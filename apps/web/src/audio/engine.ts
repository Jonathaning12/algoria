// Motor de audio chiptune con Web Audio: música en bucle + efectos.
// Todo se sintetiza en el navegador; no hay archivos de audio.
// Sin AudioContext (tests, navegadores antiguos) todas las llamadas son no-ops.
import { useSyncExternalStore } from 'react';
import { noteFreq, type Song, type Wave } from './notes';
import { SONGS, type TrackId } from './songs';
import { SFX, type SfxId } from './sfx';

export interface AudioSettings {
  music: boolean;
  sfx: boolean;
  /** 0–1 */
  musicVolume: number;
  /** 0–1 */
  sfxVolume: number;
}

const STORAGE_KEY = 'algoria.audio.v1';

export const DEFAULT_AUDIO: AudioSettings = { music: true, sfx: true, musicVolume: 0.5, sfxVolume: 0.6 };

// La música va muy por debajo de los efectos: es de fondo.
const MUSIC_CEILING = 0.22;
const SFX_CEILING = 0.35;

export function loadAudioSettings(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): AudioSettings {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIO;
    const p = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      music: typeof p.music === 'boolean' ? p.music : DEFAULT_AUDIO.music,
      sfx: typeof p.sfx === 'boolean' ? p.sfx : DEFAULT_AUDIO.sfx,
      musicVolume: clamp01(p.musicVolume, DEFAULT_AUDIO.musicVolume),
      sfxVolume: clamp01(p.sfxVolume, DEFAULT_AUDIO.sfxVolume),
    };
  } catch {
    return DEFAULT_AUDIO;
  }
}

function clamp01(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback;
}

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

interface Playing {
  id: TrackId;
  bus: GainNode;
  timer: ReturnType<typeof setInterval>;
}

const LOOKAHEAD_S = 0.2;
const TICK_MS = 50;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private playing: Playing | null = null;
  private wanted: TrackId | null = null;
  private settings: AudioSettings = loadAudioSettings();
  private listeners = new Set<() => void>();

  getSettings = (): AudioSettings => this.settings;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  setSettings(patch: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...patch };
    try {
      safeStorage()?.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Sin almacenamiento: los ajustes duran lo que la pestaña.
    }
    this.applyVolumes();
    if (this.settings.music) this.startWanted();
    else this.stopMusic();
    this.listeners.forEach((fn) => fn());
  }

  /** Los navegadores solo dejan sonar audio tras un gesto del usuario: llamar desde clic/tecla. */
  unlock(): void {
    if (!this.ensure()) return;
    if (this.ctx!.state === 'suspended') void this.ctx!.resume();
    this.startWanted();
  }

  /** Pausa todo mientras la pestaña está oculta. */
  setHidden(hidden: boolean): void {
    if (!this.ctx) return;
    if (hidden) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  /** Cambia la canción de fondo (null = silencio). Repetir la misma no la reinicia. */
  playMusic(id: TrackId | null): void {
    this.wanted = id;
    if (this.playing?.id === id) return;
    this.stopMusic();
    this.startWanted();
  }

  sfx(id: SfxId): void {
    if (!this.settings.sfx || !this.ctx || this.ctx.state !== 'running' || !this.sfxBus) return;
    let t = this.ctx.currentTime + 0.01;
    for (const tone of SFX[id]) {
      if (tone.f > 0 || tone.wave === 'noise') {
        this.voice(this.sfxBus, tone.wave ?? 'square', tone.f, t, tone.d, tone.v ?? 0.6, tone.to);
      }
      t += tone.d;
    }
  }

  /* ---------- interno ---------- */

  private ensure(): boolean {
    if (this.ctx) return true;
    const Ctor = typeof window !== 'undefined'
      ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
    if (!Ctor) return false;
    this.ctx = new Ctor();
    const master = this.ctx.createGain();
    master.connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain();
    this.sfxBus = this.ctx.createGain();
    this.musicBus.connect(master);
    this.sfxBus.connect(master);
    this.noise = this.makeNoise();
    this.applyVolumes();
    return true;
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.musicBus || !this.sfxBus) return;
    const now = this.ctx.currentTime;
    const music = this.settings.music ? this.settings.musicVolume * MUSIC_CEILING : 0;
    const sfx = this.settings.sfx ? this.settings.sfxVolume * SFX_CEILING : 0;
    this.musicBus.gain.setTargetAtTime(music, now, 0.05);
    this.sfxBus.gain.setTargetAtTime(sfx, now, 0.02);
  }

  private makeNoise(): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private startWanted(): void {
    if (!this.wanted || this.playing || !this.settings.music) return;
    if (!this.ctx || this.ctx.state !== 'running' || !this.musicBus) return;
    this.playing = this.startSong(this.wanted, SONGS[this.wanted]);
  }

  private stopMusic(): void {
    const p = this.playing;
    if (!p || !this.ctx) return;
    this.playing = null;
    clearInterval(p.timer);
    const now = this.ctx.currentTime;
    p.bus.gain.setTargetAtTime(0, now, 0.08);
    setTimeout(() => p.bus.disconnect(), 600);
  }

  private startSong(id: TrackId, song: Song): Playing {
    const ctx = this.ctx!;
    const bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(this.musicBus!);
    const beat = 60 / song.bpm;
    const start = ctx.currentTime + 0.1;
    const cursors = song.voices.map(() => ({ index: 0, time: start }));

    const schedule = () => {
      const horizon = ctx.currentTime + LOOKAHEAD_S;
      song.voices.forEach((voice, vi) => {
        const cur = cursors[vi]!;
        // Si la pestaña estuvo pausada, saltamos lo atrasado en vez de amontonar notas.
        if (cur.time < ctx.currentTime - 0.05) cur.time = ctx.currentTime + 0.02;
        while (cur.time < horizon) {
          const [note, beats] = voice.steps[cur.index]!;
          const dur = beats * beat;
          if (note !== '-') {
            this.voice(bus, voice.wave, noteFreq(note), cur.time, dur * 0.9, voice.gain);
          }
          cur.time += dur;
          cur.index = (cur.index + 1) % voice.steps.length;
        }
      });
    };
    schedule();
    return { id, bus, timer: setInterval(schedule, TICK_MS) };
  }

  private voice(dest: AudioNode, wave: Wave, freq: number, t: number, dur: number, vol: number, slideTo?: number): void {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    const release = Math.min(0.04, dur / 3);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.005);
    env.gain.setValueAtTime(vol * 0.8, t + dur - release);
    env.gain.linearRampToValueAtTime(0, t + dur);
    env.connect(dest);

    let src: AudioScheduledSourceNode;
    if (wave === 'noise') {
      const n = ctx.createBufferSource();
      n.buffer = this.noise;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 6000;
      n.connect(hp).connect(env);
      src = n;
    } else {
      const osc = ctx.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, t);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      osc.connect(env);
      src = osc;
    }
    src.start(t);
    src.stop(t + dur + 0.01);
    src.onended = () => env.disconnect();
  }
}

export const audio = new AudioEngine();

export function useAudioSettings(): AudioSettings {
  return useSyncExternalStore(audio.subscribe, audio.getSettings, audio.getSettings);
}

export type { TrackId, SfxId };
