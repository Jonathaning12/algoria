import { LANGUAGES } from '@algoria/shared';
import type { Stage } from '@algoria/shared';
import { allLevels, getLevel, stages } from '@algoria/content';
import { playerLevel, useGame, useLanguage, type Progress } from '../state/game';
import { ROUTE, type RouteInfo } from '../game/world';
import { LANGUAGE_INFO } from '../lib/languages';
import { Sprite } from '../components/Sprite';
import { Bar } from '../components/ui';
import { ConfirmReset } from '../components/world/ConfirmReset';
import '../styles/world.css';

interface RouteEntry extends RouteInfo {
  pct: number;
  status: string;
  /** Etapa con contenido (si no, "PRÓXIMAMENTE"). */
  real: boolean;
  current: boolean;
  badgeEarned: boolean;
}

function gymDone(stage: Stage, completed: string[]): boolean {
  const gym = stage.levels.find((l) => l.gym);
  return !!gym && completed.includes(gym.id);
}

/** Ruta de Algoria: etapas reales con su progreso y el resto como "PRÓXIMAMENTE". */
function buildRoute(progress: Progress, currentId: string): RouteEntry[] {
  const fromContent = (s: Stage, i: number): RouteEntry => {
    const done = s.levels.filter((l) => progress.completed.includes(l.id)).length;
    const complete = s.levels.length > 0 && done === s.levels.length;
    const prev = stages[i - 1];
    const open = !prev || gymDone(prev, progress.completed);
    const status = complete
      ? 'COMPLETADA'
      : s.id === currentId || done > 0
        ? 'EN CURSO'
        : open
          ? 'DISPONIBLE'
          : 'BLOQUEADA';
    return {
      n: s.number,
      name: s.name,
      range: s.range,
      topics: s.summary,
      color: s.color,
      badge: s.badge,
      pct: s.levels.length ? done / s.levels.length : 0,
      status,
      real: true,
      current: s.id === currentId,
      badgeEarned: gymDone(s, progress.completed),
    };
  };
  const real = stages.map(fromContent);
  const soon = ROUTE.filter((r) => !stages.some((s) => s.number === r.n)).map((r) => ({
    ...r,
    pct: 0,
    status: 'PRÓXIMAMENTE',
    real: false,
    current: false,
    badgeEarned: false,
  }));
  return [...real, ...soon].sort((a, b) => a.n - b.n);
}

const LOCKED_COMPANION_TEXT = [
  'Se une a ti al terminar el Pueblo Semilla.',
  'Aparece en el Puerto Estructura. Lo encontrarás si exploras.',
];

