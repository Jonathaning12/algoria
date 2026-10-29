// Piezas pequeñas compartidas por las pantallas del aula.
import { Fragment, type ReactNode } from 'react';
import { useGame } from '../../state/game';
import '../../styles/classroom.css';

/** Convierte `texto` entre comillas invertidas en <code> estilo chip. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.length > 2 && p.startsWith('`') && p.endsWith('`') ? (
          <code key={i} className="cl-code">{p.slice(1, -1)}</code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Estado de error amable cuando el nivel no existe (p. ej. contenido aún no cargado). */
export function LevelMissing({ levelId }: { levelId: string }) {
  const { go } = useGame();
  return (
    <main className="cl-missing">
      <div className="box">
        <h1 className="cl-heading" style={{ fontSize: 14 }}>¡UPS! NADIE POR AQUÍ</h1>
        <p style={{ margin: 0, fontSize: 21 }}>
          No encontramos el nivel <code className="cl-code">{levelId}</code>. Puede que aún se esté preparando. Vuelve al mapa y prueba con otro maestro.
        </p>
        <button type="button" className="btn btn--gold" autoFocus onClick={() => go({ name: 'map' })}>
          VOLVER AL MAPA
        </button>
      </div>
    </main>
  );
}

/** Estrella pixel (Victory.dc.html). */
export function Star({ on, size = 32 }: { on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="#1c1a2b" d="M3 0h2v2h3v2h-1v1h1v3h-2v-1h-2v1h-2v-3h1v-1h-1v-2h3z" />
      <path fill={on ? '#f6c945' : '#4a4560'} d="M3 1h2v2h2v1h-1v2h1v1h-1v-1h-4v1h-1v-1h1v-2h-1v-1h2z" />
    </svg>
  );
}

/** Insignia de la etapa (Main.dc.html · SEMILLA). */
export function BadgeIcon({ color = '#6cc04a', size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="#1c1a2b" d="M3 0h4v1h2v2h1v4h-1v2h-2v1h-4v-1h-2v-2h-1v-4h1v-2h2z" />
      <path fill={color} d="M3 1h4v1h1v1h1v4h-1v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1z" />
      <path fill="#a8e06a" d="M4 3h2v2h-2z" />
    </svg>
  );
}

/** Etiqueta pixel pequeña. */
export function Tag({ children, bg, dark }: { children: ReactNode; bg?: string; dark?: boolean }) {
  return (
    <span className={dark ? 'cl-tag cl-tag--dark' : 'cl-tag'} style={bg ? { background: bg } : undefined}>
      {children}
    </span>
  );
}

/** Flecha pixel a la derecha (la fuente pixel no trae el glifo ▸). */
export function ArrowRight({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 6 6" shapeRendering="crispEdges" aria-hidden="true" style={{ flex: 'none' }}>
      <path fill={color} d="M2 0h1v1h1v1h1v2h-1v1h-1v1h-1z" />
    </svg>
  );
}
