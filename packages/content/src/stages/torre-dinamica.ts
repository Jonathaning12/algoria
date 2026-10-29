// Etapa 6: TORRE DINÁMICA (Nv 51–60). Se entra por el sur (vuelta a la Montaña Grafo), se sube en zigzag
// entre estanterías y se llega al Gimnasio Torre, en el piso más alto, junto a la salida norte al Coliseo.
import type { Stage } from '@algoria/shared';
import { nivel51 } from '../levels/nivel-51';
import { nivel52 } from '../levels/nivel-52';
import { nivel53 } from '../levels/nivel-53';
import { nivel54 } from '../levels/nivel-54';
import { nivel55 } from '../levels/nivel-55';
import { nivel56 } from '../levels/nivel-56';
import { nivel57 } from '../levels/nivel-57';
import { nivel58 } from '../levels/nivel-58';
import { nivel59 } from '../levels/nivel-59';
import { nivel60 } from '../levels/nivel-60';

export const torreDinamica: Stage = {
  id: 'torre-dinamica',
  number: 6,
  name: 'TORRE DINÁMICA',
  range: 'Nv 51–60',
  summary: 'Programación dinámica: memoización, conteo de caminos, mochila, monedas, LIS, LCS, edición y máscaras de bits.',
  badge: 'TORRE',
  color: '#9b6fd6',
  map: {
    //     x: 012345678901234567
    rows: [
      'ZZZZZZZZZZZZZ=ZZZZ', // 0  salida al Coliseo (13,0)
      'ZQQ*SH%%%%%%%=%QQZ', // 1  cartel (4,1) · gimnasio (5,1)
      'Z%%%%=%%QQ%%%=%%mZ', // 2  Archimaga Isolda (5,2) frente a la puerta · Melquíades (11,2)
      'Z%QQ%=======%=%QQZ', // 3
      'Z%%%%%%QQ%%%%%%%%Z', // 4  Úrsula (4,4) ← Gaspar (13,4)
      'ZQQ%%%%%%%%%%QQ%%Z', // 5
      'Z%%%%=========%%%Z', // 6  Orfea (2,6) → Selene (15,6)
      'Z%QQ%%%%QQ%%%%QQ%Z', // 7
      'Z%%%%%%%%%%%%%%%%Z', // 8  Baltasar (6,8) ← Casiopea (12,8)
      'ZQQ%%%QQ%%%QQ%%%*Z', // 9
      'Z%%%%=========%%%Z', // 10 Elda (3,10) → Tobías (14,10)
      'Z*%%QQ%%S=%%QQ%%mZ', // 11 cartel (8,11) · spawn (9,11) · Prof. Bit (10,11)
      'ZZZZZZZZZ=ZZZZZZZZ', // 12 vuelta a la Montaña Grafo (9,12)
    ],
    spawn: { x: 9, y: 11 },
    signs: [
      { x: 8, y: 11, text: 'TORRE DINÁMICA · Niveles 51 al 60. La puerta del sur vuelve a la Montaña Grafo.' },
      { x: 4, y: 1, text: 'GIMNASIO TORRE · Líder: Archimaga Isolda. Solo para quienes resolvieron los nueve enigmas de la torre.' },
    ],
    extraNpcs: [
      {
        id: 'prof-torre',
        name: 'PROF. BIT',
        title: 'Mentor',
        sprite: 'prof',
        x: 10,
        y: 11,
        greeting: 'En esta torre nadie resuelve dos veces el mismo problema. Guarda cada respuesta y úsala después.',
      },
    ],
    back: { x: 9, y: 12 },
    exit: { x: 13, y: 0, lockedText: 'Arriba del todo está el Coliseo. Se abre al vencer el Gimnasio Torre.' },
  },
  levels: [nivel51, nivel52, nivel53, nivel54, nivel55, nivel56, nivel57, nivel58, nivel59, nivel60],
};
