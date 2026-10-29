// Etapa 2: BOSQUE ITERADOR (Nv 11–20). Se entra por el norte (vuelta al Pueblo Semilla), se baja en zigzag,
// se cruza el río por los puentes y se llega al Gimnasio Bosque, junto a la salida sur.
import type { Stage } from '@algoria/shared';
import { nivel11 } from '../levels/nivel-11';
import { nivel12 } from '../levels/nivel-12';
import { nivel13 } from '../levels/nivel-13';
import { nivel14 } from '../levels/nivel-14';
import { nivel15 } from '../levels/nivel-15';
import { nivel16 } from '../levels/nivel-16';
import { nivel17 } from '../levels/nivel-17';
import { nivel18 } from '../levels/nivel-18';
import { nivel19 } from '../levels/nivel-19';
import { nivel20 } from '../levels/nivel-20';

export const bosqueIterador: Stage = {
  id: 'bosque-iterador',
  number: 2,
  name: 'BOSQUE ITERADOR',
  range: 'Nv 11–20',
  summary: 'Recorrer arreglos y textos, contar, matrices, sumas acumuladas, ventana deslizante y frecuencias.',
  badge: 'HOJA',
  color: '#2f7a3a',
  map: {
    //     x: 012345678901234567
    rows: [
      'PPPPPPPP=PPPPPPPPP', // 0  vuelta al Pueblo Semilla (8,0)
      'Pm ,,  S=  B ,, mP', // 1  cartel (7,1) · spawn (8,1) · Prof. Bit (10,1)
      'P ============== P', // 2  Rana (5,2) → Kai (12,2)
      'P B ,,  m  L  ,  P', // 3
      'P ============== P', // 4  Mila (4,4) ← Otto (9,4) ← Lupe (14,4)
      'P ,, m  B   ,, m P', // 5
      'P~~~~~~~#~~~~#~~~P', // 6  río con puentes (8,6) y (13,6)
      'P~~~~~~~#~~~~#~~~P', // 7
      'P ============== P', // 8  Tito (4,8) → Zoe (9,8) → Dante (14,8)
      'P ,, L  m  ,, B  P', // 9
      'P ,,, SH======== P', // 10 cartel (6,10) · gimnasio (7,10) · Vera (12,10)
      'P m   ========= mP', // 11 Guardabosques Cedro (7,11) frente a la puerta
      'PPPPPPPPPPPPPP=PPP', // 12 salida sur (14,12)
    ],
    spawn: { x: 8, y: 1 },
    signs: [
      { x: 7, y: 1, text: 'BOSQUE ITERADOR · Niveles 11 al 20. El camino del norte vuelve al Pueblo Semilla.' },
      { x: 6, y: 10, text: 'GIMNASIO BOSQUE · Líder: Guardabosques Cedro. Solo para quienes vencieron a los nueve guardianes del bosque.' },
    ],
    extraNpcs: [
      {
        id: 'prof-bosque',
        name: 'PROF. BIT',
        title: 'Mentor',
        sprite: 'prof',
        x: 10,
        y: 1,
        greeting: 'Aquí los datos son grandes. Antes de escribir un bucle, pregúntate cuántas vueltas dará.',
      },
    ],
    back: { x: 8, y: 0 },
    exit: { x: 14, y: 12, lockedText: 'Más allá está la Cueva Recursiva. Se abre al vencer el Gimnasio Bosque.' },
  },
  levels: [nivel11, nivel12, nivel13, nivel14, nivel15, nivel16, nivel17, nivel18, nivel19, nivel20],
};
