// Piezas de UI compartidas por todas las pantallas.
import type { CSSProperties, ReactNode } from 'react';
import type { SpriteId } from '@algoria/shared';
import { Sprite } from './Sprite';

/** Caja de diálogo con nombre del hablante y retrato opcional. */
export function DialogBox({
  speaker,
  portrait,
  children,
  footer,
  style,
}: {
  speaker?: string;
  portrait?: SpriteId;
  children: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="box" role="status" style={{ padding: '20px 26px', display: 'flex', gap: 18, alignItems: 'center', ...style }}>
      {portrait && (
        <div style={{ flex: '0 0 auto', background: 'var(--water)', border: '3px solid var(--ink)', padding: 2 }}>
          <Sprite id={portrait} size={56} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        {speaker && <strong className="px" style={{ fontSize: 10, color: 'var(--red-dark)' }}>{speaker}</strong>}
        <div style={{ fontSize: 23, lineHeight: 1.35 }}>{children}</div>
        {footer}
      </div>
    </div>
  );
}

/** Barra horizontal (XP, defensa, progreso). `value` entre 0 y 1. */
export function Bar({ value, color, label, height = 10 }: { value: number; color: string; label: string; height?: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      style={{ height, border: '3px solid var(--ink)', background: 'var(--paper)' }}
    >
      <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width .5s steps(6)' }} />
    </div>
  );
}

/** Código inline estilo "chip". */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <code style={{ fontFamily: 'var(--font-code)', background: 'var(--ink)', color: 'var(--gold)', padding: '0 5px' }}>
      {children}
    </code>
  );
}
