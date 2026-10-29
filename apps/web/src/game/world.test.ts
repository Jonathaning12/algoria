import { describe, expect, it } from 'vitest';
import type { Level, Stage } from '@algoria/shared';
import { stages as contentStages } from '@algoria/content';
import { migrateProgress } from '../state/game';
import {
  arrivalAtExit,
  comingSoonText,
  examine,
  faceToward,
  facingTile,
  groundOf,
  houses,
  isExitLocked,
  missionElsewhere,
  move,
  npcStatus,
  startPosition,
  step,
  talkMessage,
  tileAt,
  worldNpcs,
} from './world';

function level(number: number, x: number, y: number, gym = false): Level {
  return {
    number,
    id: `l${number}`,
    title: `Nivel ${number}`,
    topic: 'Tema',
    gym,
    npc: { id: `n${number}`, name: `NPC${number}`, title: '', sprite: 'lia', x, y },
    greeting: `Hola ${number}`,
  } as unknown as Level;
}

function makeStage(levels: Level[] = []): Stage {
  return {
    id: 's',
    number: 1,
    name: 'PUEBLO SEMILLA',
    range: 'Nv 1–3',
    summary: '',
    badge: 'SEMILLA',
    color: '#6cc04a',
    levels,
    map: {
      rows: [
        'TTTTTTT', //
        'TH   HT',
        'T  S  T',
        'T ,,~ T',
        'TTT=TTT',
      ],
      spawn: { x: 3, y: 1 },
      signs: [{ x: 3, y: 2, text: 'Bienvenido' }],
      extraNpcs: [{ id: 'prof', name: 'PROF. BIT', title: 'Mentor', sprite: 'prof', x: 1, y: 2, greeting: 'Hola' }],
      exit: { x: 3, y: 4, lockedText: 'Cerrado' },
    },
  };
}

const levels = [level(1, 2, 1), level(2, 4, 1), level(3, 5, 2, true)];

describe('tileAt', () => {
  it('lee casillas y trata el exterior como árbol', () => {
    const s = makeStage();
    expect(tileAt(s.map, 3, 2)).toBe('S');
    expect(tileAt(s.map, -1, 0)).toBe('T');
    expect(tileAt(s.map, 0, 99)).toBe('T');
    expect(tileAt(s.map, 99, 1)).toBe('T');
  });
});

describe('step', () => {
  const stage = makeStage(levels);
  const npcs = worldNpcs(stage);

  it('avanza por casillas libres', () => {
    const r = step(stage, npcs, { x: 3, y: 1, dir: 'down' }, 'left', []);
    expect(r).toMatchObject({ moved: false, reason: 'npc' }); // NPC1 está en (2,1)
    const r2 = step(stage, npcs, { x: 2, y: 2, dir: 'down' }, 'down', []);
    expect(r2).toEqual({ moved: true, pos: { x: 2, y: 3, dir: 'down' }, tile: ',' });
  });

  it('bloquea en casillas sólidas pero gira al jugador', () => {
    const r = step(stage, npcs, { x: 3, y: 1, dir: 'up' }, 'down', []);
    expect(r.moved).toBe(false);
    expect(r.pos).toEqual({ x: 3, y: 1, dir: 'down' });
  });

  it('la salida está cerrada hasta completar el gimnasio', () => {
    const from = { x: 3, y: 3, dir: 'up' as const };
    expect(step(stage, npcs, from, 'down', [])).toMatchObject({ moved: false, reason: 'exit' });
    expect(step(stage, npcs, from, 'down', ['l1', 'l2', 'l3']).moved).toBe(true);
  });

  it('sin niveles la salida sigue cerrada', () => {
    expect(isExitLocked(makeStage([]), [])).toBe(true);
  });
});

describe('dirección y casilla de enfrente', () => {
  it('calcula la casilla de enfrente', () => {
    expect(facingTile({ x: 2, y: 2, dir: 'up' })).toEqual({ x: 2, y: 1 });
    expect(facingTile({ x: 2, y: 2, dir: 'right' })).toEqual({ x: 3, y: 2 });
  });
  it('mira hacia el eje dominante', () => {
    expect(faceToward({ x: 0, y: 0 }, { x: 5, y: 1 })).toBe('right');
    expect(faceToward({ x: 5, y: 5 }, { x: 4, y: 1 })).toBe('up');
    expect(faceToward({ x: 5, y: 5 }, { x: 1, y: 6 })).toBe('left');
  });
});

