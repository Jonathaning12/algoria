// Utilidades para escribir niveles: código con sangría limpia y tests generados.
import type { TestCase } from '@algoria/shared';

/**
 * Etiqueta para bloques de código: usa String.raw (los "\n" del código se quedan como texto),
 * quita la primera línea vacía y la sangría común, y termina siempre en un único salto de línea.
 */
export function code(strings: TemplateStringsArray, ...values: unknown[]): string {
  const raw = String.raw({ raw: strings.raw }, ...values);
  const lines = raw.replace(/^\r?\n/, '').replace(/\s+$/, '').split(/\r?\n/);
  const indents = lines.filter((l) => l.trim() !== '').map((l) => l.match(/^ */)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n') + '\n';
}

/** Atajo para crear tests: [input, expected] → TestCase. Los `samples` primeros son visibles. */
export function tests(cases: [string, string][], samples = 2): TestCase[] {
  return cases.map(([input, expected], i) => ({
    id: `t${i + 1}`,
    input: input === '' || input.endsWith('\n') ? input : input + '\n',
    expected,
    sample: i < samples,
  }));
}

/** Generador pseudoaleatorio determinista (LCG) para tests grandes reproducibles. */
export function rng(seed: number): (lo: number, hi: number) => number {
  let s = seed >>> 0;
  return (lo, hi) => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const r = s / 2 ** 32;
    return lo + Math.floor(r * (hi - lo + 1));
  };
}
