// API de Algoria: POST /api/run (juez) y GET /api/health.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { getProblem as contentGetProblem } from '@algoria/content';
import { detectCompilers as realDetectCompilers, judge as realJudge } from '@algoria/judge';
import type { ApiError, Problem, RunRequest, RunResponse } from '@algoria/shared';
import { LANGUAGES } from '@algoria/shared';

export const MAX_CODE_BYTES = 64 * 1024;

export interface ServerOptions {
  getProblem?: (id: string) => Problem | undefined;
  /** Sustituible en tests. */
  judge?: typeof realJudge;
  detectCompilers?: typeof realDetectCompilers;
  /** Límite por IP para /api/run. Por defecto 30 peticiones por minuto. */
  rateLimit?: { max: number; windowMs: number };
  logger?: boolean;
  /** Detrás de un proxy (Vercel) la IP real viene en X-Forwarded-For. */
  trustProxy?: boolean;
}

// En producción la web y la API comparten dominio, así que CORS solo hace falta en desarrollo.
const ALLOWED_ORIGINS = ['http://localhost:5180', 'http://127.0.0.1:5180'];

function apiError(error: string): ApiError {
  return { error };
}

/** Valida el cuerpo; devuelve un mensaje en español si algo falla. */
function validateBody(body: unknown): string | RunRequest {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return 'El cuerpo de la petición debe ser un objeto JSON.';
  }
  const b = body as Record<string, unknown>;
  if (typeof b.problemId !== 'string' || b.problemId.trim() === '') {
    return 'Falta el campo "problemId".';
  }
  if (typeof b.language !== 'string' || !(LANGUAGES as readonly string[]).includes(b.language)) {
    return `Lenguaje no válido. Usa uno de: ${LANGUAGES.join(', ')}.`;
  }
  if (typeof b.code !== 'string' || b.code.trim() === '') {
    return 'El código está vacío.';
  }
  if (Buffer.byteLength(b.code, 'utf8') > MAX_CODE_BYTES) {
    return 'El código es demasiado largo (máximo 64 KB).';
  }
  if (b.mode !== 'samples' && b.mode !== 'submit') {
    return 'Modo no válido. Usa "samples" o "submit".';
  }
  return { problemId: b.problemId, language: b.language as RunRequest['language'], code: b.code, mode: b.mode };
}

/** Borra los datos de los tests ocultos (sample: false). */
export function hideHiddenTests(res: RunResponse): RunResponse {
  return {
    ...res,
    results: res.results.map((r) => {
      if (r.sample) return r;
      const { input: _i, expected: _e, output: _o, stderr: _s, ...rest } = r;
      return rest;
    }),
  };
}

export function buildServer(opts: ServerOptions = {}): FastifyInstance {
  const getProblem = opts.getProblem ?? contentGetProblem;
  const judge = opts.judge ?? realJudge;
  const detectCompilers = opts.detectCompilers ?? realDetectCompilers;
  const { max: rateMax, windowMs } = opts.rateLimit ?? { max: 30, windowMs: 60_000 };

  const app = Fastify({ logger: opts.logger ?? false, bodyLimit: 1024 * 1024, trustProxy: opts.trustProxy ?? false });

  app.register(cors, { origin: ALLOWED_ORIGINS });

  // Errores de Fastify (JSON mal formado, cuerpo demasiado grande...) en español.
  app.setErrorHandler((err: { statusCode?: number; message?: string }, _req, reply) => {
    const status = err.statusCode ?? 500;
    if (status === 413) return reply.code(413).send(apiError('La petición es demasiado grande.'));
    if (status === 415) return reply.code(415).send(apiError('La petición debe enviarse como JSON.'));
    if (status >= 400 && status < 500) return reply.code(status).send(apiError('Petición inválida: revisa el JSON enviado.'));
    app.log.error(err);
    return reply.code(500).send(apiError('Error interno del servidor.'));
  });
  app.setNotFoundHandler((_req, reply) => reply.code(404).send(apiError('Ruta no encontrada.')));

  // Límite simple en memoria (ventana fija por IP).
  const hits = new Map<string, { count: number; resetAt: number }>();
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [ip, h] of hits) if (h.resetAt <= now) hits.delete(ip);
  }, Math.max(windowMs, 10_000));
  sweep.unref();
  app.addHook('onClose', async () => clearInterval(sweep));

  function rateLimited(ip: string): boolean {
    const now = Date.now();
    const h = hits.get(ip);
    if (!h || h.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return false;
    }
    h.count++;
    return h.count > rateMax;
  }

  let healthCache: Promise<Awaited<ReturnType<typeof detectCompilers>>> | undefined;

  app.get('/api/health', async () => {
    healthCache ??= detectCompilers().catch((e) => {
      healthCache = undefined; // no cachear fallos inesperados
      throw e;
    });
    return { ok: true, compilers: await healthCache };
  });

  app.post('/api/run', async (req, reply) => {
    if (rateLimited(req.ip)) {
      return reply.code(429).send(apiError('Demasiados intentos seguidos. Espera un minuto y vuelve a probar.'));
    }
    const parsed = validateBody(req.body);
    if (typeof parsed === 'string') return reply.code(400).send(apiError(parsed));

    const problem = getProblem(parsed.problemId);
    if (!problem) return reply.code(404).send(apiError('No existe ese problema.'));

    const tests = parsed.mode === 'samples' ? problem.tests.filter((t) => t.sample) : problem.tests;
    const res = await judge({
      language: parsed.language,
      code: parsed.code,
      tests,
      timeLimitMs: problem.timeLimitMs,
    });
    return reply.send(hideHiddenTests(res));
  });

  return app;
}

function isMain(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  const a = path.resolve(fileURLToPath(import.meta.url));
  const b = path.resolve(entry);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

if (isMain()) {
  const port = Number(process.env.PORT) || 8787;
  const host = process.env.HOST || 'localhost';
  const app = buildServer({ logger: true });
  app.listen({ port, host }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}
