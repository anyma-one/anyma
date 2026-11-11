// The sign-up (Deep Cast) and Full Cast step as a modal over the reading (design: GateModal.md).
// Both take one email for the shared anyma list (src/signup.ts).
// - Deep Cast: opens as soon as the list accepts the address.
// - Full Cast: closed until payment is decided (owner, 11 Nov 2026). The email only joins the list
//   for news of its opening. On the dev server the closed-beta access code still unlocks it, so
//   Full Cast can be tested locally; production builds leave that field out.
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { copy, fill, ui } from "../data";
import { unlock } from "../fullcast";
import { track } from "../analytics";
import { signUp } from "../signup";

// No copy exists for the access-code field (dev only).
const ACCESS_CODE_LABEL = "[COPY NEEDED: label for the Full Cast access-code field]";

export type GateKind = "deep" | "full";

export function GateModal({
  kind,
  onClose,
  onSignedUp,
  onUnlocked,
}: {
  kind: GateKind;
  onClose: () => void;
  onSignedUp: () => void;
  onUnlocked: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const hid = useId();
  const fieldId = useId();
  const codeId = useId();
  const fineId = useId();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [onList, setOnList] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Focus moves into the dialog, stays there (Tab wraps), Escape closes, and focus returns to
  // whatever opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current!;
    const focusables = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
        (el) => !el.hasAttribute("disabled"),
      );
    (dialog.querySelector<HTMLElement>("input") ?? dialog.querySelector<HTMLElement>("h2"))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  // Once on the list, the form is gone: focus its message so keyboard users keep their place.
  useEffect(() => {
    if (onList) dialogRef.current?.querySelector<HTMLElement>("h2")?.focus();
  }, [onList]);

  const deep = kind === "deep";
  const su = ui.gate.signup;
  const wl = ui.gate.waitlist;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const outcome = await signUp(email, deep ? "deep-cast" : "full-cast");
    setBusy(false);
    if (!outcome.ok) {
      setError(outcome.message);
      return;
    }
    track("signup_completed");
    if (deep) onSignedUp();
    else setOnList(true);
  };

  const onUnlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError("");
    const outcome = await unlock(code);
    setBusy(false);
    if (outcome === "ok") {
      track("unlock_completed");
      onUnlocked();
    } else {
      setError(copy.errors.unlockFailed);
    }
  };

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gate-modal" role="dialog" aria-modal="true" aria-labelledby={hid} ref={dialogRef}>
        <button type="button" className="gate-modal__close" aria-label={ui.gate.close} onClick={onClose}>
          ×
        </button>
        <span className="eyebrow">{deep ? fill(ui.gate.signupEyebrow, { level: copy.levels[1].name }) : wl.eyebrow}</span>
        <h2 id={hid} className="gate-modal__heading" tabIndex={-1}>
          {deep ? su.heading : onList ? wl.doneHeading : wl.heading}
        </h2>

        {onList ? (
          <>
            <p>{wl.doneText}</p>
            <p className="gate-modal__keep">{copy.gate.keep}</p>
            <button type="button" className="button button--on-red" onClick={onClose}>
              {ui.gate.close}
            </button>
          </>
        ) : (
          <>
            <p>{deep ? su.body : wl.body}</p>
            {!deep && <p>{wl.lead}</p>}

            <form onSubmit={onSubmit} className="gate-modal__form" noValidate>
              <div className="gate-modal__flow gate-modal__flow--field">
                <label htmlFor={fieldId} className="gate-modal__label">
                  {su.label}
                </label>
                <input
                  id={fieldId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder={su.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={fineId}
                  disabled={busy}
                />
              </div>
              {error && (
                <p className="gate-modal__error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="button button--on-red" disabled={busy || !email.trim()}>
                {busy ? (deep ? su.busy : wl.busy) : ui.gate.button} {!busy && <span aria-hidden="true">→</span>}
              </button>
            </form>
            <p className="gate-modal__fine" id={fineId}>
              {deep ? su.fine : wl.fine}
            </p>

            {!deep && import.meta.env.DEV && (
              <form onSubmit={onUnlock} className="gate-modal__form gate-modal__dev">
                <label htmlFor={codeId} className="gate-modal__label">
                  Dev only · {ACCESS_CODE_LABEL}
                </label>
                <input id={codeId} type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
                <button type="submit" className="button button--on-red" disabled={busy || !code.trim()}>
                  unlock
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
