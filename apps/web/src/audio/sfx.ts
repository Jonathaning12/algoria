// Efectos de sonido como secuencias de tonos cortos.
import type { Wave } from './notes';

export interface Tone {
  /** Frecuencia inicial en Hz (0 = silencio). */
  f: number;
  /** Duración en segundos. */
  d: number;
  wave?: Wave;
  /** Volumen relativo (0–1). */
  v?: number;
  /** Frecuencia final para un barrido. */
  to?: number;
}

export type SfxId =
  | 'select' | 'confirm' | 'cancel' | 'step' | 'bump' | 'talk' | 'npc'
  | 'run' | 'pass' | 'hit' | 'fail' | 'error' | 'hint'
  | 'quizRight' | 'quizWrong' | 'levelUp' | 'locked';

export const SFX: Record<SfxId, Tone[]> = {
  select: [{ f: 880, d: 0.03, v: 0.4 }],
  confirm: [{ f: 660, d: 0.05 }, { f: 990, d: 0.08 }],
  cancel: [{ f: 440, d: 0.05 }, { f: 330, d: 0.08 }],
  step: [{ f: 0, d: 0.035, wave: 'noise', v: 0.15 }],
  bump: [{ f: 110, d: 0.08, v: 0.6, to: 80 }],
  talk: [{ f: 523, d: 0.03, v: 0.5 }, { f: 659, d: 0.04, v: 0.4 }],
  npc: [{ f: 523, d: 0.05 }, { f: 659, d: 0.05 }, { f: 784, d: 0.08 }],
  locked: [{ f: 220, d: 0.08, v: 0.5 }, { f: 196, d: 0.12, v: 0.5 }],
  run: [{ f: 392, d: 0.04, v: 0.4 }, { f: 523, d: 0.04, v: 0.4 }, { f: 659, d: 0.06, v: 0.4 }],
  pass: [{ f: 784, d: 0.06 }, { f: 988, d: 0.06 }, { f: 1175, d: 0.12 }],
  hit: [
    { f: 0, d: 0.08, wave: 'noise', v: 0.7 },
    { f: 880, d: 0.06, to: 440 },
    { f: 1047, d: 0.06 },
    { f: 1319, d: 0.16 },
  ],
  fail: [{ f: 392, d: 0.1 }, { f: 311, d: 0.1 }, { f: 262, d: 0.2, to: 220 }],
  error: [{ f: 150, d: 0.09, wave: 'sawtooth', v: 0.4 }, { f: 0, d: 0.04 }, { f: 150, d: 0.12, wave: 'sawtooth', v: 0.4 }],
  hint: [{ f: 1319, d: 0.04, wave: 'triangle' }, { f: 1568, d: 0.04, wave: 'triangle' }, { f: 2093, d: 0.1, wave: 'triangle' }],
  quizRight: [{ f: 659, d: 0.07 }, { f: 880, d: 0.12 }],
  quizWrong: [{ f: 294, d: 0.08 }, { f: 262, d: 0.14 }],
  levelUp: [
    { f: 523, d: 0.1 }, { f: 659, d: 0.1 }, { f: 784, d: 0.1 }, { f: 1047, d: 0.2 },
    { f: 0, d: 0.05 },
    { f: 784, d: 0.08 }, { f: 1047, d: 0.35 },
  ],
};
