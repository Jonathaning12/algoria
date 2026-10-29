import type { ApiError, RunRequest, RunResponse } from '@algoria/shared';

/** Envía código al juez. Lanza Error con mensaje legible si la API falla. */
export async function runCode(req: RunRequest, signal?: AbortSignal): Promise<RunResponse> {
  let res: Response;
  try {
    res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new Error('No se pudo contactar con el juez. ¿Está corriendo la API (npm run dev)?');
  }
  const body = (await res.json().catch(() => null)) as RunResponse | ApiError | null;
  if (!res.ok || !body || 'error' in body) {
    throw new Error((body && 'error' in body && body.error) || `El juez respondió ${res.status}`);
  }
  return body;
}
