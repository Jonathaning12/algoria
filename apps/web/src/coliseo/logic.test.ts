import { describe, expect, it } from 'vitest';
import type { Level, Stage } from '@algoria/shared';
import {
  EMPTY_RECORD,
  formatClock,
  isColiseoUnlocked,
  loadRecord,
  pickTournament,
  saveResult,
  slotScore,
  timeBonus,
} from './logic';

const lv = (id: string, gym = false) => ({ id, gym }) as unknown as Level;
const stage = (levels: Level[]) => ({ levels }) as unknown as Stage;

function memoryStore() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
}

describe('coliseo', () => {
  it('se abre al vencer el gimnasio de la última etapa', () => {
    const stages = [stage([lv('a'), lv('g1', true)]), stage([lv('b'), lv('g2', true)])];
    expect(isColiseoUnlocked(['g1'], stages)).toBe(false);
    expect(isColiseoUnlocked(['g2'], stages)).toBe(true);
    expect(isColiseoUnlocked([], [])).toBe(false);
  });

  it('elige problemas distintos', () => {
    const pool = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => lv(id));
    const picked = pickTournament(pool, 5, () => 0.42);
    expect(picked).toHaveLength(5);
    expect(new Set(picked).size).toBe(5);
    expect(pickTournament(pool.slice(0, 3), 5)).toHaveLength(3);
  });

  it('puntúa por dificultad con penalización y mínimo de la mitad', () => {
    expect(slotScore({ levelId: 'x', solved: false, wrong: 0 }, 'facil')).toBe(0);
    expect(slotScore({ levelId: 'x', solved: true, wrong: 0 }, 'medio')).toBe(200);
    expect(slotScore({ levelId: 'x', solved: true, wrong: 2 }, 'dificil')).toBe(260);
    expect(slotScore({ levelId: 'x', solved: true, wrong: 99 }, 'facil')).toBe(50);
  });

  it('bonus de tiempo solo si se resuelve todo', () => {
    expect(timeBonus(125_000, true)).toBe(12);
    expect(timeBonus(125_000, false)).toBe(0);
    expect(timeBonus(-5, true)).toBe(0);
  });

  it('formatea el reloj', () => {
    expect(formatClock(30 * 60 * 1000)).toBe('30:00');
    expect(formatClock(61_001)).toBe('01:02');
    expect(formatClock(-1)).toBe('00:00');
  });

  it('guarda el récord y tolera datos corruptos', () => {
    const s = memoryStore();
    expect(loadRecord(s)).toEqual(EMPTY_RECORD);
    saveResult(300, s);
    expect(saveResult(120, s)).toEqual({ best: 300, plays: 2, last: 120 });
    s.setItem('algoria.coliseo.v1', '{roto');
    expect(loadRecord(s)).toEqual(EMPTY_RECORD);
  });
});
