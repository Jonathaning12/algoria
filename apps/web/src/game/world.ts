// Lógica pura del mapa: colisiones, movimiento, casilla de enfrente y estado de NPCs.
// Sin React ni estado global, para poder probarla con vitest.
import { SOLID_TILES, type Level, type Npc, type SpriteId, type Stage, type StageMap } from '@algoria/shared';

export type Dir = 'up' | 'down' | 'left' | 'right';

export interface Pos {
  x: number;
  y: number;
}

export interface PlayerPos extends Pos {
  dir: Dir;
}

export const DIRS: Record<Dir, readonly [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** Teclas de movimiento (e.key en minúsculas). */
export const KEY_DIRS: Record<string, Dir> = {
  w: 'up',
  arrowup: 'up',
  s: 'down',
  arrowdown: 'down',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
};

/** Un personaje del mapa: nivel (con `level`) o NPC extra (solo saluda). */
export interface WorldNpc {
  npc: Npc;
  greeting: string;
  level?: Level;
}

export type NpcStatus = 'current' | 'done' | 'locked' | 'extra';

export function mapSize(map: StageMap): { cols: number; rows: number } {
  return { cols: Math.max(0, ...map.rows.map((r) => r.length)), rows: map.rows.length };
}

/** Carácter de la casilla; fuera del mapa cuenta como árbol (sólido). */
export function tileAt(map: StageMap, x: number, y: number): string {
  if (y < 0 || x < 0) return 'T';
  const row = map.rows[y];
  if (row === undefined || x >= row.length) return 'T';
  return row.charAt(x);
}

export function worldNpcs(stage: Stage): WorldNpc[] {
  return [
    ...stage.levels.map((level) => ({ npc: level.npc, greeting: level.greeting, level })),
    ...stage.map.extraNpcs.map(({ greeting, ...npc }) => ({ npc, greeting })),
  ];
}

export function npcAt(npcs: WorldNpc[], x: number, y: number): WorldNpc | undefined {
  return npcs.find((n) => n.npc.x === x && n.npc.y === y);
}

/** Nivel anterior por número (en todo el juego). */
export function previousLevel(levels: Level[], level: Level): Level | undefined {
  return levels.find((l) => l.number === level.number - 1);
}

export function levelStatus(level: Level, completed: string[], levels: Level[]): Exclude<NpcStatus, 'extra'> {
  if (completed.includes(level.id)) return 'done';
  const prev = previousLevel(levels, level);
  return !prev || completed.includes(prev.id) ? 'current' : 'locked';
}

export function npcStatus(n: WorldNpc, completed: string[], levels: Level[]): NpcStatus {
  return n.level ? levelStatus(n.level, completed, levels) : 'extra';
}

/** La salida sigue cerrada mientras el gimnasio de la etapa no esté completado. */
export function isExitLocked(stage: Stage, completed: string[]): boolean {
  const gym = stage.levels.find((l) => l.gym);
  return !gym || !completed.includes(gym.id);
}

export function isExit(map: StageMap, x: number, y: number): boolean {
  return !!map.exit && map.exit.x === x && map.exit.y === y;
}

export function isWalkable(map: StageMap, npcs: WorldNpc[], x: number, y: number): boolean {
  return !SOLID_TILES.has(tileAt(map, x, y)) && !npcAt(npcs, x, y);
}

export type StepResult =
  | { moved: true; pos: PlayerPos; tile: string }
  | { moved: false; pos: PlayerPos; reason: 'solid' | 'npc' | 'exit' };

/** Intenta avanzar una casilla. Siempre gira al jugador hacia `dir`. */
export function step(
  stage: Stage,
  npcs: WorldNpc[],
  from: PlayerPos,
  dir: Dir,
  completed: string[],
): StepResult {
  const [dx, dy] = DIRS[dir];
  const nx = from.x + dx;
  const ny = from.y + dy;
  const turned: PlayerPos = { ...from, dir };
  const tile = tileAt(stage.map, nx, ny);
  if (SOLID_TILES.has(tile)) return { moved: false, pos: turned, reason: 'solid' };
  if (npcAt(npcs, nx, ny)) return { moved: false, pos: turned, reason: 'npc' };
  if (isExit(stage.map, nx, ny) && isExitLocked(stage, completed)) return { moved: false, pos: turned, reason: 'exit' };
  return { moved: true, pos: { x: nx, y: ny, dir }, tile };
}

export function facingTile(pos: PlayerPos): Pos {
  const [dx, dy] = DIRS[pos.dir];
  return { x: pos.x + dx, y: pos.y + dy };
}

/** Dirección para mirar desde `from` hacia `to` (eje dominante). */
export function faceToward(from: Pos, to: Pos): Dir {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return 'down';
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export type HouseKind = 'gym' | 'lab' | 'house';

function dist(a: Pos, b: Pos): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function nearest(houses: Pos[], target: Pos): Pos | undefined {
  return [...houses].sort((a, b) => dist(a, target) - dist(b, target))[0];
}

/** Casillas de casa ('H') con su función: laboratorio (junto al Prof. Bit), gimnasio y casas normales. */
export function houses(stage: Stage): (Pos & { kind: HouseKind })[] {
  const all: Pos[] = [];
  stage.map.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === 'H') all.push({ x, y });
    });
  });
  const prof = stage.map.extraNpcs.find((n) => n.sprite === 'prof');
  const gymNpc = stage.levels.find((l) => l.gym)?.npc;
  // Con líder de gimnasio, su casa se decide primero (en el bosque solo hay una casa: el gimnasio).
  let gym = gymNpc ? nearest(all, gymNpc) : undefined;
  const lab = prof ? nearest(all.filter((h) => h !== gym), prof) : undefined;
  if (!gymNpc) {
    const rest = all.filter((h) => h !== lab);
    gym = lab ? [...rest].sort((a, b) => dist(b, lab) - dist(a, lab))[0] : rest[0];
  }
  return all.map((h) => ({ ...h, kind: h === lab ? 'lab' : h === gym ? 'gym' : 'house' }));
}

