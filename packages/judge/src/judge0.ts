// Juez remoto con Judge0 (https://judge0.com): cada envío se ejecuta aislado en
// sus servidores. Se activa con la variable de entorno JUDGE0_URL.
//
//   JUDGE0_URL   p. ej. https://judge0-ce.p.rapidapi.com  o  https://tu-judge0.example.com
//   JUDGE0_KEY   clave de RapidAPI (cabeceras X-RapidAPI-*) o token de un Judge0 propio
//   JUDGE0_AUTH  'rapidapi' (por defecto si la URL es de rapidapi.com) | 'token' (X-Auth-Token)
//   JUDGE0_LANG_PYTHON / _CPP / _JAVA  ids de lenguaje si no quieres autodetectarlos
import type { Language, RunResponse, TestCase, TestResult, Verdict } from '@algoria/shared';

export interface Judge0Config {
  url: string;
  key?: string;
  auth: 'rapidapi' | 'token' | 'none';
  langIds: Partial<Record<Language, number>>;
  /** Para tests: espera entre consultas. */
  pollMs?: number;
  /** Tiempo máximo esperando resultados. */
  maxWaitMs?: number;
}

export function judge0ConfigFromEnv(env: NodeJS.ProcessEnv = process.env): Judge0Config | null {
  const url = env.JUDGE0_URL?.trim().replace(/\/+$/, '');
  if (!url) return null;
  const key = env.JUDGE0_KEY?.trim() || undefined;
  const auth =
    (env.JUDGE0_AUTH as Judge0Config['auth'] | undefined) ??
    (key ? (/rapidapi\.com/.test(url) ? 'rapidapi' : 'token') : 'none');
  const id = (v?: string) => (v && Number.isInteger(Number(v)) ? Number(v) : undefined);
  return {
    url,
    key,
    auth,
    langIds: { python: id(env.JUDGE0_LANG_PYTHON), cpp: id(env.JUDGE0_LANG_CPP), java: id(env.JUDGE0_LANG_JAVA) },
  };
}

function headers(cfg: Judge0Config): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cfg.auth === 'rapidapi' && cfg.key) {
    h['X-RapidAPI-Key'] = cfg.key;
    h['X-RapidAPI-Host'] = new URL(cfg.url).host;
  } else if (cfg.auth === 'token' && cfg.key) {
    h['X-Auth-Token'] = cfg.key;
  }
  return h;
}

const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');
const unb64 = (s: string | null | undefined) => (s ? Buffer.from(s, 'base64').toString('utf8') : '');

/* ---------- lenguajes ---------- */

const LANG_PATTERNS: Record<Language, RegExp> = {
  python: /^Python \(3\.([\d.]+)\)/,
  cpp: /^C\+\+ \(GCC ([\d.]+)\)/,
  java: /^Java \((?:OpenJDK|JDK) ([\d.]+)\)/,
};

function versionKey(v: string): number[] {
  return v.split('.').map((n) => Number(n) || 0);
}

function newer(a: string, b: string): boolean {
  const x = versionKey(a);
  const y = versionKey(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d !== 0) return d > 0;
  }
  return false;
}

/** Elige el id más moderno de cada lenguaje en la lista de Judge0. */
export function pickLanguageIds(list: { id: number; name: string }[]): Partial<Record<Language, { id: number; name: string }>> {
  const out: Partial<Record<Language, { id: number; name: string; v: string }>> = {};
  for (const l of list) {
    for (const lang of Object.keys(LANG_PATTERNS) as Language[]) {
      const m = LANG_PATTERNS[lang].exec(l.name);
      if (!m) continue;
      const v = m[1]!;
      const cur = out[lang];
      if (!cur || newer(v, cur.v)) out[lang] = { id: l.id, name: l.name, v };
    }
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { id: v.id, name: v.name }]));
}

let langCache: Promise<Partial<Record<Language, { id: number; name: string }>>> | undefined;

async function languages(cfg: Judge0Config): Promise<Partial<Record<Language, { id: number; name: string }>>> {
  langCache ??= (async () => {
    const res = await fetch(`${cfg.url}/languages`, { headers: headers(cfg) });
    if (!res.ok) throw new Error(`Judge0 /languages respondió ${res.status}`);
    return pickLanguageIds((await res.json()) as { id: number; name: string }[]);
  })().catch((e) => {
    langCache = undefined;
    throw e;
  });
  return langCache;
}

async function languageId(cfg: Judge0Config, lang: Language): Promise<number> {
  const fixed = cfg.langIds[lang];
  if (fixed) return fixed;
  const found = (await languages(cfg))[lang];
  if (!found) throw new Error(`Judge0 no ofrece ${lang}`);
  return found.id;
}

/* ---------- ejecución ---------- */

/**
 * Judge0 mide tiempo de CPU (sin margen de arranque). Python va con ×3 porque las versiones de
 * Python de Judge0 suelen ser más lentas y hay niveles con DP de 10^6 celdas.
 */
const TIME_FACTOR: Record<Language, number> = { python: 3, cpp: 1, java: 2 };

interface Judge0Result {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  status?: { id: number; description: string };
}

