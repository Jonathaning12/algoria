// Genera .vercel/output (Build Output API v3): la web estática + la API como funciones.
// Uso: npm run build:vercel  (Vercel lo ejecuta como "Build Command").
import { build } from 'esbuild';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '.vercel', 'output');

await rm(out, { recursive: true, force: true });

// 1. Web estática (ya construida por `npm run build -w @algoria/web`).
await cp(join(root, 'apps', 'web', 'dist'), join(out, 'static'), { recursive: true });

// 2. API empaquetada en un único módulo ESM (Fastify + juez + contenido).
const bundle = join(out, 'api-bundle', 'index.mjs');
await build({
  entryPoints: [join(root, 'apps', 'api', 'src', 'vercel.ts')],
  outfile: bundle,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  minify: false,
  sourcemap: false,
  logLevel: 'warning',
  // Algunas dependencias CommonJS usan require() de módulos de Node.
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});

// 3. Una función por ruta: /api/run y /api/health.
for (const route of ['run', 'health']) {
  const fn = join(out, 'functions', 'api', `${route}.func`);
  await mkdir(fn, { recursive: true });
  await cp(bundle, join(fn, 'index.mjs'));
  await writeFile(
    join(fn, '.vc-config.json'),
    JSON.stringify({ runtime: 'nodejs20.x', handler: 'index.mjs', launcherType: 'Nodejs', maxDuration: 60 }, null, 2),
  );
}
await rm(join(out, 'api-bundle'), { recursive: true, force: true });

// 4. Rutas: primero archivos estáticos y funciones; lo demás, a la web.
await writeFile(
  join(out, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '/assets/(.*)', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
        { handle: 'filesystem' },
        { src: '/api/.*', status: 404 },
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);

console.log('Listo: .vercel/output generado.');
