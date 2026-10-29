// Prueba de humo del paquete de Vercel: levanta la función empaquetada en un servidor
// local y llama a /api/health y /api/run. Uso: node scripts/smoke-vercel.mjs
import { createServer } from 'node:http';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const fn = join(process.cwd(), '.vercel', 'output', 'functions', 'api', 'run.func', 'index.mjs');
const { default: handler } = await import(pathToFileURL(fn).href);
const server = createServer((req, res) => handler(req, res));
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const health = await fetch(`${base}/api/health`).then((r) => r.json());
console.log('health:', JSON.stringify(health));

const run = await fetch(`${base}/api/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    problemId: process.argv[2] ?? 'p01-hola-mundo',
    language: 'python',
    code: 'print("Hola, mundo!")\nprint("Bienvenido a Algoria")\n',
    mode: 'submit',
  }),
}).then((r) => r.json());
console.log('run:', run.verdict ?? run.error, `${run.passed ?? '-'}/${run.total ?? '-'}`);

// Cerrar antes de salir: process.exit() con el servidor cerrándose rompe libuv en Windows.
server.closeAllConnections();
await new Promise((r) => server.close(r));
process.exitCode = run.verdict === 'AC' && health.ok ? 0 : 1;