export interface Message {
  speaker?: string;
  sprite?: SpriteId;
  text: string;
  /** Si existe, la caja ofrece "HABLAR ▸" hacia este nivel. */
  levelId?: string;
}

export const INTRO_TEXT = 'Usa W A S D o las flechas para caminar. Haz clic en un personaje para hablar con él.';
export const TALLGRASS_TEXT =
  'La hierba alta se mueve… Aquí viven los Bugs salvajes. Próximamente: retos de práctica aleatorios.';

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function gymName(stage: Stage): string {
  return `Gimnasio ${titleCase(stage.badge)}`;
}

/** Mensaje al hablar con un NPC (clic o E). */
export function talkMessage(n: WorldNpc, completed: string[], levels: Level[]): Message {
  const base = { sprite: n.npc.sprite };
  if (!n.level) return { ...base, speaker: n.npc.name, text: n.greeting };
  const speaker = `${n.npc.name} · Nv ${n.level.number}`;
  const status = levelStatus(n.level, completed, levels);
  if (status === 'locked') {
    const prev = previousLevel(levels, n.level);
    return { ...base, speaker, text: `Aún no estás listo. Vence primero a ${prev?.npc.name ?? 'los demás maestros'}.` };
  }
  return { ...base, speaker, text: n.greeting, levelId: n.level.id };
}

