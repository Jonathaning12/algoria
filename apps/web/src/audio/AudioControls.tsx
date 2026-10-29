// Botones flotantes de música y sonido, con volumen.
import { useId, useState } from 'react';
import { audio, useAudioSettings } from './engine';

function NoteIcon({ off }: { off: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="currentColor" d="M3 0h5v5h-1v1h-2v-1h1v-1h1v-3h-3v5h-1v1h-2v-1h1v-1h1z" />
      {off && <path fill="var(--red)" d="M0 0h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1z" />}
    </svg>
  );
}

function SpeakerIcon({ off }: { off: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="currentColor" d="M0 3h2v-1h1v-1h1v6h-1v-1h-1v-1h-2z" />
      {off ? (
        <path fill="var(--red)" d="M5 2h1v1h1v-1h1v1h-1v1h1v1h-1v-1h-1v1h-1v-1h1v-1h-1z" />
      ) : (
        <path fill="currentColor" d="M5 3h1v2h-1zM6 1h1v1h1v4h-1v1h-1v-1h1v-4h-1z" />
      )}
    </svg>
  );
}

export function AudioControls() {
  const s = useAudioSettings();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="audio-ctl">
      <button
        type="button"
        className="audio-ctl__btn"
        data-sfx="none"
        aria-pressed={s.music}
        aria-label={s.music ? 'Silenciar música' : 'Activar música'}
        title={s.music ? 'Música: sí' : 'Música: no'}
        onClick={() => {
          audio.unlock();
          audio.setSettings({ music: !s.music });
        }}
      >
        <NoteIcon off={!s.music} />
      </button>
      <button
        type="button"
        className="audio-ctl__btn"
        data-sfx="none"
        aria-pressed={s.sfx}
        aria-label={s.sfx ? 'Silenciar efectos' : 'Activar efectos'}
        title={s.sfx ? 'Efectos: sí' : 'Efectos: no'}
        onClick={() => {
          audio.unlock();
          audio.setSettings({ sfx: !s.sfx });
          if (!s.sfx) setTimeout(() => audio.sfx('confirm'), 30);
        }}
      >
        <SpeakerIcon off={!s.sfx} />
      </button>
      <button
        type="button"
        className="audio-ctl__btn px"
        data-sfx="select"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Ajustar volumen"
        title="Volumen"
        onClick={() => setOpen((o) => !o)}
        style={{ fontSize: 9, width: 'auto', padding: '0 8px' }}
      >
        VOL
      </button>
      {open && (
        <div id={panelId} className="box audio-ctl__panel">
          <label className="px">
            MÚSICA
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(s.musicVolume * 100)}
              onChange={(e) => audio.setSettings({ musicVolume: Number(e.target.value) / 100, music: true })}
            />
          </label>
          <label className="px">
            EFECTOS
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(s.sfxVolume * 100)}
              onChange={(e) => audio.setSettings({ sfxVolume: Number(e.target.value) / 100, sfx: true })}
              onPointerUp={() => audio.sfx('select')}
              onKeyUp={() => audio.sfx('select')}
            />
          </label>
        </div>
      )}
    </div>
  );
}
