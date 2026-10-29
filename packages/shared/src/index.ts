// Contrato compartido entre la web, la API, el juez y el contenido.
// Cambiar algo aquí afecta a todos los paquetes: coordinarlo antes.

export type Language = 'python' | 'cpp' | 'java';
export const LANGUAGES: readonly Language[] = ['python', 'cpp', 'java'] as const;

/** Texto que cambia según el lenguaje elegido por el jugador. */
export type PerLanguage<T = string> = Record<Language, T>;

/** Ids de sprites disponibles (ver apps/web/src/game/sprites.ts). */
export type SpriteId =
  | 'hero_down' | 'hero_up' | 'hero_side'
  | 'pyxi' | 'ceeplus' | 'javo'
  | 'prof' | 'lia' | 'tomas' | 'bug'
  // NPCs extra del Pueblo Semilla (el agente del mundo los dibuja).
  | 'max' | 'nora' | 'leo' | 'sofi' | 'iris' | 'bruno' | 'gael' | 'gym_semilla'
  // NPCs del Bosque Iterador (Nv 11–20).
  | 'rana' | 'kai' | 'lupe' | 'otto' | 'mila' | 'tito' | 'zoe' | 'dante' | 'vera' | 'gym_bosque'
  // Tiles del bosque.
  | 'pine' | 'bush' | 'log' | 'mushroom' | 'bridge'
  | 'grass' | 'tallgrass' | 'path' | 'water' | 'tree' | 'flower' | 'sign' | 'house' | 'rock';

export interface DialogueLine {
  /** Nombre visible, p. ej. "LÍA". */
  speaker: string;
  text: string;
}

export interface Npc {
  id: string;
  name: string;
  /** Subtítulo, p. ej. "Guardiana de las decisiones". */
  title: string;
  sprite: SpriteId;
  /** Casilla en el mapa de la etapa. */
  x: number;
  y: number;
}

export interface LessonExample {
  input: string;
  output: string;
}

export interface Quiz {
  question: string;
  code: PerLanguage;
  options: string[];
  /** Índice de la opción correcta en `options`. */
  answer: number;
  /** Se muestra al acertar. */
  explanation: string;
  /** Se muestra al fallar; nunca revela la respuesta. */
  wrongHint: string;
}

export interface Lesson {
  /** Concepto en una línea, p. ej. "IF / ELSE". */
  concept: string;
  /** 1–3 objetivos cortos. */
  goals: string[];
  /** Explicación breve (2–4 frases) en tono amable. */
  explanation: string;
  /** Ejemplo completo y ejecutable en cada lenguaje. */
  code: PerLanguage;
  examples: LessonExample[];
  /** Un tip pequeño del compañero, distinto por lenguaje. */
  tips: PerLanguage;
  quiz: Quiz;
}

export interface TestCase {
  id: string;
  input: string;
  /** Salida esperada; se compara ignorando espacios al final de cada línea y líneas vacías finales. */
  expected: string;
  /** true = ejemplo visible para el jugador. */
  sample: boolean;
}

export type Difficulty = 'facil' | 'medio' | 'dificil';

export interface Problem {
  id: string;
  title: string;
  statement: string;
  inputSpec: string;
  outputSpec: string;
  constraints: string;
  difficulty: Difficulty;
  xp: number;
  timeLimitMs: number;
  tests: TestCase[];
  /** Código inicial que ve el jugador en el editor. */
  starter: PerLanguage;
  /** Solución de referencia; debe pasar todos los tests. */
  solution: PerLanguage;
  /** Pistas progresivas, de más vaga a más concreta. */
  hints: string[];
}

export interface Level {
  /** 1-based y global (Nv 1…60). */
  number: number;
  id: string;
  title: string;
  /** Concepto principal, p. ej. "Condicionales". */
  topic: string;
  /** true para el jefe de gimnasio (último nivel de cada etapa). */
  gym?: boolean;
  npc: Npc;
  /** Diálogo de encuentro en el mapa (antes de lección/duelo). */
  intro: DialogueLine[];
  /** Frase corta que dice el NPC al hacerle clic en el mapa. */
  greeting: string;
  lesson: Lesson;
  problem: Problem;
  /** Diálogo tras ganar el duelo. */
  outro: DialogueLine[];
  /** Tip que se guarda en la Libreta al ganar. */
  rewardTip: { title: string; text: PerLanguage };
}

export interface StageMap {
  /** Filas del mapa; leyenda en TILE_LEGEND. Todas de la misma longitud. */
  rows: string[];
  spawn: { x: number; y: number };
  /** Carteles: casilla → texto. */
  signs: { x: number; y: number; text: string }[];
  /** NPCs que no son nivel (p. ej. Prof. Bit): solo dicen su saludo. */
  extraNpcs: (Npc & { greeting: string })[];
  /**
   * Salida a la etapa siguiente. Bloqueada (muestra lockedText) hasta completar el
   * nivel gym de esta etapa; después, pisarla lleva al `spawn` de la etapa siguiente.
   */
  exit?: { x: number; y: number; lockedText: string };
  /**
   * Vuelta a la etapa anterior (siempre abierta). Pisarla lleva a la etapa anterior,
   * a la casilla caminable junto a su `exit`.
   */
  back?: { x: number; y: number };
}

/** Leyenda de caracteres de StageMap.rows. */
export const TILE_LEGEND = {
  ' ': 'grass',
  ',': 'tallgrass',
  '=': 'path',
  '~': 'water',
  T: 'tree',
  '*': 'flower',
  S: 'sign',
  H: 'house',
  o: 'rock',
  // Bosque
  P: 'pine',
  B: 'bush',
  L: 'log',
  m: 'mushroom',
  '#': 'bridge',
} as const satisfies Record<string, SpriteId>;

/** Casillas que bloquean el paso. */
export const SOLID_TILES = new Set<string>(['~', 'T', 'S', 'H', 'o', 'P', 'B', 'L']);

export interface Stage {
  id: string;
  number: number;
  name: string;
  /** p. ej. "Nv 1–10". */
  range: string;
  summary: string;
  badge: string;
  color: string;
  map: StageMap;
  levels: Level[];
}

/* ---------- API del juez ---------- */

export type RunMode = 'samples' | 'submit';

export interface RunRequest {
  problemId: string;
  language: Language;
  code: string;
  mode: RunMode;
}

/** AC aceptado · WA respuesta incorrecta · TLE tiempo excedido · RE error en ejecución · CE error de compilación */
export type Verdict = 'AC' | 'WA' | 'TLE' | 'RE' | 'CE';

export interface TestResult {
  id: string;
  sample: boolean;
  verdict: Verdict;
  timeMs: number;
  /** Solo se rellenan en tests de ejemplo, nunca en ocultos. */
  input?: string;
  expected?: string;
  output?: string;
  stderr?: string;
}

export interface RunResponse {
  /** AC si todos pasan; si no, el primer veredicto distinto de AC. */
  verdict: Verdict;
  passed: number;
  total: number;
  results: TestResult[];
  /** Salida del compilador cuando verdict === 'CE'. */
  compileOutput?: string;
}

export interface ApiError {
  error: string;
}
