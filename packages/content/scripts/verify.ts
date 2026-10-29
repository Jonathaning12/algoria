// Verifica el contenido: estructura, mapa y que todo el código (soluciones, lecciones y quizzes) funcione.
//   npm run verify:content              → ejecuta con judge() de @algoria/judge
//   npx tsx scripts/verify.ts --local   (desde packages/content) → ejecutor local de respaldo (mientras judge no esté listo)
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LANGUAGES, SOLID_TILES, TILE_LEGEND } from '@algoria/shared';
import type { Language, RunResponse, Stage, TestCase, Verdict } from '@algoria/shared';
import { judge } from '@algoria/judge';
import { stages } from '../src/index';
import { ALL_NAIVE, type NaiveSolution } from './naive';

const LOCAL = process.argv.includes('--local');
/** --niveles=11-20 (o --niveles=18) ejecuta solo esos niveles; la validación estructural siempre es completa. */
const RANGE = (() => {
  const arg = process.argv.find((a) => a.startsWith('--niveles='));
  if (!arg) return null;
  const [a, b] = arg.slice('--niveles='.length).split('-').map(Number);
  return { from: a!, to: b ?? a! };
})();
/** Límite de salida por test del juez. */
const MAX_OUTPUT_BYTES = 64 * 1024;
const LANG_LABEL: Record<Language, string> = { python: 'Python', cpp: 'C++', java: 'Java' };

/* ---------------- 1. Validaciones estructurales ---------------- */

