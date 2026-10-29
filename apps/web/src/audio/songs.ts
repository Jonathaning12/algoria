// Canciones originales de Algoria (8 compases en bucle, 4/4).
import { bassLine, drumLine, type Song, type Step } from './notes';

export type TrackId = 'title' | 'town' | 'forest' | 'battle';

/** Pantalla de título: tranquila, como el comienzo de una aventura. */
const title: Song = {
  bpm: 84,
  voices: [
    {
      wave: 'square',
      gain: 0.5,
      steps: [
        ['C5', 2], ['G4', 1], ['E5', 1],
        ['D5', 2], ['B4', 2],
        ['A4', 2], ['C5', 1], ['E5', 1],
        ['G4', 3], ['-', 1],
        ['F4', 1], ['A4', 1], ['C5', 1], ['F5', 1],
        ['E5', 2], ['C5', 2],
        ['D5', 1], ['E5', 1], ['F5', 1], ['D5', 1],
        ['C5', 3], ['-', 1],
      ] satisfies Step[],
    },
    { wave: 'triangle', gain: 0.9, steps: bassLine(['C3', 'G2', 'A2', 'E2', 'F2', 'C3', 'G2', 'C3'], [0, 7]) },
  ],
};

/** Pueblo Semilla: alegre y ligera; suena en el mapa, diálogos y lecciones. */
const town: Song = {
  bpm: 108,
  voices: [
    {
      wave: 'square',
      gain: 0.45,
      steps: [
        ['E5', 1], ['G5', 0.5], ['E5', 0.5], ['D5', 1], ['C5', 1],
        ['D5', 0.5], ['E5', 0.5], ['F5', 1], ['E5', 1], ['D5', 1],
        ['C5', 1], ['E5', 0.5], ['G5', 0.5], ['A5', 1], ['G5', 1],
        ['F5', 0.5], ['E5', 0.5], ['D5', 1], ['G4', 2],
        ['E5', 1], ['G5', 0.5], ['E5', 0.5], ['D5', 1], ['C5', 1],
        ['D5', 0.5], ['E5', 0.5], ['F5', 1], ['A5', 1], ['G5', 1],
        ['F5', 0.5], ['E5', 0.5], ['D5', 0.5], ['E5', 0.5], ['F5', 1], ['D5', 1],
        ['C5', 3], ['-', 1],
      ],
    },
    { wave: 'triangle', gain: 0.9, steps: bassLine(['C3', 'G2', 'A2', 'G2', 'C3', 'F2', 'G2', 'C3'], [0, 7, 12, 7]) },
    { wave: 'noise', gain: 0.12, steps: drumLine('..x...x.', 8) },
  ],
};

/** Bosque Iterador: modo dórico en Re, algo misteriosa pero tranquila. */
const forest: Song = {
  bpm: 96,
  voices: [
    {
      wave: 'square',
      gain: 0.4,
      steps: [
        ['D5', 1], ['F5', 0.5], ['A5', 0.5], ['G5', 1], ['F5', 1],
        ['E5', 0.5], ['F5', 0.5], ['G5', 1], ['A5', 2],
        ['C5', 1], ['E5', 0.5], ['G5', 0.5], ['F5', 1], ['E5', 1],
        ['D5', 3], ['-', 1],
        ['A4', 0.5], ['D5', 0.5], ['F5', 1], ['E5', 0.5], ['D5', 0.5], ['C5', 1],
        ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['E5', 2],
        ['F5', 1], ['E5', 0.5], ['D5', 0.5], ['C5', 1], ['E5', 1],
        ['D5', 3], ['-', 1],
      ],
    },
    { wave: 'triangle', gain: 0.9, steps: bassLine(['D3', 'C3', 'A2', 'D3', 'D3', 'G2', 'A2', 'D3'], [0, 7, 12, 7]) },
    { wave: 'noise', gain: 0.08, steps: drumLine('....x...', 8) },
  ],
};

/** Duelo de código: más rápida y en menor, con tensión pero sin agobiar. */
const battle: Song = {
  bpm: 138,
  voices: [
    {
      wave: 'square',
      gain: 0.4,
      steps: [
        ['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 0.5],
        ['F4', 0.5], ['A4', 0.5], ['C5', 0.5], ['F5', 0.5], ['E5', 0.5], ['C5', 0.5], ['A4', 0.5], ['C5', 0.5],
        ['G4', 0.5], ['B4', 0.5], ['D5', 0.5], ['G5', 0.5], ['F5', 0.5], ['D5', 0.5], ['B4', 0.5], ['D5', 0.5],
        ['E5', 1], ['D5', 0.5], ['C5', 0.5], ['B4', 1], ['E4', 1],
        ['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 0.5],
        ['F4', 0.5], ['A4', 0.5], ['C5', 0.5], ['F5', 0.5], ['E5', 0.5], ['C5', 0.5], ['A4', 0.5], ['C5', 0.5],
        ['D5', 0.5], ['E5', 0.5], ['F5', 0.5], ['D5', 0.5], ['E5', 0.5], ['C5', 0.5], ['B4', 0.5], ['G#4', 0.5],
        ['A4', 2], ['-', 2],
      ],
    },
    { wave: 'triangle', gain: 0.9, steps: bassLine(['A2', 'F2', 'G2', 'E2', 'A2', 'F2', 'E2', 'A2'], [0, 12, 0, 12, 0, 12, 0, 12]) },
    { wave: 'noise', gain: 0.14, steps: drumLine('x.x.x.x.', 8) },
  ],
};

export const SONGS: Record<TrackId, Song> = { title, town, forest, battle };

/** Canción de fondo de cada etapa (mapa, diálogos, lecciones). */
export const STAGE_TRACK: Record<string, TrackId> = {
  'pueblo-semilla': 'town',
  'bosque-iterador': 'forest',
};
