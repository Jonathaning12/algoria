// Etapa 1: PUEBLO SEMILLA (Nv 1–10). Un NPC por nivel, recorrido en zigzag de arriba abajo
// hasta el Gimnasio Semilla, junto a la salida sur.
import type { Stage } from '@algoria/shared';
import { nivel01 } from '../levels/nivel-01';
import { nivel02 } from '../levels/nivel-02';
import { nivel03 } from '../levels/nivel-03';
import { nivel04 } from '../levels/nivel-04';
import { nivel05 } from '../levels/nivel-05';
import { nivel06 } from '../levels/nivel-06';
import { nivel07 } from '../levels/nivel-07';
import { nivel08 } from '../levels/nivel-08';
import { nivel09 } from '../levels/nivel-09';
import { nivel10 } from '../levels/nivel-10';

export const puebloSemilla: Stage = {
  id: 'pueblo-semilla',
  number: 1,
  name: 'PUEBLO SEMILLA',
  range: 'Nv 1–10',
  summary: 'Imprimir, variables, entrada, operadores, if, bucles, listas y funciones.',
  badge: 'SEMILLA',
  color: '#6cc04a',
  map: {
    //     x: 012345678901234
    rows: [
      'TTTTTTTTTTTTTTT', // 0
      'T*H  S    ,,H*T', // 1  casa del Prof. Bit (2,1) · cartel (5,1)
      'T =========== T', // 2  spawn (4,2) → Leo (6,2) → Sofi (11,2)
      'T ,,  o    ~~ T', // 3
      'T =========== T', // 4  Iris (11,4) ← Tomás (7,4) ← Lía (3,4)
      'T*  ,,  o  ~~*T', // 5
      'T =========== T', // 6  Max (3,6) → Nora (7,6) → Bruno (11,6)
      'T ,, *    ,,  T', // 7
      'T~~  ==SH===  T', // 8  cartel (7,8) · gimnasio (8,8) · Gael (11,8)
      'T~~  =======  T', // 9  Maestra Olmo (8,9) frente a la puerta
      'TTTTTTT=TTTTTTT', // 10 salida sur (7,10)
    ],
    spawn: { x: 4, y: 2 },
    signs: [
      { x: 5, y: 1, text: 'PUEBLO SEMILLA · Niveles 1 al 10. Habla con cada vecino en orden.' },
      { x: 7, y: 8, text: 'GIMNASIO SEMILLA · Líder: Maestra Olmo. Solo para quienes vencieron a los nueve vecinos.' },
    ],
    extraNpcs: [
      {
        id: 'prof',
        name: 'PROF. BIT',
        title: 'Mentor',
        sprite: 'prof',
        x: 2,
        y: 2,
        greeting: 'Si te atascas, lee el enunciado en voz alta y prueba con los ejemplos.',
      },
    ],
    exit: { x: 7, y: 10, lockedText: 'Al sur está el Bosque Iterador. Se abre al vencer el Gimnasio Semilla.' },
  },
  levels: [nivel01, nivel02, nivel03, nivel04, nivel05, nivel06, nivel07, nivel08, nivel09, nivel10],
};
