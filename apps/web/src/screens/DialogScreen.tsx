// Encuentro con el NPC del nivel (design/project/Dialog.dc.html).
import { useEffect, useRef, useState } from 'react';
import type { DialogueLine } from '@algoria/shared';
import { getLevel } from '@algoria/content';
import { useGame, useLanguage } from '../state/game';
import { LANGUAGE_INFO } from '../lib/languages';
import { Sprite } from '../components/Sprite';
import { LevelMissing, RichText, Tag } from '../components/classroom/common';
import { Choice } from '../components/classroom/Choice';
import { onArrowNav } from '../lib/arrowNav';
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../components/classroom/battleLogic';
import '../styles/classroom.css';

export function DialogScreen({ levelId }: { levelId: string }) {
  const level = getLevel(levelId);
  const { go, progress } = useGame();
  const lang = useLanguage();
  const [i, setI] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);

  const completed = progress.completed.includes(levelId);
  const lines: DialogueLine[] = !level
    ? []
    : completed
      ? [{ speaker: level.npc.name, text: `¡Hola de nuevo! Ya me ganaste una vez. ¿Quieres repasar la lección o volver a retarme?` }]
      : level.intro.length > 0
        ? level.intro
        : [{ speaker: level.npc.name, text: level.greeting }];
  const last = i >= lines.length - 1;

  useEffect(() => {
    (last ? firstChoiceRef : nextRef).current?.focus();
  }, [last, i]);

  if (!level) return <LevelMissing levelId={levelId} />;

  const comp = LANGUAGE_INFO[lang];
  const line = lines[Math.min(i, lines.length - 1)]!;
  const npc = level.npc;

  return (
    <main className="cl-dialog">
      <div className="cl-dialog__frame">
        <section className="cl-scene" aria-label={`Encuentro con ${npc.name}`}>
          <div aria-hidden="true">
            <span className="cl-cloud cl-cloud--a" />
            <span className="cl-cloud cl-cloud--b" />
            <div className="cl-ground" />
            <div className="cl-hedge" />
          </div>

          <div className="box cl-plate">
            <div className="cl-plate__row">
              <h1 className="cl-heading" style={{ fontSize: 14 }}>{npc.name}</h1>
              <span className="px" style={{ fontSize: 11 }}>Nv {level.number}</span>
            </div>
            <span style={{ fontSize: 18 }}>{npc.title}</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag dark>TEMA: {level.topic.toUpperCase()}</Tag>
              <Tag bg={DIFFICULTY_COLOR[level.problem.difficulty]}>{DIFFICULTY_LABEL[level.problem.difficulty]}</Tag>
              {level.gym && <Tag bg="var(--gold)">GIMNASIO</Tag>}
            </div>
          </div>

          <div className="cl-npc">
            <div className="bob">
              <Sprite id={npc.sprite} size={176} label={npc.name} />
            </div>
            <div className="cl-platform" aria-hidden="true" />
          </div>

          <div className="cl-party">
            <Sprite id="hero_up" size={192} label="Tú, de espaldas" />
            <div className="cl-party__comp">
              <Sprite id={comp.sprite} size={96} label={comp.companion} />
            </div>
          </div>

          <div className="box cl-whisper">
            <Sprite id={comp.sprite} size={36} />
            <span>
              {comp.companion.charAt(0) + comp.companion.slice(1).toLowerCase()} susurra: «<RichText text={level.lesson.tips[lang]} />»
            </span>
          </div>
        </section>

        <div className="cl-dialog__bottom">
          <div className="box cl-talk">
            <div className="cl-talk__head">
              <strong className="px" style={{ fontSize: 11, color: 'var(--red-dark)' }}>{line.speaker}</strong>
              <span className="px" style={{ fontSize: 9, color: 'var(--slate)' }} aria-label={`Línea ${i + 1} de ${lines.length}`}>
                {i + 1} / {lines.length}
              </span>
            </div>
            <p className="cl-talk__line" aria-live="polite">
              <RichText text={line.text} />
            </p>

            {!last && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button ref={nextRef} type="button" data-sfx="talk" className="cl-next" autoFocus onClick={() => setI((n) => Math.min(n + 1, lines.length - 1))}>
                  SIGUIENTE <span className="blink cl-arrow" aria-hidden="true">▼</span>
                </button>
              </div>
            )}

            {last && (
              <nav
                aria-label={`Responder a ${npc.name}. Usa las flechas o W A S D para elegir y Enter para confirmar.`}
                className="cl-choices"
                onKeyDown={onArrowNav}
              >
                {completed ? (
                  <>
                    <Choice buttonRef={firstChoiceRef} onClick={() => go({ name: 'battle', levelId })}>REPETIR DUELO</Choice>
                    <Choice onClick={() => go({ name: 'lesson', levelId })}>REPASAR LECCIÓN</Choice>
                    <Choice muted onClick={() => go({ name: 'map' })}>VOLVER</Choice>
                  </>
                ) : (
                  <>
                    <Choice buttonRef={firstChoiceRef} onClick={() => go({ name: 'lesson', levelId })}>¡ENSÉÑAME!</Choice>
                    <Choice onClick={() => go({ name: 'battle', levelId })}>YA LO SÉ: ¡AL DUELO!</Choice>
                    <Choice muted onClick={() => go({ name: 'map' })}>AHORA NO</Choice>
                  </>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
