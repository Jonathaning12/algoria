import { useEffect, useRef, useState } from 'react';

/** Botón que pide confirmación en línea antes de una acción destructiva. */
export function ConfirmReset({
  label,
  question,
  confirmLabel,
  onConfirm,
  buttonClass = 'btn btn--gray',
}: {
  label: string;
  question: string;
  confirmLabel: string;
  onConfirm: () => void;
  buttonClass?: string;
}) {
  const [asking, setAsking] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const wasAsking = useRef(false);

  useEffect(() => {
    if (asking) cancelRef.current?.focus();
    else if (wasAsking.current) openRef.current?.focus();
    wasAsking.current = asking;
  }, [asking]);

  if (!asking) {
    return (
      <button ref={openRef} type="button" className={buttonClass} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <div
      className="box w-confirm"
      role="alertdialog"
      aria-labelledby="w-confirm-q"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setAsking(false);
      }}
    >
      <p id="w-confirm-q" style={{ margin: 0, fontSize: 21 }}>
        {question}
      </p>
      <div className="w-confirm__actions">
        <button ref={cancelRef} type="button" className="btn" onClick={() => setAsking(false)}>
          CANCELAR
        </button>
        <button type="button" className="btn btn--red" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
