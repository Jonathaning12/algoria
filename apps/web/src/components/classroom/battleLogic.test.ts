import { describe, expect, it } from 'vitest';
import type { RunResponse } from '@algoria/shared';
import {
  battleLog,
  calcStars,
  calcXp,
  clearDraft,
  draftKey,
  formatTime,
  loadDraft,
  normalizeOutput,
  remainingDefense,
  saveDraft,
} from './battleLogic';

describe('calcXp', () => {
  it('da la XP completa sin pistas', () => {
    expect(calcXp(100, 0)).toBe(100);
  });
  it('resta 15 % por pista', () => {
    expect(calcXp(100, 1)).toBe(85);
    expect(calcXp(100, 2)).toBe(70);
    expect(calcXp(100, 3)).toBe(55);
  });
  it('nunca baja del 50 %', () => {
    expect(calcXp(100, 4)).toBe(50);
    expect(calcXp(120, 10)).toBe(60);
  });
  it('da 0 si el nivel ya estaba completado', () => {
    expect(calcXp(100, 0, true)).toBe(0);
  });
  it('redondea', () => {
    expect(calcXp(150, 1)).toBe(128);
  });
});

describe('calcStars', () => {
  it('3 estrellas a la primera sin pistas', () => expect(calcStars(1, 0)).toBe(3));
  it('2 estrellas con 1 pista', () => expect(calcStars(5, 1)).toBe(2));
  it('2 estrellas con ≤3 intentos', () => expect(calcStars(3, 3)).toBe(2));
  it('1 estrella en otro caso', () => expect(calcStars(4, 2)).toBe(1));
});

describe('formatTime', () => {
  it('formatea mm:ss', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(252_400)).toBe('04:12');
    expect(formatTime(3_600_000)).toBe('60:00');
  });
});

describe('normalizeOutput', () => {
  it('quita espacios finales, CRLF y líneas vacías finales', () => {
    expect(normalizeOutput('PAR  \r\nIMPAR\t\n\n\n')).toBe('PAR\nIMPAR');
  });
  it('acepta vacíos', () => {
    expect(normalizeOutput(undefined)).toBe('');
  });
});

const ok = (id: string, sample: boolean) => ({ id, sample, verdict: 'AC' as const, timeMs: 12 });

describe('battleLog', () => {
  it('golpe crítico en submit AC', () => {
    const r: RunResponse = { verdict: 'AC', passed: 8, total: 8, results: Array.from({ length: 8 }, (_, i) => ok(`t${i}`, i < 2)) };
    expect(battleLog(r, 'submit', 'LÍA', 6)).toMatch(/^¡Golpe crítico! 8\/8 tests/);
  });
  it('no compila', () => {
    const r: RunResponse = { verdict: 'CE', passed: 0, total: 8, results: [], compileOutput: 'error' };
    expect(battleLog(r, 'submit', 'LÍA', 6)).toMatch(/no compila/);
  });
  it('tiempo agotado en test oculto', () => {
    const r: RunResponse = {
      verdict: 'TLE', passed: 2, total: 3,
      results: [ok('a', true), ok('b', true), { id: 'c', sample: false, verdict: 'TLE', timeMs: 1000 }],
    };
    expect(battleLog(r, 'submit', 'LÍA', 1)).toMatch(/^Tiempo agotado en un test oculto…/);
  });
  it('WA en ejemplos indica cuántos pasan', () => {
    const r: RunResponse = {
      verdict: 'WA', passed: 1, total: 2,
      results: [ok('a', true), { id: 'b', sample: true, verdict: 'WA', timeMs: 3 }],
    };
    expect(battleLog(r, 'samples', 'LÍA', 5)).toMatch(/1\/2 ejemplos/);
  });
  it('ejemplos AC anima a enviar', () => {
    const r: RunResponse = { verdict: 'AC', passed: 2, total: 2, results: [ok('a', true), ok('b', true)] };
    expect(battleLog(r, 'samples', 'LÍA', 5)).toBe('Tus 2 ejemplos pasan. LÍA aún tiene 5 defensas ocultas… ¡Pulsa ENVIAR!');
  });
});

describe('remainingDefense', () => {
  it('empieza llena y baja con los tests superados', () => {
    expect(remainingDefense(8, null)).toBe(8);
    expect(remainingDefense(8, { verdict: 'WA', passed: 5, total: 8, results: [] })).toBe(3);
  });
});

describe('borrador', () => {
  it('guarda y carga por nivel y lenguaje', () => {
    const map = new Map<string, string>();
    const store = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
    expect(draftKey('nv1', 'cpp')).toBe('algoria.draft.nv1.cpp');
    expect(loadDraft('nv1', 'cpp', 'inicial', store)).toBe('inicial');
    saveDraft('nv1', 'cpp', 'mi código', store);
    expect(loadDraft('nv1', 'cpp', 'inicial', store)).toBe('mi código');
    expect(loadDraft('nv1', 'python', 'inicial', store)).toBe('inicial');
    clearDraft('nv1', 'cpp', store);
    expect(loadDraft('nv1', 'cpp', 'inicial', store)).toBe('inicial');
  });
});
