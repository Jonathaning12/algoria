// Panel lateral del mapa: jugador, misión actual y lista de niveles de la etapa.
import type { Level, Stage } from '@algoria/shared';
import { currentLevel, playerLevel, type Progress } from '../../state/game';
import { LANGUAGE_INFO } from '../../lib/languages';
import { levelStatus, missionElsewhere, stageTitle } from '../../game/world';
import { Sprite } from '../Sprite';
import { Bar, Kbd } from '../ui';

export function MapPanel({
  stage,
  stages = [stage],
  progress,
  levels,
  onProfile,
  onColiseo,
}: {
  stage: Stage;
  /** Todas las etapas con contenido (para indicar a dónde ir si la misión está en otra). */
  stages?: Stage[];
  progress: Progress;
  levels: Level[];
  onProfile: () => void;
  /** Si se pasa, muestra el botón del Coliseo (ya desbloqueado). */
  onColiseo?: () => void;
}) {
  const info = LANGUAGE_INFO[progress.language ?? 'python'];
  const totalXp = stage.levels.reduce((sum, l) => sum + (l.problem?.xp ?? 0), 0);
  const doneLevels = stage.levels.filter((l) => progress.completed.includes(l.id));
  const done = doneLevels.length;
  // XP de esta etapa (la barra es por etapa; el total está en el perfil).
  const stageXp = stages.length > 1 ? doneLevels.reduce((sum, l) => sum + (l.problem?.xp ?? 0), 0) : progress.xp;
  const mission = currentLevel(progress);
  const elsewhere = mission ? missionElsewhere(stages, stage, mission) : null;

  return (
    <aside className="mapside" aria-label="Estado del jugador">
      <div className="box player">
        <div className="player__avatar">
          <Sprite id="hero_down" size={56} />
        </div>
        <div className="player__info">
          <div className="player__row">
            <strong className="px">{progress.playerName}</strong>
            <span className="px">Nv {playerLevel(progress)}</span>
          </div>
          <Bar value={totalXp > 0 ? Math.min(1, stageXp / totalXp) : 0} color={info.color} label="Experiencia de la etapa" />
          <div className="player__row">
            <span>{totalXp > 0 ? `${stageXp}/${totalXp} XP` : `${progress.xp} XP`}</span>
            <span className="player__comp">
              <Sprite id={info.sprite} size={24} />
              {info.label}
            </span>
          </div>
        </div>
      </div>

      <div className="box mission">
        <span className="px mission__title">MISIÓN ACTUAL</span>
        <p>
          {elsewhere ? (
            <>{elsewhere}</>
          ) : mission ? (
            <>
              Haz clic en <strong>{mission.npc.name}</strong> en el mapa para empezar el nivel {mission.number}:{' '}
              <Kbd>{mission.topic}</Kbd>.
            </>
          ) : stage.levels.length === 0 ? (
            <>Explora {stageTitle(stage.name)}. Los maestros están llegando…</>
          ) : (
            <>¡Has completado {stageTitle(stage.name)}! La siguiente etapa llegará pronto.</>
          )}
        </p>
      </div>

      <div className="box levels">
        <div className="levels__head">
          <span className="px" style={{ fontSize: 10 }}>
            NIVELES {stage.range.replace(/^Nv\s*/, '')}
          </span>
          <span className="px" style={{ fontSize: 9, color: 'var(--slate)' }}>
            {done} / {stage.levels.length}
          </span>
        </div>
        {stage.levels.length === 0 ? (
          <p style={{ margin: 0, fontSize: 17, color: 'var(--slate)' }}>Los niveles se están preparando.</p>
        ) : (
          <ol>
            {stage.levels.map((l) => {
              const st = levelStatus(l, progress.completed, levels);
              const cls = [`is-${st}`, l.gym && st !== 'done' ? 'is-gym' : ''].join(' ');
              const badge = st === 'done' ? '✓' : l.gym ? 'G' : String(l.number);
              const state = st === 'done' ? 'HECHO' : st === 'current' ? 'ACTUAL' : l.gym ? 'JEFE' : '';
              const sr = st === 'done' ? 'completado' : st === 'current' ? 'nivel actual' : 'bloqueado';
              return (
                <li key={l.id} className={cls}>
                  <span className="px levels__badge" aria-hidden="true">
                    {badge}
                  </span>
                  <span className="levels__name">
                    <span className="sr-only">Nivel {l.number}: </span>
                    {l.title}
                    <span className="sr-only"> ({sr})</span>
                  </span>
                  <span className="px levels__state" aria-hidden="true">
                    {state}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <button type="button" className="btn btn--blue" onClick={onProfile}>
        PERFIL
      </button>
      {onColiseo && (
        <button type="button" className="btn btn--gold" data-sfx="confirm" onClick={onColiseo}>
          COLISEO
        </button>
      )}
    </aside>
  );
}