const errors: string[] = [];
const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`);

function checkPerLanguage(where: string, value: unknown) {
  if (!value || typeof value !== 'object') return err(where, 'falta el objeto por lenguaje');
  for (const lang of LANGUAGES) {
    const v = (value as Record<string, unknown>)[lang];
    if (typeof v !== 'string' || v.trim() === '') err(where, `falta ${lang}`);
  }
}

function checkMap(stage: Stage, index: number) {
  const where = `etapa ${stage.id} · mapa`;
  const { rows, spawn: sp, signs, extraNpcs, exit, back } = stage.map;
  const width = rows[0]?.length ?? 0;
  rows.forEach((r, y) => {
    if (r.length !== width) err(where, `la fila ${y} mide ${r.length} y no ${width}`);
    for (const ch of r) if (!(ch in TILE_LEGEND)) err(where, `carácter desconocido '${ch}' en la fila ${y}`);
  });
  const tile = (x: number, y: number) => rows[y]?.[x];
  const walkable = (x: number, y: number) => {
    const t = tile(x, y);
    return t !== undefined && !SOLID_TILES.has(t);
  };

  const npcs = [...stage.levels.map((l) => l.npc), ...extraNpcs];
  if (!walkable(sp.x, sp.y)) err(where, `el spawn (${sp.x},${sp.y}) no es caminable`);
  const taken = new Map<string, string>();
  for (const n of npcs) {
    const key = `${n.x},${n.y}`;
    if (!walkable(n.x, n.y)) err(where, `el NPC ${n.id} está en una casilla no caminable (${key})`);
    if (n.x === sp.x && n.y === sp.y) err(where, `el NPC ${n.id} está sobre el spawn`);
    if (taken.has(key)) err(where, `${n.id} y ${taken.get(key)} comparten la casilla ${key}`);
    taken.set(key, n.id);
  }

  // BFS desde el spawn sin atravesar NPCs; un NPC es alcanzable si alguna casilla vecina lo es.
  const seen = new Set<string>([`${sp.x},${sp.y}`]);
  const queue = [[sp.x, sp.y] as const];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
  while (queue.length) {
    const [x, y] = queue.shift()!;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy, key = `${nx},${ny}`;
      if (seen.has(key) || !walkable(nx, ny) || taken.has(key)) continue;
      seen.add(key);
      queue.push([nx, ny]);
    }
  }
  for (const n of npcs) {
    if (!dirs.some(([dx, dy]) => seen.has(`${n.x + dx},${n.y + dy}`))) err(where, `el NPC ${n.id} no es alcanzable desde el spawn`);
  }
  if (exit && !dirs.some(([dx, dy]) => seen.has(`${exit.x + dx},${exit.y + dy}`) || seen.has(`${exit.x},${exit.y}`))) {
    err(where, 'la salida no es alcanzable');
  }

  // Pasos entre etapas: `exit` (a la siguiente) y `back` (a la anterior). Toda etapa salvo la primera necesita `back`.
  if (index > 0 && !back) err(where, 'falta `back` (vuelta a la etapa anterior)');
  if (index === 0 && back) err(where, 'la primera etapa no puede tener `back`');
  const height = rows.length;
  const portals = [['exit', exit], ['back', back]] as const;
  for (const [name, p] of portals) {
    if (!p) continue;
    const key = `${p.x},${p.y}`;
    if (!walkable(p.x, p.y)) err(where, `${name} (${key}) no es una casilla caminable`);
    if (!(p.x === 0 || p.y === 0 || p.x === width - 1 || p.y === height - 1)) err(where, `${name} (${key}) no está en el borde del mapa`);
    if (taken.has(key)) err(where, `el NPC ${taken.get(key)} está sobre ${name} (${key})`);
    if (p.x === sp.x && p.y === sp.y) err(where, `${name} (${key}) coincide con el spawn`);
    if (!seen.has(key)) err(where, `${name} (${key}) no es alcanzable desde el spawn`);
  }
  if (exit && back && exit.x === back.x && exit.y === back.y) err(where, 'exit y back están en la misma casilla');
  if (exit && !exit.lockedText.trim()) err(where, 'exit sin lockedText');

  // Carteles: cada S tiene su texto y cada texto está sobre una S.
  const signKeys = new Set(signs.map((s) => `${s.x},${s.y}`));
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === 'S' && !signKeys.has(`${x},${y}`)) err(where, `el cartel (${x},${y}) no tiene texto en signs`);
  }));
  for (const s of signs) if (tile(s.x, s.y) !== 'S') err(where, `signs tiene (${s.x},${s.y}) pero ahí no hay una S`);
  for (const s of signs) if (!s.text.trim()) err(where, `el cartel (${s.x},${s.y}) está vacío`);
}

function checkStructure() {
  const levelIds = new Set<string>();
  const problemIds = new Set<string>();
  const npcIds = new Set<string>();
  const sprites = new Set<string>();
  let expected = 1;
  stages.forEach((stage, si) => {
    if (stage.number !== si + 1) err(`etapa ${stage.id}`, `se esperaba el número de etapa ${si + 1}`);
    if (stage.levels.length === 0) err(`etapa ${stage.id}`, 'no tiene niveles');
    if (stage.levels[0] && !stage.range.startsWith(`Nv ${stage.levels[0].number}`)) err(`etapa ${stage.id}`, `range "${stage.range}" no empieza en Nv ${stage.levels[0].number}`);
    checkMap(stage, si);
    for (const n of stage.map.extraNpcs) npcIds.add(n.id);
    stage.levels.forEach((lv, idx) => {
      const where = `Nv ${lv.number} (${lv.id})`;
      if (lv.number !== expected) err(where, `se esperaba el número ${expected}`);
      expected++;
      if (levelIds.has(lv.id)) err(where, 'id de nivel repetido');
      levelIds.add(lv.id);
      if (problemIds.has(lv.problem.id)) err(where, 'id de problema repetido');
      problemIds.add(lv.problem.id);
      if (npcIds.has(lv.npc.id)) err(where, `id de NPC repetido (${lv.npc.id})`);
      npcIds.add(lv.npc.id);
      if (sprites.has(lv.npc.sprite)) err(where, `sprite repetido (${lv.npc.sprite})`);
      sprites.add(lv.npc.sprite);
      const isLast = idx === stage.levels.length - 1;
      if (!!lv.gym !== isLast) err(where, isLast ? 'el último nivel debe ser gym' : 'solo el último nivel es gym');

      if (!lv.greeting.trim()) err(where, 'greeting vacío');
      if (lv.intro.length < 3 || lv.intro.length > 5) err(where, `intro debe tener 3–5 líneas (tiene ${lv.intro.length})`);
      if (lv.outro.length < 2 || lv.outro.length > 3) err(where, `outro debe tener 2–3 líneas (tiene ${lv.outro.length})`);

      const { lesson, problem } = lv;
      if (lesson.goals.length < 1 || lesson.goals.length > 3) err(where, 'lesson.goals debe tener 1–3 objetivos');
      checkPerLanguage(`${where} · lesson.code`, lesson.code);
      checkPerLanguage(`${where} · lesson.tips`, lesson.tips);
      checkPerLanguage(`${where} · quiz.code`, lesson.quiz.code);
      checkPerLanguage(`${where} · problem.starter`, problem.starter);
      checkPerLanguage(`${where} · problem.solution`, problem.solution);
      checkPerLanguage(`${where} · rewardTip.text`, lv.rewardTip.text);
      if (lesson.examples.length < 1 || lesson.examples.length > 3) err(where, 'lesson.examples debe tener 1–3 ejemplos');
      const q = lesson.quiz;
      if (q.options.length !== 3) err(where, 'el quiz debe tener 3 opciones');
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(where, 'quiz.answer fuera de rango');

      if (problem.tests.length < 6 || problem.tests.length > 10) err(where, `se esperan 6–10 tests (hay ${problem.tests.length})`);
      if (!problem.tests.some((t) => t.sample)) err(where, 'no hay ningún test de ejemplo (sample)');
      const testIds = new Set(problem.tests.map((t) => t.id));
      if (testIds.size !== problem.tests.length) err(where, 'ids de test repetidos');
      if (problem.hints.length !== 3) err(where, 'se esperan 3 pistas');
      // Etapa 1: 100 XP por nivel; desde la etapa 2: 120. El gimnasio siempre da 250.
      const xp = lv.gym ? 250 : stage.number === 1 ? 100 : 120;
      if (problem.xp !== xp) err(where, `xp debería ser ${xp}`);
      const tl = lv.gym ? 2000 : 1000;
      if (problem.timeLimitMs !== tl) err(where, `timeLimitMs debería ser ${tl}`);
      for (const lang of LANGUAGES) {
        if (lang === 'java') {
          for (const [k, c] of [['solution', problem.solution.java], ['starter', problem.starter.java], ['lesson', lesson.code.java], ['quiz', q.code.java]] as const) {
            if (!/public\s+class\s+Main\b/.test(c)) err(where, `java ${k}: falta public class Main`);
          }
        }
        if (!/TODO/.test(problem.starter[lang])) err(where, `starter ${lang} sin comentario TODO`);
      }
      for (const t of problem.tests) {
        if (Buffer.byteLength(t.expected, 'utf8') > MAX_OUTPUT_BYTES) err(where, `el test ${t.id} espera más de 64 KB de salida`);
      }
    });
  });
}

/* ---------------- 2/3. Ejecución ---------------- */

type Runner = (language: Language, code: string, tests: TestCase[], timeLimitMs: number) => Promise<RunResponse>;

const normalize = (s: string) =>
  s.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');

function exec(cmd: string, args: string[], cwd: string, input: string, timeoutMs: number) {
  return new Promise<{ code: number | null; stdout: string; stderr: string; ms: number; timedOut: boolean }>((resolve) => {
    const start = Date.now();
    const child = spawn(cmd, args, { cwd, windowsHide: true });
    let stdout = '', stderr = '', timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (e) => { stderr += String(e); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr, ms: Date.now() - start, timedOut }); });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}

/** Ejecutor local de respaldo (no aislado). Solo para desarrollo. */
const localRunner: Runner = async (language, code, tests, timeLimitMs) => {
  const dir = await mkdtemp(join(tmpdir(), 'algoria-verify-'));
  try {
    let run: [string, string[]];
    if (language === 'python') {
      await writeFile(join(dir, 'main.py'), code);
      run = ['python', ['main.py']];
    } else if (language === 'cpp') {
      await writeFile(join(dir, 'main.cpp'), code);
      const c = await exec('g++', ['-std=c++17', '-O2', '-static', '-o', 'main.exe', 'main.cpp'], dir, '', 60000);
      if (c.code !== 0) return { verdict: 'CE', passed: 0, total: tests.length, results: [], compileOutput: c.stderr };
      run = [join(dir, 'main.exe'), []];
    } else {
      await writeFile(join(dir, 'Main.java'), code);
      const c = await exec('javac', ['-encoding', 'UTF-8', 'Main.java'], dir, '', 60000);
      if (c.code !== 0) return { verdict: 'CE', passed: 0, total: tests.length, results: [], compileOutput: c.stderr };
      run = ['java', ['-cp', dir, 'Main']];
    }
    // Mismo margen que da el juez a los lenguajes con arranque lento (intérprete / JVM).
    const limit = language === 'python' ? timeLimitMs * 2 : language === 'java' ? timeLimitMs * 2 + 500 : timeLimitMs;
    const results: RunResponse['results'] = [];
    for (const t of tests) {
      const r = await exec(run[0], run[1], dir, t.input, limit + 2000);
      let verdict: Verdict;
      if (r.timedOut || r.ms > limit) verdict = 'TLE';
      else if (r.code !== 0) verdict = 'RE';
      else verdict = normalize(r.stdout) === normalize(t.expected) ? 'AC' : 'WA';
      results.push({ id: t.id, sample: t.sample, verdict, timeMs: r.ms, output: r.stdout, stderr: r.stderr });
    }
    const bad = results.find((r) => r.verdict !== 'AC');
    return { verdict: bad?.verdict ?? 'AC', passed: results.filter((r) => r.verdict === 'AC').length, total: tests.length, results };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
};

const judgeRunner: Runner = (language, code, tests, timeLimitMs) => judge({ language, code, tests, timeLimitMs });

interface Job {
  level: number;
  kind: 'solución' | 'lección' | 'quiz' | 'ingenua';
  language: Language;
  code: string;
  tests: TestCase[];
  timeLimitMs: number;
}

/**
 * Soluciones ingenuas que DEBEN dar TLE en algún test oculto (y nunca WA/RE): garantizan que el problema
 * exige la idea eficiente. Viven solo aquí, no en el contrato.
 */
const MUST_TLE: NaiveSolution[] = ALL_NAIVE;

const inRange = (n: number) => !RANGE || (n >= RANGE.from && n <= RANGE.to);

function buildJobs(): Job[] {
  const jobs: Job[] = [];
  for (const m of MUST_TLE) {
    const lv = stages.flatMap((s) => s.levels).find((l) => l.problem.id === m.problemId);
    if (!lv) throw new Error(`MUST_TLE: no existe el problema ${m.problemId}`);
    if (!inRange(lv.number)) continue;
    jobs.push({ level: lv.number, kind: 'ingenua', language: m.language, code: m.code, tests: lv.problem.tests, timeLimitMs: lv.problem.timeLimitMs });
  }
  for (const lv of stages.flatMap((s) => s.levels).filter((l) => inRange(l.number))) {
    for (const language of LANGUAGES) {
      jobs.push({ level: lv.number, kind: 'solución', language, code: lv.problem.solution[language], tests: lv.problem.tests, timeLimitMs: lv.problem.timeLimitMs });
      jobs.push({
        level: lv.number, kind: 'lección', language, code: lv.lesson.code[language], timeLimitMs: 3000,
        tests: lv.lesson.examples.map((e, i) => ({ id: `ej${i + 1}`, input: e.input === '' || e.input.endsWith('\n') ? e.input : e.input + '\n', expected: e.output, sample: true })),
      });
      const q = lv.lesson.quiz;
      jobs.push({
        level: lv.number, kind: 'quiz', language, code: q.code[language], timeLimitMs: 3000,
        tests: [{ id: 'quiz', input: '', expected: q.options[q.answer] ?? '', sample: true }],
      });
    }
  }
  return jobs;
}

async function pool<T, R>(items: T[], size: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  }));
  return out;
}

function table(title: string, rows: string[][]) {
  const widths = rows[0]!.map((_, c) => Math.max(...rows.map((r) => r[c]!.length)));
  console.log(`\n${title}`);
  rows.forEach((r, i) => {
    console.log('  ' + r.map((cell, c) => cell.padEnd(widths[c]!)).join(' │ '));
    if (i === 0) console.log('  ' + widths.map((w) => '─'.repeat(w)).join('─┼─'));
  });
}

async function main() {
  checkStructure();
  const nLevels = stages.reduce((n, s) => n + s.levels.length, 0);
  console.log(`Contenido: ${stages.length} etapa(s), ${nLevels} niveles.`);
  if (errors.length) {
    console.log(`\nErrores estructurales (${errors.length}):`);
    for (const e of errors) console.log('  ✗ ' + e);
  } else {
    console.log('Estructura y mapa: OK');
  }

  const runner = LOCAL ? localRunner : judgeRunner;
  console.log(LOCAL ? '\nEjecutando con el ejecutor LOCAL de respaldo (--local)...' : '\nEjecutando con judge() de @algoria/judge...');
  if (!LOCAL) {
    try {
      await judge({ language: 'python', code: 'print(1)\n', tests: [{ id: 'x', input: '', expected: '1', sample: true }], timeLimitMs: 3000 });
    } catch (e) {
      console.log(`  judge() no está disponible: ${(e as Error).message}`);
      console.log('  Usa `npx tsx scripts/verify.ts --local` (desde packages/content) mientras tanto.');
      process.exit(1);
    }
  }

  const jobs = buildJobs();
  const failures: string[] = [];
  const naive: string[] = [];
  const results = await pool(jobs, 1, async (job) => {
    let res: RunResponse;
    if (job.kind === 'ingenua') {
      // Se ejecuta una sola vez: aquí el TLE es lo esperado. Debe pasar los ejemplos y no dar nunca WA/RE/CE.
      res = await runner(job.language, job.code, job.tests, job.timeLimitMs).catch(
        (e): RunResponse => ({ verdict: 'RE', passed: 0, total: job.tests.length, results: [], compileOutput: String(e) }),
      );
      const firstBad = res.results.find((r) => r.verdict !== 'AC');
      const wrong = res.results.find((r) => r.verdict !== 'AC' && r.verdict !== 'TLE');
      const ok = res.verdict === 'TLE' && !wrong && !!firstBad && !firstBad.sample;
      const line =
        `Nv ${job.level} · ingenua ${LANG_LABEL[job.language]}: ${res.verdict} ${res.passed}/${res.total}` +
        (firstBad ? ` · primer fallo en ${firstBad.id} (${firstBad.verdict}, ${firstBad.timeMs} ms)` : '');
      naive.push(`${ok ? '✓' : '✗'} ${line}`);
      if (!ok) failures.push(`${line} → se esperaba TLE en un test oculto, sin WA/RE/CE${res.compileOutput ? ` · ${res.compileOutput.slice(0, 300)}` : ''}`);
      return { job, res, maxMs: Math.max(0, ...res.results.map((r) => r.timeMs)) };
    }
    try {
      res = await runner(job.language, job.code, job.tests, job.timeLimitMs);
      // Un TLE suelto suele ser ruido de la máquina (arranque de Python/JVM): se reintenta hasta 3 veces.
      for (let retry = 0; retry < 3 && res.verdict === 'TLE'; retry++) {
        res = await runner(job.language, job.code, job.tests, job.timeLimitMs);
      }
    } catch (e) {
      res = { verdict: 'RE', passed: 0, total: job.tests.length, results: [], compileOutput: String(e) };
    }
    if (res.verdict !== 'AC') {
      const bad = res.results.find((r) => r.verdict !== 'AC');
      const detail = res.compileOutput?.slice(0, 400) ?? (bad ? `test ${bad.id}: ${bad.verdict}${bad.output !== undefined ? ` · salida: ${JSON.stringify(bad.output.slice(0, 120))}` : ''}${bad.stderr ? ` · stderr: ${bad.stderr.slice(0, 200)}` : ''}` : '');
      failures.push(`Nv ${job.level} · ${job.kind} · ${LANG_LABEL[job.language]}: ${res.verdict} ${detail}`);
    }
    const maxMs = Math.max(0, ...res.results.map((r) => r.timeMs));
    return { job, res, maxMs };
  });

  const levels = stages.flatMap((s) => s.levels).filter((l) => inRange(l.number));
  const cell = (lv: number, kind: Job['kind'], lang: Language, withTime = false) => {
    const r = results.find((x) => x.job.level === lv && x.job.kind === kind && x.job.language === lang)!;
    return `${r.res.verdict} ${r.res.passed}/${r.res.total}${withTime ? ` (${r.maxMs} ms)` : ''}`;
  };
  table('Soluciones contra todos los tests (veredicto · pasados/total · peor tiempo):', [
    ['Nivel', ...LANGUAGES.map((l) => LANG_LABEL[l])],
    ...levels.map((lv) => [`Nv ${String(lv.number).padStart(2)} ${lv.title}`, ...LANGUAGES.map((l) => cell(lv.number, 'solución', l, true))]),
  ]);
  table('Lecciones (contra sus ejemplos) y quizzes (salida = opción correcta):', [
    ['Nivel', ...LANGUAGES.flatMap((l) => [`${LANG_LABEL[l]} lec`, `${LANG_LABEL[l]} quiz`])],
    ...levels.map((lv) => [`Nv ${String(lv.number).padStart(2)}`, ...LANGUAGES.flatMap((l) => [cell(lv.number, 'lección', l), cell(lv.number, 'quiz', l)])]),
  ]);

  if (naive.length) {
    console.log('\nSoluciones ingenuas (deben dar TLE en un test oculto):');
    for (const l of naive) console.log('  ' + l);
  }

  if (failures.length) {
    console.log(`\nFallos de ejecución (${failures.length}):`);
    for (const f of failures) console.log('  ✗ ' + f);
  }
  const ok = errors.length === 0 && failures.length === 0;
  console.log(ok ? '\nTodo en verde.' : '\nHay problemas: revisa la lista de arriba.');
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
