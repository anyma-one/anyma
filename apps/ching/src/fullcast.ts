// Full Cast client: the closed-beta unlock (mirrors soul's src/deepdive/access.ts) and the
// dialogue request. The question is sent in the request body only, never in a URL.
import { KEYS, readJSON, writeJSON } from "./storage";
import type { ChatMessage } from "./types";

export const PASSCODE_HEADER = "x-ching-passcode";
const api = (name: string) => `/api/${name}`;

let memoryCode = "";
let memoryDevice = "";

export function loadPasscode(): string {
  return readJSON<string>(KEYS.passcode, "") || memoryCode;
}

export function savePasscode(code: string): void {
  memoryCode = code;
  writeJSON(KEYS.passcode, code);
}

/** Random per-device id, so testers sharing one beta code are counted apart. */
function deviceId(): string {
  const saved = readJSON<string>(KEYS.device, "") || memoryDevice;
  if (saved) return saved;
  const id = crypto.randomUUID();
  memoryDevice = id;
  writeJSON(KEYS.device, id);
  return id;
}

const headers = (code = loadPasscode()) => ({
  "Content-Type": "application/json",
  [PASSCODE_HEADER]: encodeURIComponent(code.trim()),
});

export type UnlockOutcome = "ok" | "failed";

export async function unlock(code: string): Promise<UnlockOutcome> {
  try {
    const res = await fetch(api("ching-unlock"), { method: "POST", headers: headers(code) });
    if (res.ok) {
      savePasscode(code.trim());
      return "ok";
    }
    return "failed";
  } catch {
    return "failed";
  }
}

export type DialogueError = "limit" | "unlock" | "invalid" | "unavailable";

export class DialogueFailure extends Error {
  constructor(public code: DialogueError) {
    super(code);
  }
}

/**
 * Ask for the next reply. `messages` holds only real turns (an empty array asks for the
 * opening). Calls onText with the reply so far as it streams in; resolves with the full reply.
 */
export async function requestReply(
  cast: { question: string; totals: number[] },
  messages: ChatMessage[],
  onText: (soFar: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(api("ching-dialogue"), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ unlock: deviceId(), question: cast.question, totals: cast.totals, messages }),
      signal,
    });
  } catch {
    throw new DialogueFailure("unavailable");
  }
  if (!res.ok || !res.body) {
    let code: DialogueError = "unavailable";
    try {
      const j = await res.json();
      if (["limit", "unlock", "invalid", "unavailable"].includes(j?.error)) code = j.error;
    } catch {
      // keep "unavailable"
    }
    throw new DialogueFailure(code);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
  } catch {
    if (!text) throw new DialogueFailure("unavailable");
  }
  text += decoder.decode();
  if (!text.trim()) throw new DialogueFailure("unavailable");
  return text;
}
