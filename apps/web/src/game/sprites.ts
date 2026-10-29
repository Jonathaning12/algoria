// Pixel-art 16×16. Filas de 8 caracteres se reflejan a 16 (sprites simétricos);
// filas de 16 se usan tal cual. '.' es transparente; el resto, claves de PALETTE.
import type { SpriteId } from '@algoria/shared';

export const PALETTE: Record<string, string> = {
  k: '#1c1a2b', w: '#fbf7ea', s: '#f4c79a', S: '#d9976a', h: '#5a3a26', H: '#2e2033',
  r: '#e0483e', R: '#9c2b2b', b: '#3f74d8', B: '#24428c', g: '#6cc04a', G: '#2f7a3a',
  l: '#a8e06a', y: '#f6c945', Y: '#c58a1e', o: '#f08a3c', c: '#7fd3e8', C: '#3a8fb5',
  p: '#4a4560', e: '#c3c7d4', E: '#7d8399', n: '#b07a4a', N: '#6e4527', t: '#ead9a6',
  T: '#cdb67a', v: '#9b6fd6', V: '#5e3f96',
  // Bosque: verde de pino muy oscuro y rosa para vestidos y flores.
  D: '#1d4f2a', q: '#f29bb4',
  // Cueva: roca oscura y cristal magenta.
  a: '#3b394d', A: '#26243a', m: '#d65aa8',
  // Piel morena (variantes de NPC).
  j: '#b9784d', J: '#8a5434',
  // Puerto: arena.
  f: '#f0d9a0', F: '#d4b46e',
  // Montaña: nieve y hielo.
  i: '#eef5fc', I: '#c4d8ee',
  // Torre: ladrillo.
  z: '#a0523d', Z: '#743527',
};

/**
 * Sprite asimétrico: filas de 8 que se reflejan salvo las de `right`,
 * que sustituyen la mitad derecha (columnas 8–15) de esa fila.
 */
function asym(left: string[], right: Record<number, string>): string[] {
  return left.map((row, i) => row + (right[i] ?? [...row].reverse().join('')));
}

/* ---------- Variantes de NPC (etapas 3–6) ----------
 * Un NPC = cabeza (filas 0–8) + cuerpo (filas 9–15), ambos como mitades de 8 que se reflejan.
 * Los dígitos son "roles" que cada NPC pinta con su paleta:
 *   1 sombrero/pelo principal · 2 ala o cinta del sombrero · 3 ropa · 4 sombra de ropa o capa
 *   5 piernas · 6 acento (lámpara, botones, estrella) · 7 pelo bajo el sombrero · 8 forro de capa
 *   9 piel · 0 sombra de piel
 * Encima se dibujan accesorios (`px`): [fila, columna, texto]; '.' en el texto deja lo que había.
 */
const HEADS = {
  hair: ['........', '....kkkk', '...k7777', '..k77777', '..k77777', '..k79999', '..k79k99', '..k79999', '...k0999'],
  longhair: ['........', '....kkkk', '...k7777', '..k77777', '.k777777', '.k779999', '.k779k99', '.k779999', '.k7k0999'],
  bun: ['......kk', '.....k77', '....kk77', '...k7777', '..k77777', '..k79999', '..k79k99', '..k79999', '...k0999'],
  helmet: ['........', '....kkkk', '...k1111', '..k11166', '..k11166', '.kk22222', '..k79k99', '..k79999', '...k0999'],
  beanie: ['......k6', '.....k11', '....k121', '...k1111', '..k22222', '..k79999', '..k79k99', '..k79999', '...k0999'],
  sailor: ['........', '........', '....kkkk', '...k1111', '..k11111', '..k22222', '..k79k99', '..k79999', '...k0999'],
  hat: ['........', '.....kkk', '....k111', '...k1111', '.k222222', '..k79999', '..k79k99', '..k79999', '...k0999'],
  bandana: ['........', '....kkkk', '...k1111', '..k11611', '..k11111', '..k79999', '..k79k99', '..k79999', '...k0999'],
  captain: ['...kkkkk', '..k11111', '.k111116', 'k1111111', 'k2222222', '..k79999', '..k79k99', '..k79999', '...k0999'],
  hood: ['.....kkk', '....k111', '...k1111', '..k11111', '..k11111', '..k19999', '..k19k99', '..k19999', '..k1k099'],
  wizard: ['........', '.......k', '......k1', '.....k16', '....k111', '.k222222', '..k79k99', '..k79999', '...k0999'],
  tallhat: ['.......k', '......k1', '......k1', '.....k16', '.....k11', '.k222222', '..k79k99', '..k79999', '...k0999'],
} satisfies Record<string, string[]>;

const BODIES = {
  shirt: ['...kk333', '..k33333', '.k943333', '.k9k3333', '..kk5555', '...k55k.', '...kkkk.'],
  overalls: ['...kk333', '..k34444', '.k944444', '.k9k4464', '..kk4444', '...k55k.', '...kkkk.'],
  dress: ['...kk333', '..k33333', '.k933333', '.k9k3333', '..k44444', '...k99k.', '...kkkk.'],
  robe: ['...kk336', '..k33336', '.k933336', '.k9k3336', '..k33336', '..k44444', '..kkkkkk'],
  coat: ['...kk333', '..k33336', '.k943333', '.k9k3336', '..k33333', '...k55k.', '...kkkk.'],
  cape: ['k44kk333', 'k48k3333', 'k4893333', 'k48k3333', 'k44k5555', 'k44k55k.', 'kkkkkkk.'],
  apron: ['...kk333', '..k36666', '.k936666', '.k9k6666', '..kk6666', '...k55k.', '...kkkk.'],
  stripes: ['...kk333', '..kwwwww', '.k933333', '.k9kwwww', '..kk5555', '...k55k.', '...kkkk.'],
  big: ['..kkk333', '.k333333', 'k9433333', 'k9k33333', '.kk55555', '..k555k.', '..kkkkk.'],
} satisfies Record<string, string[]>;

