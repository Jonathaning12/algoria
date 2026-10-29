// API pública del contenido. La web y la API dependen de estas exportaciones:
// se pueden añadir más, pero no cambiar sus firmas.
import type { Level, Problem, Stage } from '@algoria/shared';
import { puebloSemilla } from './stages/pueblo-semilla';

export const stages: Stage[] = [puebloSemilla];

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
