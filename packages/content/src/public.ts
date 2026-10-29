// Versión pública del contenido para el navegador: misma API que index.ts, pero sin
// soluciones ni datos de tests ocultos. La web la usa mediante un alias de Vite.
// Se genera con `npm run gen:public -w @algoria/content`.
import type { Level, Problem, Stage } from '@algoria/shared';
import data from '../generated/public-content.json';

export const stages: Stage[] = data as unknown as Stage[];

export const allLevels: Level[] = stages.flatMap((s) => s.levels);

export function getLevel(id: string): Level | undefined {
  return allLevels.find((l) => l.id === id);
}

export function getProblem(id: string): Problem | undefined {
  return allLevels.find((l) => l.problem.id === id)?.problem;
}

export function getStageOfLevel(id: string): Stage | undefined {
  return stages.find((s) => s.levels.some((l) => l.id === id));
}
