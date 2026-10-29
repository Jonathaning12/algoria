import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { TILE_LEGEND, type SpriteId } from '@algoria/shared';
import { allLevels, stages } from '@algoria/content';
import { useGame } from '../state/game';
import { Sprite } from '../components/Sprite';
import { MapPanel } from '../components/world/MapPanel';
import { audio } from '../audio/engine';
import {
  INTRO_TEXT,
  KEY_DIRS,
  TALLGRASS_TEXT,
  examine,
  faceToward,
  groundOf,
  houses,
  mapSize,
  move as moveInWorld,
  npcStatus,
  startPosition,
  talkMessage,
  worldNpcs,
  type Dir,
  type Message,
  type NpcStatus,
  type PlayerPos,
  type Travel,
  type WorldNpc,
} from '../game/world';
import '../styles/world.css';

const T = 56;

const MARK: Record<NpcStatus, { text: string; label: string }> = {
  current: { text: '!', label: 'nuevo reto' },
  done: { text: '✓', label: 'completado' },
  locked: { text: '…', label: 'bloqueado' },
  extra: { text: '?', label: 'tiene un tip' },
};

/** Duración de cada paso del fundido al cambiar de etapa. */
const FADE_STEP_MS = 90;
/** Tiempo que el cartel con el nombre de la etapa sigue visible tras llegar. */
const BANNER_MS = 2600;

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function heroSprite(dir: Dir): SpriteId {
  return dir === 'up' ? 'hero_up' : dir === 'down' ? 'hero_down' : 'hero_side';
}

