import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import type { RunResponse } from '@algoria/shared';

vi.mock('@algoria/content', async () => {
  const { sampleLevel, sampleStage } = await import('./fixtures');
  return {
    stages: [sampleStage],
    allLevels: [sampleLevel],
    getLevel: (id: string) => (id === sampleLevel.id ? sampleLevel : undefined),
    getProblem: () => sampleLevel.problem,
    getStageOfLevel: (id: string) => (id === sampleLevel.id ? sampleStage : undefined),
  };
});

const runCode = vi.fn();
vi.mock('../../../lib/api', () => ({ runCode: (...args: unknown[]) => runCode(...args) }));

import { GameProvider, useGame, type Screen } from '../../../state/game';
import { App } from '../../../App';

function Harness({ start }: { start: Screen }) {
  const { go } = useGame();
  useEffect(() => go(start), []); // eslint-disable-line react-hooks/exhaustive-deps
  return <App />;
}

function renderAt(start: Screen) {
  return render(
    <GameProvider>
      <Harness start={start} />
    </GameProvider>,
  );
}

const LEVEL = 'test-nivel-1';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    'algoria.progress.v1',
    JSON.stringify({ version: 1, language: 'python', playerName: 'JUGADOR 1', xp: 0, completed: [], tips: [], position: null }),
  );
  window.scrollTo = vi.fn() as never;
  // jsdom no mide texto; CodeMirror lo necesita.
  const empty = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
  Range.prototype.getClientRects ??= empty;
  Range.prototype.getBoundingClientRect ??= () => new DOMRect();
  runCode.mockReset();
});
afterEach(() => cleanup());

describe('DialogScreen', () => {
  it('avanza línea a línea y ofrece opciones al final', () => {
    renderAt({ name: 'dialog', levelId: LEVEL });
    expect(screen.getByText('1 / 3')).toBeTruthy();
    const next = screen.getByRole('button', { name: /SIGUIENTE/ });
    expect(document.activeElement).toBe(next);
    fireEvent.click(next);
    fireEvent.click(screen.getByRole('button', { name: /SIGUIENTE/ }));
    expect(screen.queryByRole('button', { name: /SIGUIENTE/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /ENSÉÑAME/ }));
    expect(screen.getByRole('heading', { name: 'IF / ELSE' })).toBeTruthy();
  });

  it('muestra un error amable si el nivel no existe', () => {
    renderAt({ name: 'dialog', levelId: 'no-existe' });
    expect(screen.getByRole('button', { name: 'VOLVER AL MAPA' })).toBeTruthy();
  });
});

describe('LessonScreen', () => {
  it('el quiz permite fallar y reintentar', () => {
    renderAt({ name: 'lesson', levelId: LEVEL });
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]!.textContent).toBe('PYTHON');
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    expect(screen.getByText('CASI…')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(screen.getByText('¡CORRECTO!')).toBeTruthy();
  });
});

describe('BattleScreen', () => {
  it('ENVIAR con AC completa el nivel y lleva a la victoria', async () => {
    const res: RunResponse = {
      verdict: 'AC', passed: 3, total: 3,
      results: [
        { id: 's1', sample: true, verdict: 'AC', timeMs: 10, input: '4', expected: 'PAR', output: 'PAR' },
        { id: 's2', sample: true, verdict: 'AC', timeMs: 12, input: '7', expected: 'IMPAR', output: 'IMPAR' },
        { id: 'h1', sample: false, verdict: 'AC', timeMs: 9 },
      ],
    };
    runCode.mockResolvedValue(res);
    renderAt({ name: 'battle', levelId: LEVEL });
    fireEvent.click(screen.getByRole('button', { name: 'PISTA' }));
    expect(screen.getByText('Usa %.')).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'ENVIAR' }));
    });
    expect(runCode).toHaveBeenCalledWith(expect.objectContaining({ mode: 'submit', language: 'python', problemId: 'test-par-impar' }), expect.anything());
    expect(screen.getByRole('status').textContent).toMatch(/¡Golpe crítico! 3\/3/);
    fireEvent.click(screen.getByRole('button', { name: /CONTINUAR/ }));
    expect(screen.getByText('¡VICTORIA!')).toBeTruthy();
    expect(screen.getByText('+85 XP')).toBeTruthy();
    expect(screen.getByText('¡SUBES A Nv 2!')).toBeTruthy();
    const saved = JSON.parse(localStorage.getItem('algoria.progress.v1')!);
    expect(saved.completed).toEqual([LEVEL]);
    expect(saved.xp).toBe(85);
  });

  it('muestra la salida del compilador en CE', async () => {
    runCode.mockResolvedValue({ verdict: 'CE', passed: 0, total: 3, results: [], compileOutput: 'SyntaxError: línea 1' } satisfies RunResponse);
    renderAt({ name: 'battle', levelId: LEVEL });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'EJECUTAR' }));
    });
    expect(screen.getByText('SyntaxError: línea 1')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/no compila/);
  });

  it('muestra el error de red', async () => {
    runCode.mockRejectedValue(new Error('No se pudo contactar con el juez.'));
    renderAt({ name: 'battle', levelId: LEVEL });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'ENVIAR' }));
    });
    expect(screen.getByRole('status').textContent).toMatch(/No se pudo contactar/);
  });
});