describe('estado de NPCs', () => {
  const stage = makeStage(levels);
  const npcs = worldNpcs(stage);

  it('incluye niveles y NPCs extra', () => {
    expect(npcs.map((n) => n.npc.id)).toEqual(['n1', 'n2', 'n3', 'prof']);
  });

  it('marca actual, completado, bloqueado y extra', () => {
    const st = (done: string[]) => npcs.map((n) => npcStatus(n, done, levels));
    expect(st([])).toEqual(['current', 'locked', 'locked', 'extra']);
    expect(st(['l1'])).toEqual(['done', 'current', 'locked', 'extra']);
  });

  it('un NPC bloqueado remite al anterior y no ofrece HABLAR', () => {
    const m = talkMessage(npcs[1]!, [], levels);
    expect(m.text).toBe('Aún no estás listo. Vence primero a NPC1.');
    expect(m.levelId).toBeUndefined();
    expect(talkMessage(npcs[0]!, [], levels).levelId).toBe('l1');
    expect(talkMessage(npcs[3]!, [], levels)).toMatchObject({ speaker: 'PROF. BIT', text: 'Hola' });
  });
});

describe('examine', () => {
  const stage = makeStage(levels);
  const npcs = worldNpcs(stage);

  it('lee carteles', () => {
    expect(examine(stage, npcs, { x: 3, y: 1, dir: 'down' }, [], levels)?.text).toBe('Bienvenido');
  });
  it('habla con el NPC de enfrente', () => {
    expect(examine(stage, npcs, { x: 3, y: 1, dir: 'left' }, [], levels)?.levelId).toBe('l1');
  });
  it('identifica laboratorio y gimnasio', () => {
    const kinds = houses(stage).map((h) => h.kind);
    expect(kinds).toEqual(['lab', 'gym']);
    expect(examine(stage, npcs, { x: 1, y: 2, dir: 'up' }, [], levels)?.speaker).toBe('LAB');
    expect(examine(stage, npcs, { x: 5, y: 2, dir: 'up' }, [], levels)?.speaker).toBe('PUERTA CERRADA');
    expect(examine(stage, npcs, { x: 5, y: 2, dir: 'up' }, ['l1', 'l2'], levels)?.speaker).toBe('GIMNASIO');
    expect(examine(stage, npcs, { x: 2, y: 2, dir: 'up' }, [], levels)?.levelId).toBe('l1');
  });
  it('nada que examinar en hierba', () => {
    expect(examine(stage, npcs, { x: 2, y: 2, dir: 'down' }, [], levels)).toBeNull();
  });
});

describe('startPosition', () => {
  const stage = makeStage(levels);
  const npcs = worldNpcs(stage);
  it('usa la posición guardada si es válida', () => {
    expect(startPosition(stage, npcs, { x: 2, y: 3, dir: 'left' })).toEqual({ x: 2, y: 3, dir: 'left' });
  });
  it('vuelve al spawn si no hay posición o es inválida', () => {
    expect(startPosition(stage, npcs, null)).toEqual({ x: 3, y: 1, dir: 'down' });
    expect(startPosition(stage, npcs, { x: 0, y: 0, dir: 'up' })).toEqual({ x: 3, y: 1, dir: 'down' });
    expect(startPosition(stage, npcs, { x: 2, y: 1, dir: 'up' })).toEqual({ x: 3, y: 1, dir: 'down' });
  });
});

/* ---------- Varias etapas (con una etapa 2 falsa) ---------- */

function forest(levels: Level[] = []): Stage {
  return {
    id: 'bosque-iterador',
    number: 2,
    name: 'BOSQUE ITERADOR',
    range: 'Nv 4–5',
    summary: '',
    badge: 'HOJA',
    color: '#2f7a3a',
    levels,
    map: {
      rows: [
        'PP=PP', //
        'P   P',
        'P B P',
        'PP=PP',
      ],
      spawn: { x: 2, y: 1 },
      signs: [],
      extraNpcs: [],
      back: { x: 2, y: 0 },
      exit: { x: 2, y: 3, lockedText: 'Cerrado' },
    },
  };
}

