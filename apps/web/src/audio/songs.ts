// Canciones originales de Algoria (8 compases en bucle, 4/4).
import { bassLine, drumLine, type Song, type Step } from './notes';

export type TrackId = 'title' | 'town' | 'forest' | 'cave' | 'port' | 'mountain' | 'tower' | 'arena' | 'battle';

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

/** Cueva Recursiva: lenta, en La menor, con ecos (notas que se repiten como un eco). */
const cave: Song = {
  bpm: 80,
  voices: [
    {
      wave: 'triangle',
      gain: 0.7,
      steps: [
        ['A4', 1], ['A4', 0.5], ['-', 0.5], ['C5', 1], ['B4', 1],
        ['E4', 2], ['E4', 0.5], ['-', 1.5],
        ['F4', 1], ['A4', 1], ['G4', 1], ['F4', 1],
        ['E4', 3], ['-', 1],
        ['A4', 1], ['C5', 1], ['E5', 1], ['D5', 1],
        ['C5', 2], ['C5', 0.5], ['-', 1.5],
        ['B4', 1], ['G#4', 1], ['B4', 1], ['D5', 1],
        ['A4', 3], ['-', 1],
      ],
    },
    { wave: 'square', gain: 0.25, steps: bassLine(['A2', 'E2', 'F2', 'E2', 'A2', 'C3', 'E2', 'A2'], [0, 12]) },
    { wave: 'noise', gain: 0.06, steps: drumLine('x.......', 8) },
  ],
};

/** Puerto Estructura: balanceo marinero en 3 tiempos sobre un compás de 4 (vals rápido). */
const port: Song = {
  bpm: 120,
  voices: [
    {
      wave: 'square',
      gain: 0.42,
      steps: [
        ['G4', 1], ['C5', 1], ['E5', 1], ['C5', 1],
        ['D5', 1.5], ['C5', 0.5], ['B4', 1], ['G4', 1],
        ['A4', 1], ['C5', 1], ['F5', 1], ['E5', 1],
        ['D5', 3], ['-', 1],
        ['G4', 1], ['C5', 1], ['E5', 1], ['G5', 1],
        ['F5', 1.5], ['E5', 0.5], ['D5', 1], ['C5', 1],
        ['B4', 1], ['D5', 1], ['G4', 1], ['B4', 1],
        ['C5', 3], ['-', 1],
      ],
    },
    { wave: 'triangle', gain: 0.9, steps: bassLine(['C3', 'G2', 'F2', 'G2', 'C3', 'F2', 'G2', 'C3'], [0, 7, 12, 7]) },
    { wave: 'noise', gain: 0.1, steps: drumLine('x...x.x.', 8) },
  ],
};

/** Montaña Grafo: amplia y épica, en Sol mayor, con quintas abiertas en el bajo. */
const mountain: Song = {
  bpm: 100,
  voices: [
    {
      wave: 'square',
      gain: 0.4,
      steps: [
        ['D5', 1.5], ['G5', 0.5], ['G5', 1], ['A5', 1],
        ['B5', 2], ['A5', 1], ['G5', 1],
        ['E5', 1.5], ['G5', 0.5], ['A5', 1], ['G5', 1],
        ['D5', 3], ['-', 1],
        ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1],
        ['B5', 2], ['G5', 2],
        ['A5', 1], ['G5', 1], ['F#5', 1], ['A5', 1],
        ['G5', 3], ['-', 1],
      ],
    },
    { wave: 'triangle', gain: 0.9, steps: bassLine(['G2', 'G2', 'E2', 'D3', 'C3', 'G2', 'D3', 'G2'], [0, 7, 12, 7]) },
    { wave: 'noise', gain: 0.1, steps: drumLine('x...x...', 8) },
  ],
};

/** Torre Dinámica: misteriosa y ordenada, arpegios en Mi menor como engranajes. */
const tower: Song = {
  bpm: 112,
  voices: [
    {
      wave: 'square',
      gain: 0.36,
      steps: [
        ['E5', 0.5], ['G5', 0.5], ['B5', 0.5], ['G5', 0.5], ['E5', 0.5], ['G5', 0.5], ['B5', 0.5], ['G5', 0.5],
        ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['E5', 0.5],
        ['D5', 0.5], ['F#5', 0.5], ['A5', 0.5], ['F#5', 0.5], ['D5', 0.5], ['F#5', 0.5], ['A5', 0.5], ['F#5', 0.5],
        ['B4', 0.5], ['D#5', 0.5], ['F#5', 0.5], ['D#5', 0.5], ['B5', 2],
        ['E5', 0.5], ['G5', 0.5], ['B5', 0.5], ['G5', 0.5], ['E5', 0.5], ['G5', 0.5], ['B5', 0.5], ['G5', 0.5],
        ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['E5', 0.5],
        ['F#5', 1], ['A5', 1], ['G5', 1], ['F#5', 1],
        ['E5', 3], ['-', 1],
      ],
    },
    { wave: 'triangle', gain: 0.9, steps: bassLine(['E2', 'C3', 'D3', 'B2', 'E2', 'C3', 'B2', 'E2'], [0, 7]) },
  ],
};

/** Coliseo: marcial y con energía, para el torneo contrarreloj. */
const arena: Song = {
  bpm: 150,
  voices: [
    {
      wave: 'square',
      gain: 0.4,
      steps: [
        ['D5', 1], ['D5', 0.5], ['D5', 0.5], ['F5', 1], ['A5', 1],
        ['G5', 1], ['F5', 0.5], ['E5', 0.5], ['D5', 2],
        ['C5', 1], ['C5', 0.5], ['C5', 0.5], ['E5', 1], ['G5', 1],
        ['F5', 1], ['E5', 0.5], ['D5', 0.5], ['C5', 2],
        ['D5', 1], ['D5', 0.5], ['D5', 0.5], ['F5', 1], ['A5', 1],
        ['Bb5', 1], ['A5', 0.5], ['G5', 0.5], ['A5', 2],
        ['G5', 0.5], ['F5', 0.5], ['E5', 0.5], ['F5', 0.5], ['G5', 1], ['C#5', 1],
        ['D5', 3], ['-', 1],
      ],
    },
    { wave: 'triangle', gain: 0.9, steps: bassLine(['D2', 'G2', 'C3', 'F2', 'D2', 'Bb2', 'A2', 'D2'], [0, 12, 0, 12, 0, 12, 0, 12]) },
    { wave: 'noise', gain: 0.14, steps: drumLine('x.x.xxx.', 8) },
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

export const SONGS: Record<TrackId, Song> = { title, town, forest, cave, port, mountain, tower, arena, battle };

/** Canción de fondo de cada etapa (mapa, diálogos, lecciones). */
export const STAGE_TRACK: Record<string, TrackId> = {
  'pueblo-semilla': 'town',
  'bosque-iterador': 'forest',
  'cueva-recursiva': 'cave',
  'puerto-estructura': 'port',
  'montana-grafo': 'mountain',
  'torre-dinamica': 'tower',
};
