// Pixel-art 16×16. Filas de 8 caracteres se reflejan a 16 (sprites simétricos);
// filas de 16 se usan tal cual. '.' es transparente; el resto, claves de PALETTE.
import type { SpriteId } from '@algoria/shared';

export const PALETTE: Record<string, string> = {
  k: '#1c1a2b', w: '#fbf7ea', s: '#f4c79a', S: '#d9976a', h: '#5a3a26', H: '#2e2033',
  r: '#e0483e', R: '#9c2b2b', b: '#3f74d8', B: '#24428c', g: '#6cc04a', G: '#2f7a3a',
  l: '#a8e06a', y: '#f6c945', Y: '#c58a1e', o: '#f08a3c', c: '#7fd3e8', C: '#3a8fb5',
  p: '#4a4560', e: '#c3c7d4', E: '#7d8399', n: '#b07a4a', N: '#6e4527', t: '#ead9a6',
  T: '#cdb67a', v: '#9b6fd6', V: '#5e3f96',
};

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
