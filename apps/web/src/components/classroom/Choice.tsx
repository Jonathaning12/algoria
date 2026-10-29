import type { ReactNode, Ref } from 'react';
import { ArrowRight } from './common';
import type { SfxId } from '../../audio/engine';

/** Opción de diálogo con cursor ▸ que aparece al enfocarla (teclado) o al pasar el ratón. */
export function Choice({
  children,
  onClick,
  muted = false,
  sfx = muted ? 'cancel' : 'confirm',
  buttonRef,
}: {
  children: ReactNode;
  onClick: () => void;
  muted?: boolean;
  sfx?: SfxId;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      data-sfx={sfx}
      className={`cl-choice${muted ? ' cl-choice--muted' : ''}`}
      onClick={onClick}
    >
      <span className="cl-choice__cursor">
        <ArrowRight color="var(--red)" />
      </span>
      {children}
    </button>
  );
}