type Px = [y: number, x: number, text: string];

interface PersonSpec {
  head: keyof typeof HEADS;
  body: keyof typeof BODIES;
  /** Rol (dígito) → color de PALETTE. Por defecto: piel clara y piernas oscuras. */
  colors: Partial<Record<string, string>>;
  px?: Px[];
}

const ROLE_DEFAULTS: Record<string, string> = { '9': 's', '0': 'S', '5': 'p', '7': 'h', '8': 'R', '6': 'y' };

function person({ head, body, colors, px = [] }: PersonSpec): string[] {
  const grid = [...HEADS[head], ...BODIES[body]].map((row) => [...row, ...[...row].reverse()]);
  for (const [y, x, text] of px) {
    [...text].forEach((ch, i) => {
      if (ch !== '.' && grid[y] && x + i < 16) grid[y]![x + i] = ch;
    });
  }
  const pal: Record<string, string> = { ...ROLE_DEFAULTS, ...colors } as Record<string, string>;
  return grid.map((row) => row.map((ch) => (/\d/.test(ch) ? (pal[ch] ?? 'k') : ch)).join(''));
}

/** Rectángulo de un solo color como accesorio. */
function rect(ch: string, x: number, y: number, w: number, h: number): Px[] {
  return Array.from({ length: h }, (_, i): Px => [y + i, x, ch.repeat(w)]);
}

// Accesorios reutilizables.
const BEARD = (c = 'w'): Px[] => [[8, 4, c.repeat(8)], [9, 5, c.repeat(6)]];
const LONG_BEARD: Px[] = [[8, 4, 'wwwwwwww'], [9, 5, 'wwwwww'], [10, 5, 'wwwwww'], [11, 6, 'wwww'], [12, 7, 'ww']];
const PICKAXE = (head = 'E'): Px[] => [...rect('N', 14, 7, 1, 7), [6, 12, head.repeat(4)], [7, 12, head], [7, 15, head]];
const LANTERN: Px[] = [[11, 14, 'k'], [12, 13, 'kkk'], [13, 13, 'kyk'], [14, 13, 'kkk']];
const ROPE_COIL: Px[] = [[10, 11, 'tttt'], [11, 11, 'T..T'], [12, 11, 'tttt']];
const ROPE_SASH: Px[] = [[9, 10, 'T'], [10, 9, 'T'], [11, 8, 'T'], [12, 7, 'T'], [13, 6, 'T']];
const GOGGLES = (lens: string): Px[] => [[6, 3, `k${lens}${lens}kkkk${lens}${lens}k`]];
const GLASSES: Px[] = [[6, 4, 'kckkkkck']];
const STAFF = (top: Px[] = []): Px[] => [...rect('N', 14, 4, 1, 12), ...top];
const BOOK = (cover: string): Px[] => [[11, 5, cover.repeat(6)], [12, 5, 'www' + 'ttt'], [11, 8, 'k'], [12, 8, 'k']];
const FLASK = (liquid: string): Px[] => [[9, 14, 'w'], [10, 13, 'kwk'], [11, 12, `k${liquid}${liquid}${liquid}`], [12, 12, `k${liquid}${liquid}${liquid}`], [13, 13, 'kkk']];
const FISH: Px[] = [[12, 11, 'kCCCk'], [13, 11, 'kcwCC'], [14, 12, 'kkk']];
const MAP_SHEET: Px[] = [[11, 4, 'kttttttk'], [12, 4, 'ktTtrttk'], [13, 4, 'kkkkkkkk']];
const SPYGLASS: Px[] = [[5, 11, 'kkkkk'], [6, 11, 'Yyyyy'], [7, 11, 'kkkkk']];

/** Sprite simétrico de 8 columnas cuyo lado derecho se sombrea con otros colores. */
function shaded(left: string[], swap: Record<string, string>): string[] {
  return left.map((row) => row + [...row].reverse().map((ch) => swap[ch] ?? ch).join(''));
}