/** Qué hay en la casilla de enfrente (tecla E). `null` si no hay nada que examinar. */
export function examine(
  stage: Stage,
  npcs: WorldNpc[],
  pos: PlayerPos,
  completed: string[],
  levels: Level[],
  stages: Stage[] = [stage],
): Message | null {
  const { x, y } = facingTile(pos);
  const n = npcAt(npcs, x, y);
  if (n) return talkMessage(n, completed, levels);
  if (isExit(stage.map, x, y) && stage.map.exit) {
    if (isExitLocked(stage, completed)) return { speaker: 'CAMINO BLOQUEADO', text: stage.map.exit.lockedText };
    const next = nextStage(stages, stage);
    return next
      ? { speaker: 'CAMINO', text: `El camino está abierto. Lleva a${stageTitle(next.name, true)}.` }
      : { speaker: 'CAMINO', text: comingSoonText(stage) };
  }
  if (isBack(stage.map, x, y)) {
    const prev = previousStage(stages, stage);
    if (prev) return { speaker: 'CAMINO', text: `Este camino vuelve a${stageTitle(prev.name, true)}.` };
  }
  const tile = tileAt(stage.map, x, y);
  switch (tile) {
    case 'S': {
      const sign = stage.map.signs.find((s) => s.x === x && s.y === y);
      return { speaker: 'CARTEL', text: sign?.text ?? 'El cartel está borroso. No se puede leer.' };
    }
    case 'H': {
      const kind = houses(stage).find((h) => h.x === x && h.y === y)?.kind ?? 'house';
      if (kind === 'lab') return { speaker: 'LAB', text: 'Laboratorio del Prof. Bit. Aquí nacieron los compañeros.' };
      if (kind === 'gym') {
        const gym = stage.levels.find((l) => l.gym);
        if (gym && completed.includes(gym.id)) {
          return { speaker: 'GIMNASIO', text: `Ya venciste en el ${gymName(stage)}. ¡Buen trabajo!` };
        }
        if (gym && levelStatus(gym, completed, levels) === 'current') {
          return { speaker: 'GIMNASIO', text: `El ${gymName(stage)} te espera. Habla con ${gym.npc.name}.` };
        }
        const masters = stage.levels.filter((l) => !l.gym).length || 9;
        const where = stage.number === 1 ? 'del pueblo' : 'de la zona';
        return { speaker: 'PUERTA CERRADA', text: `${gymName(stage)}: vence a los ${masters} maestros ${where} para entrar.` };
      }
      return {
        speaker: 'CASA',
        text: stage.number === 1 ? 'Una casa del pueblo. La puerta está cerrada.' : 'Una cabaña. La puerta está cerrada.',
      };
    }
    case '~':
      return { text: 'El agua del estanque está tranquila. Ves tu reflejo.' };
    case 'T':
      return { text: 'Un árbol frondoso. No se puede pasar.' };
    case 'o':
      return { text: 'Una roca enorme. Ni con un bucle infinito la moverías.' };
    case '*':
      return { text: 'Unas flores muy bonitas.' };
    case 'P':
      return { text: 'Un pino altísimo. Huele a resina.' };
    case 'B':
      return { text: 'Un arbusto espeso. Algo se mueve dentro… solo es el viento.' };
    case 'L':
      return { text: 'Un tronco caído. Tiene tantos anillos que da pereza contarlos uno a uno.' };
    case 'm':
      return { text: 'Una seta roja con puntos blancos. Mejor no tocarla.' };
    case '#':
      return { text: 'Un puente de tablones. Cruje un poco, pero aguanta.' };
    default:
      return null;
  }
}

/** Posición inicial: la guardada si es válida; si no, el spawn. */
export function startPosition(stage: Stage, npcs: WorldNpc[], saved: PlayerPos | null | undefined): PlayerPos {
  const { cols, rows } = mapSize(stage.map);
  if (
    saved &&
    Number.isInteger(saved.x) &&
    Number.isInteger(saved.y) &&
    saved.x >= 0 &&
    saved.y >= 0 &&
    saved.x < cols &&
    saved.y < rows &&
    isWalkable(stage.map, npcs, saved.x, saved.y) &&
    DIRS[saved.dir]
  ) {
    return { x: saved.x, y: saved.y, dir: saved.dir };
  }
  return { ...stage.map.spawn, dir: 'down' };
}

/* ---------- Varias etapas ---------- */

/** Una etapa de la ruta de Algoria (tenga o no contenido todavía). */
export interface RouteInfo {
  n: number;
  name: string;
  range: string;
  topics: string;
  color: string;
  badge: string;
}

