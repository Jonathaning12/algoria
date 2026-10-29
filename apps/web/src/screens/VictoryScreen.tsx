// Pantalla de victoria tras ganar el duelo (design/project/Victory.dc.html).
import { useEffect, useRef, useState } from 'react';
import { allLevels, getLevel, getStageOfLevel } from '@algoria/content';
import { playerLevel, useGame, useLanguage, type VictoryInfo } from '../state/game';
import { LANGUAGE_INFO } from '../lib/languages';
import { Sprite } from '../components/Sprite';
import { Bar } from '../components/ui';
import { audio } from '../audio/engine';
import { onArrowNav } from '../lib/arrowNav';
import { BadgeIcon, LevelMissing, RichText, Star } from '../components/classroom/common';
import { DIFFICULTY_LABEL, calcStars, formatTime } from '../components/classroom/battleLogic';
import '../styles/classroom.css';

const CONFETTI: [string, number, string][] = [
  ['12%', 60, 'var(--gold)'],
  ['22%', 140, 'var(--red)'],
  ['70%', 50, 'var(--water)'],
  ['84%', 150, 'var(--grass)'],
  ['50%', 24, 'var(--bug)'],
  ['92%', 300, 'var(--gold)'],
  ['5%', 320, 'var(--water)'],
];

export function VictoryScreen({ levelId, info }: { levelId: string; info: VictoryInfo }) {
  const level = getLevel(levelId);
  const { go, progress } = useGame();
  const lang = useLanguage();
  const [line, setLine] = useState(0);
  const mapRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const outroLen = level ? Math.max(1, level.outro.length) : 1;
  const atEnd = line >= outroLen - 1;

  // Fanfarria de victoria (la música de fondo está en pausa en esta pantalla).
  useEffect(() => {
    const t = setTimeout(() => audio.sfx('levelUp'), 250);
    return () => clearTimeout(t);
  }, []);

  // Foco: primero el diálogo de despedida; al terminarlo, VOLVER AL MAPA.
  useEffect(() => {
    (atEnd ? mapRef : nextRef).current?.focus();
  }, [atEnd, line]);

  if (!level) return <LevelMissing levelId={levelId} />;

  const comp = LANGUAGE_INFO[lang];
  const stage = getStageOfLevel(levelId);
  const stageLevels = stage?.levels ?? [];
  const beaten = stageLevels.filter((l) => progress.completed.includes(l.id)).length;
  const next = allLevels.find((l) => l.number === level.number + 1);
  const stars = calcStars(info.attempts, info.hintsUsed);
  const newWin = info.xpGained > 0;
  const outro = level.outro.length > 0 ? level.outro : [{ speaker: level.npc.name, text: '¡Bien hecho!' }];
  const current = outro[Math.min(line, outro.length - 1)]!;
  const lastLine = line >= outro.length - 1;
  const badge = stage?.badge ?? 'SEMILLA';

  return (
    <main className="cl-victory">
      <div className="cl-confetti" aria-hidden="true">
        {CONFETTI.map(([left, top, bg], k) => (
          <span key={k} style={{ left, top, background: bg }} />
        ))}
      </div>

      <div className="cl-victory__inner">
        <h1 className="cl-victory__title">¡VICTORIA!</h1>

        <div className="cl-heroes">
          <div className="bob"><Sprite id="hero_down" size={128} label="Tú" /></div>
          <div className="bob"><Sprite id={comp.sprite} size={88} label={comp.companion} /></div>
        </div>

        {level.gym && (
          <div className="box cl-badge-won" role="status" style={{ background: 'var(--grass)' }}>
            <BadgeIcon color={stage?.color ?? '#6cc04a'} size={56} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <strong className="px" style={{ fontSize: 13 }}>¡INSIGNIA {badge} CONSEGUIDA!</strong>
              <span style={{ fontSize: 19 }}>Has vencido al Gimnasio de {stage?.name ?? 'la etapa'}. Se abre un nuevo camino.</span>
            </div>
          </div>
        )}

        <div className="cl-panels">
          <section className="box cl-panel" aria-labelledby="cl-rewards">
            <h2 id="cl-rewards" className="cl-heading" style={{ fontSize: 11 }}>RECOMPENSAS</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 22 }}>Experiencia</span>
              <strong className="px" style={{ fontSize: 16, color: 'var(--python-dark)' }}>+{info.xpGained} XP</strong>
            </div>
            <Bar value={newWin ? 1 : 0} color="var(--python)" label="Experiencia ganada en este duelo" height={14} />
            {newWin ? (
              <div className="cl-levelup">
                <span className="px blink" style={{ fontSize: 11 }} aria-hidden="true">▲</span>
                <strong className="px" style={{ fontSize: 12 }}>¡SUBES A Nv {playerLevel(progress)}!</strong>
              </div>
            ) : (
              <span style={{ fontSize: 18 }} className="cl-muted">Ya habías vencido a {level.npc.name}: esta revancha no da XP.</span>
            )}
            {next && (
              <span style={{ fontSize: 18 }} className="cl-muted">
                Desbloqueado: {next.topic} · {next.npc.name} te espera.
              </span>
            )}
          </section>

          <section className="box cl-panel" aria-labelledby="cl-duel">
            <h2 id="cl-duel" className="cl-heading" style={{ fontSize: 11 }}>TU DUELO</h2>
            <dl className="cl-stats">
              <div><dt>TIEMPO</dt><dd>{formatTime(info.timeMs)}</dd></div>
              <div><dt>INTENTOS</dt><dd>{info.attempts}</dd></div>
              <div><dt>PISTAS</dt><dd>{info.hintsUsed}</dd></div>
              <div><dt>DIFICULTAD</dt><dd>{DIFFICULTY_LABEL[level.problem.difficulty]}</dd></div>
            </dl>
            <div className="cl-stars" role="img" aria-label={`${stars} de 3 estrellas`}>
              {[1, 2, 3].map((n) => <Star key={n} on={n <= stars} />)}
            </div>
          </section>

          <section className="box cl-panel" aria-labelledby="cl-notebook">
            <h2 id="cl-notebook" className="cl-heading" style={{ fontSize: 11 }}>NUEVO EN TU LIBRETA</h2>
            <div className="cl-note">
              <Sprite id={comp.sprite} size={40} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <strong className="px" style={{ fontSize: 9 }}>TIP #{level.number} · {level.rewardTip.title.toUpperCase()}</strong>
                <span style={{ fontSize: 18, lineHeight: 1.3 }}><RichText text={level.rewardTip.text[lang]} /></span>
              </div>
            </div>
            {stageLevels.length > 0 && (
              <>
                <span style={{ fontSize: 18 }} className="cl-muted">
                  Insignia {badge.charAt(0) + badge.slice(1).toLowerCase()}: {beaten} / {stageLevels.length} maestros vencidos
                </span>
                <div className="cl-badge-row" aria-hidden="true">
                  {stageLevels.map((l) => (
                    <span key={l.id} data-on={progress.completed.includes(l.id)} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <div className="cl-outro">
          <Sprite id={level.npc.sprite} size={80} label={level.npc.name} />
          <div className="box">
            <strong className="px" style={{ fontSize: 10, color: 'var(--red-dark)' }}>{current.speaker}</strong>
            <p style={{ margin: 0 }} aria-live="polite"><RichText text={current.text} /></p>
            {!lastLine && (
              <div className="cl-outro__foot">
                <span className="px cl-muted" style={{ fontSize: 9 }}>{line + 1} / {outro.length}</span>
                <button ref={nextRef} type="button" data-sfx="talk" className="cl-next" onClick={() => setLine((n) => n + 1)}>
                  SIGUIENTE <span className="blink cl-arrow" aria-hidden="true">▼</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }} onKeyDown={onArrowNav}>
          <button ref={mapRef} type="button" className="cl-cta" style={{ boxShadow: '0 5px 0 var(--red-dark)', fontSize: 12 }} onClick={() => go({ name: 'map' })}>
            VOLVER AL MAPA
          </button>
          <button type="button" className="cl-cta" style={{ background: 'var(--paper)', fontSize: 12 }} onClick={() => go({ name: 'profile' })}>
            VER MI LIBRETA
          </button>
        </div>
      </div>
    </main>
  );
}
