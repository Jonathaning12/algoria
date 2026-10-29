import type { Language } from '@algoria/shared';

/** Solución ingenua que DEBE dar TLE en algún test oculto (y nunca WA/RE). */
export interface NaiveSolution {
  problemId: string;
  language: Language;
  idea: string;
  code: string;
}
