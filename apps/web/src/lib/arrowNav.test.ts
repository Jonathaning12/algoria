import { describe, expect, it } from 'vitest';
import { nextIndex } from './arrowNav';

describe('nextIndex', () => {
  it('avanza y retrocede con vuelta al principio', () => {
    expect(nextIndex(0, 1, 3)).toBe(1);
    expect(nextIndex(2, 1, 3)).toBe(0);
    expect(nextIndex(0, -1, 3)).toBe(2);
  });

  it('sin foco va al primero (abajo) o al último (arriba)', () => {
    expect(nextIndex(-1, 1, 3)).toBe(0);
    expect(nextIndex(-1, -1, 3)).toBe(2);
  });

  it('sin opciones devuelve -1', () => {
    expect(nextIndex(0, 1, 0)).toBe(-1);
  });
});
