// Coliseo: torneo individual contrarreloj con problemas de niveles ya superados.
import type { Difficulty, Level, Stage } from '@algoria/shared';

export const TOURNAMENT_SIZE = 5;
export const DURATION_MS = 30 * 60 * 1000;
export const POINTS: Record<Difficulty, number> = { facil: 100, medio: 200, dificil: 300 };
export const WRONG_PENALTY = 20;

export interface Slot {
  levelId: string;
  solved: boolean;
  /** Envíos fallidos (no cuentan los de ejemplo). */
  wrong: number;
}

/** El Coliseo se abre al vencer el gimnasio de la última etapa jugable. */
export function isColiseoUnlocked(completed: string[], stages: Stage[]): boolean {
  const last = stages[stages.length - 1];
  const gym = last?.levels.find((l) => l.gym);
  return !!gym && completed.includes(gym.id);
}

/** Elige `n` niveles distintos al azar entre los superados (Fisher–Yates). */
export function pickTournament(pool: Level[], n = TOURNAMENT_SIZE, rand: () => number = Math.random): string[] {
  const ids = pool.map((l) => l.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  return ids.slice(0, n);
}

/** Puntos de un problema: base por dificultad menos penalización por fallos (mínimo la mitad). */
export function slotScore(slot: Slot, difficulty: Difficulty): number {
  if (!slot.solved) return 0;
  const base = POINTS[difficulty];
  return Math.max(Math.round(base / 2), base - slot.wrong * WRONG_PENALTY);
}

/** Bonus por terminar todo antes de tiempo: 1 punto por cada 10 s sobrantes. */
export function timeBonus(remainingMs: number, allSolved: boolean): number {
  return allSolved ? Math.floor(Math.max(0, remainingMs) / 10_000) : 0;
}

export function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/* ---------- récord ---------- */

export interface ColiseoRecord {
  best: number;
  plays: number;
  last: number;
}

const KEY = 'algoria.coliseo.v1';
export const EMPTY_RECORD: ColiseoRecord = { best: 0, plays: 0, last: 0 };

type Store = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): Store | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadRecord(store: Store | null = storage()): ColiseoRecord {
  try {
    const p = JSON.parse(store?.getItem(KEY) ?? 'null') as Partial<ColiseoRecord> | null;
    if (!p) return EMPTY_RECORD;
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
    return { best: num(p.best), plays: num(p.plays), last: num(p.last) };
  } catch {
    return EMPTY_RECORD;
  }
}

/** Guarda una partida y devuelve el récord actualizado. */
export function saveResult(score: number, store: Store | null = storage()): ColiseoRecord {
  const prev = loadRecord(store);
  const next = { best: Math.max(prev.best, score), plays: prev.plays + 1, last: score };
  try {
    store?.setItem(KEY, JSON.stringify(next));
  } catch {
    // sin almacenamiento: el récord dura lo que la pestaña
  }
  return next;
}
