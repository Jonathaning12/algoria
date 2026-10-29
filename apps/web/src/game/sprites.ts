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
};

/**
 * Sprite asimétrico: filas de 8 que se reflejan salvo las de `right`,
 * que sustituyen la mitad derecha (columnas 8–15) de esa fila.
 */
function asym(left: string[], right: Record<number, string>): string[] {
  return left.map((row, i) => row + (right[i] ?? [...row].reverse().join('')));
}

export const SPRITES: Record<SpriteId, string[]> = {
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