describe('viajes entre etapas', () => {
  const town = makeStage(levels);
  const lvl4 = level(4, 1, 2);
  const lvl5 = level(5, 3, 2, true);
  const woods = forest([lvl4, lvl5]);
  const world = [town, woods];
  const all = [...levels, lvl4, lvl5];
  const gymDone = ['l1', 'l2', 'l3'];
  const atExit = { x: 3, y: 3, dir: 'down' as const };

  it('la salida bloqueada no lleva a ningún sitio', () => {
    const r = move(world, town, worldNpcs(town), atExit, 'down', []);
    expect(r).toMatchObject({ moved: false, reason: 'exit' });
    expect(r.travel).toBeUndefined();
  });

  it('con el gimnasio completado, la salida lleva al spawn de la etapa siguiente', () => {
    const r = move(world, town, worldNpcs(town), atExit, 'down', gymDone);
    expect(r.travel?.stage.id).toBe('bosque-iterador');
    expect(r.travel?.pos).toEqual({ x: 2, y: 1, dir: 'down' });
  });

  it('en la última etapa la salida abierta dice "Próximamente" y no mueve al jugador', () => {
    const from = { x: 2, y: 2, dir: 'down' as const };
    const done = [...gymDone, 'l4', 'l5'];
    const r = move(world, woods, worldNpcs(woods), from, 'down', done);
    expect(r).toMatchObject({ moved: false, reason: 'soon', pos: from });
    if (r.moved === false && r.reason === 'soon') expect(r.text).toBe('Próximamente: Cueva Recursiva. El camino aún no está listo.');
    // Con una sola etapa también funciona.
    const solo = move([town], town, worldNpcs(town), atExit, 'down', gymDone);
    expect(solo).toMatchObject({ moved: false, reason: 'soon' });
    expect(comingSoonText(town)).toContain('Bosque Iterador');
  });

  it('back vuelve a la etapa anterior, junto a su salida y mirando hacia dentro', () => {
    const r = move(world, woods, worldNpcs(woods), { x: 2, y: 1, dir: 'down' }, 'up', []);
    expect(r.travel?.stage.id).toBe('s');
    expect(r.travel?.pos).toEqual({ x: 3, y: 3, dir: 'up' });
    expect(arrivalAtExit(town)).toEqual({ x: 3, y: 3, dir: 'up' });
  });

  it('back en la primera etapa no hace nada especial', () => {
    const lone = forest();
    const r = move([lone], lone, worldNpcs(lone), { x: 2, y: 1, dir: 'down' }, 'up', []);
    expect(r).toMatchObject({ moved: true, pos: { x: 2, y: 0 } });
    expect(r.travel).toBeUndefined();
  });

  it('examinar la salida abierta y el camino de vuelta', () => {
    const m = examine(town, worldNpcs(town), { x: 3, y: 3, dir: 'down' }, gymDone, all, world);
    expect(m?.text).toBe('El camino está abierto. Lleva al Bosque Iterador.');
    const b = examine(woods, worldNpcs(woods), { x: 2, y: 1, dir: 'up' }, [], all, world);
    expect(b?.text).toBe('Este camino vuelve al Pueblo Semilla.');
  });

  it('misión actual en otra etapa', () => {
    expect(missionElsewhere(world, town, lvl4)).toBe('Cruza al sur hacia el Bosque Iterador. Allí te espera NPC4 (Nv 4).');
    expect(missionElsewhere(world, woods, levels[0]!)).toBe(
      'Vuelve al Pueblo Semilla por el camino del norte. Allí te espera NPC1 (Nv 1).',
    );
    expect(missionElsewhere(world, town, levels[0]!)).toBeNull();
  });

  it('fondo de hierba por etapa con valor por defecto', () => {
    expect(groundOf(woods)).toEqual({ base: '#4f9e38', dot: '#2f7a3a' });
    expect(groundOf({ id: 'desconocida' })).toEqual({ base: '#6cc04a', dot: '#4f9e38' });
  });
});

describe('migración de partidas', () => {
  const first = contentStages[0]!.id;

  it('el antiguo position pasa a positions de la primera etapa', () => {
    const p = migrateProgress({ version: 1, xp: 30, completed: ['a'], position: { x: 4, y: 5, dir: 'left' } });
    expect(p.stageId).toBe(first);
    expect(p.positions).toEqual({ [first]: { x: 4, y: 5, dir: 'left' } });
    expect(p.xp).toBe(30);
    expect('position' in p).toBe(false);
  });

  it('respeta positions y stageId nuevos; un stageId desconocido vuelve a la primera etapa', () => {
    const p = migrateProgress({ version: 1, stageId: 'nope', positions: { x: { x: 1, y: 1, dir: 'up' } } });
    expect(p.stageId).toBe(first);
    expect(p.positions).toEqual({ x: { x: 1, y: 1, dir: 'up' } });
    expect(migrateProgress({ version: 1, position: null }).positions).toEqual({});
  });
});

describe('houses con una sola casa', () => {
  it('si la única casa es la del líder, es el gimnasio aunque el Prof. Bit esté cerca', () => {
    const s = makeStage([level(1, 4, 2, true)]);
    s.map = { ...s.map, rows: ['TTTTTTT', 'T    HT', 'T  S  T', 'T ,,~ T', 'TTT=TTT'] };
    s.map.extraNpcs = [{ ...s.map.extraNpcs[0]!, x: 5, y: 2 }];
    expect(houses(s).map((h) => h.kind)).toEqual(['gym']);
  });
});
