import { describe, expect, it } from 'vitest';
import { TILE_LEGEND } from '@algoria/shared';
import { PALETTE, SPRITES, spritePaths } from './sprites';

describe('sprites', () => {
  it('todos miden 16 filas de 8 (reflejadas) o 16 columnas y solo usan colores de la paleta', () => {
    for (const [id, rows] of Object.entries(SPRITES)) {
      expect(rows, id).toHaveLength(16);
      for (const row of rows) {
        expect([8, 16], `${id}: "${row}"`).toContain(row.length);
        for (const ch of row) {
          if (ch !== '.') expect(PALETTE[ch], `${id}: color "${ch}"`).toBeDefined();
        }
      }
    }
  });

  it('cada tile de la leyenda tiene sprite', () => {
    for (const id of Object.values(TILE_LEGEND)) {
      expect(spritePaths(id).length, id).toBeGreaterThan(0);
    }
  });
});
