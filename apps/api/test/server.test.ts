import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { Problem, RunResponse } from '@algoria/shared';
import { buildServer, type ServerOptions } from '../src/server';

const fakeProblem: Problem = {
  id: 'fake-sum',
  title: 'Suma falsa',
  statement: 'Suma dos números.',
  inputSpec: 'Dos enteros a y b.',
  outputSpec: 'a + b',
  constraints: '|a|, |b| <= 10^9',
  difficulty: 'facil',
  xp: 10,
  timeLimitMs: 1000,
  tests: [
    { id: 's1', input: '1 2\n', expected: '3\n', sample: true },
    { id: 'h1', input: '10 20\n', expected: '30\n', sample: false },
    { id: 'h2', input: '-5 5\n', expected: '0\n', sample: false },
  ],
  starter: { python: '', cpp: '', java: '' },
  solution: { python: '', cpp: '', java: '' },
  hints: [],
};

const getProblem = (id: string) => (id === fakeProblem.id ? fakeProblem : undefined);
const pySum = 'a, b = map(int, input().split())\nprint(a + b)\n';

let app: FastifyInstance | undefined;
afterEach(async () => {
  await app?.close();
  app = undefined;
});

function make(extra: Partial<ServerOptions> = {}) {
  app = buildServer({ getProblem, ...extra });
  return app;
}

const run = (a: FastifyInstance, body: unknown) =>
  a.inject({ method: 'POST', url: '/api/run', payload: body as Record<string, unknown> });

describe('POST /api/run', () => {
  it('samples: solo ejecuta los tests de ejemplo (juez real, Python)', async () => {
    const res = await run(make(), { problemId: 'fake-sum', language: 'python', code: pySum, mode: 'samples' });
    expect(res.statusCode).toBe(200);
    const body = res.json<RunResponse>();
    expect(body.verdict).toBe('AC');
    expect(body.total).toBe(1);
    expect(body.results[0]).toMatchObject({ id: 's1', input: '1 2\n', expected: '3\n' });
  }, 60_000);

  it('submit: ejecuta todos y oculta los datos de los tests no-sample', async () => {
    const res = await run(make(), { problemId: 'fake-sum', language: 'python', code: pySum, mode: 'submit' });
    expect(res.statusCode).toBe(200);
    const body = res.json<RunResponse>();
    expect(body.verdict).toBe('AC');
    expect(body.passed).toBe(3);
    expect(body.total).toBe(3);
    const hidden = body.results.filter((r) => !r.sample);
    expect(hidden).toHaveLength(2);
    for (const r of hidden) {
      expect(r).not.toHaveProperty('input');
      expect(r).not.toHaveProperty('expected');
      expect(r).not.toHaveProperty('output');
      expect(r).not.toHaveProperty('stderr');
      expect(r.verdict).toBe('AC');
    }
    expect(body.results.find((r) => r.sample)).toHaveProperty('output');
  }, 60_000);

  it('pasa al juez el lenguaje, el código y el timeLimit del problema', async () => {
    let received: unknown;
    const judge: ServerOptions['judge'] = async (input) => {
      received = input;
      return { verdict: 'AC', passed: 0, total: 0, results: [] };
    };
    await run(make({ judge }), { problemId: 'fake-sum', language: 'cpp', code: 'int main(){}', mode: 'submit' });
    expect(received).toMatchObject({ language: 'cpp', code: 'int main(){}', timeLimitMs: 1000 });
    expect((received as { tests: unknown[] }).tests).toHaveLength(3);
  });

  it('404 si el problema no existe', async () => {
    const res = await run(make(), { problemId: 'nope', language: 'python', code: pySum, mode: 'samples' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toMatch(/problema/);
  });

  it.each([
    [{ problemId: 'fake-sum', language: 'ruby', code: pySum, mode: 'samples' }, /Lenguaje/],
    [{ problemId: 'fake-sum', language: 'python', code: '   ', mode: 'samples' }, /vacío/],
    [{ problemId: 'fake-sum', language: 'python', code: 42, mode: 'samples' }, /vacío/],
    [{ problemId: 'fake-sum', language: 'python', code: 'x'.repeat(64 * 1024 + 1), mode: 'samples' }, /64 KB/],
    [{ problemId: 'fake-sum', language: 'python', code: pySum, mode: 'all' }, /Modo/],
    [{ language: 'python', code: pySum, mode: 'samples' }, /problemId/],
  ])('400 con cuerpo inválido %#', async (body, msg) => {
    const res = await run(make(), body);
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(msg);
  });

  it('400 en español con JSON mal formado', async () => {
    const a = make();
    const res = await a.inject({
      method: 'POST',
      url: '/api/run',
      headers: { 'content-type': 'application/json' },
      payload: '{ no es json',
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/Petición inválida/);
  });

  it('429 al superar el límite por IP', async () => {
    const judge: ServerOptions['judge'] = async () => ({ verdict: 'AC', passed: 0, total: 0, results: [] });
    const a = make({ judge, rateLimit: { max: 3, windowMs: 60_000 } });
    const body = { problemId: 'fake-sum', language: 'python', code: pySum, mode: 'samples' };
    for (let i = 0; i < 3; i++) expect((await run(a, body)).statusCode).toBe(200);
    const res = await run(a, body);
    expect(res.statusCode).toBe(429);
    expect(res.json().error).toMatch(/Espera/);
  });

  it('CORS permitido para http://localhost:5180', async () => {
    const res = await make().inject({
      method: 'OPTIONS',
      url: '/api/run',
      headers: {
        origin: 'http://localhost:5180',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    });
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5180');
  });
});

describe('GET /api/health', () => {
  it('devuelve ok y cachea detectCompilers', async () => {
    let calls = 0;
    const detectCompilers: ServerOptions['detectCompilers'] = async () => {
      calls++;
      return { python: { ok: true, version: 'Python 3' }, cpp: { ok: true }, java: { ok: false, error: 'x' } };
    };
    const a = make({ detectCompilers });
    const r1 = await a.inject({ method: 'GET', url: '/api/health' });
    const r2 = await a.inject({ method: 'GET', url: '/api/health' });
    expect(r1.statusCode).toBe(200);
    expect(r1.json()).toMatchObject({ ok: true, compilers: { python: { ok: true } } });
    expect(r2.json()).toEqual(r1.json());
    expect(calls).toBe(1);
  });
});
