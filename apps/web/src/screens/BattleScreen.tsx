// Duelo de código contra el NPC (design/project/Battle.dc.html).
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RunMode, RunResponse, TestResult } from '@algoria/shared';
import { getLevel } from '@algoria/content';
import { playerLevel, useGame, useLanguage, type VictoryInfo } from '../state/game';
import { LANGUAGE_INFO } from '../lib/languages';
import { runCode } from '../lib/api';
import { audio } from '../audio/engine';
import { Sprite } from '../components/Sprite';
import { LevelMissing, RichText, Tag } from '../components/classroom/common';
import { CodeEditor } from '../components/classroom/CodeEditor';
import {
  DIFFICULTY_COLOR,
  DIFFICULTY_LABEL,
  MAX_HINTS,
  VERDICT_LABEL,
  battleLog,
  calcXp,
  clearDraft,
  hiddenCount,
  introLog,
  loadDraft,
  loadingLog,
  remainingDefense,
  saveDraft,
} from '../components/classroom/battleLogic';
import '../styles/classroom.css';

export function BattleScreen({ levelId }: { levelId: string }) {
  const level = getLevel(levelId);
  const problem = level?.problem;
  const { go, progress, completeLevel } = useGame();
  const lang = useLanguage();
  const info = LANGUAGE_INFO[lang];

  const [code, setCode] = useState(() => (problem ? loadDraft(levelId, lang, problem.starter[lang]) : ''));
  const [busy, setBusy] = useState<RunMode | null>(null);
  const [sampleRun, setSampleRun] = useState<RunResponse | null>(null);
  const [submitRun, setSubmitRun] = useState<RunResponse | null>(null);
  const [lastMode, setLastMode] = useState<RunMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState(() => (level ? introLog(level.npc.name) : ''));
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [victory, setVictory] = useState<VictoryInfo | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const startRef = useRef(Date.now());
  const alreadyCompleted = useRef(progress.completed.includes(levelId)).current;
  const abortRef = useRef<AbortController | null>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const resetBtnRef = useRef<HTMLButtonElement>(null);
  const confirmYesRef = useRef<HTMLButtonElement>(null);
  const runBtnRef = useRef<HTMLButtonElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  // Al deshabilitarse el botón pulsado el foco se pierde; lo devolvemos al terminar.
  const refocusRef = useRef<HTMLButtonElement | null>(null);

  // Cancelar peticiones pendientes al salir.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Borrador por nivel + lenguaje.
  useEffect(() => {
    if (problem) saveDraft(levelId, lang, code);
  }, [code, levelId, lang, problem]);

  useEffect(() => {
    if (victory) continueRef.current?.focus();
  }, [victory]);

  useEffect(() => {
    if (busy || victory) return;
    const btn = refocusRef.current;
    refocusRef.current = null;
    if (btn && (document.activeElement === document.body || document.activeElement === null)) btn.focus();
  }, [busy, victory]);

  useEffect(() => {
    if (confirmReset) confirmYesRef.current?.focus();
  }, [confirmReset]);

  const run = useCallback(
    async (mode: RunMode) => {
      if (!level || !problem || busy) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const nextAttempts = mode === 'submit' ? attempts + 1 : attempts;
      if (mode === 'submit') setAttempts(nextAttempts);
      refocusRef.current = mode === 'submit' ? submitBtnRef.current : runBtnRef.current;
      setBusy(mode);
      setError(null);
      setLog(loadingLog(level.npc.name));
      try {
        const res = await runCode({ problemId: problem.id, language: lang, code, mode }, ctrl.signal);
        if (ctrl.signal.aborted) return;
        setLastMode(mode);
        if (mode === 'samples') setSampleRun(res);
        else setSubmitRun(res);
        setLog(battleLog(res, mode, level.npc.name, hiddenCount(problem)));
        audio.sfx(res.verdict === 'CE' ? 'error' : res.verdict !== 'AC' ? 'fail' : mode === 'submit' ? 'hit' : 'pass');
        if (mode === 'submit' && res.verdict === 'AC') {
          const xpGained = calcXp(problem.xp, hintsUsed, alreadyCompleted);
          completeLevel(levelId, xpGained);
          setVictory({ xpGained, timeMs: Date.now() - startRef.current, attempts: nextAttempts, hintsUsed });
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const msg = (err as Error).message || 'Algo salió mal al contactar con el juez.';
        setError(msg);
        setLog(msg);
        audio.sfx('error');
      } finally {
        if (abortRef.current === ctrl) {
          abortRef.current = null;
          setBusy(null);
        }
      }
    },
    [level, problem, busy, attempts, lang, code, hintsUsed, alreadyCompleted, completeLevel, levelId],
  );

  if (!level || !problem) return <LevelMissing levelId={levelId} />;

  const npc = level.npc;
  const totalTests = problem.tests.length;
  const defense = remainingDefense(submitRun?.total ?? totalTests, submitRun);
  const defenseTotal = submitRun?.total ?? totalTests;
  const defensePct = defenseTotal > 0 ? (defense / defenseTotal) * 100 : 0;
  const defenseColor = defensePct > 50 ? 'var(--grass)' : defensePct > 25 ? 'var(--gold)' : 'var(--red)';
  const hintsAvailable = Math.min(MAX_HINTS, problem.hints.length);
  const samples = problem.tests.filter((t) => t.sample);
  const won = victory !== null;
  const lastRun = lastMode === 'submit' ? submitRun : lastMode === 'samples' ? sampleRun : null;

  // El último run manda; los ocultos pueden conservar el resultado del último envío.
  const resultFor = (id: string): TestResult | undefined =>
    lastRun?.results.find((r) => r.id === id) ??
    (lastMode === 'samples' && submitRun?.verdict !== 'CE' ? submitRun?.results.find((r) => r.id === id) : undefined);

  let sampleNo = 0;
  let hiddenNo = 0;
  const testCells = problem.tests.map((t) => {
    const label = t.sample ? `EJ ${++sampleNo}` : `OCULTO ${++hiddenNo}`;
    const ceAll = lastRun?.verdict === 'CE';
    const r = ceAll ? undefined : resultFor(t.id);
    const state = r ? (r.verdict === 'AC' ? 'ok' : 'ko') : ceAll ? 'ko' : sampleRun && !t.sample ? 'pending' : 'idle';
    const icon = state === 'ok' ? '✓' : state === 'ko' ? '✗' : state === 'pending' ? '?' : '·';
    const verdict = r ? r.verdict : ceAll ? 'CE' : null;
    const spoken = verdict ? VERDICT_LABEL[verdict].toLowerCase() : state === 'pending' ? 'sin probar todavía' : 'sin probar';
    return { id: t.id, label, state, icon, verdict, spoken };
  });

  const detailResults = (lastRun?.results ?? []).filter((r) => r.sample && r.input !== undefined);

  return (
    <main className="cl-battle">
      <h1 className="sr-only">Duelo contra {npc.name}: {problem.title}</h1>

      <section aria-label="Duelo" className="cl-arena">
        <div className="cl-arena__ground" aria-hidden="true" />

        <div className="cl-side">
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Sprite id="hero_up" size={128} label="Tú" />
            <div style={{ marginLeft: -20 }}>
              <Sprite id={info.sprite} size={72} label={info.companion} />
            </div>
          </div>
          <div className="box cl-hud">
            <div className="cl-hud__row">
              <strong className="px" style={{ fontSize: 11 }}>{progress.playerName}</strong>
              <span className="px" style={{ fontSize: 10 }}>Nv {playerLevel(progress)}</span>
            </div>
            <div className="cl-pips" role="img" aria-label={`Pistas disponibles: ${hintsAvailable - hintsUsed} de ${hintsAvailable}`}>
              <span className="px" style={{ fontSize: 8 }}>PISTAS</span>
              {Array.from({ length: MAX_HINTS }, (_, k) => (
                <span key={k} className={k < hintsAvailable - hintsUsed ? 'cl-pip cl-pip--on' : 'cl-pip'} />
              ))}
            </div>
          </div>
        </div>

        <div className="cl-side cl-side--npc">
          <div className="box cl-hud" style={{ minWidth: 260 }}>
            <div className="cl-hud__row">
              <strong className="px" style={{ fontSize: 11 }}>{npc.name}</strong>
              <span className="px" style={{ fontSize: 10 }}>Nv {level.number}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Tag dark>DEFENSA</Tag>
              <div
                className="cl-hp"
                role="progressbar"
                aria-label={`Defensa de ${npc.name}`}
                aria-valuemin={0}
                aria-valuemax={defenseTotal}
                aria-valuenow={defense}
                aria-valuetext={`${defense} de ${defenseTotal} tests sin superar`}
              >
                <div className="cl-hp__fill" style={{ width: `${defensePct}%`, background: defenseColor }} />
              </div>
            </div>
            <span className="px" style={{ fontSize: 9, alignSelf: 'flex-end' }} aria-hidden="true">
              {defense} / {defenseTotal}
            </span>
          </div>
          <div className={won ? 'cl-npc-sprite--down' : 'bob'}>
            <Sprite id={npc.sprite} size={128} label={npc.name} />
          </div>
        </div>
      </section>

      <div className="cl-row">
        <article className="box cl-statement" aria-labelledby="cl-problem-title">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 id="cl-problem-title" className="cl-heading" style={{ fontSize: 14 }}>{problem.title.toUpperCase()}</h2>
            <Tag bg={DIFFICULTY_COLOR[problem.difficulty]}>
              {DIFFICULTY_LABEL[problem.difficulty]} · {problem.xp} XP
            </Tag>
          </div>
          <p><RichText text={problem.statement} /></p>
          <div className="cl-spec">
            <div>
              <span className="px" style={{ fontSize: 9 }}>ENTRADA</span>
              <span><RichText text={problem.inputSpec} /></span>
            </div>
            <div>
              <span className="px" style={{ fontSize: 9 }}>SALIDA</span>
              <span><RichText text={problem.outputSpec} /></span>
            </div>
          </div>
          {samples.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="px" style={{ fontSize: 9 }}>EJEMPLOS</span>
              <div className="cl-samples">
                {samples.map((t, k) => (
                  <div key={t.id} className="cl-sample" aria-label={`Ejemplo ${k + 1}`} role="group">
                    <span className="cl-sample__label">ENTRADA</span>
                    <pre>{t.input.trim() === '' ? '(sin entrada)' : t.input}</pre>
                    <span className="cl-sample__label">SALIDA</span>
                    <pre>{t.expected}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="cl-muted" style={{ fontSize: 17 }}>
            Límites: <RichText text={problem.constraints} /> · Tiempo: {problem.timeLimitMs / 1000} s
          </p>
          <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {problem.hints.slice(0, hintsUsed).map((h, k) => (
              <div key={k} className="cl-hint">
                <Sprite id={info.sprite} size={40} />
                <span>
                  <strong>Pista {k + 1}:</strong> <RichText text={h} />
                </span>
              </div>
            ))}
          </div>
        </article>

        <section className="box cl-editor-box" aria-label="Editor">
          <div className="cl-editor-head">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="cl-tab" style={{ background: info.color, color: info.onColor, display: 'inline-flex', alignItems: 'center', fontSize: 9, minHeight: 36 }}>
                {info.label}
              </span>
              <span className="px cl-muted" style={{ fontSize: 8 }}>{info.fileName}</span>
            </div>
            {!confirmReset && (
              <button ref={resetBtnRef} type="button" className="cl-small-btn" disabled={busy !== null} onClick={() => setConfirmReset(true)}>
                REINICIAR CÓDIGO
              </button>
            )}
          </div>
          {confirmReset && (
            <div className="cl-confirm" role="alertdialog" aria-label="Confirmar reinicio">
              <span>¿Borrar tu código y volver al inicial?</span>
              <button
                ref={confirmYesRef}
                type="button"
                className="cl-small-btn cl-small-btn--danger"
                onClick={() => {
                  clearDraft(levelId, lang);
                  setCode(problem.starter[lang]);
                  setConfirmReset(false);
                }}
              >
                SÍ, REINICIAR
              </button>
              <button
                type="button"
                className="cl-small-btn"
                onClick={() => {
                  setConfirmReset(false);
                  requestAnimationFrame(() => resetBtnRef.current?.focus());
                }}
              >
                CANCELAR
              </button>
            </div>
          )}
          <CodeEditor language={lang} value={code} onChange={setCode} label={`Tu código en ${info.label}`} />
          <p className="cl-muted" style={{ margin: 0, fontSize: 15 }}>Tab indenta. Para salir del editor con teclado: Esc y luego Tab.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="px" style={{ fontSize: 9 }} id="cl-tests-label">CASOS DE PRUEBA</span>
            <ul className="cl-tests" aria-labelledby="cl-tests-label">
              {testCells.map((c) => (
                <li key={c.id} className="cl-test" data-state={c.state} aria-label={`${c.label}: ${c.spoken}`}>
                  <span className="cl-test__icon" aria-hidden="true">{c.icon}</span>
                  <span className="cl-test__label" aria-hidden="true">{c.label}</span>
                  {c.verdict && c.verdict !== 'AC' && (
                    <span className="cl-test__label" aria-hidden="true">{c.verdict}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="cl-row">
        <div className="box cl-log" aria-busy={busy !== null}>
          <span role="status" aria-live="polite" className={error ? 'cl-log--error' : undefined}>
            {error ? <><strong className="px" style={{ fontSize: 11 }}>ERROR · </strong>{log}</> : log}
          </span>
          {won && (
            <button
              ref={continueRef}
              type="button"
              className="cl-act cl-act--gold"
              style={{ alignSelf: 'flex-end' }}
              onClick={() => victory && go({ name: 'victory', levelId, info: victory })}
            >
              CONTINUAR <span className="blink" style={{ color: 'var(--red)' }} aria-hidden="true">▼</span>
            </button>
          )}
        </div>
        <nav className="box cl-actions" aria-label="Acciones">
          <button ref={runBtnRef} type="button" data-sfx="run" className="cl-act" disabled={busy !== null || won} onClick={() => void run('samples')}>
            {busy === 'samples' ? 'EJECUTANDO…' : 'EJECUTAR'}
          </button>
          <button ref={submitBtnRef} type="button" data-sfx="run" className="cl-act cl-act--green" disabled={busy !== null || won} onClick={() => void run('submit')}>
            {busy === 'submit' ? 'ENVIANDO…' : 'ENVIAR'}
          </button>
          <button
            type="button"
            className="cl-act cl-act--blue"
            data-sfx="hint"
            disabled={busy !== null || won || hintsUsed >= hintsAvailable}
            onClick={() => setHintsUsed((h) => Math.min(h + 1, hintsAvailable))}
          >
            PISTA
          </button>
          <button
            type="button"
            className="cl-act cl-act--gray"
            onClick={() => {
              abortRef.current?.abort();
              go({ name: 'map' });
            }}
          >
            HUIR
          </button>
        </nav>
      </div>

      {lastRun && (lastRun.verdict === 'CE' || detailResults.length > 0) && (
        <section className="box cl-results" aria-labelledby="cl-results-title">
          <h2 id="cl-results-title" className="cl-heading" style={{ fontSize: 11 }}>
            {lastRun.verdict === 'CE' ? 'MENSAJE DEL COMPILADOR' : lastMode === 'submit' ? 'EJEMPLOS DEL ENVÍO' : 'RESULTADO DE LOS EJEMPLOS'}
          </h2>
          {lastRun.verdict === 'CE' ? (
            <pre className="cl-pre cl-compile" tabIndex={0}>{lastRun.compileOutput || 'El compilador no dio detalles.'}</pre>
          ) : (
            detailResults.map((r, k) => (
              <div key={r.id} className="cl-result">
                <div className="cl-result__head">
                  <strong className="px" style={{ fontSize: 10 }}>EJEMPLO {k + 1}</strong>
                  <span className={`cl-verdict ${r.verdict === 'AC' ? 'cl-verdict--ok' : 'cl-verdict--ko'}`}>
                    {r.verdict === 'AC' ? '✓' : '✗'} {VERDICT_LABEL[r.verdict]} · {r.timeMs} ms
                  </span>
                </div>
                <div>
                  <span className="px" style={{ fontSize: 8 }}>ENTRADA</span>
                  <pre>{(r.input ?? '').trim() === '' ? '(sin entrada)' : r.input}</pre>
                </div>
                <div>
                  <span className="px" style={{ fontSize: 8 }}>ESPERADO</span>
                  <pre>{r.expected}</pre>
                </div>
                <div>
                  <span className="px" style={{ fontSize: 8 }}>TU SALIDA</span>
                  <pre>{r.output ?? ''}</pre>
                </div>
                {r.stderr && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span className="px" style={{ fontSize: 8 }}>ERRORES</span>
                    <pre>{r.stderr}</pre>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}
    </main>
  );
}
