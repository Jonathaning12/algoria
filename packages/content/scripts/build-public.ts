// Genera generated/public-content.json: el contenido que puede ver el navegador.
// Quita las soluciones y vacía los tests ocultos (se conserva cuántos hay, para la barra de
// defensa del duelo). Los tests completos solo los tiene la API.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Stage } from '@algoria/shared';
import { stages } from '../src/index';

const EMPTY = { python: '', cpp: '', java: '' };

export function toPublic(all: Stage[]): Stage[] {
  return all.map((stage) => ({
    ...stage,
    levels: stage.levels.map((level) => ({
      ...level,
      problem: {
        ...level.problem,
        solution: EMPTY,
        tests: level.problem.tests.map((t) => (t.sample ? t : { id: t.id, sample: false, input: '', expected: '' })),
      },
    })),
  }));
}

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'generated', 'public-content.json');
mkdirSync(dirname(out), { recursive: true });
const json = JSON.stringify(toPublic(stages));
writeFileSync(out, json);
console.log(`public-content.json: ${stages.length} etapas, ${(json.length / 1024).toFixed(0)} KB`);