const STAGE_SPRITES = {
  /* ---- Cueva Recursiva (Nv 21–29): mineros, espeleólogas y un murciélago ---- */
  npc21: person({ head: 'helmet', body: 'overalls', colors: { 1: 'y', 2: 'Y', 6: 'w', 3: 'r', 4: 'B', 5: 'N' }, px: LANTERN }),
  npc22: person({ head: 'helmet', body: 'shirt', colors: { 1: 'o', 2: 'R', 6: 'c', 7: 'H', 3: 'G', 4: 'D' }, px: ROPE_COIL }),
  // Murciélago amable: alas abiertas, ojos grandes y colmillos de sonrisa.
  npc23: ['........', '........', '....k...', '....kvkk', 'kk..kvvv', 'kVk.kvwk', 'kVVkkvvv', 'kVVVvvvq', 'kVvVvvvw', '.kVvVvvv', '..kVkvvv', '...k.kvv', '.....kvv', '......kk', '........', '........'],
  npc24: person({ head: 'helmet', body: 'overalls', colors: { 1: 'e', 2: 'E', 6: 'y', 7: 'e', 3: 'e', 4: 'N', 5: 'p' }, px: [...BEARD(), ...PICKAXE()] }),
  npc25: person({ head: 'bun', body: 'apron', colors: { 7: 'o', 3: 'C', 6: 't', 5: 'N' }, px: [[10, 13, 'kck'], [11, 12, 'kcmck'], [12, 13, 'kmk']] }),
  npc26: person({ head: 'hat', body: 'shirt', colors: { 1: 't', 2: 'T', 7: 'N', 3: 'y', 4: 'Y', 5: 'n', 9: 'j', 0: 'J' }, px: [[8, 14, 'o'], [9, 14, 'y'], ...rect('N', 14, 10, 1, 4)] }),
  npc27: person({ head: 'longhair', body: 'dress', colors: { 7: 'H', 3: 'C', 4: 'B' }, px: MAP_SHEET }),
  npc28: person({ head: 'bandana', body: 'big', colors: { 1: 'R', 6: 'r', 7: 'H', 3: 'E', 4: 'p', 5: 'N', 9: 'j', 0: 'J' }, px: PICKAXE('e') }),
  npc29: person({ head: 'helmet', body: 'shirt', colors: { 1: 'w', 2: 'e', 6: 'y', 7: 'h', 3: 'v', 4: 'V' }, px: GOGGLES('c') }),
  // Líder del Gimnasio Espiral: casco de cristal y capa de roca.
  gym_cueva: person({
    head: 'helmet',
    body: 'cape',
    colors: { 1: 'c', 2: 'C', 6: 'm', 7: 'H', 3: 'e', 4: 'A', 8: 'V', 5: 'a' },
    px: [[0, 3, 'kc.kmmk.ck'], [1, 3, 'kckmmmmkck'], [10, 7, 'mm'], [11, 7, 'cc']],
  }),

  /* ---- Puerto Estructura (Nv 31–39): marineros, pescadores, estibadores y una gaviota ---- */
  npc31: person({ head: 'sailor', body: 'stripes', colors: { 1: 'w', 2: 'B', 7: 'y', 3: 'B', 5: 'b' } }),
  npc32: person({ head: 'hat', body: 'coat', colors: { 1: 'y', 2: 'Y', 7: 'h', 3: 'y', 4: 'Y', 6: 'Y', 5: 'B' }, px: FISH }),
  npc33: person({
    head: 'bandana',
    body: 'big',
    colors: { 1: 'b', 6: 'w', 7: 'H', 3: 'o', 4: 'N', 5: 'B', 9: 'j', 0: 'J' },
    px: [[3, 11, 'kkkkk'], [4, 11, 'knnnk'], [5, 11, 'kNnNk'], [6, 11, 'knnnk'], [7, 11, 'kkkkk']],
  }),
  // Capitana: gorra blanca de visera y melena naranja.
  npc34: person({ head: 'captain', body: 'coat', colors: { 1: 'w', 2: 'B', 6: 'y', 7: 'o', 3: 'b', 4: 'B', 5: 'B' }, px: [...rect('o', 2, 5, 1, 5), ...rect('o', 13, 5, 1, 5)] }),
  // Gaviota de perfil, mirando a la izquierda.
  npc35: ['................', '................', '................', '......kkk.......', '.....kwwwk......', '....kwkwwwk.....', '..kkywwwwwk.....', '.kyyykwwwwk.....', '..kk.kwwwwwkkk..', '.....kwwweeeeEk.', '....kwwwweeeEEk.', '....kwwwwwweEk..', '.....kwwwwwwkk..', '......kkkkkk....', '.......ko.ko....', '.......kk.kk....'],
  npc36: person({ head: 'bun', body: 'apron', colors: { 7: 'h', 3: 'r', 6: 'w', 5: 'p', 9: 'j', 0: 'J' }, px: [[11, 5, 'kCCk'], [12, 5, 'kccw']] }),
  npc37: person({ head: 'helmet', body: 'shirt', colors: { 1: 'g', 2: 'G', 6: 'g', 7: 'N', 3: 'l', 4: 'g', 5: 'N' }, px: SPYGLASS }),
  npc38: person({ head: 'bandana', body: 'stripes', colors: { 1: 'r', 6: 'w', 7: 'y', 3: 'r', 5: 'n' } }),
  npc39: person({ head: 'beanie', body: 'big', colors: { 1: 'C', 2: 'B', 6: 'C', 7: 'e', 3: 'G', 4: 'D', 5: 'p' }, px: [...BEARD('e'), [8, 11, 'kN'], [7, 12, 'kNk']] }),
  // Líder del Gimnasio Ancla: capitán con sombrero de capitán, abrigo largo y charreteras.
  gym_puerto: person({
    head: 'captain',
    body: 'cape',
    colors: { 1: 'B', 2: 'H', 6: 'y', 7: 'e', 3: 'b', 4: 'B', 8: 'R', 5: 'H' },
    px: [...BEARD('e'), [9, 0, 'kyy'], [9, 13, 'yyk'], [10, 7, 'yy'], [12, 7, 'yy']],
  }),

  /* ---- Montaña Grafo (Nv 41–49): escaladores, guías, pastoras y un yeti ---- */
  npc41: person({ head: 'beanie', body: 'shirt', colors: { 1: 'r', 2: 'w', 6: 'w', 7: 'h', 3: 'o', 4: 'R', 5: 'B' }, px: [[9, 2, 'k'], [10, 1, 'kNN'], [11, 1, 'kN'], [12, 1, 'kNN']] }),
  npc42: person({ head: 'beanie', body: 'overalls', colors: { 1: 'G', 2: 'g', 6: 'y', 7: 'N', 3: 'y', 4: 'b', 5: 'B' }, px: [...ROPE_SASH, ...ROPE_COIL] }),
  npc43: person({
    head: 'longhair',
    body: 'dress',
    colors: { 7: 'y', 3: 'r', 4: 'w' },
    px: [...rect('N', 14, 4, 1, 12), [2, 13, 'NNk'], [3, 15, 'N']],
  }),
  // Yeti amable: pelaje blanco, cara azul y sonrisa.
  npc44: ['........', '....kkkk', '...kwwww', '..kwwwww', '..kwcccc', '.kwccccc', '.kwckccc', '.kwccccc', 'kwwccckk', 'kwwwwwww', 'kwekwwww', 'kwekwwww', 'kcckwwww', '.kkwwwww', '..kwwkkk', '..kkkk..'],
  npc45: person({ head: 'beanie', body: 'coat', colors: { 1: 'v', 2: 'V', 6: 'w', 7: 'H', 3: 'c', 4: 'C', 5: 'p' }, px: PICKAXE('c') }),
  npc46: person({ head: 'hood', body: 'robe', colors: { 1: 'n', 3: 'n', 4: 'N', 6: 'N' }, px: BEARD() }),
  npc47: person({ head: 'beanie', body: 'stripes', colors: { 1: 'b', 2: 'y', 6: 'y', 7: 'h', 3: 'b', 5: 'B' }, px: GOGGLES('o') }),
  npc48: person({ head: 'bun', body: 'coat', colors: { 7: 'N', 3: 'g', 4: 'G', 6: 'y', 5: 'h', 9: 'j', 0: 'J' }, px: MAP_SHEET }),
  npc49: person({ head: 'beanie', body: 'big', colors: { 1: 'E', 2: 'e', 6: 'w', 7: 'e', 3: 'N', 4: 'h', 5: 'p' }, px: [...BEARD(), ...ROPE_COIL] }),
  // Líder del Gimnasio Cumbre: capa de nieve y bastón con punta de hielo.
  gym_montana: person({
    head: 'hood',
    body: 'cape',
    colors: { 1: 'i', 3: 'C', 4: 'i', 8: 'I', 5: 'B' },
    px: [[1, 13, 'kck'], [2, 13, 'kck'], [3, 14, 'k'], ...STAFF()],
  }),

  /* ---- Torre Dinámica (Nv 51–59): magos, bibliotecarias, alquimistas y un búho ---- */
  npc51: person({ head: 'wizard', body: 'robe', colors: { 1: 'b', 2: 'B', 6: 'y', 7: 'h', 3: 'b', 4: 'B' } }),
  npc52: person({ head: 'longhair', body: 'dress', colors: { 7: 'h', 3: 'G', 4: 'D' }, px: [...GLASSES, [10, 11, 'kkkk'], [11, 11, 'rrrr'], [12, 11, 'bbbb'], [13, 11, 'yyyy']] }),
  npc53: person({ head: 'hood', body: 'robe', colors: { 1: 'g', 3: 'g', 4: 'G', 6: 'n' }, px: FLASK('m') }),
  // Búho sabio: penachos, ojos grandes y pecho moteado.
  npc54: ['........', '..k.....', '..kk.kkk', '..knknnn', '..kwwwnn', '.knwkwnn', '.knwwwny', '.knnnnny', '.kNnnttt', 'kNnnttTt', 'kNnntttt', 'kNnntTtt', '.kNntttt', '..kNnnnn', '....kyky', '....kkkk'],
  npc55: person({ head: 'wizard', body: 'robe', colors: { 1: 'r', 2: 'R', 6: 'y', 7: 'o', 3: 'r', 4: 'R' } }),
  npc56: person({ head: 'bun', body: 'robe', colors: { 7: 'e', 3: 't', 4: 'T', 6: 'N' }, px: [...GLASSES, [9, 14, 'w'], [10, 13, 'w'], [11, 13, 'k']] }),
  npc57: person({ head: 'hair', body: 'apron', colors: { 7: 'o', 3: 'c', 6: 'n', 5: 'p', 9: 'j', 0: 'J' }, px: [...GOGGLES('y'), ...FLASK('l')] }),
  npc58: person({ head: 'wizard', body: 'robe', colors: { 1: 'C', 2: 'B', 6: 'y', 7: 'H', 3: 'C', 4: 'B' }, px: [[10, 5, 'y'], [12, 10, 'y']] }),
  npc59: person({ head: 'hood', body: 'robe', colors: { 1: 'E', 3: 'E', 4: 'p', 6: 'w' }, px: [...BEARD(), ...BOOK('R')] }),
  // Líder del Gimnasio Torre: archimago con sombrero alto, túnica morada, barba larga y bastón con orbe.
  gym_torre: person({
    head: 'tallhat',
    body: 'robe',
    colors: { 1: 'v', 2: 'V', 6: 'y', 7: 'e', 3: 'v', 4: 'V' },
    px: [...LONG_BEARD, [2, 13, 'kkk'], [3, 13, 'kmk'], [4, 13, 'kmk'], [5, 13, 'kkk'], ...rect('N', 14, 6, 1, 10)],
  }),

  /* ---- Tiles de las etapas 3–6 ---- */
  cavewall: ['aaaaaaAaaaaaaaaa', 'aEEaaaAaaaEEaaaa', 'aEaaaaAaaaEaaaaa', 'aaaaaaAaaaaaaaaa', 'aaaaaAAaaaaaaaaA', 'AAAAAAaAAAAAAAAA', 'aaaAaaaaaaaaAaaa', 'aEaAaaaEEaaaAaEa', 'aaaAaaaEaaaaAaaa', 'aaaAaaaaaaaaAaaa', 'AAAAAAAAAAAAAAAA', 'aaaaaaaAaaaaaaaa', 'aaEEaaaAaaaaEaaa', 'aaEaaaaAaaaaaaaa', 'aaaaaaaAaaaaaaaa', 'AAAAAAAAAAAAAAAA'],
  stalagmite: shaded(['........', '........', '.......k', '......ke', '......ke', '.....kea', '.....kea', '.....kEa', '....kEaa', '....keaa', '...kEaaa', '...kEaaa', '..kEaaaa', '.kEEaaaa', 'kkkkkkkk', '........'], { e: 'a', E: 'A', a: 'A' }),
  crystal: ['................', '......k.........', '.....kck........', '.....kwck.......', '....kcwck..k....', '....kcwcCkkmk...', '.k..kcwcCkkwmk..', 'kck.kcwcCkkwmVk.', 'kwck.kccCkkwmVk.', 'kwcCkkccCkkmmVk.', '.kcCkkccCkmmVk..', '.kcCkkcCCkmmVk..', '..kkaakkkaaakk..', '.kaaaaaaaaaaaak.', '..kkkkkkkkkkkk..', '................'],
  sand: ['ffffffff', 'ffFfffff', 'ffffffff', 'fffffFff', 'ffffffff', 'fFffffff', 'ffffffff', 'ffffffFf', 'ffffffff', 'fffFffff', 'ffffffff', 'ffffffff', 'fFffffFf', 'ffffffff', 'ffffFfff', 'ffffffff'],
  dock: ['NnnnNnnnNnnnNnnn', 'NnnnNnnnNnnnNnnn', 'NnnnNnnnNnnnNnnn', 'NnknNnnnNnnnNnkn', 'NnnnNnnnNnnnNnnn', 'NnnnNNNNNnnnNnnn', 'NnnnNnknNnnnNnnn', 'NntnNnnnNntnNnnn', 'NnnnNnnnNnnnNnnn', 'NnnnNnnnNnknNnnn', 'NNNNNnnnNnnnNnnn', 'NnknNnnnNnnnNnnn', 'NnnnNnnnNNNNNnnn', 'NnnnNnnnNnnnNnnn', 'NnnnNntnNnnnNntn', 'NnnnNnnnNnnnNnnn'],
  crate: ['................', '................', '.kkkkkkkkkkkkkk.', '.kNNNNNNNNNNNNk.', '.kNtnnnnnnnntNk.', '.kNntnnnnnntnNk.', '.kNnntnnnntnnNk.', '.kNnnntnntnnnNk.', '.kNnnnnttnnnnNk.', '.kNnnnnttnnnnNk.', '.kNnnntnntnnnNk.', '.kNnntnnnntnnNk.', '.kNntnnnnnntnNk.', '.kNNNNNNNNNNNNk.', '.kkkkkkkkkkkkkk.', '................'],
  boat: ['................', '.......N........', '.......Nk.......', '.......Nwk......', '.......Nwwk.....', '.......Nwwwk....', '.......Nwwwwk...', '.......Nkkkkkk..', '.......N........', 'kkkkkkkkkkkkkkkk', 'krrrrrrrrrrrrrrk', '.kwwwwwwwwwwwwk.', '..kRRRRRRRRRRk..', '...kkkkkkkkkk...', '................', '................'],
  cliff: ['EEEeEEEEEEEEeEEE', 'EeeEEEEpEEEeeEEE', 'EEEEEEppEEEEEEEE', 'pppEEEpEEEEEEppp', 'EEEppppEEEpppEEE', 'EeEEEEEEpppEEEeE', 'EEEEEEEEEEEEEEEE', 'EEEEeEEEEEeeEEEE', 'pEEEEEEpEEEEEEEp', 'ppppEEEppEEEpppp', 'EEEppppEEppppEEE', 'EeEEEEEEEEEEEEeE', 'EEEEEeeEEEEEEEEE', 'EEEEEEEEEEpEEEEE', 'pppEEEEEEppppEEE', 'EEpppppppEEEEppp'],
  snow: ['iiiiiiiiiiiiiiii', 'iiIiiiiiiiiiiwii', 'iiiiiiiiiiiiiiii', 'iiiiiiwiiiIiiiii', 'iiiiiiiiiiiiiiii', 'iIiiiiiiiiiiiiIi', 'iiiiiiiiiwiiiiii', 'iiiiIiiiiiiiiiii', 'iiiiiiiiiiiiiiii', 'iiwiiiiiiiiIiiii', 'iiiiiiiiiiiiiiii', 'iiiiiiIiiiiiiiwi', 'iiiiiiiiiiiiiiii', 'iIiiiiiiiwiiiiii', 'iiiiiiiiiiiiIiii', 'iiiiiiiiiiiiiiii'],
  icerock: shaded(['........', '........', '........', '........', '.....kkk', '....kicc', '...kiwcc', '..kiiccc', '..kicccc', '.kiccccc', '.kcccccc', '.kccCccc', '.kCCCCCC', '..kkkkkk', '........', '........'], { i: 'c', w: 'c', c: 'C', C: 'B' }),
  brick: ['EEEEEEEEEEEEEEEE', 'zzzzzzzEzzzzzzzE', 'zzzzzzzEzzzzzzzE', 'ZZZZZZZEZZZZZZZE', 'EEEEEEEEEEEEEEEE', 'zzzEzzzzzzzEzzzz', 'zzzEzzzzzzzEzzzz', 'ZZZEZZZZZZZEZZZZ', 'EEEEEEEEEEEEEEEE', 'zzzzzzzEzzzzzzzE', 'zzzzzzzEzzzzzzzE', 'ZZZZZZZEZZZZZZZE', 'EEEEEEEEEEEEEEEE', 'zzzEzzzzzzzEzzzz', 'zzzEzzzzzzzEzzzz', 'ZZZEZZZZZZZEZZZZ'],
  carpet: ['RRRRRRRR', 'RYYYYYYY', 'RYrrrrrr', 'RYrrrrrr', 'RYrrrrrr', 'RYrrrrrR', 'RYrrrrRy', 'RYrrrRyY', 'RYrrrRyY', 'RYrrrrRy', 'RYrrrrrR', 'RYrrrrrr', 'RYrrrrrr', 'RYrrrrrr', 'RYYYYYYY', 'RRRRRRRR'],
  bookshelf: ['kkkkkkkkkkkkkkkk', 'kNNNNNNNNNNNNNNk', 'kNNNbNNGvNNcbNNk', 'kNrrbyyGvvrcbNNk', 'kNrrbyyGvvrcbtNk', 'kNRrByYGVvRcBtNk', 'kNrrbyyGvvrcbtNk', 'knnnnnnnnnnnnnnk', 'kNNyNNNNcNNNNNNk', 'kNbyrrGlcqqrvNNk', 'kNbyrrGlcqqrvbNk', 'kNbyrrGlcqqrvbNk', 'kNBYRrGlCqqRVbNk', 'knnnnnnnnnnnnnnk', 'kNNNNNNNNNNNNNNk', 'kkkkkkkkkkkkkkkk'],
} satisfies Partial<Record<SpriteId, string[]>>;

