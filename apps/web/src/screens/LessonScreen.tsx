// Mini lección antes del duelo (design/project/Lesson.dc.html).
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { LANGUAGES, type Language } from '@algoria/shared';
import { getLevel } from '@algoria/content';
import { useGame, useLanguage } from '../state/game';
import { LANGUAGE_INFO } from '../lib/languages';
import { Sprite } from '../components/Sprite';
import { audio } from '../audio/engine';
import { onArrowNav } from '../lib/arrowNav';
import { ArrowRight, LevelMissing, RichText } from '../components/classroom/common';
import '../styles/classroom.css';

const STEPS = ['CONCEPTO', 'EJEMPLO', 'MINI RETO'] as const;

export function LessonScreen({ levelId }: { levelId: string }) {
  const level = getLevel(levelId);
  const { go } = useGame();
  const playerLang = useLanguage();
  const order: Language[] = [playerLang, ...LANGUAGES.filter((l) => l !== playerLang)];
  const [tab, setTab] = useState<Language>(playerLang);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const sectionRefs = [useRef<HTMLElement>(null), useRef<HTMLElement>(null), useRef<HTMLElement>(null)];
  const tabRefs = useRef<Partial<Record<Language, HTMLButtonElement | null>>>({});

  // Paso actual según la sección visible.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = sectionRefs.findIndex((r) => r.current === e.target);
          if (idx >= 0) setStep((s) => Math.max(s, idx));
        }
      },
      { threshold: 0.6 },
    );
    sectionRefs.forEach((r) => r.current && obs.observe(r.current));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  if (!level) return <LevelMissing levelId={levelId} />;

  const { lesson, npc } = level;
  const comp = LANGUAGE_INFO[playerLang];
  const quiz = lesson.quiz;
  const correct = picked === quiz.answer;

  const goToStep = (idx: number) => {
    setStep((s) => Math.max(s, idx));
    const el = sectionRefs[idx]?.current;
    el?.scrollIntoView({ behavior: typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    el?.focus({ preventScroll: true });
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = order.indexOf(tab);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (idx + 1) % order.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + order.length) % order.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = order.length - 1;
    if (next === null) return;
    e.preventDefault();
    const l = order[next]!;
    setTab(l);
    tabRefs.current[l]?.focus();
  };

  const answer = (i: number) => {
    setPicked(i);
    setStep(2);
    audio.sfx(i === quiz.answer ? 'quizRight' : 'quizWrong');
    if (i !== quiz.answer) setWrong((w) => (w.includes(i) ? w : [...w, i]));
  };

  const stepState = (idx: number) => (correct && idx === 2 ? 'done' : idx < step ? 'done' : idx === step ? 'current' : 'todo');

  return (
    <div className="cl-lesson">
      <header className="cl-lesson__header">
        <div className="cl-lesson__bar">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <button type="button" className="cl-back" title={`Volver a hablar con ${npc.name}`} onClick={() => go({ name: 'dialog', levelId })}>
              <svg width="12" height="12" viewBox="0 0 6 6" shapeRendering="crispEdges" aria-hidden="true">
                <path fill="currentColor" d="M3 0h1v6h-1v-1h-1v-1h-1v-2h1v-1h1z" />
              </svg>
              VOLVER
            </button>
            <span className="px" style={{ fontSize: 12 }}>
              LECCIÓN · Nv {level.number} · {level.topic.toUpperCase()}
            </span>
          </div>
          <nav aria-label={`Progreso de la lección: paso ${step + 1} de 3`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="px" style={{ fontSize: 9, color: 'var(--gray)', marginRight: 6 }} aria-hidden="true">
              PASO {step + 1}/3
            </span>
            <ol className="cl-steps">
              {STEPS.map((s, idx) => (
                <li key={s}>
                  <button
                    type="button"
                    className="cl-step"
                    data-state={stepState(idx)}
                    aria-label={`Ir a ${s.toLowerCase()}`}
                    aria-current={idx === step ? 'step' : undefined}
                    onClick={() => goToStep(idx)}
                  >
                    <span />
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      <main className="cl-lesson__main">
        <aside className="cl-lesson__aside" ref={sectionRefs[0]} tabIndex={-1} aria-label="Concepto">
          <div className="cl-say">
            <Sprite id={npc.sprite} size={112} label={npc.name} />
            <div className="box">
              <RichText text={level.greeting} />
            </div>
          </div>
          {lesson.goals.length > 0 && (
            <div className="box cl-card cl-card--sm">
              <h2 className="cl-heading" style={{ fontSize: 10 }}>LO QUE APRENDERÁS</h2>
              <ul className="cl-goals">
                {lesson.goals.map((g) => (
                  <li key={g}><RichText text={g} /></li>
                ))}
              </ul>
            </div>
          )}
          <div className="box cl-tip">
            <div className="cl-portrait" style={{ background: comp.tint }}>
              <Sprite id={comp.sprite} size={48} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <strong className="px" style={{ fontSize: 9, color: 'var(--red-dark)' }}>TIP DE {comp.companion}</strong>
              <span style={{ fontSize: 19, lineHeight: 1.3 }}><RichText text={lesson.tips[playerLang]} /></span>
            </div>
          </div>
        </aside>

        <div className="cl-lesson__section">
          <section className="box cl-card" ref={sectionRefs[1]} tabIndex={-1} aria-labelledby="cl-concept">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <h1 id="cl-concept" className="cl-heading" style={{ fontSize: 16 }}>{lesson.concept}</h1>
              <div role="tablist" aria-label="Lenguaje del ejemplo" className="cl-tabs" onKeyDown={onTabKey}>
                {order.map((l) => {
                  const info = LANGUAGE_INFO[l];
                  const on = l === tab;
                  return (
                    <button
                      key={l}
                      ref={(el) => { tabRefs.current[l] = el; }}
                      type="button"
                      role="tab"
                      id={`cl-tab-${l}`}
                      aria-selected={on}
                      aria-controls="cl-tabpanel"
                      tabIndex={on ? 0 : -1}
                      className="cl-tab"
                      style={on ? { background: info.color, color: info.onColor } : undefined}
                      onClick={() => setTab(l)}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 21, lineHeight: 1.35 }}><RichText text={lesson.explanation} /></p>
            <div role="tabpanel" id="cl-tabpanel" aria-labelledby={`cl-tab-${tab}`}>
              <pre className="cl-pre" tabIndex={0} aria-label={`Ejemplo en ${LANGUAGE_INFO[tab].label}`}>
                <code>{lesson.code[tab]}</code>
              </pre>
            </div>
            {lesson.examples.length > 0 && (
              <div className="cl-examples">
                {lesson.examples.map((ex, k) => (
                  <div key={k} className="cl-example">
                    <span className="px" style={{ fontSize: 9 }}>ENTRADA</span>
                    <pre>{ex.input.trim() === '' ? '(sin entrada)' : ex.input}</pre>
                    <span className="px" style={{ fontSize: 9 }}>SALIDA</span>
                    <pre>{ex.output}</pre>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="box cl-card" ref={sectionRefs[2]} tabIndex={-1} aria-labelledby="cl-quiz">
            <h2 id="cl-quiz" className="cl-heading" style={{ fontSize: 13 }}>MINI RETO</h2>
            <p style={{ margin: 0, fontSize: 21, lineHeight: 1.35 }}><RichText text={quiz.question} /></p>
            {quiz.code[tab] && (
              <pre className="cl-pre" tabIndex={0} aria-label={`Código del reto en ${LANGUAGE_INFO[tab].label}`}>
                <code>{quiz.code[tab]}</code>
              </pre>
            )}
            <div role="group" aria-label="Respuestas (flechas o W A S D para moverte)" className="cl-answers" onKeyDown={onArrowNav}>
              {quiz.options.map((opt, k) => {
                const state = picked === k && k === quiz.answer ? 'right' : wrong.includes(k) ? 'wrong' : undefined;
                return (
                  <button
                    key={k}
                    type="button"
                    className="cl-answer"
                    data-sfx="none"
                    data-state={state}
                    aria-pressed={picked === k}
                    onClick={() => answer(k)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <div aria-live="polite">
              {picked !== null && (
                <div className={`cl-feedback ${correct ? 'cl-feedback--ok' : 'cl-feedback--ko'}`}>
                  <strong className="px" style={{ fontSize: 10 }}>{correct ? '¡CORRECTO!' : 'CASI…'}</strong>
                  <span style={{ fontSize: 19, lineHeight: 1.3 }}>
                    <RichText text={correct ? quiz.explanation : `${quiz.wrongHint} Prueba otra vez.`} />
                  </span>
                </div>
              )}
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <button type="button" className="cl-cta" onClick={() => go({ name: 'battle', levelId })}>
              ¡AL DUELO CON {npc.name}! <ArrowRight />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
