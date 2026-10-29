// Panel lateral del mapa: jugador, misión actual y lista de niveles de la etapa.
import type { Level, Stage } from '@algoria/shared';
import { currentLevel, playerLevel, type Progress } from '../../state/game';
import { LANGUAGE_INFO } from '../../lib/languages';
import { levelStatus } from '../../game/world';
import { Sprite } from '../Sprite';
import { Bar, Kbd } from '../ui';

export function MapPanel({
  stage,
  progress,
  levels,
  onProfile,
}: {
  stage: Stage;
  progress: Progress;
  levels: Level[];
  onProfile: () => void;
}) {
  const info = LANGUAGE_INFO[progress.language ?? 'python'];
  const totalXp = stage.levels.reduce((sum, l) => sum + (l.problem?.xp ?? 0), 0);
  const done = stage.levels.filter((l) => progress.completed.includes(l.id)).length;
  const mission = currentLevel(progress);

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
          <Bar value={totalXp > 0 ? progress.xp / totalXp : 0} color={info.color} label="Experiencia de la etapa" />
          <div className="player__row">
            <span>{totalXp > 0 ? `${progress.xp}/${totalXp} XP` : `${progress.xp} XP`}</span>
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
          {mission ? (
            <>
              Haz clic en <strong>{mission.npc.name}</strong> en el mapa para empezar el nivel {mission.number}:{' '}
              <Kbd>{mission.topic}</Kbd>.
            </>
          ) : stage.levels.length === 0 ? (
            <>Explora el pueblo. Los maestros están llegando… Habla con el Prof. Bit mientras tanto.</>
          ) : (
            <>¡Has completado el {stage.name.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}! La siguiente etapa llegará pronto.</>
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
    </aside>
  );
}