export function ProfileScreen() {
  const { stage, progress, go, resetProgress } = useGame();
  const lang = useLanguage();
  const info = LANGUAGE_INFO[lang];

  const stageDone = stage.levels.filter((l) => progress.completed.includes(l.id)).length;
  const stagePct = stage.levels.length ? stageDone / stage.levels.length : 0;
  const route = buildRoute(progress, stage.id);

  const tips = progress.tips
    .map((id) => getLevel(id))
    .filter((l): l is NonNullable<typeof l> => !!l)
    .sort((a, b) => a.number - b.number);

  const others = LANGUAGES.filter((l) => l !== lang);

  return (
    <div className="profile">
      <header className="profile__header">
        <div className="profile__header-inner">
          <span className="px profile__brand">ALGORIA</span>
          <nav aria-label="Secciones" className="profile__nav">
            <button type="button" className="navlink" onClick={() => go({ name: 'map' })}>
              MAPA
            </button>
            <a href="#perfil" className="navlink" aria-current="page">
              PERFIL
            </a>
            <a href="#libreta" className="navlink">
              LIBRETA
            </a>
          </nav>
        </div>
      </header>

      <main className="profile__main" id="perfil">
        <h1 className="sr-only">Perfil de {progress.playerName}</h1>
        <div className="profile__row">
          <section className="box pcard" aria-label="Tarjeta de jugador">
            <div className="pcard__head" style={{ background: info.color, color: info.onColor }}>
              <span className="px">TARJETA DE JUGADOR</span>
              <span className="px" style={{ fontSize: 9 }}>
                {info.label}
              </span>
            </div>
            <div className="pcard__body">
              <div className="pcard__avatar">
                <Sprite id="hero_down" size={128} />
              </div>
              <dl>
                <div>
                  <dt className="px">NOMBRE</dt>
                  <dd>{progress.playerName}</dd>
                </div>
                <div>
                  <dt className="px">NIVEL</dt>
                  <dd>{playerLevel(progress)}</dd>
                </div>
                <div>
                  <dt className="px">XP</dt>
                  <dd>{progress.xp}</dd>
                </div>
                <div>
                  <dt className="px">RETOS</dt>
                  <dd>
                    {progress.completed.length} {progress.completed.length === 1 ? 'resuelto' : 'resueltos'}
                  </dd>
                </div>
                <div>
                  <dt className="px">TIPS</dt>
                  <dd>
                    {progress.tips.length} / {allLevels.length}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="pcard__badges">
              <span className="px" style={{ fontSize: 9 }} id="badges-title">
                INSIGNIAS
              </span>
              <ul className="badges" aria-labelledby="badges-title">
                {route.map((s) => {
                  const earned = s.badgeEarned;
                  return (
                    <li
                      key={s.n}
                      className={`px badge${earned ? '' : ' badge--off'}`}
                      style={{ background: s.color }}
                      title={`Insignia ${s.badge}${earned ? '' : ' (bloqueada)'}`}
                    >
                      <span aria-hidden="true">{earned ? s.badge.charAt(0) : '?'}</span>
                      <span className="sr-only">
                        Insignia {s.badge}: {earned ? 'conseguida' : 'sin conseguir'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section className="box companions" aria-labelledby="companions-title">
            <h2 className="px" id="companions-title" style={{ margin: 0, fontSize: 11 }}>
              COMPAÑEROS
            </h2>
            <div className="companion" style={{ background: info.tint }}>
              <Sprite id={info.sprite} size={64} />
              <div className="companion__info">
                <div className="companion__row">
                  <strong className="px" style={{ fontSize: 11 }}>
                    {info.companion}
                  </strong>
                  <span className="px" style={{ fontSize: 9 }}>
                    {info.label} · Nv {playerLevel(progress)}
                  </span>
                </div>
                <Bar value={stagePct} color={info.color} label={`Progreso de ${info.companion} en la etapa`} />
                <span>Compañero activo</span>
              </div>
            </div>
            {others.map((l, i) => (
              <div key={l} className="companion companion--locked">
                <div className="companion__silhouette">
                  <Sprite id={LANGUAGE_INFO[l].sprite} size={64} />
                </div>
                <div className="companion__info">
                  <strong className="px" style={{ fontSize: 11 }}>
                    ???
                    <span className="sr-only"> (compañero bloqueado)</span>
                  </strong>
                  <span>{LOCKED_COMPANION_TEXT[i]}</span>
                </div>
              </div>
            ))}
          </section>
        </div>

        <section aria-labelledby="route-title" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="section-head">
            <h2 className="px" id="route-title">
              RUTA DE ALGORIA
            </h2>
            <span>7 etapas · 10 niveles cada una · un gimnasio al final de cada etapa</span>
          </div>
          <ol className="route">
            {route.map((s) => (
              <li
                key={s.n}
                className={`box${s.real ? '' : ' is-soon'}`}
                aria-current={s.current ? 'location' : undefined}
              >
                <div className="route__head" style={{ background: s.color }}>
                  <span className="px route__chip">
                    ETAPA {s.n}
                    {s.current ? ' · ESTÁS AQUÍ' : ''}
                  </span>
                  <span className="px route__chip">{s.range}</span>
                </div>
                <div className="route__body">
                  <strong className="px route__name">{s.name}</strong>
                  <span className="route__topics">{s.topics}</span>
                  <Bar value={s.pct} color="var(--grass)" label={`Progreso en ${s.name.toLowerCase()}`} />
                  <div className="route__foot">
                    <span className="px">{s.status}</span>
                    <span className="px route__badge">INSIGNIA {s.badge}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="box notebook" id="libreta" aria-labelledby="notebook-title">
          <div className="section-head">
            <h2 className="px" id="notebook-title">
              LIBRETA DE TIPS
            </h2>
            <span>
              Tips de {info.companion} en {info.label}
            </span>
          </div>
          {tips.length === 0 ? (
            <p className="notebook__empty">
              Aún no tienes tips. Vence a un maestro del pueblo y {info.companion} apuntará aquí su primer consejo.
            </p>
          ) : (
            <ul>
              {tips.map((l) => (
                <li key={l.id} className="tip">
                  <span className="px tip__meta">
                    NV {l.number} · {l.npc.name}
                  </span>
                  <strong className="px">{l.rewardTip.title}</strong>
                  <p>{l.rewardTip.text[lang]}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="profile__actions">
          <button type="button" className="btn btn--gold" onClick={() => go({ name: 'map' })}>
            VOLVER AL MAPA
          </button>
          <ConfirmReset
            label="BORRAR PARTIDA"
            question="¿Borrar la partida? Perderás niveles, XP y tips. No se puede deshacer."
            confirmLabel="SÍ, BORRAR"
            onConfirm={resetProgress}
          />
        </div>
      </main>
    </div>
  );
}
