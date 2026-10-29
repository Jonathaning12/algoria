import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TestCase } from '@algoria/shared';
import { judge0ConfigFromEnv, judgeWithJudge0, pickLanguageIds, type Judge0Config } from '../src/judge0';

const cfg: Judge0Config = { url: 'https://j0.test', key: 'k', auth: 'token', langIds: {}, pollMs: 1, maxWaitMs: 2000 };
const tests: TestCase[] = [
  { id: 't1', input: '1 2\n', expected: '3\n', sample: true },
  { id: 't2', input: '5 5\n', expected: '10', sample: false },
];
const b64 = (s: string) => Buffer.from(s).toString('base64');

const LANGS = [
  { id: 71, name: 'Python (3.8.1)' },
  { id: 92, name: 'Python (3.11.2)' },
  { id: 54, name: 'C++ (GCC 9.2.0)' },
  { id: 105, name: 'C++ (GCC 14.1.0)' },
  { id: 76, name: 'C++ (Clang 7.0.1)' },
  { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  { id: 91, name: 'Java (JDK 17.0.6)' },
];

/** fetch falso: /languages, POST batch y GET batch con los estados dados. */
function mockJudge0(statuses: { id: number; stdout?: string; compile?: string }[], pendingPolls = 1) {
  let polls = 0;
  const calls: { url: string; init?: RequestInit }[] = [];
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (url.endsWith('/languages')) return new Response(JSON.stringify(LANGS));
    if (init?.method === 'POST') return new Response(JSON.stringify(statuses.map((_, i) => ({ token: `tok${i}` }))));
    polls++;
    const pending = polls <= pendingPolls;
    return new Response(
      JSON.stringify({
        submissions: statuses.map((s, i) => ({
          token: `tok${i}`,
          status: { id: pending ? 2 : s.id, description: '' },
          stdout: s.stdout ? b64(s.stdout) : null,
          compile_output: s.compile ? b64(s.compile) : null,
          time: '0.05',
        })),
      }),
    );
  });
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe('judge0', () => {
  it('elige la versión más moderna de cada lenguaje', () => {
    expect(pickLanguageIds(LANGS)).toEqual({
      python: { id: 92, name: 'Python (3.11.2)' },
      cpp: { id: 105, name: 'C++ (GCC 14.1.0)' },
      java: { id: 91, name: 'Java (JDK 17.0.6)' },
    });
  });

  it('lee la configuración del entorno', () => {
    expect(judge0ConfigFromEnv({})).toBeNull();
    const c = judge0ConfigFromEnv({ JUDGE0_URL: 'https://judge0-ce.p.rapidapi.com/', JUDGE0_KEY: 'x', JUDGE0_LANG_CPP: '54' });
    expect(c).toMatchObject({ url: 'https://judge0-ce.p.rapidapi.com', auth: 'rapidapi', langIds: { cpp: 54 } });
    expect(judge0ConfigFromEnv({ JUDGE0_URL: 'https://mio.example', JUDGE0_KEY: 'x' })?.auth).toBe('token');
  });

  it('AC: compara la salida normalizada y espera a que terminen', async () => {
    const calls = mockJudge0([{ id: 3, stdout: '3\n' }, { id: 4, stdout: '10\n' }], 2);
    const res = await judgeWithJudge0(cfg, { language: 'cpp', code: 'int main(){}', tests, timeLimitMs: 1000 });
    expect(res.verdict).toBe('AC');
    expect(res.passed).toBe(2);
    const post = calls.find((c) => c.init?.method === 'POST')!;
    const body = JSON.parse(String(post.init!.body));
    expect(body.submissions[0]).toMatchObject({ language_id: 105, cpu_time_limit: 1, compiler_options: '-O2 -std=c++17' });
    expect((post.init!.headers as Record<string, string>)['X-Auth-Token']).toBe('k');
  });

  it('WA, TLE y RE', async () => {
    mockJudge0([{ id: 3, stdout: '4' }, { id: 5 }]);
    const res = await judgeWithJudge0(cfg, { language: 'python', code: 'x', tests, timeLimitMs: 1000 });
    expect(res.results.map((r) => r.verdict)).toEqual(['WA', 'TLE']);
    expect(res.verdict).toBe('WA');

    mockJudge0([{ id: 3, stdout: '3' }, { id: 11 }]);
    const re = await judgeWithJudge0(cfg, { language: 'python', code: 'x', tests, timeLimitMs: 1000 });
    expect(re.verdict).toBe('RE');
  });

  it('CE con la salida del compilador', async () => {
    mockJudge0([{ id: 6, compile: 'main.cpp:1: error' }, { id: 6, compile: 'main.cpp:1: error' }]);
    const res = await judgeWithJudge0(cfg, { language: 'cpp', code: 'x', tests, timeLimitMs: 1000 });
    expect(res.verdict).toBe('CE');
    expect(res.compileOutput).toContain('error');
    expect(res.total).toBe(2);
  });

  it('Java sin clase Main no gasta envíos', async () => {
    const calls = mockJudge0([]);
    const res = await judgeWithJudge0(cfg, { language: 'java', code: 'class X {}', tests, timeLimitMs: 1000 });
    expect(res.verdict).toBe('CE');
    expect(calls).toHaveLength(0);
  });

  it('si Judge0 falla devuelve un mensaje amable, sin lanzar', async () => {
    vi.stubGlobal('fetch', async () => new Response('boom', { status: 500 }));
    const res = await judgeWithJudge0({ ...cfg, langIds: { python: 71 } }, { language: 'python', code: 'x', tests, timeLimitMs: 1000 });
    expect(res.verdict).toBe('CE');
    expect(res.compileOutput).toMatch(/juez en línea/);
  });
});
