// Juez local de Algoria: compila y ejecuta Python / C++ / Java contra una lista de tests.
//
// AVISO: ejecuta código arbitrario directamente en la máquina. Solo apto para desarrollo local.
// Antes de publicar hay que aislarlo (contenedor sin red, usuario sin privilegios, límites de memoria).
//
// Decisiones (documentadas también en el informe del agente):
// - CE: `results` contiene TODOS los tests con verdict 'CE' (timeMs 0, output ''), así `total` es coherente;
//   el detalle está en `compileOutput`.
// - Salida > 64 KB: se mata el proceso, se corta la salida y el test se marca WA (casi siempre es un bucle
//   que imprime sin fin; stderr lleva una nota explicándolo).
// - Se ejecutan todos los tests aunque alguno falle, para rellenar todos los resultados.
// - El límite de tiempo es de reloj (wall-clock) e incluye el arranque del proceso.
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { promises as fs, realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Language, RunResponse, TestCase, TestResult, Verdict } from '@algoria/shared';

export interface JudgeInput {
  language: Language;
  code: string;
  tests: TestCase[];
  timeLimitMs: number;
}

export const MAX_OUTPUT_BYTES = 64 * 1024;
const MAX_STDERR_CHARS = 2 * 1024;
const MAX_COMPILE_OUTPUT_CHARS = 4 * 1024;
const COMPILE_TIMEOUT_MS = 30_000;
const MAX_CONCURRENT_JUDGES = 2;

const isWindows = process.platform === 'win32';

function bin(name: 'python' | 'gxx' | 'javac' | 'java'): string {
  const env = {
    python: process.env.ALGORIA_PYTHON,
    gxx: process.env.ALGORIA_GXX,
    javac: process.env.ALGORIA_JAVAC,
    java: process.env.ALGORIA_JAVA,
  }[name];
  if (env && env.trim()) return env.trim();
  return { python: 'python', gxx: 'g++', javac: 'javac', java: 'java' }[name];
}

/* ---------------- Cola de concurrencia ---------------- */

let active = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT_JUDGES) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  } else {
    active++;
  }
  try {
    return await fn();
  } finally {
    const next = waiting.shift();
    if (next) next(); // el hueco pasa directamente al siguiente (active no cambia)
    else active--;
  }
}

/* ---------------- Ejecución de procesos ---------------- */

interface ExecResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  outputExceeded: boolean;
  timeMs: number;
  /** Error al lanzar el proceso (p. ej. ENOENT si no existe el ejecutable). */
  spawnError?: NodeJS.ErrnoException;
}

interface ExecOptions {
  cwd: string;
  stdin?: string;
  timeoutMs: number;
  maxOutputBytes?: number;
}

function killTree(child: ChildProcess): void {
  if (child.pid === undefined) return;
  if (isWindows) {
    try {
      const k = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore',
      });
      k.on('error', () => child.kill('SIGKILL'));
    } catch {
      child.kill('SIGKILL');
    }
  } else {
    try {
      process.kill(-child.pid, 'SIGKILL'); // grupo de procesos (spawn con detached)
    } catch {
      child.kill('SIGKILL');
    }
  }
}

