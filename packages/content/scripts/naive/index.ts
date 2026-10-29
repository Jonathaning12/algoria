// Una lista por etapa para que cada etapa se edite en su propio archivo.
import type { NaiveSolution } from './types';
import { naive as bosque } from './bosque-iterador';
import { naive as cueva } from './cueva-recursiva';
import { naive as puerto } from './puerto-estructura';
import { naive as montana } from './montana-grafo';
import { naive as torre } from './torre-dinamica';

export type { NaiveSolution };
export const ALL_NAIVE: NaiveSolution[] = [...bosque, ...cueva, ...puerto, ...montana, ...torre];
