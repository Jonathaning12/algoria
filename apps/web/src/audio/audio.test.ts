import { describe, expect, it } from 'vitest';
import { bassLine, drumLine, lengthInBeats, noteFreq } from './notes';
import { SONGS } from './songs';
import { SFX } from './sfx';
import { DEFAULT_AUDIO, audio, loadAudioSettings } from './engine';
import { trackFor } from './useGameAudio';

describe('noteFreq', () => {
  it('convierte notas a Hz', () => {
    expect(noteFreq('A4')).toBeCloseTo(440);
    expect(noteFreq('C5')).toBeCloseTo(523.25, 1);
    expect(noteFreq('G#4')).toBeCloseTo(noteFreq('Ab4'));
    expect(noteFreq('-')).toBe(0);
  });

  it('rechaza notas inválidas', () => {
    expect(() => noteFreq('H4')).toThrow();
  });
});

describe('canciones', () => {
  it.each(Object.entries(SONGS))('%s: todas las voces duran lo mismo y las notas son válidas', (_id, song) => {
    const lengths = song.voices.map((v) => lengthInBeats(v.steps));
    expect(new Set(lengths).size).toBe(1);
    expect(lengths[0]).toBe(32); // 8 compases de 4/4
    for (const v of song.voices) for (const [note] of v.steps) expect(() => noteFreq(note)).not.toThrow();
  });

  it('bassLine y drumLine generan compases completos', () => {
    expect(lengthInBeats(bassLine(['C3', 'G2'], [0, 7, 12, 7]))).toBe(8);
    expect(bassLine(['C3'], [0, 12]).map(([n]) => n)).toEqual(['C3', 'C4']);
    expect(lengthInBeats(drumLine('x.x.x.x.', 2))).toBe(8);
  });
});

describe('efectos', () => {
  it('cada efecto es corto (menos de 1,5 s)', () => {
    for (const [id, tones] of Object.entries(SFX)) {
      const total = tones.reduce((s, t) => s + t.d, 0);
      expect(total, id).toBeLessThan(1.5);
    }
  });
});

describe('ajustes de audio', () => {
  const store = (v: string | null) => ({ getItem: () => v });

  it('usa valores por defecto sin datos o con JSON roto', () => {
    expect(loadAudioSettings(store(null))).toEqual(DEFAULT_AUDIO);
    expect(loadAudioSettings(store('{oops'))).toEqual(DEFAULT_AUDIO);
  });

  it('limita volúmenes a 0–1 e ignora tipos incorrectos', () => {
    const s = loadAudioSettings(store(JSON.stringify({ music: false, sfx: 'si', musicVolume: 3, sfxVolume: -1 })));
    expect(s).toEqual({ music: false, sfx: DEFAULT_AUDIO.sfx, musicVolume: 1, sfxVolume: 0 });
  });

  it('sin AudioContext (jsdom) el motor no falla', () => {
    expect(() => {
      audio.unlock();
      audio.playMusic('town');
      audio.sfx('hit');
      audio.setHidden(true);
    }).not.toThrow();
  });
});

describe('trackFor', () => {
  it('elige la canción según la pantalla', () => {
    expect(trackFor('title')).toBe('title');
    expect(trackFor('map')).toBe('town');
    expect(trackFor('lesson')).toBe('town');
    expect(trackFor('battle')).toBe('battle');
    expect(trackFor('victory')).toBeNull();
  });
});
