import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { LANGUAGES, type Language } from '@algoria/shared';
import { useGame } from '../state/game';
import { LANGUAGE_INFO } from '../lib/languages';
import { Sprite } from '../components/Sprite';
import { ConfirmReset } from '../components/world/ConfirmReset';
import { audio } from '../audio/engine';
import '../styles/world.css';

const STARS: [number, number, number, string][] = [
  [6, 8, 6, 'var(--paper)'],
  [18, 22, 4, 'var(--water)'],
  [34, 6, 4, 'var(--paper)'],
  [62, 12, 6, 'var(--gold)'],
  [78, 26, 4, 'var(--paper)'],
  [90, 9, 6, 'var(--water)'],
  [48, 30, 4, 'var(--paper)'],
];

function Speech({ children }: { children: ReactNode }) {
  return (
    <div className="title__welcome">
      <Sprite id="prof" size={96} />
      <div className="speech">
        <span className="px speech__name">PROF. BIT</span>
        <div className="box speech__body">
          {children}
          <span className="blink speech__more" aria-hidden="true">
            ▼
          </span>
        </div>
      </div>
    </div>
  );
}

export function TitleScreen() {
  const { progress, setLanguage, go, resetProgress } = useGame();
  const saved = progress.language;

  return (
    <main className="title">
      <div className="title__stars" aria-hidden="true">
        {STARS.map(([l, t, s, c], i) => (
          <span key={i} style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, background: c }} />
        ))}
      </div>
      <div className="title__inner">
        <div className="title__logo">
          <h1 className="px">ALGORIA</h1>
          <p className="px">CODE QUEST</p>
        </div>
        {saved ? (
          <ContinueGame
            language={saved}
            onContinue={() => go({ name: 'map' })}
            onReset={resetProgress}
          />
        ) : (
          <ChooseStarter
            onChoose={(lang) => {
              setLanguage(lang);
              go({ name: 'map' });
            }}
          />
        )}
      </div>
    </main>
  );
}

function ContinueGame({
  language,
  onContinue,
  onReset,
}: {
  language: Language;
  onContinue: () => void;
  onReset: () => void;
}) {
  const info = LANGUAGE_INFO[language];
  return (
    <>
      <Speech>
        ¡Hola de nuevo! {info.companion} te espera en el Pueblo Semilla. ¿Seguimos con la aventura?
      </Speech>
      <div className="starter__stage" style={{ padding: '12px 32px' }}>
        <div className="bob">
          <Sprite id={info.sprite} size={112} label={`${info.companion}, tu compañero de ${info.label}`} />
        </div>
      </div>
      <div className="title__actions">
        <button type="button" data-sfx="confirm" className="btn btn--gold btn--big" onClick={onContinue} autoFocus>
          CONTINUAR
        </button>
        <ConfirmReset
          label="NUEVA PARTIDA"
          question="¿Empezar de cero? Se borrará todo tu progreso: niveles, XP y tips."
          confirmLabel="SÍ, BORRAR"
          onConfirm={onReset}
        />
      </div>
    </>
  );
}

function ChooseStarter({ onChoose }: { onChoose: (lang: Language) => void }) {
  const [picked, setPicked] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const chosen = LANGUAGE_INFO[LANGUAGES[picked]!];

  const select = (i: number) => {
    const n = (i + LANGUAGES.length) % LANGUAGES.length;
    if (n !== picked) audio.sfx('select');
    setPicked(n);
    refs.current[n]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        select(picked + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        select(picked - 1);
        break;
      case 'Home':
        e.preventDefault();
        select(0);
        break;
      case 'End':
        e.preventDefault();
        select(LANGUAGES.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        audio.sfx('confirm');
        onChoose(chosen.id);
        break;
    }
  };

  return (
    <>
      <Speech>
        ¡Bienvenido a Algoria! Antes de partir, elige a tu compañero. Cada uno habla un lenguaje distinto. Podrás
        conocer a los demás más adelante.
      </Speech>
      <div role="radiogroup" aria-label="Elige tu lenguaje" className="starters" onKeyDown={onKeyDown}>
        {LANGUAGES.map((lang, i) => {
          const info = LANGUAGE_INFO[lang];
          const sel = i === picked;
          return (
            <button
              key={lang}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={sel}
              aria-label={`${info.companion}, ${info.label}. ${info.blurb} ${info.stat}`}
              tabIndex={sel ? 0 : -1}
              className="starter"
              data-sfx="none"
              onClick={() => select(i)}
              onDoubleClick={() => onChoose(lang)}
            >
              <div className="starter__card">
                <div className="starter__head">
                  <span className="px starter__tag" style={{ background: info.color, color: info.onColor }}>
                    {info.label}
                  </span>
                  {sel && (
                    <span className="px blink" style={{ fontSize: 14, color: 'var(--red)' }} aria-hidden="true">
                      ◀
                    </span>
                  )}
                </div>
                <div className="starter__stage">
                  <div className={sel ? 'bob' : undefined}>
                    <Sprite id={info.sprite} size={112} />
                  </div>
                </div>
                <strong className="px starter__name">{info.companion}</strong>
                <span className="starter__blurb">{info.blurb}</span>
                <span className="starter__stat">{info.stat}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="title__actions">
        <button type="button" data-sfx="confirm" className="btn btn--gold btn--big" onClick={() => onChoose(chosen.id)}>
          ¡ELIJO A {chosen.companion}!
        </button>
        <span className="px blink title__hint" aria-hidden="true">
          PULSA ENTER PARA CONFIRMAR
        </span>
      </div>
    </>
  );
}