export function MapScreen() {
  const { stage, progress, go, savePosition, travelTo } = useGame();
  const npcs = useMemo(() => worldNpcs(stage), [stage]);
  const { cols, rows } = mapSize(stage.map);
  const ground = groundOf(stage);
  const [pos, setPos] = useState<PlayerPos>(() => startPosition(stage, npcs, progress.positions[stage.id]));
  const [msg, setMsg] = useState<Message | null>(() =>
    Object.keys(progress.positions).length > 0 ? null : { speaker: 'PROF. BIT', sprite: 'prof', text: INTRO_TEXT },
  );
  /** Oscuridad del fundido (0 = nada, 3 = negro). */
  const [fade, setFade] = useState(0);
  const [banner, setBanner] = useState<{ name: string; range: string } | null>(null);
  const traveling = useRef(false);
  const timers = useRef<number[]>([]);
  const worldRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const completed = progress.completed;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const tiles = useMemo(() => {
    const out: { x: number; y: number; id: SpriteId }[] = [];
    stage.map.rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const id = TILE_LEGEND[ch as keyof typeof TILE_LEGEND] as SpriteId | undefined;
        if (id && id !== 'grass') out.push({ x, y, id });
      });
    });
    return out;
  }, [stage]);
  const houseLabels = useMemo(() => houses(stage).filter((h) => h.kind !== 'house'), [stage]);

  const focusWorld = () => worldRef.current?.focus({ preventScroll: true });

  useEffect(() => {
    focusWorld();
  }, []);

  // En pantallas estrechas, mantener al jugador visible dentro del contenedor con scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const px = pos.x * T;
    const py = pos.y * T;
    const pad = T * 2;
    if (px - pad < el.scrollLeft) el.scrollLeft = px - pad;
    else if (px + T + pad > el.scrollLeft + el.clientWidth) el.scrollLeft = px + T + pad - el.clientWidth;
    if (py - pad < el.scrollTop) el.scrollTop = py - pad;
    else if (py + T + pad > el.scrollTop + el.clientHeight) el.scrollTop = py + T + pad - el.clientHeight;
  }, [pos.x, pos.y]);

  const update = (next: PlayerPos) => {
    setPos(next);
    savePosition(next);
  };

  /** Cambio de etapa: fundido a negro en 3 pasos, cambio, aclarado y cartel con el nombre. */
  const startTravel = (t: Travel) => {
    traveling.current = true;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    setMsg(null);
    const arrive = () => {
      travelTo(t.stage.id, t.pos);
      setPos(t.pos);
      setBanner({ name: t.stage.name, range: t.stage.range });
      audio.sfx('confirm');
    };
    const done = () => {
      traveling.current = false;
      focusWorld();
    };
    if (prefersReducedMotion()) {
      arrive();
      done();
      later(BANNER_MS, () => setBanner(null));
      return;
    }
    [1, 2, 3].forEach((level, i) => later(i * FADE_STEP_MS, () => setFade(level)));
    const dark = 3 * FADE_STEP_MS + 120;
    later(dark, arrive);
    [2, 1, 0].forEach((level, i) => later(dark + (i + 1) * FADE_STEP_MS, () => setFade(level)));
    const end = dark + 3 * FADE_STEP_MS;
    later(end, done);
    later(end + BANNER_MS, () => setBanner(null));
  };

  const move = (dir: Dir) => {
    if (traveling.current) return;
    const r = moveInWorld(stages, stage, npcs, pos, dir, completed);
    if (r.travel) {
      // El jugador pisa el camino y la pantalla se funde; la posición se guarda ya en la etapa nueva.
      setPos(r.pos);
      audio.sfx('step');
      startTravel(r.travel);
      return;
    }
    update(r.pos);
    if (r.moved) {
      audio.sfx('step');
      setMsg(r.tile === ',' ? { speaker: '¡CUIDADO!', sprite: 'bug', text: TALLGRASS_TEXT } : null);
    } else if (r.reason === 'exit' && stage.map.exit) {
      audio.sfx('locked');
      setMsg({ speaker: 'CAMINO BLOQUEADO', text: stage.map.exit.lockedText });
    } else if (r.reason === 'soon') {
      audio.sfx('locked');
      setMsg({ speaker: 'CAMINO', text: r.text });
    } else {
      audio.sfx('bump');
    }
  };

  const talkTo = (n: WorldNpc) => {
    if (traveling.current) return;
    update({ ...pos, dir: faceToward(pos, n.npc) });
    setMsg(talkMessage(n, completed, allLevels));
    audio.sfx(npcStatus(n, completed, allLevels) === 'locked' ? 'locked' : 'npc');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (traveling.current) {
      e.preventDefault();
      return;
    }
    const key = e.key.toLowerCase();
    const dir = KEY_DIRS[key];
    if (dir) {
      e.preventDefault();
      move(dir);
      return;
    }
    if (key === 'e') {
      e.preventDefault();
      const found = examine(stage, npcs, pos, completed, allLevels, stages);
      setMsg(found);
      audio.sfx(found ? 'talk' : 'bump');
    } else if (key === 'escape') {
      if (msg) audio.sfx('cancel');
      setMsg(null);
    } else if (key === 'enter' && e.target === e.currentTarget && msg?.levelId) {
      e.preventDefault();
      audio.sfx('confirm');
      go({ name: 'dialog', levelId: msg.levelId });
    }
  };

  return (
    <main className="mapscreen">
      <div className="mapscreen__inner">
        <section aria-label="Mapa" className="mapscreen__map">
          <div className="world-frame">
            <div className="world-scroll" ref={scrollRef}>
              <div
                ref={worldRef}
                className="world"
                tabIndex={0}
                role="application"
                aria-roledescription="mapa"
                aria-label={`Mapa del ${stage.name.toLowerCase()}. Usa W A S D o las flechas para moverte, E para examinar y Escape para cerrar mensajes.`}
                onKeyDown={onKeyDown}
                onClick={focusWorld}
                style={{
                  width: cols * T,
                  height: rows * T,
                  backgroundColor: ground.base,
                  backgroundImage: `radial-gradient(${ground.dot} 2px, transparent 2.5px)`,
                }}
              >
                {tiles.map((t) => (
                  <div key={`${t.x},${t.y}`} className="world__tile" style={{ left: t.x * T, top: t.y * T }}>
                    <Sprite id={t.id} size={T} />
                  </div>
                ))}
                {houseLabels.map((h) => (
                  <span
                    key={`${h.x},${h.y}`}
                    className="px world__label"
                    aria-hidden="true"
                    style={{
                      left: h.x * T + T / 2,
                      top: h.y * T + 2,
                      color: h.kind === 'gym' ? 'var(--gold)' : 'var(--paper)',
                    }}
                  >
                    {h.kind === 'gym' ? 'GIM' : 'LAB'}
                  </span>
                ))}

                {npcs.map((n) => {
                  const st = npcStatus(n, completed, allLevels);
                  const name = n.level ? `${n.npc.name}, nivel ${n.level.number}` : n.npc.name;
                  return (
                    <button
                      key={n.npc.id}
                      type="button"
                      data-sfx="none"
                      className={`npc${st === 'locked' ? ' npc--locked' : ''}`}
                      aria-label={`Hablar con ${name} (${MARK[st].label})`}
                      style={{ left: n.npc.x * T, top: n.npc.y * T }}
                      onClick={(e) => {
                        e.stopPropagation();
                        talkTo(n);
                        focusWorld();
                      }}
                    >
                      <Sprite id={n.npc.sprite} size={T} />
                      <span className="npc__ring" />
                      <span className={`px npc__mark npc__mark--${st}${st === 'current' ? ' bob' : ''}`} aria-hidden="true">
                        {MARK[st].text}
                      </span>
                    </button>
                  );
                })}

                <div className="hero" style={{ left: pos.x * T, top: pos.y * T }}>
                  <Sprite id={heroSprite(pos.dir)} flip={pos.dir === 'left'} size={T} />
                </div>
              </div>
            </div>

            <div className="box world-place">
              <span className="px">{stage.name}</span>
            </div>

            {fade > 0 && <div className={`world-fade world-fade--${fade}`} aria-hidden="true" />}
            {banner && (
              <div className="box world-banner" aria-hidden="true">
                <strong className="px world-banner__name">{banner.name}</strong>
                <span className="px world-banner__range">{banner.range}</span>
              </div>
            )}
            <div className="sr-only" role="status">
              {banner ? `Has llegado a ${banner.name.toLowerCase()}, ${banner.range}.` : ''}
            </div>

            {msg && (
              <div
                className="box world-msg"
                role="status"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setMsg(null);
                    focusWorld();
                  }
                }}
              >
                {msg.sprite && (
                  <div className="world-msg__portrait">
                    <Sprite id={msg.sprite} size={56} />
                  </div>
                )}
                <div className="world-msg__body">
                  {msg.speaker && <strong className="px world-msg__speaker">{msg.speaker}</strong>}
                  <span className="world-msg__text">{msg.text}</span>
                </div>
                {msg.levelId && (
                  <button
                    type="button"
                    className="btn btn--gold"
                    data-sfx="confirm"
                    style={{ flex: '0 0 auto', fontSize: 11 }}
                    onClick={() => go({ name: 'dialog', levelId: msg.levelId! })}
                  >
                    HABLAR ▸
                  </button>
                )}
                <button
                  type="button"
                  className="px world-msg__close"
                  data-sfx="cancel"
                  aria-label="Cerrar mensaje"
                  onClick={() => {
                    setMsg(null);
                    focusWorld();
                  }}
                >
                  <span className="blink" aria-hidden="true">
                    ▼
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="legend">
            <span>
              <span className="w-key">W</span>
              <span className="w-key">A</span>
              <span className="w-key">S</span>
              <span className="w-key">D</span> o flechas: moverte
            </span>
            <span>
              <span className="w-key">CLIC</span> en un personaje: hablar
            </span>
            <span>
              <span className="w-key">E</span> examinar lo que tienes enfrente
            </span>
            <span>
              <span className="w-key">ESC</span> cerrar
            </span>
          </div>
        </section>

        <MapPanel stage={stage} stages={stages} progress={progress} levels={allLevels} onProfile={() => go({ name: 'profile' })} />
      </div>
    </main>
  );
}