/** 1 en cola · 2 procesando · 3 aceptado (ejecutó bien) · 4 WA · 5 TLE · 6 CE · 7–12 RE · 13 error interno · 14 formato. */
function verdictOf(statusId: number): Verdict | 'pending' | 'internal' | 'ok' {
  if (statusId <= 2) return 'pending';
  if (statusId === 3 || statusId === 4) return 'ok';
  if (statusId === 5) return 'TLE';
  if (statusId === 6) return 'CE';
  if (statusId >= 7 && statusId <= 12) return 'RE';
  return 'internal';
}

export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function judgeWithJudge0(
  cfg: Judge0Config,
  input: { language: Language; code: string; tests: TestCase[]; timeLimitMs: number },
): Promise<RunResponse> {
  const { language, code, tests, timeLimitMs } = input;
  const ce = (message: string): RunResponse => ({
    verdict: 'CE',
    passed: 0,
    total: tests.length,
    compileOutput: message,
    results: tests.map((t) => ({ id: t.id, sample: t.sample, verdict: 'CE', timeMs: 0, input: t.input, expected: t.expected, output: '', stderr: '' })),
  });

  if (language === 'java' && !/\bclass\s+Main\b/.test(code)) {
    return ce('No se encontró la clase Main. En Java tu programa debe estar dentro de "public class Main" con un método "public static void main(String[] args)".');
  }

  try {
    const langId = await languageId(cfg, language);
    const cpu = Math.min(15, (timeLimitMs * TIME_FACTOR[language]) / 1000);
    const submissions = tests.map((t) => ({
      language_id: langId,
      source_code: b64(code),
      stdin: b64(t.input),
      cpu_time_limit: cpu,
      wall_time_limit: Math.min(20, cpu * 2 + 2),
      memory_limit: 256_000,
      ...(language === 'cpp' ? { compiler_options: '-O2 -std=c++17' } : {}),
    }));

    const created = await fetch(`${cfg.url}/submissions/batch?base64_encoded=true`, {
      method: 'POST',
      headers: headers(cfg),
      body: JSON.stringify({ submissions }),
    });
    if (created.status === 429) return ce('El juez está muy ocupado ahora mismo (límite de envíos alcanzado). Prueba de nuevo en unos minutos.');
    if (!created.ok) throw new Error(`Judge0 respondió ${created.status} al enviar`);
    const tokens = ((await created.json()) as { token?: string }[]).map((t) => t.token);
    if (tokens.some((t) => !t)) throw new Error('Judge0 no devolvió tokens');

    const fields = 'token,stdout,stderr,compile_output,message,time,status';
    const deadline = Date.now() + (cfg.maxWaitMs ?? 40_000);
    let results: Judge0Result[] = [];
    for (;;) {
      const res = await fetch(`${cfg.url}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=true&fields=${fields}`, {
        headers: headers(cfg),
      });
      if (!res.ok) throw new Error(`Judge0 respondió ${res.status} al consultar`);
      results = ((await res.json()) as { submissions: Judge0Result[] }).submissions;
      if (results.every((r) => verdictOf(r.status?.id ?? 1) !== 'pending')) break;
      if (Date.now() > deadline) throw new Error('Judge0 tardó demasiado en responder');
      await sleep(cfg.pollMs ?? 700);
    }

    const compileError = results.find((r) => r.status?.id === 6);
    if (compileError) return ce(unb64(compileError.compile_output).slice(0, 4096) || 'Error de compilación.');

    const out: TestResult[] = tests.map((t, i) => {
      const r = results[i] ?? {};
      const v = verdictOf(r.status?.id ?? 13);
      const stdout = unb64(r.stdout);
      const stderr = (unb64(r.stderr) || unb64(r.message)).slice(0, 2048);
      const timeMs = Math.round(Number(r.time ?? 0) * 1000);
      let verdict: Verdict;
      if (v === 'ok') verdict = normalizeOutput(stdout) === normalizeOutput(t.expected) ? 'AC' : 'WA';
      else if (v === 'internal' || v === 'pending') verdict = 'RE';
      else verdict = v;
      return { id: t.id, sample: t.sample, verdict, timeMs, input: t.input, expected: t.expected, output: stdout, stderr };
    });
    const bad = out.find((r) => r.verdict !== 'AC');
    return { verdict: bad ? bad.verdict : 'AC', passed: out.filter((r) => r.verdict === 'AC').length, total: out.length, results: out };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return ce(`No se pudo contactar con el juez en línea (${msg}). Prueba de nuevo en un momento.`);
  }
}

export async function judge0Status(cfg: Judge0Config): Promise<Record<Language, { ok: boolean; version?: string; error?: string }>> {
  try {
    const langs = await languages(cfg);
    const one = (l: Language) => {
      const fixed = cfg.langIds[l];
      if (fixed) return { ok: true, version: `Judge0 id ${fixed}` };
      const found = langs[l];
      return found ? { ok: true, version: `Judge0 · ${found.name}` } : { ok: false, error: 'No disponible en Judge0' };
    };
    return { python: one('python'), cpp: one('cpp'), java: one('java') };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { python: { ok: false, error }, cpp: { ok: false, error }, java: { ok: false, error } };
  }
}
