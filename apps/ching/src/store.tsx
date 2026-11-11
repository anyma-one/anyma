// App state: the level and question in progress, the current cast, and the history.
// Flow: idle → asking → casting → complete → reading (BUILD §4).
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { lineFromCoins } from "./lib/cast.js";
import { buildReading } from "./lib/reading.js";
import { isRecast } from "./lib/question.js";
import { data, type Level } from "./data";
import { KEYS, readJSON, writeJSON, remove, sessionStart } from "./storage";
import type { ChatMessage, Line, Reading, StoredCast } from "./types";

const HISTORY_MAX = 10;

interface Flow {
  /** The level the person chose. Full Cast chosen up front runs the Deep Cast guided cast,
   *  then shows the gate (BUILD §10 item 5, default until decided). */
  chosenLevel: Level | null;
  question: string;
  /** A Quick → Deep upgrade: same question, new guided cast, no re-cast note. */
  isUpgrade: boolean;
}

interface Store {
  flow: Flow;
  current: StoredCast | null;
  history: StoredCast[];
  castsCompleted: number;
  chooseLevel: (level: Level) => void;
  setQuestion: (q: string) => void;
  startUpgrade: () => void;
  completeCast: (coins: number[][]) => StoredCast;
  unlockFull: () => void;
  setDialogue: (messages: ChatMessage[]) => void;
  loadEntry: (entry: StoredCast) => void;
  clearHistory: () => void;
  /** The earliest entry this session that asks the same question, if any. */
  findRecast: (question: string) => StoredCast | null;
}

const StoreContext = createContext<Store | null>(null);

export const linesFromCoins = (coins: number[][]): Line[] => coins.map((c) => lineFromCoins(c) as Line);

export function readingFor(cast: StoredCast): Reading {
  return buildReading({ question: cast.question, lines: linesFromCoins(cast.coins) }, cast.level, data) as Reading;
}

function validCast(c: unknown): c is StoredCast {
  const x = c as StoredCast;
  try {
    return (
      !!x &&
      typeof x.question === "string" &&
      ["quick", "deep", "full"].includes(x.level) &&
      Array.isArray(x.coins) &&
      x.coins.length === 6 &&
      linesFromCoins(x.coins).length === 6
    );
  } catch {
    return false;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [flow, setFlow] = useState<Flow>({ chosenLevel: null, question: "", isUpgrade: false });
  const [current, setCurrent] = useState<StoredCast | null>(() => {
    const c = readJSON<unknown>(KEYS.current, null);
    return validCast(c) ? c : null;
  });
  const [history, setHistory] = useState<StoredCast[]>(() =>
    readJSON<unknown[]>(KEYS.history, []).filter(validCast).slice(0, HISTORY_MAX),
  );
  const [castsCompleted, setCastsCompleted] = useState(() => readJSON<number>(KEYS.casts, 0));

  const saveCurrent = useCallback((c: StoredCast | null) => {
    setCurrent(c);
    if (c) writeJSON(KEYS.current, c);
    else remove(KEYS.current);
  }, []);

  const saveHistory = useCallback((h: StoredCast[]) => {
    setHistory(h);
    writeJSON(KEYS.history, h);
  }, []);

  const store = useMemo<Store>(
    () => ({
      flow,
      current,
      history,
      castsCompleted,
      chooseLevel: (level) => setFlow((f) => ({ ...f, chosenLevel: level, isUpgrade: false })),
      setQuestion: (question) => setFlow((f) => ({ ...f, question })),
      startUpgrade: () => {
        if (!current) return;
        setFlow({ chosenLevel: "deep", question: current.question, isUpgrade: true });
      },
      completeCast: (coins) => {
        const level: Level = flow.chosenLevel === "quick" ? "quick" : "deep";
        const cast: StoredCast = { question: flow.question, level, coins, at: Date.now(), dialogue: [] };
        saveCurrent(cast);
        const entry = { question: cast.question, level, coins, at: cast.at };
        saveHistory([entry, ...history].slice(0, HISTORY_MAX));
        const n = castsCompleted + 1;
        setCastsCompleted(n);
        writeJSON(KEYS.casts, n);
        return cast;
      },
      unlockFull: () => {
        if (!current) return;
        // Deep → Full unlocks the same cast; no new cast (BUILD §4).
        saveCurrent({ ...current, level: "full" });
        saveHistory(history.map((e) => (e.at === current.at ? { ...e, level: "full" } : e)));
      },
      setDialogue: (messages) => {
        if (!current) return;
        saveCurrent({ ...current, dialogue: messages });
      },
      loadEntry: (entry) => saveCurrent({ ...entry, dialogue: entry.dialogue ?? [] }),
      clearHistory: () => saveHistory([]),
      findRecast: (question) => {
        const since = sessionStart();
        const matches = history.filter((e) => e.at >= since && isRecast(question, [e.question]));
        return matches.length ? matches[matches.length - 1] : null;
      },
    }),
    [flow, current, history, castsCompleted, saveCurrent, saveHistory],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
