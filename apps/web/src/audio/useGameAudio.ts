// Conecta el audio con el juego: canción por pantalla, desbloqueo con el primer
// gesto, pausa en segundo plano y "clic" genérico en botones.
import { useEffect } from 'react';
import type { Screen } from '../state/game';
import { audio, type SfxId, type TrackId } from './engine';

export function trackFor(screen: Screen['name']): TrackId | null {
  switch (screen) {
    case 'title':
      return 'title';
    case 'battle':
      return 'battle';
    case 'victory':
      // La fanfarria de victoria suena sola; la canción del pueblo vuelve en el mapa.
      return null;
    default:
      return 'town';
  }
}

export function useGameAudio(screen: Screen['name']): void {
  useEffect(() => {
    audio.playMusic(trackFor(screen));
  }, [screen]);

  useEffect(() => {
    const unlock = () => audio.unlock();
    // Clic genérico: cualquier botón o enlace suena, salvo data-sfx="none".
    // Las acciones con su propio sonido usan data-sfx="none" o un id concreto.
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('button, a, [role="radio"], [role="tab"]');
      if (!el || (el as HTMLButtonElement).disabled) return;
      const id = el.dataset.sfx ?? 'select';
      if (id !== 'none') audio.sfx(id as SfxId);
    };
    const onVisibility = () => audio.setHidden(document.hidden);
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    document.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      document.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}
