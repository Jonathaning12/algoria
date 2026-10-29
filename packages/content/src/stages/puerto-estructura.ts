// Etapa 4: PUERTO ESTRUCTURA (Nv 31–40). Se entra por el norte (vuelta a la Cueva Recursiva), se recorren
// el paseo de arena y los muelles, se cruza el puente hacia la playa sur y se llega al Gimnasio Puerto.
// La salida a la Montaña Grafo está en el borde este de la playa sur.
import type { Stage } from '@algoria/shared';
import { nivel31 } from '../levels/nivel-31';
import { nivel32 } from '../levels/nivel-32';
import { nivel33 } from '../levels/nivel-33';
import { nivel34 } from '../levels/nivel-34';
import { nivel35 } from '../levels/nivel-35';
import { nivel36 } from '../levels/nivel-36';
import { nivel37 } from '../levels/nivel-37';
import { nivel38 } from '../levels/nivel-38';
import { nivel39 } from '../levels/nivel-39';
import { nivel40 } from '../levels/nivel-40';

export const puertoEstructura: Stage = {
  id: 'puerto-estructura',
  number: 4,
  name: 'PUERTO ESTRUCTURA',
  range: 'Nv 31–40',
  summary: 'Pilas, colas, diccionarios, conjuntos, colas de prioridad y deques: cada dato en su estructura.',
  badge: 'ANCLA',
  color: '#3a8fb5',
  map: {
    //     x: 012345678901234567
    rows: [
      'TTTTTTTT:TTTTTTTTT', // 0  vuelta a la Cueva Recursiva (8,0)
      'TXX:::S:::::::::BT', // 1  cartel (6,1) · spawn (8,1) · Prof. Bit (10,1)
      'T:::::::::::::::XT', // 2  Brisa (4,2) → Ramón (13,2)
      '~~~|~~~~::~~~~|~~~', // 3  muelle oeste (3), pasarela (8–9), muelle este (14)
      '~U~|~~~~::~~~~|~U~', // 4  barcos amarrados
      '~~~|~~~~::~~~~|~~~', // 5  Nerea (3,5) · Salvador (14,5) al final de los muelles
      '~~~~~~~~##~~~~~~~~', // 6  puente
      'T:::::::::::::::XT', // 7  Coral (4,7) → Gaspar (13,7)
      'T:X:::~~~~|~~::::T', // 8  caleta con muelle chico (10,8)
      'T:::::~~U~|~~::::T', // 9  Anselmo (10,9) · Dora (15,9)
      'T:S:H:::::::::X::T', // 10 cartel (2,10) · gimnasio (4,10)
      'T:::::::::::::::::', // 11 Capitana Marea (4,11) frente a la puerta · Faustino (9,11) · salida este (17,11)
      'TTTTTTTTTTTTTTTTTT', // 12
    ],
    spawn: { x: 8, y: 1 },
    signs: [
      { x: 6, y: 1, text: 'PUERTO ESTRUCTURA · Niveles 31 al 40. El camino del norte vuelve a la Cueva Recursiva.' },
      { x: 2, y: 10, text: 'GIMNASIO PUERTO · Líder: Capitana Marea. Solo para quienes vencieron a los nueve marineros del puerto.' },
    ],
    extraNpcs: [
      {
        id: 'prof-puerto',
        name: 'PROF. BIT',
        title: 'Mentor',
        sprite: 'prof',
        x: 10,
        y: 1,
        greeting: 'Antes de escribir código, pregúntate: ¿qué necesito sacar rápido? Eso te dice qué estructura usar.',
      },
    ],
    back: { x: 8, y: 0 },
    exit: { x: 17, y: 11, lockedText: 'Más allá está la Montaña Grafo. Se abre al vencer el Gimnasio Puerto.' },
  },
  levels: [nivel31, nivel32, nivel33, nivel34, nivel35, nivel36, nivel37, nivel38, nivel39, nivel40],
};