/** Ruta completa. Las etapas sin contenido en @algoria/content se muestran como "PRÓXIMAMENTE". */
export const ROUTE: RouteInfo[] = [
  { n: 1, name: 'PUEBLO SEMILLA', range: 'Nv 1–10', topics: 'Imprimir, variables, entrada, operadores, if, bucles, listas y funciones.', color: '#6cc04a', badge: 'SEMILLA' },
  { n: 2, name: 'BOSQUE ITERADOR', range: 'Nv 11–20', topics: 'Arreglos y strings, bucles anidados, contar y acumular. Primer vistazo a Big-O.', color: '#2f7a3a', badge: 'HOJA' },
  { n: 3, name: 'CUEVA RECURSIVA', range: 'Nv 21–30', topics: 'Recursión, ordenamiento, búsqueda binaria y dos punteros.', color: '#7d8399', badge: 'ESPIRAL' },
  { n: 4, name: 'PUERTO ESTRUCTURA', range: 'Nv 31–40', topics: 'Pilas, colas, mapas, sets y colas de prioridad.', color: '#3a8fb5', badge: 'ANCLA' },
  { n: 5, name: 'MONTAÑA GRAFO', range: 'Nv 41–50', topics: 'Grafos, BFS, DFS, caminos mínimos y union-find.', color: '#e0483e', badge: 'CUMBRE' },
  { n: 6, name: 'TORRE DINÁMICA', range: 'Nv 51–60', topics: 'Programación dinámica: memoización, mochila, subsecuencias.', color: '#9b6fd6', badge: 'TORRE' },
  { n: 7, name: 'COLISEO', range: 'Nv 60+', topics: 'Torneos semanales cronometrados contra otros jugadores, como un contest real.', color: '#f6c945', badge: 'CORONA' },
];

const FEMININE = /^(CUEVA|MONTAÑA|TORRE)\b/;

/** "PUEBLO SEMILLA" → "Pueblo Semilla". */
export function stageName(name: string): string {
  return name
    .split(' ')
    .map((w) => titleCase(w))
    .join(' ');
}

/**
 * Nombre con artículo: "el Pueblo Semilla", "la Cueva Recursiva".
 * Con `afterA`, la forma que sigue a "a": "l Pueblo Semilla" (→ "al …") o " la Cueva …".
 */
export function stageTitle(name: string, afterA = false): string {
  const fem = FEMININE.test(name);
  if (afterA) return fem ? ` la ${stageName(name)}` : `l ${stageName(name)}`;
  return `${fem ? 'la' : 'el'} ${stageName(name)}`;
}

export function nextStage(stages: Stage[], stage: Stage): Stage | undefined {
  const i = stages.findIndex((s) => s.id === stage.id);
  return i < 0 ? undefined : stages[i + 1];
}

export function previousStage(stages: Stage[], stage: Stage): Stage | undefined {
  const i = stages.findIndex((s) => s.id === stage.id);
  return i <= 0 ? undefined : stages[i - 1];
}

export function isBack(map: StageMap, x: number, y: number): boolean {
  return !!map.back && map.back.x === x && map.back.y === y;
}

/** Texto al pisar la salida abierta de la última etapa con contenido. */
export function comingSoonText(stage: Stage): string {
  const upcoming = ROUTE.find((r) => r.n === stage.number + 1);
  return upcoming
    ? `Próximamente: ${stageName(upcoming.name)}. El camino aún no está listo.`
    : 'Próximamente: nuevas aventuras. El camino aún no está listo.';
}

/** Punto cardinal de una casilla según el borde del mapa en el que está (o null si no está en un borde). */
export function edgeWord(map: StageMap, p: Pos): 'norte' | 'sur' | 'este' | 'oeste' | null {
  const { cols, rows } = mapSize(map);
  if (p.y >= rows - 1) return 'sur';
  if (p.y <= 0) return 'norte';
  if (p.x <= 0) return 'oeste';
  if (p.x >= cols - 1) return 'este';
  return null;
}

const INWARD: Record<NonNullable<ReturnType<typeof edgeWord>>, Dir> = {
  sur: 'up',
  norte: 'down',
  oeste: 'right',
  este: 'left',
};

