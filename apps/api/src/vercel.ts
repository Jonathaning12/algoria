// Entrada de la API como función serverless de Vercel (la empaqueta scripts/build-vercel.mjs).
// Reutiliza el mismo servidor Fastify que en desarrollo; en producción el juez usa Judge0.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildServer } from './server';

const app = buildServer({ trustProxy: true });
const ready = app.ready();

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await ready;
  app.server.emit('request', req, res);
}
