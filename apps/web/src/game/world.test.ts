import { describe, expect, it } from 'vitest';
import type { Level, Stage } from '@algoria/shared';
import {
  examine,
  faceToward,
  facingTile,
  houses,
  isExitLocked,
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
