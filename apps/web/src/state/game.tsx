// Estado global del juego: pantalla actual + progreso guardado en localStorage.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language, Level, Stage } from '@algoria/shared';
import { allLevels, getLevel, stages } from '@algoria/content';

export type Dir = 'up' | 'down' | 'left' | 'right';

export interface VictoryInfo {
  xpGained: number;
  timeMs: number;
  attempts: number;
  hintsUsed: number;
}

export type Screen =
  | { name: 'title' }
  | { name: 'map' }
  | { name: 'dialog'; levelId: string }
  | { name: 'lesson'; levelId: string }
  | { name: 'battle'; levelId: string }
  | { name: 'victory'; levelId: string; info: VictoryInfo }
  | { name: 'profile' };

export interface Progress {
  version: 1;
  language: Language | null;
  playerName: string;
  xp: number;
  /** ids de niveles completados */
  completed: string[];
  /** ids de niveles cuyo rewardTip está en la Libreta */
  tips: string[];
  position: { x: number; y: number; dir: Dir } | null;
}

const STORAGE_KEY = 'algoria.progress.v1';

export const EMPTY_PROGRESS: Progress = {
  version: 1,
  language: null,
  playerName: 'JUGADOR 1',
  xp: 0,
  completed: [],
  tips: [],
  position: null,
};

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (parsed.version !== 1) return EMPTY_PROGRESS;
    return { ...EMPTY_PROGRESS, ...parsed };
  } catch {
    return EMPTY_PROGRESS;
  }
}

/** Nivel del jugador = niveles completados + 1. */
export function playerLevel(p: Progress): number {
  return p.completed.length + 1;
}

/** Un nivel está desbloqueado si el anterior (por número) está completado. */
export function isUnlocked(p: Progress, level: Level): boolean {
  const prev = allLevels.find((l) => l.number === level.number - 1);
  return !prev || p.completed.includes(prev.id);
}

/** Primer nivel no completado (la misión actual). */
export function currentLevel(p: Progress): Level | undefined {
  return allLevels.find((l) => !p.completed.includes(l.id));
}

interface GameApi {
  screen: Screen;
  progress: Progress;
  stage: Stage;
  go: (screen: Screen) => void;
  setLanguage: (lang: Language) => void;
  savePosition: (pos: NonNullable<Progress['position']>) => void;
  /** Marca el nivel como completado, suma XP y guarda el tip. Idempotente. */
  completeLevel: (levelId: string, xp: number) => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameApi | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  // Siempre se entra por el título: muestra "CONTINUAR" si hay partida guardada.
  const [screen, setScreen] = useState<Screen>({ name: 'title' });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Sin almacenamiento (modo privado): el juego sigue funcionando en memoria.
    }
  }, [progress]);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);

  const setLanguage = useCallback((language: Language) => setProgress((p) => ({ ...p, language })), []);

  const savePosition = useCallback(
    (position: NonNullable<Progress['position']>) => setProgress((p) => ({ ...p, position })),
    [],
  );

  const completeLevel = useCallback((levelId: string, xp: number) => {
    setProgress((p) => {
      if (p.completed.includes(levelId) || !getLevel(levelId)) return p;
      return { ...p, xp: p.xp + xp, completed: [...p.completed, levelId], tips: [...p.tips, levelId] };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(EMPTY_PROGRESS);
    setScreen({ name: 'title' });
  }, []);

  // Por ahora solo existe la etapa 1.
  const stage = stages[0]!;

  const api = useMemo<GameApi>(
    () => ({ screen, progress, stage, go, setLanguage, savePosition, completeLevel, resetProgress }),
    [screen, progress, stage, go, setLanguage, savePosition, completeLevel, resetProgress],
  );

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return ctx;
}

/** Lenguaje elegido; las pantallas de juego solo se muestran con uno elegido. */
export function useLanguage(): Language {
  return useGame().progress.language ?? 'python';
}
