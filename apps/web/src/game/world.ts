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
  const lab = prof ? nearest(all, prof) : undefined;
  const rest = all.filter((h) => h !== lab);
  const gymNpc = stage.levels.find((l) => l.gym)?.npc;
  const gym = gymNpc
    ? nearest(rest, gymNpc)
    : lab
      ? [...rest].sort((a, b) => dist(b, lab) - dist(a, lab))[0]
      : rest[0];
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
): Message | null {
  const { x, y } = facingTile(pos);
  const n = npcAt(npcs, x, y);
  if (n) return talkMessage(n, completed, levels);
  if (isExit(stage.map, x, y) && stage.map.exit) {
    return isExitLocked(stage, completed)
      ? { speaker: 'CAMINO BLOQUEADO', text: stage.map.exit.lockedText }
      : { speaker: 'CAMINO', text: 'El camino está abierto. La siguiente etapa llegará pronto.' };
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
        return { speaker: 'PUERTA CERRADA', text: `${gymName(stage)}: vence a los ${masters} maestros del pueblo para entrar.` };
      }
      return { speaker: 'CASA', text: 'Una casa del pueblo. La puerta está cerrada.' };
    }
    case '~':
      return { text: 'El agua del estanque está tranquila. Ves tu reflejo.' };
    case 'T':
      return { text: 'Un árbol frondoso. No se puede pasar.' };
    case 'o':
      return { text: 'Una roca enorme. Ni con un bucle infinito la moverías.' };
    case '*':
      return { text: 'Unas flores muy bonitas.' };
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
