// Etapa 3: CUEVA RECURSIVA (Nv 21–30). Se entra por el norte (vuelta al Bosque Iterador), se baja en zigzag
// entre estalagmitas y cristales, se cruza el lago subterráneo por los puentes y se llega al Gimnasio Cueva,
// junto a la salida sur.
import type { Stage } from '@algoria/shared';
import { nivel21 } from '../levels/nivel-21';
import { nivel22 } from '../levels/nivel-22';
import { nivel23 } from '../levels/nivel-23';
import { nivel24 } from '../levels/nivel-24';
import { nivel25 } from '../levels/nivel-25';
import { nivel26 } from '../levels/nivel-26';
import { nivel27 } from '../levels/nivel-27';
import { nivel28 } from '../levels/nivel-28';
import { nivel29 } from '../levels/nivel-29';
import { nivel30 } from '../levels/nivel-30';

export const cuevaRecursiva: Stage = {
  id: 'cueva-recursiva',
  number: 3,
  name: 'CUEVA RECURSIVA',
  range: 'Nv 21–30',
  summary: 'Recursión, backtracking, ordenar con criterio, merge sort, búsqueda binaria y dos punteros.',
  badge: 'ESPIRAL',
  color: '#7d8399',
  map: {
    //     x: 012345678901234567
    rows: [
      'WWWWWWWW=WWWWWWWWW', // 0  vuelta al Bosque Iterador (8,0)
      'WC K   S=  K  m CW', // 1  cartel (7,1) · spawn (8,1) · Prof. Bit (10,1)
      'W ============== W', // 2  Eco (4,2) → Greta (9,2) → Ámbar (14,2)
      'W K  m  C  K  m  W', // 3
      'W ============== W', // 4  Gema (4,4) ← Estela (9,4) ← Roque (14,4)
      'W m  K   C  K m  W', // 5
      'W~~~~~~#~~~~~#~~~W', // 6  lago subterráneo con puentes (7,6) y (13,6)
      'W~~~~~~#~~~~~#~~~W', // 7
      'W ============== W', // 8  Pico (4,8) → Nico (9,8) → Petra (14,8)
      'W K m  C   K  C  W', // 9
      'W K   SH======== W', // 10 cartel (6,10) · gimnasio (7,10)
      'W C   ========= mW', // 11 Obsidiana (7,11) frente a la puerta
      'WWWWWWWWWWWWWW=WWW', // 12 salida sur (14,12)
    ],
    spawn: { x: 8, y: 1 },
    signs: [
      { x: 7, y: 1, text: 'CUEVA RECURSIVA · Niveles 21 al 30. El túnel del norte vuelve al Bosque Iterador.' },
      { x: 6, y: 10, text: 'GIMNASIO CUEVA · Líder: Obsidiana. Solo para quienes vencieron a los nueve habitantes de la cueva.' },
    ],
    extraNpcs: [
      {
        id: 'prof-cueva',
        name: 'PROF. BIT',
        title: 'Mentor',
        sprite: 'prof',
        x: 10,
        y: 1,
        greeting: 'En esta cueva los túneles se repiten dentro de otros túneles. Antes de entrar, busca siempre la salida: el caso base.',
      },
    ],
    back: { x: 8, y: 0 },
    exit: { x: 14, y: 12, lockedText: 'Más allá está el Puerto Estructura. Se abre al vencer el Gimnasio Cueva.' },
  },
  levels: [nivel21, nivel22, nivel23, nivel24, nivel25, nivel26, nivel27, nivel28, nivel29, nivel30],
};
