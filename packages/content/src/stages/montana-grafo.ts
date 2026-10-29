// Etapa 5: MONTAÑA GRAFO (Nv 41–50). Se entra por el norte (vuelta al Puerto Estructura), se baja en zigzag
// entre rocas de hielo, se cruza el lago helado por los puentes y se llega al Gimnasio Montaña, junto a la salida sur.
import type { Stage } from '@algoria/shared';
import { nivel41 } from '../levels/nivel-41';
import { nivel42 } from '../levels/nivel-42';
import { nivel43 } from '../levels/nivel-43';
import { nivel44 } from '../levels/nivel-44';
import { nivel45 } from '../levels/nivel-45';
import { nivel46 } from '../levels/nivel-46';
import { nivel47 } from '../levels/nivel-47';
import { nivel48 } from '../levels/nivel-48';
import { nivel49 } from '../levels/nivel-49';
import { nivel50 } from '../levels/nivel-50';

export const montanaGrafo: Stage = {
  id: 'montana-grafo',
  number: 5,
  name: 'MONTAÑA GRAFO',
  range: 'Nv 41–50',
  summary: 'Grafos: listas de adyacencia, DFS, BFS, dos colores, orden topológico, Dijkstra, Union-Find y Kruskal.',
  badge: 'CUMBRE',
  color: '#e0483e',
  map: {
    //     x: 012345678901234567
    rows: [
      'MMMMMMMM=MMMMMMMMM', // 0  vuelta al Puerto Estructura (8,0)
      'MP++I++S=++++I++PM', // 1  cartel (7,1) · spawn (8,1) · Prof. Bit (10,1)
      'M+==============+M', // 2  Rocío (4,2) → Eladio (12,2)
      'M++I+++o+++I++o++M', // 3
      'M+==============+M', // 4  Bombo (4,4) ← Neva (9,4) ← Nima (14,4)
      'M++o++I+++++o++I+M', // 5
      'MM~~~~~~#~~~~#~~MM', // 6  lago helado con puentes (8,6) y (13,6)
      'M+++I++++++++I+++M', // 7
      'M+==============+M', // 8  Herminia (4,8) → Fausto (9,8) → Olga (14,8)
      'MPI++o++P++I++o+PM', // 9
      'M+++++SH========+M', // 10 cartel (6,10) · gimnasio (7,10) · Ignacio (12,10)
      'MI++++=========+IM', // 11 Alpinista Kora (7,11) frente a la puerta
      'MMMMMMMMMMMMMM=MMM', // 12 salida sur (14,12)
    ],
    spawn: { x: 8, y: 1 },
    signs: [
      { x: 7, y: 1, text: 'MONTAÑA GRAFO · Niveles 41 al 50. El camino del norte baja al Puerto Estructura.' },
      { x: 6, y: 10, text: 'GIMNASIO MONTAÑA · Líder: Alpinista Kora. Solo para quienes vencieron a los nueve guías de la montaña.' },
    ],
    extraNpcs: [
      {
        id: 'prof-montana',
        name: 'PROF. BIT',
        title: 'Mentor',
        sprite: 'prof',
        x: 10,
        y: 1,
        greeting: 'Aquí todo son refugios y senderos. Antes de programar, pregúntate: ¿qué son los nodos y qué son las aristas?',
      },
    ],
    back: { x: 8, y: 0 },
    exit: { x: 14, y: 12, lockedText: 'Más arriba está la Torre Dinámica. Se abre al vencer el Gimnasio Montaña.' },
  },
  levels: [nivel41, nivel42, nivel43, nivel44, nivel45, nivel46, nivel47, nivel48, nivel49, nivel50],
};
