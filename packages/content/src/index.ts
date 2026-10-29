// API pública del contenido. La web y la API dependen de estas exportaciones:
// se pueden añadir más, pero no cambiar sus firmas.
import type { Level, Problem, Stage } from '@algoria/shared';
import { bosqueIterador } from './stages/bosque-iterador';
import { cuevaRecursiva } from './stages/cueva-recursiva';
import { montanaGrafo } from './stages/montana-grafo';
import { puebloSemilla } from './stages/pueblo-semilla';
import { puertoEstructura } from './stages/puerto-estructura';
import { torreDinamica } from './stages/torre-dinamica';

/** Etapas jugables, en orden. Las que aún no tienen niveles no se exponen. */
export const stages: Stage[] = [
  puebloSemilla,
  bosqueIterador,
  cuevaRecursiva,
  puertoEstructura,
  montanaGrafo,
  torreDinamica,
].filter((s) => s.levels.length > 0);

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
