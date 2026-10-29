// Coliseo: torneo individual contrarreloj con 5 problemas de niveles ya superados.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Level, RunMode, RunResponse } from '@algoria/shared';
import { allLevels, getLevel, stages } from '@algoria/content';
import { useGame, useLanguage } from '../state/game';
import { LANGUAGE_INFO } from '../lib/languages';
import { runCode } from '../lib/api';
import { audio } from '../audio/engine';
import { Sprite } from '../components/Sprite';
import { RichText } from '../components/classroom/common';
import { CodeEditor } from '../components/classroom/CodeEditor';
import { DIFFICULTY_LABEL, VERDICT_LABEL, firstFailure } from '../components/classroom/battleLogic';
import {
  DURATION_MS,
  TOURNAMENT_SIZE,
  formatClock,
  isColiseoUnlocked,
  loadRecord,
  pickTournament,
  saveResult,
  slotScore,
  timeBonus,
  type ColiseoRecord,
  type Slot,
} from '../coliseo/logic';
import '../styles/classroom.css';
import '../styles/coliseo.css';

type Phase = 'lobby' | 'playing' | 'done';

export function ColiseoScreen() {
  const { go, progress } = useGame();
  const lang = useLanguage();
  const info = LANGUAGE_INFO[lang];
  const unlocked = isColiseoUnlocked(progress.completed, stages);
  const pool = useMemo(() => allLevels.filter((l) => progress.completed.includes(l.id)), [progress.completed]);

  const [phase, setPhase] = useState<Phase>('lobby');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [current, setCurrent] = useState(0);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState<RunMode | null>(null);
  const [log, setLog] = useState('');
  const [lastRun, setLastRun] = useState<RunResponse | null>(null);
  const [finalScore, setFinalScore] = useState<{ total: number; bonus: number; record: ColiseoRecord; newBest: boolean } | null>(null);
  const [record, setRecord] = useState<ColiseoRecord>(loadRecord);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const remaining = Math.max(0, endsAt - now);
  const levels = slots.map((s) => getLevel(s.levelId)).filter((l): l is Level => !!l);
  const level = levels[current];

  const finish = (finalSlots: Slot[], remainingMs: number) => {
    abortRef.current?.abort();
    const all = finalSlots.every((s) => s.solved);
    const base = finalSlots.reduce((sum, s) => sum + slotScore(s, getLevel(s.levelId)?.problem.difficulty ?? 'facil'), 0);
    const bonus = timeBonus(remainingMs, all);
    const total = base + bonus;
    const prevBest = loadRecord().best;
    const rec = saveResult(total);
    setRecord(rec);
    setFinalScore({ total, bonus, record: rec, newBest: total > prevBest && total > 0 });
    setPhase('done');
    audio.sfx(total > 0 ? 'levelUp' : 'fail');
  };

  // Reloj del torneo.
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && remaining <= 0) finish(slots, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining]);

  const start = () => {
    const ids = pickTournament(pool, TOURNAMENT_SIZE);
    setSlots(ids.map((levelId) => ({ levelId, solved: false, wrong: 0 })));
    setCodes(Object.fromEntries(ids.map((id) => [id, getLevel(id)?.problem.starter[lang] ?? ''])));
    setCurrent(0);
    setLog('¡Que empiece el torneo! Resuelve todo lo que puedas antes de que acabe el tiempo.');
    setLastRun(null);
    const t = Date.now();
    setNow(t);
    setEndsAt(t + DURATION_MS);
    setPhase('playing');
    audio.sfx('confirm');
  };

  const run = async (mode: RunMode) => {
    if (!level || busy) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBusy(mode);
    setLog('El jurado del Coliseo está revisando tu código…');
    try {
      const res = await runCode({ problemId: level.problem.id, language: lang, code: codes[level.id] ?? '', mode }, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setLastRun(res);
      if (mode === 'samples') {
        setLog(res.verdict === 'AC' ? 'Los ejemplos pasan. ¡Envía cuando estés listo!' : explain(res));
        audio.sfx(res.verdict === 'AC' ? 'pass' : res.verdict === 'CE' ? 'error' : 'fail');
        return;
      }
      if (res.verdict === 'AC') {
        const next = slots.map((s, i) => (i === current ? { ...s, solved: true } : s));
        setSlots(next);
        audio.sfx('hit');
        if (next.every((s) => s.solved)) {
          finish(next, endsAt - Date.now());
          return;
        }
        setLog(`¡Problema resuelto! ${res.passed}/${res.total} tests. Vamos con el siguiente.`);
        const after = next.findIndex((s, i) => i > current && !s.solved);
        setCurrent(after >= 0 ? after : next.findIndex((s) => !s.solved));
        setLastRun(null);
      } else {
        setSlots((ss) => ss.map((s, i) => (i === current ? { ...s, wrong: s.wrong + 1 } : s)));
        setLog(`${explain(res)} (−20 puntos en este problema)`);
        audio.sfx(res.verdict === 'CE' ? 'error' : 'fail');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setLog((err as Error).message || 'No se pudo contactar con el juez.');
      audio.sfx('error');
    } finally {
      if (abortRef.current === ctrl) {
        abortRef.current = null;
        setBusy(null);
      }
    }
  };

  /* ---------- lobby ---------- */
  if (phase === 'lobby') {
    return (
      <main className="col">
        <div className="col__inner">
          <h1 className="px col__title">COLISEO</h1>
          <div className="col__hero">
            <Sprite id="hero_up" size={96} />
            <Sprite id={info.sprite} size={64} />
          </div>
          <div className="box col__panel">
            {unlocked ? (
              <>
                <p>
                  Torneo contrarreloj: <strong>{TOURNAMENT_SIZE} problemas</strong> al azar de los niveles que ya superaste y{' '}
                  <strong>{DURATION_MS / 60000} minutos</strong>. Cada problema vale según su dificultad (fácil 100, media 200,
                  difícil 300); cada envío fallido resta 20 y, si resuelves todo, el tiempo sobrante suma puntos.
                </p>
                <dl className="col__stats">
                  <div><dt className="px">RÉCORD</dt><dd className="px">{record.best}</dd></div>
                  <div><dt className="px">ÚLTIMA</dt><dd className="px">{record.last}</dd></div>
                  <div><dt className="px">PARTIDAS</dt><dd className="px">{record.plays}</dd></div>
                </dl>
              </>
            ) : (
              <p>
                Las puertas del Coliseo están cerradas. Se abren al vencer el último gimnasio de Algoria. ¡Sigue
                entrenando!
              </p>
            )}
          </div>
          <div className="col__actions">
            {unlocked && (
              <button type="button" className="btn btn--gold" data-sfx="none" onClick={start} disabled={pool.length === 0}>
                ¡EMPEZAR TORNEO!
              </button>
            )}
            <button type="button" className="btn" data-sfx="cancel" onClick={() => go({ name: 'map' })}>
              VOLVER AL MAPA
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- resultados ---------- */
  if (phase === 'done' && finalScore) {
    return (
      <main className="col">
        <div className="col__inner">
          <h1 className="px col__title">{finalScore.newBest ? '¡NUEVO RÉCORD!' : 'FIN DEL TORNEO'}</h1>
          <div className="box col__panel">
            <table className="col__table">
              <caption className="sr-only">Resultado por problema</caption>
              <thead>
                <tr><th scope="col">Problema</th><th scope="col">Estado</th><th scope="col">Fallos</th><th scope="col">Puntos</th></tr>
              </thead>
              <tbody>
                {slots.map((s) => {
                  const l = getLevel(s.levelId);
                  return (
                    <tr key={s.levelId}>
                      <td>Nv {l?.number} · {l?.problem.title}</td>
                      <td>{s.solved ? '✓ Resuelto' : '✗ Pendiente'}</td>
                      <td>{s.wrong}</td>
                      <td className="px">{slotScore(s, l?.problem.difficulty ?? 'facil')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="col__total">
              Bonus de tiempo: <strong className="px">{finalScore.bonus}</strong> · Total:{' '}
              <strong className="px">{finalScore.total}</strong> · Récord: <strong className="px">{finalScore.record.best}</strong>
            </p>
          </div>
          <div className="col__actions">
            <button type="button" className="btn btn--gold" data-sfx="none" onClick={start}>OTRO TORNEO</button>
            <button type="button" className="btn" data-sfx="cancel" onClick={() => go({ name: 'map' })}>VOLVER AL MAPA</button>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- torneo ---------- */
  if (!level) return null;
  const p = level.problem;
  const samples = p.tests.filter((t) => t.sample);
  const failure = lastRun && lastRun.verdict !== 'AC' ? firstFailure(lastRun) : undefined;
  return (
    <main className="col col--playing">
      <header className="col__bar">
        <span className="px">COLISEO</span>
        <span className={`px col__clock${remaining < 5 * 60 * 1000 ? ' col__clock--low' : ''}`} role="timer" aria-label={`Tiempo restante ${formatClock(remaining)}`}>
          {formatClock(remaining)}
        </span>
        <button type="button" className="btn btn--gray" data-sfx="cancel" onClick={() => finish(slots, remaining)} style={{ fontSize: 10 }}>
          TERMINAR
        </button>
      </header>

      <nav className="col__tabs" aria-label="Problemas del torneo">
        {slots.map((s, i) => {
          const l = getLevel(s.levelId);
          return (
            <button
              key={s.levelId}
              type="button"
              className="col__tab px"
              data-state={s.solved ? 'ok' : i === current ? 'current' : undefined}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => {
                setCurrent(i);
                setLastRun(null);
              }}
            >
              {s.solved ? '✓ ' : ''}
              {i + 1}. Nv {l?.number}
              {s.wrong > 0 && !s.solved ? ` ✗${s.wrong}` : ''}
            </button>
          );
        })}
      </nav>

      <div className="col__work">
        <article className="box col__problem">
          <div className="col__head">
            <h1 className="px" style={{ fontSize: 14, margin: 0 }}>{p.title}</h1>
            <span className="px col__diff">{DIFFICULTY_LABEL[p.difficulty]}</span>
          </div>
          <p><RichText text={p.statement} /></p>
          <p><strong>Entrada:</strong> <RichText text={p.inputSpec} /></p>
          <p><strong>Salida:</strong> <RichText text={p.outputSpec} /></p>
          <p className="col__muted"><RichText text={p.constraints} /></p>
          {samples.map((t, i) => (
            <div key={t.id} className="col__sample">
              <span className="px">EJEMPLO {i + 1}</span>
              <pre>{t.input}</pre>
              <pre>{t.expected}</pre>
            </div>
          ))}
        </article>

        <section className="box col__editor" aria-label="Tu solución">
          <CodeEditor
            language={lang}
            value={codes[level.id] ?? ''}
            onChange={(v) => setCodes((c) => ({ ...c, [level.id]: v }))}
            label={`Código en ${info.label} para ${p.title}`}
          />
          <div className="col__buttons">
            <button type="button" className="btn" data-sfx="run" disabled={busy !== null || slots[current]?.solved} onClick={() => void run('samples')}>
              {busy === 'samples' ? 'PROBANDO…' : 'PROBAR EJEMPLOS'}
            </button>
            <button type="button" className="btn btn--green" data-sfx="run" disabled={busy !== null || slots[current]?.solved} onClick={() => void run('submit')}>
              {busy === 'submit' ? 'ENVIANDO…' : 'ENVIAR'}
            </button>
          </div>
          <p className="col__log" role="status" aria-live="polite">{log}</p>
          {lastRun?.compileOutput && <pre className="col__ce">{lastRun.compileOutput}</pre>}
          {failure?.sample && failure.output !== undefined && (
            <p className="col__muted">
              Ejemplo fallido · {VERDICT_LABEL[failure.verdict]} · tu salida: <code>{failure.output.slice(0, 200) || '(vacía)'}</code>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function explain(res: RunResponse): string {
  if (res.verdict === 'CE') return 'Tu código no compila.';
  return `${VERDICT_LABEL[res.verdict]}: ${res.passed}/${res.total} tests superados.`;
}
