// Navegación tipo menú de juego: flechas o WASD mueven el foco entre las opciones
// de un contenedor; Enter/Espacio las eligen (comportamiento nativo del botón).
import type { KeyboardEvent } from 'react';
import { audio } from '../audio/engine';

const DELTA: Record<string, -1 | 1> = {
  arrowup: -1, arrowleft: -1, w: -1, a: -1,
  arrowdown: 1, arrowright: 1, s: 1, d: 1,
};

const ITEMS = 'button:not([disabled]), a[href]';

/** Índice siguiente con vuelta al principio; desde "ninguno" (-1) va al primero o al último. */
export function nextIndex(current: number, delta: -1 | 1, count: number): number {
  if (count === 0) return -1;
  if (current < 0) return delta > 0 ? 0 : count - 1;
  return (current + delta + count) % count;
}

/** Úsalo como onKeyDown del contenedor de opciones. */
export function onArrowNav(e: KeyboardEvent<HTMLElement>): void {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const delta = DELTA[e.key.toLowerCase()];
  if (!delta) return;
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>(ITEMS)];
  const i = nextIndex(items.indexOf(document.activeElement as HTMLElement), delta, items.length);
  const target = items[i];
  if (!target) return;
  e.preventDefault();
  if (target !== document.activeElement) {
    target.focus();
    audio.sfx('select');
  }
}
