// Lógica pura del duelo de código: XP, estrellas, mensajes del registro y normalización.
// Sin React ni efectos (salvo los helpers de borrador, que reciben el Storage).
import type { Difficulty, Language, Problem, RunMode, RunResponse, TestResult, Verdict } from '@algoria/shared';

/** Máximo de pistas que se pueden pedir en un duelo. */
export const MAX_HINTS = 3;

/** −15 % de XP por pista usada, nunca por debajo del 50 %. 0 si el nivel ya estaba completado. */
export function calcXp(baseXp: number, hintsUsed: number, alreadyCompleted = false): number {
  if (alreadyCompleted || baseXp <= 0) return 0;
  const factor = Math.max(0.5, 1 - 0.15 * Math.max(0, hintsUsed));
  return Math.round(baseXp * factor);
}

/** 3 estrellas: sin pistas y a la primera. 2: como mucho 1 pista o 3 intentos. Si no, 1. */
export function calcStars(attempts: number, hintsUsed: number): 1 | 2 | 3 {
  if (hintsUsed === 0 && attempts <= 1) return 3;
  if (hintsUsed <= 1 || attempts <= 3) return 2;
  return 1;
}

/** mm:ss (los minutos pueden pasar de 99). */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Normaliza una salida como lo hace el juez: \r\n → \n, sin espacios al final de cada línea
 * y sin líneas vacías al final.
 */
export function normalizeOutput(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: 'FÁCIL',
  medio: 'MEDIO',
  dificil: 'DIFÍCIL',
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  facil: 'var(--grass)',
  medio: 'var(--gold)',
  dificil: 'var(--red)',
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  AC: 'CORRECTO',
  WA: 'INCORRECTO',
  TLE: 'TIEMPO AGOTADO',
  RE: 'ERROR DE EJECUCIÓN',
  CE: 'NO COMPILA',
};

/** Tests que siguen en pie (defensa del NPC). Sin respuesta, todos. */
export function remainingDefense(total: number, response: RunResponse | null): number {
  if (!response) return total;
  return Math.max(0, total - response.passed);
}

/** Primer test que falló (o undefined si todo pasó). */
export function firstFailure(response: RunResponse): TestResult | undefined {
  return response.results.find((r) => r.verdict !== 'AC');
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/** Mensaje inicial del registro. */
export function introLog(npcName: string): string {
  return `¡${npcName} te reta a un duelo! Escribe tu solución y pulsa ENVIAR para atacar.`;
}

/** Mensaje mientras el juez trabaja. */
export function loadingLog(npcName: string): string {
  return `${npcName} está revisando tu código…`;
}

/** Mensaje del registro de batalla según la respuesta del juez. */
export function battleLog(response: RunResponse, mode: RunMode, npcName: string, hiddenTotal: number): string {
  const { verdict, passed, total } = response;

  if (verdict === 'CE') {
    return 'Tu código no compila. Lee el mensaje del compilador, corrige y vuelve a intentarlo.';
  }

  if (mode === 'samples') {
    if (verdict === 'AC') {
      const hidden =
        hiddenTotal > 0
          ? ` ${npcName} aún tiene ${hiddenTotal} ${plural(hiddenTotal, 'defensa oculta', 'defensas ocultas')}… ¡Pulsa ENVIAR!`
          : ' ¡Pulsa ENVIAR para atacar!';
      return `${total === 1 ? 'Tu ejemplo pasa.' : `Tus ${total} ejemplos pasan.`}${hidden}`;
    }
    const fail = firstFailure(response);
    const which = fail ? ` (${fail.id})` : '';
    switch (verdict) {
      case 'WA':
        return `Pasas ${passed}/${total} ejemplos. Tu salida no coincide con la esperada${which}. Compáralas abajo.`;
      case 'TLE':
        return `Tiempo agotado en un ejemplo${which}. ¿Hay algún bucle que no termina?`;
      case 'RE':
        return `Tu programa se detuvo con un error en un ejemplo${which}. Revisa el mensaje de error.`;
    }
  }

  // mode === 'submit'
  if (verdict === 'AC') {
    const ms = Math.max(0, ...response.results.map((r) => r.timeMs));
    return `¡Golpe crítico! ${passed}/${total} tests superados en ${ms} ms. Las defensas de ${npcName} caen.`;
  }
  const fail = firstFailure(response);
  const where = fail && !fail.sample ? 'un test oculto' : 'un ejemplo';
  const score = `${passed}/${total} tests superados.`;
  switch (verdict) {
    case 'WA':
      return `${passed > 0 ? '¡Le das!' : '¡Fallas!'} ${score} Respuesta incorrecta en ${where}.`;
    case 'TLE':
      return `Tiempo agotado en ${where}… ${score} Prueba con una idea más rápida.`;
    case 'RE':
      return `Tu programa se detuvo con un error en ${where}. ${score}`;
  }
  return score;
}

/** Tests ocultos (no sample) del problema. */
export function hiddenCount(problem: Pick<Problem, 'tests'>): number {
  return problem.tests.filter((t) => !t.sample).length;
}

/* ---------- Borrador del editor ---------- */

export function draftKey(levelId: string, lang: Language): string {
  return `algoria.draft.${levelId}.${lang}`;
}

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function storage(): DraftStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadDraft(levelId: string, lang: Language, fallback: string, store: DraftStorage | null = storage()): string {
  try {
    const v = store?.getItem(draftKey(levelId, lang));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveDraft(levelId: string, lang: Language, code: string, store: DraftStorage | null = storage()): void {
  try {
    store?.setItem(draftKey(levelId, lang), code);
  } catch {
    // Sin almacenamiento: el borrador solo vive en memoria.
  }
}

export function clearDraft(levelId: string, lang: Language, store: DraftStorage | null = storage()): void {
  try {
    store?.removeItem(draftKey(levelId, lang));
  } catch {
    // ignorar
  }
}
