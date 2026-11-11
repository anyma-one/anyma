// /make-it-yours: the Full Cast dialogue (design: screens.md §5; HANDOFF §4.9, BUILD §6.2).
// Opens with an automatic reply; the person never types first. The client never sends, shows
// or stores the opener.
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { copy, fill, pad, ui } from "../data";
import { Link, useRouter } from "../router";
import { readingFor, useStore } from "../store";
import { track } from "../analytics";
import { DialogueFailure, requestReply, type DialogueError } from "../fullcast";
import type { ChatMessage, Reading } from "../types";
import { Seal } from "../components/Seal";
import { PinyinChar } from "../components/Text";
import { HexagramFigure } from "../components/HexagramFigure";
import { figureLines } from "../components/Reading";

const MAX_MESSAGE = 2000;

const errorCopy: Record<DialogueError, string> = {
  limit: copy.errors.limitReached,
  unlock: copy.errors.unlockFailed,
  invalid: copy.errors.messageTooLong,
  unavailable: copy.errors.dialogueUnavailable,
};

export function MakeItYours() {
  const { current } = useStore();
  const { navigate } = useRouter();
  const ready = current?.level === "full";

  useEffect(() => {
    if (!ready) navigate(current ? "reading" : "", { replace: true });
  }, [ready, current, navigate]);
  if (!ready) return null;

  const r = readingFor(current!);
  return (
    <div className="page page--dialogue">
      <div className="dialogue-layout">
        <Dialogue reading={r} />
        <Summary r={r} />
      </div>
    </div>
  );
}

function Summary({ r }: { r: Reading }) {
  const s = r.full!.second;
  const p = r.primary;
  // Desktop: open. Mobile: at the top, collapsed.
  const [open] = useState(() => !window.matchMedia("(max-width: 720px)").matches);
  return (
    <details className="sheet dialogue-summary" open={open}>
      <summary>
        <span className="eyebrow eyebrow--paper">{ui.dialogue.summary}</span>
        <span className="dialogue-summary__toggle" aria-hidden="true" />
      </summary>
      <div className="dialogue-summary__body">
        <p className="dialogue-summary__question">{r.question}</p>
        <div className="dialogue-summary__id">
          <Seal number={p.number} shape={p.seal.shape} className="seal--small" />
          <div>
            <span className="eyebrow eyebrow--paper">
              {s ? fill(ui.dialogue.hexagrams, { from: pad(p.number), to: pad(s.number) }) : fill(ui.dialogue.hexagram, { from: pad(p.number) })}
            </span>
            <p className="dialogue-summary__name">{p.name}</p>
            <p className="dialogue-summary__py">
              <PinyinChar pinyin={p.pinyin} chinese={p.chinese} />
              {s && <> · {fill(ui.dialogue.toward, { name: s.name })}</>}
            </p>
          </div>
        </div>
        <HexagramFigure lines={figureLines(r)} tone="paper" size="card" />
        {r.full!.allLines
          .filter((l) => l.changing)
          .map((l) => (
            <div key={l.line} className="dialogue-summary__line">
              <span className="eyebrow eyebrow--paper">{fill(ui.dialogue.changingLine, { n: l.line })}</span>
              <p>{l.text}</p>
            </div>
          ))}
        <Link to="reading" className="dialogue-summary__open">
          {ui.dialogue.openReading} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </details>
  );
}

function Dialogue({ reading }: { reading: Reading }) {
  const { current, setDialogue } = useStore();
  const messages = current?.dialogue ?? [];
  const [pending, setPending] = useState<string | null>(null); // reply streaming in
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const opened = useRef(false);
  const ids = { input: useId(), privacy: useId(), h: useId() };

  const cast = { question: reading.question, totals: reading.tosses.map((t) => t.total) };
  const count = reading.changingLines.length;
  const starters = copy.dialogue.startersByCount[count === 0 ? "zero" : count === 1 ? "one" : "several"];

  const ask = async (history: ChatMessage[]) => {
    setBusy(true);
    setError("");
    setPending("");
    try {
      const reply = await requestReply(cast, history, setPending);
      setDialogue([...history, { role: "assistant", content: reply }]);
      return true;
    } catch (e) {
      const code = e instanceof DialogueFailure ? e.code : "unavailable";
      setError(code === "invalid" && history.length === 0 ? copy.errors.generic : errorCopy[code]);
      return false;
    } finally {
      setPending(null);
      setBusy(false);
    }
  };

  // The automatic opening.
  useEffect(() => {
    if (opened.current || messages.length > 0) return;
    opened.current = true;
    void ask([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy || messages.length === 0) return;
    if (content.length > MAX_MESSAGE) {
      setError(copy.errors.messageTooLong);
      return;
    }
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setDialogue(history);
    setDraft("");
    track("dialogue_message_sent");
    const ok = await ask(history);
    if (!ok) {
      // Roll back so the history still alternates; keep the person's words in the field.
      setDialogue(messages);
      setDraft(content);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  const showStarters = messages.length === 1 && !busy;

  return (
    <section className="dialogue" aria-labelledby={ids.h}>
      <h1 id={ids.h} className="display-2" tabIndex={-1}>
        {copy.dialogue.heading}
      </h1>
      <p className="lede">{copy.dialogue.intro}</p>

      <ol className="chat" role="log" aria-live="polite" aria-busy={busy}>
        {messages.map((m, i) => (
          <li key={i} className={`chat__msg chat__msg--${m.role}`}>
            {m.content}
          </li>
        ))}
        {pending !== null && <li className="chat__msg chat__msg--assistant is-pending">{pending || <span className="dots" aria-hidden="true" />}</li>}
      </ol>

      {error && (
        <p className="error error--dark" role="alert">
          {error}
          {messages.length === 0 && !busy && (
            <>
              {" "}
              <button type="button" className="text-button" onClick={() => void ask([])}>
                ↻
              </button>
            </>
          )}
        </p>
      )}

      {showStarters && (
        <div className="dialogue-starters-wrap">
          <span className="eyebrow eyebrow--muted">{ui.dialogue.startWith}</span>
          <ul className="dialogue-starters">
            {starters.map((s) => (
              <li key={s}>
                <button type="button" className="starter" onClick={() => void send(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="dialogue-input">
        <label htmlFor={ids.input} className="visually-hidden">
          {copy.dialogue.placeholder}
        </label>
        <input
          id={ids.input}
          value={draft}
          placeholder={copy.dialogue.placeholder}
          autoComplete="off"
          aria-describedby={ids.privacy}
          disabled={messages.length === 0}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="send-button" aria-label={ui.dialogue.send} disabled={busy || !draft.trim() || messages.length === 0}>
          <span aria-hidden="true">→</span>
        </button>
      </form>
      <p id={ids.privacy} className="dialogue__privacy">
        {copy.dialogue.privacy}
      </p>
    </section>
  );
}