/**
 * Llegada a `stage` volviendo desde la etapa siguiente: la casilla caminable junto a su `exit`,
 * preferentemente hacia dentro del mapa y mirando en esa dirección. Sin salida, el spawn.
 */
export function arrivalAtExit(stage: Stage): PlayerPos {
  const exit = stage.map.exit;
  if (!exit) return { ...stage.map.spawn, dir: 'down' };
  const npcs = worldNpcs(stage);
  const { cols, rows } = mapSize(stage.map);
  const edge = edgeWord(stage.map, exit);
  const inward = edge ? INWARD[edge] : undefined;
  const order = (['up', 'down', 'left', 'right'] as Dir[]).sort((a, b) => Number(b === inward) - Number(a === inward));
  for (const dir of order) {
    const [dx, dy] = DIRS[dir];
    const x = exit.x + dx;
    const y = exit.y + dy;
    if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
    if (isWalkable(stage.map, npcs, x, y) && !isBack(stage.map, x, y)) return { x, y, dir };
  }
  return { ...stage.map.spawn, dir: 'down' };
}

export interface Travel {
  stage: Stage;
  pos: PlayerPos;
}

export type MoveResult =
  | (StepResult & { travel?: undefined })
  | { moved: false; pos: PlayerPos; reason: 'soon'; text: string; travel?: undefined }
  | { moved: true; pos: PlayerPos; tile: string; travel: Travel };

/**
 * `step` más los viajes entre etapas:
 * - `exit` abierta y hay etapa siguiente → viaja a su spawn; si no la hay → "Próximamente" y no se mueve.
 * - `back` → viaja a la etapa anterior, junto a su salida y mirando hacia dentro.
 */
export function move(
  stages: Stage[],
  stage: Stage,
  npcs: WorldNpc[],
  from: PlayerPos,
  dir: Dir,
  completed: string[],
): MoveResult {
  const r = step(stage, npcs, from, dir, completed);
  if (!r.moved) return r;
  const { x, y } = r.pos;
  if (isExit(stage.map, x, y)) {
    const next = nextStage(stages, stage);
    if (!next) return { moved: false, pos: { ...from, dir }, reason: 'soon', text: comingSoonText(stage) };
    return { ...r, travel: { stage: next, pos: { ...next.map.spawn, dir } } };
  }
  if (isBack(stage.map, x, y)) {
    const prev = previousStage(stages, stage);
    if (prev) return { ...r, travel: { stage: prev, pos: arrivalAtExit(prev) } };
  }
  return r;
}

/** Fondo de hierba de cada etapa: color base y puntos. */
export interface Ground {
  base: string;
  dot: string;
}

export const DEFAULT_GROUND: Ground = { base: '#6cc04a', dot: '#4f9e38' };

export const STAGE_GROUND: Record<string, Ground> = {
  'pueblo-semilla': DEFAULT_GROUND,
  'bosque-iterador': { base: '#4f9e38', dot: '#2f7a3a' },
};

export function groundOf(stage: Pick<Stage, 'id'>): Ground {
  return STAGE_GROUND[stage.id] ?? DEFAULT_GROUND;
}

/** MISIÓN ACTUAL cuando el siguiente nivel está en otra etapa; `null` si está en esta. */
export function missionElsewhere(stages: Stage[], stage: Stage, mission: Level): string | null {
  const target = stages.find((s) => s.levels.some((l) => l.id === mission.id));
  if (!target || target.id === stage.id) return null;
  const who = `${mission.npc.name} (Nv ${mission.number})`;
  if (target.number > stage.number) {
    const edge = stage.map.exit ? edgeWord(stage.map, stage.map.exit) : null;
    return `${edge ? `Cruza al ${edge} hacia` : 'Ve hacia'} ${stageTitle(target.name)}. Allí te espera ${who}.`;
  }
  const edge = stage.map.back ? edgeWord(stage.map, stage.map.back) : null;
  return `Vuelve a${stageTitle(target.name, true)}${edge ? ` por el camino del ${edge}` : ''}. Allí te espera ${who}.`;
}