function exec(cmd: string, args: string[], opts: ExecOptions): Promise<ExecResult> {
  return new Promise((resolve) => {
    const maxOut = opts.maxOutputBytes ?? MAX_OUTPUT_BYTES;
    const start = process.hrtime.bigint();
    let child: ChildProcess;
    try {
      child = spawn(cmd, args, {
        cwd: opts.cwd,
        windowsHide: true,
        detached: !isWindows,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (err) {
      resolve({
        exitCode: null, signal: null, stdout: '', stderr: '', timedOut: false,
        outputExceeded: false, timeMs: 0, spawnError: err as NodeJS.ErrnoException,
      });
      return;
    }

    const outChunks: Buffer[] = [];
    const errChunks: Buffer[] = [];
    let outBytes = 0;
    let errBytes = 0;
    let timedOut = false;
    let outputExceeded = false;
    let killed = false;
    let settled = false;
    let spawnError: NodeJS.ErrnoException | undefined;
    let fallback: NodeJS.Timeout | undefined;

    const elapsed = () => Number(process.hrtime.bigint() - start) / 1e6;

    const kill = () => {
      if (killed) return;
      killed = true;
      killTree(child);
      // Si algún nieto mantiene abiertas las tuberías, no esperamos para siempre.
      fallback = setTimeout(() => finish(null, null), 3000);
    };

    const timer = setTimeout(() => {
      timedOut = true;
      kill();
    }, opts.timeoutMs);

    child.stdout!.on('data', (chunk: Buffer) => {
      if (chunk.length === 0) return;
      if (outBytes >= maxOut) {
        outputExceeded = true;
        kill();
        return;
      }
      const room = maxOut - outBytes;
      if (chunk.length > room) {
        outChunks.push(chunk.subarray(0, room));
        outBytes = maxOut;
        outputExceeded = true;
        kill();
      } else {
        outChunks.push(chunk);
        outBytes += chunk.length;
      }
    });
    child.stderr!.on('data', (chunk: Buffer) => {
      if (errBytes >= maxOut) return;
      errChunks.push(chunk);
      errBytes += chunk.length;
    });

    child.stdin!.on('error', () => { /* EPIPE: el programa no leyó toda la entrada */ });
    child.on('error', (err) => {
      spawnError = err as NodeJS.ErrnoException;
      finish(null, null);
    });
    child.on('close', (code, signal) => finish(code, signal));

    function finish(code: number | null, signal: NodeJS.Signals | null) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (fallback) clearTimeout(fallback);
      resolve({
        exitCode: code,
        signal,
        // CRLF→LF para que el front muestre lo mismo en Windows y en Linux.
        stdout: Buffer.concat(outChunks).toString('utf8').replace(/\r\n/g, '\n'),
        stderr: Buffer.concat(errChunks).toString('utf8').replace(/\r\n/g, '\n'),
        timedOut,
        outputExceeded,
        timeMs: Math.round(elapsed()),
        spawnError,
      });
    }

    child.stdin!.end(opts.stdin ?? '');
  });
}

/* ---------------- Utilidades ---------------- */

/** CRLF→LF, sin espacios al final de cada línea y sin líneas vacías finales. */
export function normalizeOutput(s: string): string {
  const lines = s.replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/[ \t]+$/, ''));
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n');
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '\n... (salida recortada)';
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Quita la carpeta temporal de los mensajes del compilador: "C:\...\main.cpp:3" → "main.cpp:3". */
function scrubPaths(text: string, dirs: string[]): string {
  let out = text;
  const variants = new Set<string>();
  for (const d of dirs) {
    variants.add(d);
    variants.add(d.replace(/\\/g, '/'));
    variants.add(d.replace(/\//g, '\\'));
  }
  // Las más largas primero para no dejar restos.
  for (const v of [...variants].sort((a, b) => b.length - a.length)) {
    out = out.replace(new RegExp(escapeRegExp(v) + '[\\\\/]?', isWindows ? 'gi' : 'g'), '');
  }
  return out;
}

const WINDOWS_EXIT_HINTS: Record<number, string> = {
  0xc00000fd: 'Desbordamiento de pila (recursión demasiado profunda).',
  0xc0000005: 'Acceso inválido a memoria (índice fuera de rango o puntero inválido).',
  0xc0000094: 'División entera entre cero.',
  0xc0000409: 'El programa abortó (fallo de comprobación interna).',
  0xc0000374: 'Memoria dinámica corrupta.',
};

function describeExit(r: ExecResult): string {
  if (r.signal) return `El programa terminó por la señal ${r.signal}.`;
  const code = r.exitCode ?? -1;
  const unsigned = code >>> 0;
  const hint = WINDOWS_EXIT_HINTS[unsigned];
  const shown = unsigned > 0xffff ? `0x${unsigned.toString(16).toUpperCase()}` : String(code);
  return hint ? `Código de salida ${shown}: ${hint}` : `El programa terminó con código de salida ${shown}.`;
}

function firstLine(s: string): string {
  return s.trim().split(/\r?\n/)[0]?.trim() ?? '';
}

/* ---------------- Lenguajes ---------------- */

interface Prepared {
  /** Si falla la compilación, mensaje para el jugador. */
  compileError?: string;
  run?: { cmd: string; args: string[] };
  /** Límite de tiempo real por test. */
  timeoutMs: number;
}

function missingTool(tool: string, err: NodeJS.ErrnoException): string {
  if (err.code === 'ENOENT') {
    return `No se encontró "${tool}" en el servidor. Revisa la instalación del compilador o la variable de entorno correspondiente.`;
  }
  return `No se pudo ejecutar "${tool}": ${err.message}`;
}

async function prepare(language: Language, code: string, dir: string, timeLimitMs: number): Promise<Prepared> {
  const scrubDirs = [dir];
  try {
    scrubDirs.push(realpathSync.native(dir));
  } catch { /* ignorar */ }

  const compile = async (tool: string, args: string[]): Promise<string | undefined> => {
    const r = await exec(tool, args, { cwd: dir, timeoutMs: COMPILE_TIMEOUT_MS, maxOutputBytes: 256 * 1024 });
    if (r.spawnError) return missingTool(tool, r.spawnError);
    if (r.timedOut) return 'La compilación tardó demasiado (más de 30 s).';
    if (r.exitCode !== 0) {
      const text = scrubPaths((r.stderr + r.stdout).trim(), scrubDirs);
      return truncate(text || 'Error de compilación.', MAX_COMPILE_OUTPUT_CHARS);
    }
    return undefined;
  };

  switch (language) {
    case 'python': {
      await fs.writeFile(path.join(dir, 'main.py'), code, 'utf8');
      // Comprobación de sintaxis previa: un SyntaxError se reporta como CE, no como RE.
      const err = await compile(bin('python'), [
        '-I', '-X', 'utf8', '-c',
        "import sys\ntry:\n compile(open('main.py',encoding='utf-8').read(),'main.py','exec')\n" +
          "except SyntaxError as e:\n import traceback\n sys.stderr.write(''.join(traceback.format_exception_only(type(e),e)))\n sys.exit(1)",
      ]);
      if (err !== undefined) return { compileError: err, timeoutMs: timeLimitMs };
      // -I: modo aislado (ignora PYTHON* y el site de usuario). -X utf8: E/S en UTF-8 también en Windows.
      return {
        run: { cmd: bin('python'), args: ['-I', '-X', 'utf8', 'main.py'] },
        timeoutMs: timeLimitMs * 2 + startupAllowance('python'),
      };
    }
    case 'cpp': {
      await fs.writeFile(path.join(dir, 'main.cpp'), code, 'utf8');
      const exe = isWindows ? 'main.exe' : 'main';
      const args = ['-std=c++17', '-O2', '-static', '-o', exe, 'main.cpp'];
      // Pila de 256 MB en Windows (por defecto es 1 MB y la recursión profunda revienta).
      if (isWindows) args.push('-Wl,--stack,268435456');
      const err = await compile(bin('gxx'), args);
      if (err !== undefined) return { compileError: err, timeoutMs: timeLimitMs };
      return { run: { cmd: path.join(dir, exe), args: [] }, timeoutMs: timeLimitMs + startupAllowance('cpp') };
    }
    case 'java': {
      if (!/\bclass\s+Main\b/.test(code)) {
        return {
          compileError:
            'No se encontró la clase Main. En Java tu programa debe estar dentro de "public class Main" con un método "public static void main(String[] args)".',
          timeoutMs: timeLimitMs,
        };
      }
      await fs.writeFile(path.join(dir, 'Main.java'), code, 'utf8');
      const err = await compile(bin('javac'), ['-encoding', 'UTF-8', 'Main.java']);
      if (err !== undefined) return { compileError: err, timeoutMs: timeLimitMs };
      return {
        run: {
          cmd: bin('java'),
          args: [
            '-Xss64m',
            '-XX:+UseSerialGC',
            '-XX:TieredStopAtLevel=1',
            '-Dfile.encoding=UTF-8',
            '-Dstdout.encoding=UTF-8',
            '-Dstderr.encoding=UTF-8',
            '-cp', dir, 'Main',
          ],
        },
        timeoutMs: timeLimitMs * 2 + startupAllowance('java'),
      };
    }
    default:
      return { compileError: `Lenguaje no soportado: ${String(language)}`, timeoutMs: timeLimitMs };
  }
}

/**
 * Margen fijo por test para el arranque del proceso. En Windows el antivirus escanea cada
 * ejecución nueva y el intérprete de Python puede tardar >1 s en arrancar, lo que daba TLE
 * en programas triviales. Configurable con ALGORIA_STARTUP_MS_<PYTHON|CPP|JAVA>.
 */
const DEFAULT_STARTUP_MS: Record<Language, number> = { python: 2000, cpp: 500, java: 1500 };

function startupAllowance(language: Language): number {
  const raw = process.env[`ALGORIA_STARTUP_MS_${language.toUpperCase()}`];
  const n = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_STARTUP_MS[language];
}

/* ---------------- judge() ---------------- */

function summarize(results: TestResult[], compileOutput?: string): RunResponse {
  const firstBad = results.find((r) => r.verdict !== 'AC');
  const verdict: Verdict = compileOutput !== undefined ? 'CE' : firstBad ? firstBad.verdict : 'AC';
  const res: RunResponse = {
    verdict,
    passed: results.filter((r) => r.verdict === 'AC').length,
    total: results.length,
    results,
  };
  if (compileOutput !== undefined) res.compileOutput = compileOutput;
  return res;
}

function compileErrorResponse(tests: TestCase[], message: string): RunResponse {
  return summarize(
    tests.map((t) => ({
      id: t.id, sample: t.sample, verdict: 'CE' as const, timeMs: 0,
      input: t.input, expected: t.expected, output: '', stderr: '',
    })),
    message,
  );
}

/** Compila (si hace falta) y ejecuta `code` contra cada test. Nunca lanza por errores del código del usuario. */
export async function judge(input: JudgeInput): Promise<RunResponse> {
  return withSlot(() => judgeNow(input));
}

async function judgeNow({ language, code, tests, timeLimitMs }: JudgeInput): Promise<RunResponse> {
  const dir = path.join(os.tmpdir(), `algoria-judge-${randomUUID()}`);
  try {
    await fs.mkdir(dir, { recursive: true });
    const limit = Number.isFinite(timeLimitMs) && timeLimitMs > 0 ? timeLimitMs : 1000;
    const prep = await prepare(language, code, dir, limit);
    if (prep.compileError !== undefined || !prep.run) {
      return compileErrorResponse(tests, prep.compileError ?? 'Error de compilación.');
    }

    const results: TestResult[] = [];
    let timedOut = false;
    for (const t of tests) {
      // Tras un TLE no seguimos: un bucle infinito costaría tests × límite de espera.
      if (timedOut) {
        results.push({
          id: t.id, sample: t.sample, input: t.input, expected: t.expected,
          verdict: 'TLE', timeMs: 0, output: '',
          stderr: 'No se ejecutó: un test anterior agotó el tiempo.',
        });
        continue;
      }
      const r = await exec(prep.run.cmd, prep.run.args, { cwd: dir, stdin: t.input, timeoutMs: prep.timeoutMs });
      const base = { id: t.id, sample: t.sample, input: t.input, expected: t.expected };
      if (r.spawnError) {
        results.push({
          ...base, verdict: 'RE', timeMs: r.timeMs, output: '',
          stderr: missingTool(prep.run.cmd, r.spawnError),
        });
        continue;
      }
      let verdict: Verdict;
      let stderr = r.stderr;
      if (r.outputExceeded) {
        verdict = 'WA';
        stderr = `${stderr}\nLa salida superó el máximo de 64 KB y se cortó.`.trim();
      } else if (r.timedOut) {
        verdict = 'TLE';
        timedOut = true;
      } else if (r.exitCode !== 0) {
        verdict = 'RE';
        stderr = `${stderr.trimEnd()}\n${describeExit(r)}`.trim();
      } else {
        verdict = normalizeOutput(r.stdout) === normalizeOutput(t.expected) ? 'AC' : 'WA';
      }
      results.push({
        ...base,
        verdict,
        timeMs: r.timedOut ? Math.max(r.timeMs, prep.timeoutMs) : r.timeMs,
        output: r.stdout,
        stderr: truncate(stderr, MAX_STDERR_CHARS),
      });
    }
    return summarize(results);
  } catch (err) {
    // Fallo del propio juez (disco, permisos...). No es culpa del jugador, pero no lanzamos.
    const msg = err instanceof Error ? err.message : String(err);
    return compileErrorResponse(tests, `Error interno del juez: ${msg}`);
  } finally {
    await removeDir(dir);
  }
}

async function removeDir(dir: string): Promise<void> {
  // En Windows el .exe puede seguir bloqueado unos ms tras matar el proceso.
  for (let i = 0; i < 5; i++) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
  }
}

/* ---------------- detectCompilers() ---------------- */

export interface CompilerStatus {
  ok: boolean;
  version?: string;
  error?: string;
}

async function probe(tool: string, args: string[]): Promise<CompilerStatus> {
  const r = await exec(tool, args, { cwd: os.tmpdir(), timeoutMs: 15_000 });
  if (r.spawnError) return { ok: false, error: missingTool(tool, r.spawnError) };
  if (r.timedOut) return { ok: false, error: `"${tool}" no respondió a tiempo.` };
  if (r.exitCode !== 0) {
    return { ok: false, error: firstLine(r.stderr || r.stdout) || `"${tool}" terminó con código ${r.exitCode}.` };
  }
  return { ok: true, version: firstLine(r.stdout) || firstLine(r.stderr) };
}

export async function detectCompilers(): Promise<Record<Language, CompilerStatus>> {
  const [python, cpp, javac, java] = await Promise.all([
    probe(bin('python'), ['--version']),
    probe(bin('gxx'), ['--version']),
    probe(bin('javac'), ['-version']),
    probe(bin('java'), ['-version']),
  ]);
  const javaStatus: CompilerStatus =
    javac.ok && java.ok
      ? { ok: true, version: `${javac.version} / ${java.version}` }
      : { ok: false, error: [javac.error, java.error].filter(Boolean).join(' ') };
  return { python, cpp, java: javaStatus };
}
