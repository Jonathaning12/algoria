// Notación musical mínima para las canciones chiptune.

const SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** 'A4' → 440. Admite sostenidos y bemoles ('C#5', 'Bb3'). '-' (silencio) → 0. */
export function noteFreq(note: string): number {
  if (note === '-') return 0;
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(note);
  if (!m) throw new Error(`Nota inválida: ${note}`);
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const midi = (Number(m[3]) + 1) * 12 + SEMITONE[m[1]!]! + acc;
  return 440 * 2 ** ((midi - 69) / 12);
}

/** [nota, duración en negras]. */
export type Step = [string, number];

export type Wave = 'square' | 'triangle' | 'sawtooth' | 'sine' | 'noise';

export interface Voice {
  wave: Wave;
  /** Volumen relativo de la voz (0–1). */
  gain: number;
  steps: Step[];
}

export interface Song {
  bpm: number;
  voices: Voice[];
}

export function lengthInBeats(steps: Step[]): number {
  return steps.reduce((sum, [, beats]) => sum + beats, 0);
}

/**
 * Bajo a partir de acordes: un compás (4 negras) por acorde, repitiendo `pattern`
 * de intervalos en semitonos sobre la fundamental (p. ej. [0, 7, 12, 7]).
 */
export function bassLine(roots: string[], pattern: number[], beatsPerNote = 4 / pattern.length): Step[] {
  return roots.flatMap((root) => {
    const base = noteFreq(root);
    return pattern.map((semi): Step => [freqToNote(base * 2 ** (semi / 12)), beatsPerNote]);
  });
}

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function freqToNote(freq: number): string {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/** Percusión: 'x' golpe, '.' silencio; cada carácter dura `beats`. */
export function drumLine(pattern: string, bars: number, beats = 0.5): Step[] {
  const steps: Step[] = [];
  for (let b = 0; b < bars; b++) {
    for (const ch of pattern) steps.push([ch === 'x' ? 'C6' : '-', beats]);
  }
  return steps;
}