export const SPRITES: Record<SpriteId, string[]> = {
  ...STAGE_SPRITES,
  hero_down: ['.....kkk', '....krrr', '...krrrw', '...krrrr', '..kRRRRR', '..khssss', '..khskss', '..khssss', '...kSsss', '...kkbbb', '..kbbbbb', '.ksBbbbb', '.kskbbbb', '..kkpppp', '...kppk.', '...kkkk.'],
  hero_up: ['.....kkk', '....krrr', '...krrrr', '...krrrr', '..kRRRRR', '..khhhhh', '..khhhhh', '..khhhhh', '...khhhh', '...kkbbb', '..kbbbbb', '.ksBbbbb', '.kskbbbb', '..kkpppp', '...kppk.', '...kkkk.'],
  hero_side: ['......kkkkk.....', '.....krrrrrk....', '....krrrrrrrk...', '....krrrrrrrk...', '....kRRRRRRRRRk.', '....khhssssk....', '....khhssksk....', '....khssssssk...', '.....kSsssk.....', '.....kkbbk......', '....kbbbbbk.....', '....kbBbbsk.....', '....kbBbbk......', '.....kpppk......', '.....kpkpk......', '.....kkkkk......'],
  pyxi: ['........', '........', '.....kkk', '....kbbb', '...kbbbb', '...kbwkb', '...kbbbb', '....kbbb', '.....kkr', '..kkyyyy', '.kyyYbbb', '.kybbbbb', '.kbbbBBB', '.kyyyyyy', '..kkkkkk', '........'],
  ceeplus: ['....y...', '....k...', '..kkkkkk', '.kCCCCCC', '.kCkkkkk', '.kCkcwkk', '.kCkkkkk', '.kCCCCCC', '..kkkkkk', '..keeeee', '..keEeye', 'kekeeeee', 'kEkeeeee', '..kkkkkk', '...kek..', '...kkk..'],
  javo: ['....e...', '.....e..', '....e...', '..kkkkkk', '.kNNNNNN', '.kwwwwww', '.kwwkwww', '.kwwkwww', '.kwowwww', '.kwwwwkk', '.koooooo', '.kwwwwww', '..kwwwww', '...kkkkk', '..kNNNNN', '..kkkkkk'],
  prof: ['........', '.....kkk', '....keee', '...keeee', '...keeee', '..kessss', '..kskckk', '..ksssss', '...ksEEE', '....kwww', '...kwwwr', '..kwwwwr', '..kswwww', '...kwwww', '...kppk.', '...kkkk.'],
  lia: ['........', '.....kkk', '....kHHH', '...kHHHH', '..kHHHHH', '..kHssss', '..kHskss', '..kHssss', '..kHkSss', '..kHkvvv', '..kkvvvv', '..ksvvvv', '..kseeEE', '...keeee', '...kppk.', '...kkkk.'],
  tomas: ['.....kkk', '....kHHH', '...kHHHH', '..kHHHHH', '..kHHHHH', '..kHssss', '..kHskss', '..kHssss', '...kSsss', '...kkggg', '..kggggg', '.ksGgggg', '.kskgggg', '..kkpppp', '...kppk.', '...kkkk.'],
  bug: ['..k.....', '...k....', '....kkkk', '...kvvvv', '..kvrrvv', '..kvvvvv', '.kkkkkkk', 'kvkvvvvk', '.kvvwvvk', 'kvkvvvvk', '.kvvvvvk', 'kvkvvvvk', '..kvvvvk', '...kkkkk', '..k.k...', '........'],
  // Vecinos del Pueblo Semilla.
  max: ['..k..k.k', '.kyk.kyk', '.kyykyyy', '..kyyyyy', '..kYyyyy', '..kYssss', '..kYskss', '...kssss', '...kSsss', '...kkooo', '..kooooo', '.ksooooo', '.kskoooo', '..kkNNNN', '...kNNk.', '...kkkk.'],
  nora: ['........', '....kkkk', '...krrrr', '..krrrrr', '.krrrrrr', '.krRssss', '.krRskss', '.krRssss', '.kRkSsss', '.krkkccc', '..kccccc', '.kscCccc', '.kskcccc', '..kccccc', '...kssk.', '...kkkk.'],
  leo: ['........', '....kkkk', '...khhhh', '..khhhhh', '..khhhhh', '..khssss', '..khkekk', '..khssss', '...kSsss', '...kkbbb', '..kbBbbb', '.ksbBbbb', '.kskbBbb', '..kkpppp', '...kppk.', '...kkkk.'],
  sofi: ['......kk', '.....kvv', '....kkvv', '...kvvvv', '..kvvvvv', '..kvssss', '..kvskss', '..kvssss', '...kSsss', '...kkyyy', '..kyyyyy', '.ksyyyyy', '.kskyYyy', '..kyyyyy', '...kssk.', '...kkkk.'],
  iris: ['........', '....kkkk', '...ktttt', '..kttttt', '..krrrrr', 'kttttttt', '.kkHssss', '..kHskss', '..kHssss', '...kSsss', '..kkrrrr', '.ksrrrrr', '.kskrRrr', '..krrrrr', '...kssk.', '...kkkk.'],
  bruno: ['........', '....kkkk', '...kNNNN', '..kNNNNN', '..kNssss', '..kNskss', '..ksssss', '..kNNNss', '..kNNNNN', '.kkkNNNN', 'krrrnnnn', 'krrrnnnn', 'ksrrnNnn', '.kkpnnnn', '..kppk..', '..kkkk..'],
  gael: ['........', '....kkkk', '...kgggg', '..kgggwg', '.kGGGGGG', '..khssss', '..khskss', '..khssss', '...kSsss', '...kkrrr', '..kwwwww', '.kswwwww', '.kskwwww', '..kkCCCC', '...kCCk.', '...kkkk.'],
  // Líder del Gimnasio Semilla: corona de hojas y capa.
  gym_semilla: ['...k.kgk', '..kgkglg', '..kyyyyy', '..kHHHHH', '.kHHssss', '.kHskkss', '.kHsssss', 'kGkSssss', 'kGGkyyyy', 'kGgkgggg', 'kGgggggy', 'kGgsgggy', 'kGgkgggy', 'kGGkpppp', 'kGGkppk.', 'kkkkkkk.'],
  // Vecinos del Bosque Iterador.
  // Rana: niña con capucha de rana (ojos saltones arriba).
  rana: ['..kkk...', '.kwkwkkk', '.kgggggg', '.kgggggg', '.kGGGGGG', '.kgGssss', '.kgsskss', '.kgsssss', '..kgSsss', '..kkgggg', '.kgggggg', '.ksgGggg', '.kskgggg', '..kkpppp', '...kyyk.', '...kkkk.'],
  // Kai: explorador con sombrero de ala y mochila (correas y bultos a los lados).
  kai: ['........', '....kkkk', '...knnnn', '..knnnnn', '.kNNNNNN', '..khssss', '..khskss', '..khssss', 'kRRkSsss', 'kNNkNttt', 'kNNkNttt', 'kNksNttt', 'kNNkNttt', '..kkpppp', '...kNNk.', '...kkkk.'],
  // Lupe: niña pelirroja con una lupa en la mano derecha.
  lupe: asym(
    ['........', '.....kkk', '....kooo', '...koooo', '..kooooo', '..kossss', '..koskss', '..kossss', '.kokSsss', '..kkllll', '.kslllll', '.kskllll', '..kkllll', '..kppppp', '...kssk.', '...kkkk.'],
    { 7: 'ssssokk.', 8: 'sssSkcwk', 9: 'llllkcck', 10: 'lllllkk.', 11: 'llllNsk.' },
  ),
  // Otto: gafas redondas enormes.
  otto: ['........', '....kkkk', '...khhhh', '..khhhhh', '..khssss', '..kkkkks', '..kcwckk', '..kcccks', '..kkkkks', '...kSsss', '..kkvvvv', '.ksvvvvv', '.kskvvvv', '..kkpppp', '...kppk.', '...kkkk.'],
  // Mila: flores rojas en el pelo y vestido rosa.
  mila: ['..krk...', '.krwrkkk', '..krknnn', '..knnnnn', '.knnnnnn', '.knnssss', '.knnskss', '.knnssss', '.knkSsss', '.knkkqqq', '..kqqqqq', '.ksqqqqq', '.kskqqqq', '..kqqqqq', '...kssk.', '...kkkk.'],
  // Tito: gorra azul del revés (se ve el pelo por la abertura) y camiseta a rayas.
  tito: ['........', '....kkkk', '...kbbbb', '..kbbbbb', '..kbbbkh', '..khssss', '..khskss', '..khssss', '...kSsss', '...kkrrr', '..krrrrr', '.kswwwww', '.kskrrrr', '..kkBBBB', '...kssk.', '...kkkk.'],
  // Zoe: bufanda roja y blanca con las puntas colgando.
  zoe: ['........', '....kkkk', '...kHHHH', '..kHHHHH', '..kHHHHH', '..kHssss', '..kHskss', '..kHssss', '..kkrrrr', '..krrwrr', '.kCCCCrw', '.ksCCCrr', '.kskCCwr', '..kkpppp', '...kppk.', '...kkkk.'],
  // Dante: entrenador con gorra y cronómetro en la mano.
  dante: asym(
    ['........', '....kkkk', '...krrrr', '..krrrrr', '.kRRRRRR', '..khssss', '..khskss', '..khssss', '...kSsss', '...kkBBB', '..kBwBBB', '.ksBwBBB', '.kskwBBB', '..kkpppp', '...kppk.', '...kkkk.'],
    { 9: 'BBBkk.e.', 10: 'BBBwBkkk', 11: 'BBBwskwk', 12: 'BBBwkkkk' },
  ),
  // Vera: pelo largo y un libro rojo abierto entre las manos.
  vera: ['........', '....kkkk', '...khhhh', '..khhhhh', '.khhhhhh', '.khhssss', '.khhskss', '.khhssss', '.khkSsss', '.khkkooo', '..kookkk', '..ksskRw', '..kookkk', '..kppppp', '...kssk.', '...kkkk.'],
  // Líder del Gimnasio Hoja: guardabosques con sombrero de ala ancha, barba y capa verde.
  gym_bosque: ['.....kkk', '....kNNN', '...kNNNN', 'kNNNNNNN', 'kkkkkkkk', '.kGkssss', '.kGkskss', '.kGkssss', 'kGGkhhhh', 'kGgkkttt', 'kGgktttt', 'kGgstytt', 'kGgkNNNN', 'kGGkpppp', 'kGGkppk.', 'kkkkkkk.'],
  // Tiles del bosque.
  pine: ['.......k', '......kG', '.....kGG', '....kGGD', '.....kGD', '....kGGD', '...kGGDD', '..kGGDDD', '....kGGD', '...kGGDD', '..kGGDDD', '.kGGDDDD', 'kkkkkkkk', '......kN', '......kN', '.....kkk'],
  bush: ['........', '........', '........', '........', '.....kkk', '...kkGgg', '..kGgglg', '.kGggggg', '.kGgglgg', 'kGGggggg', 'kGGGgggG', 'kGGGGGGG', '.kGGGGGG', '..kkkkkk', '........', '........'],
  log: ['........', '........', '........', '........', '........', '.kkkkkkk', 'kttkNNNN', 'ktTtknnn', 'kTtTknNn', 'ktTtknnn', 'kttkNNNN', '.kkkkkkk', '........', '........', '........', '........'],
  mushroom: ['........', '........', '........', '........', '........', '........', '........', '........', '......kk', '....kkrr', '...krwrr', '...kkkkk', '......kw', '......kw', '.....kkk', '........'],
  bridge: ['kNnnnnnn', 'kNnnnNnn', 'kNnnnnnn', 'kNNNNNNN', 'kNnnnnnn', 'kNnNnnnn', 'kNnnnnnn', 'kNNNNNNN', 'kNnnnnnn', 'kNnnnnNn', 'kNnnnnnn', 'kNNNNNNN', 'kNnnnnnn', 'kNnnNnnn', 'kNnnnnnn', 'kNNNNNNN'],
  grass: ['gggggggg', 'ggGggggg', 'gGgGgggg', 'gggggggg', 'gggggggg', 'gggggGgg', 'ggggGgGg', 'gggggggg', 'gggggggg', 'ggGggggg', 'gGgGgggg', 'gggggggg', 'gggggggg', 'gggggGgg', 'ggggGgGg', 'gggggggg'],
  tallgrass: ['GGGGGGGG', 'GlGGGGlG', 'lGlGGlGl', 'GGGGGGGG', 'GGGlGGGG', 'GGlGlGGG', 'GGGGGGGG', 'GGGGGGGG', 'GGGGGGGG', 'GlGGGGlG', 'lGlGGlGl', 'GGGGGGGG', 'GGGlGGGG', 'GGlGlGGG', 'GGGGGGGG', 'GGGGGGGG'],
  path: ['tttttttt', 'tttTtttt', 'tttttttt', 'tTtttttt', 'tttttttT', 'tttttttt', 'ttttTttt', 'tttttttt', 'tttttttt', 'tttTtttt', 'tttttttt', 'tTtttttt', 'tttttttT', 'tttttttt', 'ttttTttt', 'tttttttt'],
  water: ['cccccccc', 'ccCCcccc', 'cCccCccc', 'cccccccc', 'cccccccc', 'ccccccCC', 'ccccCCcc', 'cccccccc', 'cccccccc', 'ccCCcccc', 'cCccCccc', 'cccccccc', 'cccccccc', 'ccccccCC', 'ccccCCcc', 'cccccccc'],
  tree: ['.....kkk', '...kkGGG', '..kGGgGG', '.kGgggGG', '.kGgglgG', 'kGGggggG', 'kGgggGgG', 'kGGgGGGG', 'kGGGGGGG', '.kGGGGGG', '..kkGGGG', '....kkkk', '......kN', '......kN', '.....kkN', '......kk'],
  flower: ['........', '........', '..k.....', '.krk....', 'kryrk...', '.krk....', '..G.....', '..G.....', '........', '........', '.....k..', '....krk.', '...kryrk', '....krk.', '.....G..', '........'],
  sign: ['........', '........', '..kkkkkk', '.knnnnnn', '.knNNNNN', '.knnnnnn', '.knNNNNN', '.knnnnnn', '..kkkkkk', '......kN', '......kN', '......kN', '.....kkN', '........', '........', '........'],
  house: ['......kk', '.....krr', '....krrr', '...krrRr', '..krrRrr', '.krrRrrr', 'kRRRRRRR', 'kkkkkkkk', '.kwwwwww', '.kwccwww', '.kwccwkN', '.kwwwwkN', '.kwwwwkN', '.kwwwwkN', '.kkkkkkk', '........'],
  rock: ['........', '........', '........', '........', '........', '....kkkk', '...keeee', '..keeeww', '..keewee', '..keeeee', '.keEeeee', '.kEEeeee', '.kEEEEEE', '..kkkkkk', '........', '........'],
};

export interface SpritePath { fill: string; d: string }

const cache = new Map<string, SpritePath[]>();

/** Convierte un sprite en un path SVG por color (filas fusionadas en tramos horizontales). */
export function spritePaths(id: SpriteId): SpritePath[] {
  const hit = cache.get(id);
  if (hit) return hit;
  const rows = SPRITES[id] ?? SPRITES.hero_down;
  const byColor = new Map<string, string>();
  rows.forEach((row, y) => {
    const full = row.length === 8 ? row + [...row].reverse().join('') : row;
    let x = 0;
    while (x < 16) {
      const ch = full.charAt(x);
      let n = 1;
      while (x + n < 16 && full.charAt(x + n) === ch) n++;
      if (ch && ch !== '.' && PALETTE[ch]) {
        byColor.set(ch, (byColor.get(ch) ?? '') + `M${x} ${y}h${n}v1h-${n}z`);
      }
      x += n;
    }
  });
  const out = [...byColor].map(([ch, d]) => ({ fill: PALETTE[ch]!, d }));
  cache.set(id, out);
  return out;
}
