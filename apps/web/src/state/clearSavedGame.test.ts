import { describe, expect, it } from 'vitest';
import { clearSavedGame } from './game';

function memoryStorage(entries: Record<string, string>) {
  const m = new Map(Object.entries(entries));
  return {
    get length() {
      return m.size;
    },
    key: (i: number) => [...m.keys()][i] ?? null,
    removeItem: (k: string) => void m.delete(k),
    keys: () => [...m.keys()].sort(),
  };
}

describe('clearSavedGame', () => {
  it('borra progreso, borradores y récord, pero conserva los ajustes de audio', () => {
    const store = memoryStorage({
      'algoria.progress.v1': '{}',
      'algoria.draft.n01-hola-mundo.python': 'print("Hola, mundo!")',
      'algoria.draft.n21-recursion.cpp': 'int main() {}',
      'algoria.coliseo.v1': '{"best":300}',
      'algoria.audio.v1': '{"music":false}',
      'otra-app.dato': 'x',
    });
    clearSavedGame(store);
    expect(store.keys()).toEqual(['algoria.audio.v1', 'otra-app.dato']);
  });

  it('no falla sin almacenamiento', () => {
    expect(() => clearSavedGame(null)).not.toThrow();
  });
});
