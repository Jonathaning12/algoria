# Arquitectura de Algoria

Monorepo con npm workspaces. Todo en TypeScript; los paquetes se consumen como código fuente (sin build intermedio).

```
apps/
  web/        React 18 + Vite. El juego (pantallas, mapa, editor). Puerto 5180, /api → 8787.
  api/        Fastify. POST /api/run → juez. Puerto 8787.
packages/
  shared/     Tipos y contratos compartidos (Language, Level, Problem, RunRequest…). NO cambiar sin coordinar.
  content/    Etapas, niveles, lecciones, problemas y tests. `npm run verify:content` comprueba soluciones.
  judge/      Compila y ejecuta código Python / C++ / Java contra tests con límite de tiempo.
design/       Bocetos originales (.dc.html) — referencia visual, no se ejecutan.
```

## Flujo del juego (apps/web)

`state/game.tsx` guarda la pantalla actual y el progreso (localStorage `algoria.progress.v1`).

title → (elige compañero = lenguaje) → map → clic en NPC → dialog → lesson | battle → victory → map
                                                                          profile ←→ map

- Un nivel se desbloquea cuando el anterior está completado (`isUnlocked`).
- `completeLevel(levelId, xp)` se llama al ganar el duelo; guarda XP y el tip en la Libreta.
- Controles del mapa: WASD / flechas (solo con el mapa enfocado), clic en NPC para hablar, E examina, Esc cierra.

## Juez (packages/judge)

`judge({ language, code, tests, timeLimitMs }) → RunResponse`.
Usa los compiladores locales: `python`, `g++` (MSYS2 UCRT64), `javac`/`java`. Cada ejecución en una carpeta temporal propia.

- Límite por test = `timeLimitMs` × factor del lenguaje + margen de arranque
  (Python ×2 + 2000 ms, C++ ×1 + 500 ms, Java ×2 + 1500 ms). El margen existe porque en Windows
  el antivirus hace que arrancar un proceso pueda tardar más de un segundo.
  Se ajusta con `ALGORIA_STARTUP_MS_PYTHON`, `ALGORIA_STARTUP_MS_CPP` y `ALGORIA_STARTUP_MS_JAVA`.
- Tras el primer TLE no se ejecutan los tests restantes (se marcan TLE) para no hacer esperar al jugador.
- La salida máxima por test es 64 KB.

> **Aviso:** el juez ejecuta el código directamente en la máquina, sin aislarlo. El proyecto es solo para
> uso local; antes de publicarlo habría que aislar el juez (por ejemplo con Judge0 o contenedores sin red).

## Contenido público (web)

La web no importa el contenido completo: un alias de Vite apunta `@algoria/content` a
`packages/content/src/public.ts`, que lee `generated/public-content.json` (sin soluciones y con los tests
ocultos vacíos). Lo genera `npm run gen:public -w @algoria/content`, que `dev`, `build`, `test` y
`typecheck` de la web ejecutan antes. La API sí usa el contenido completo.

## Coliseo

Se abre al vencer el gimnasio de la última etapa. Torneo individual de 30 minutos con 5 problemas al azar
de niveles superados (`apps/web/src/coliseo/logic.ts`); el récord se guarda en `localStorage`
(`algoria.coliseo.v1`).

## Convenciones

- Textos de interfaz en español; código e identificadores en inglés.
- Sin emojis en la UI: iconos en SVG pixel o caracteres de dibujo (▼ ▸ ✓).
- Colores y fuentes: tokens en `apps/web/src/styles/global.css`.
