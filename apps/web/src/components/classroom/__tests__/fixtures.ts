// Nivel de ejemplo SOLO para tests del aula (el contenido real vive en packages/content).
import type { Level, Stage } from '@algoria/shared';

export const sampleLevel: Level = {
  number: 1,
  id: 'test-nivel-1',
  title: 'Par o impar',
  topic: 'Condicionales',
  npc: { id: 'lia', name: 'LÍA', title: 'Guardiana de las decisiones', sprite: 'lia', x: 3, y: 3 },
  intro: [
    { speaker: 'LÍA', text: '¡Hola, viajero! Soy Lía.' },
    { speaker: 'LÍA', text: 'A veces tu código tiene que elegir.' },
    { speaker: 'LÍA', text: '¿Hacemos un trato?' },
  ],
  greeting: 'Piensa en if como una puerta.',
  lesson: {
    concept: 'IF / ELSE',
    goals: ['Comparar valores', 'Elegir un camino con `if`'],
    explanation: 'Si algo es verdadero haces una cosa; si no, otra.',
    code: { python: 'print("py")', cpp: '// cpp', java: '// java' },
    examples: [{ input: '4', output: 'PAR' }],
    tips: { python: 'Sangría de 4 espacios.', cpp: 'Usa llaves.', java: 'Punto y coma.' },
    quiz: {
      question: '¿Qué imprime?',
      code: { python: 'print(7 % 2)', cpp: 'cout << 7 % 2;', java: 'System.out.println(7 % 2);' },
      options: ['0', '1', 'error'],
      answer: 1,
      explanation: '7 % 2 da 1.',
      wrongHint: 'Piensa en el resto.',
    },
  },
  problem: {
    id: 'test-par-impar',
    title: '¿Par o impar?',
    statement: 'Imprime `PAR` o `IMPAR`.',
    inputSpec: 'Un entero N',
    outputSpec: 'PAR o IMPAR',
    constraints: '0 ≤ N ≤ 10⁹',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: [
      { id: 's1', input: '4', expected: 'PAR', sample: true },
      { id: 's2', input: '7', expected: 'IMPAR', sample: true },
      { id: 'h1', input: '0', expected: 'PAR', sample: false },
    ],
    starter: { python: 'n = int(input())\n', cpp: 'int main(){}', java: 'class Main{}' },
    solution: { python: '', cpp: '', java: '' },
    hints: ['Usa %.', 'Si N % 2 es 0, es par.', 'if n % 2 == 0: print("PAR")'],
  },
  outro: [
    { speaker: 'LÍA', text: '¡Bien hecho!' },
    { speaker: 'LÍA', text: 'Max te espera al norte.' },
  ],
  rewardTip: { title: 'Elif', text: { python: 'Usa `elif`.', cpp: 'Usa else if.', java: 'Usa else if.' } },
};

export const sampleStage = {
  id: 'test-etapa',
  number: 1,
  name: 'PUEBLO DE PRUEBA',
  range: 'Nv 1',
  summary: '',
  badge: 'SEMILLA',
  color: '#6cc04a',
  map: { rows: [' '], spawn: { x: 0, y: 0 }, signs: [], extraNpcs: [] },
  levels: [sampleLevel],
} satisfies Stage;
