// POST /api/ching-dialogue: the Full Cast reading companion, streamed (BUILD §6.2).
//
// Request: { unlock: <device id>, question, totals: [6..9 x6], messages: [...] } plus the
// `x-ching-passcode` header. `messages` holds only real turns, starting with the assistant's
// opening reply; an empty array asks for the opening. The client never sends the OPENER.
//
// Response: the reply as plain text chunks (soul's streaming format), or a non-2xx JSON
// { error: "limit" | "unlock" | "invalid" | "unavailable" }.
//
// Privacy (BUILD §6.4): the question and messages are never logged. Only the hashed readingId,
// counters and token totals are stored.
import Anthropic from "@anthropic-ai/sdk";
import hexagrams from "../data/hexagrams.json";
import { buildSystemPrompt, prepareMessages, readingId, validateCastInput } from "./_lib/reading-context.js";
import { checkPasscode, unlockIdFor } from "./_lib/access.js";
import { readLimits, storeFromEnv, dayKey, usageTokens } from "./_lib/usage.js";

const DEFAULT_MODEL = "claude-sonnet-5-5";
// Replies are meant to be short (the prompt asks for under 150 words).
const MAX_TOKENS = 600;

interface ReqLike {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface ResLike {
  status: (code: number) => ResLike;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => unknown;
  write: (chunk: string) => unknown;
  end: (chunk?: string) => void;
  headersSent?: boolean;
}

type ErrorCode = "limit" | "unlock" | "invalid" | "unavailable";
const fail = (res: ResLike, status: number, error: ErrorCode) => res.status(status).json({ error });

// Thinking settings per model. Thinking tokens count against max_tokens, so with a 600-token
// ceiling it's switched off where the model allows it: Sonnet 5.5 via `between_tools` (no
// tools here, so no thinking), Haiku 5.5 via `disabled` (accepted at effort high or below).
function thinkingFor(model: string): Record<string, unknown> {
  if (model.startsWith("claude-sonnet-5-5")) return { thinking: { type: "between_tools" }, output_config: { effort: "low" } };
  if (model.startsWith("claude-haiku-5-5")) return { thinking: { type: "disabled" }, output_config: { effort: "low" } };
  return { output_config: { effort: "low" } };
}

export default async function handler(req: ReqLike, res: ResLike): Promise<void> {
  if (req.method !== "POST") return fail(res, 405, "invalid");
  const env = process.env;

  // 1. Unlock.
  const access = checkPasscode(req.headers, env);
  if (access === "closed") return fail(res, 503, "unavailable");
  if (access === "denied") return fail(res, 401, "unlock");

  // Config. Any missing piece fails closed: no silent unlimited defaults.
  const limits = readLimits(env);
  const store = storeFromEnv(env);
  if (!limits || !store || !env.ANTHROPIC_API_KEY) return fail(res, 503, "unavailable");

  // 2. Validate.
  const body = (req.body ?? {}) as { unlock?: unknown; question?: unknown; totals?: unknown; messages?: unknown };
  const cast = { question: body.question as string, totals: body.totals as number[] };
  let messages: Anthropic.MessageParam[];
  let system: string;
  try {
    validateCastInput(cast);
    messages = prepareMessages(body.messages ?? []);
    system = buildSystemPrompt(cast, hexagrams);
  } catch {
    return fail(res, 400, "invalid");
  }

  // Limits: daily token cap, then this message against the reading and the unlock.
  const day = dayKey();
  try {
    if ((await store.tokensToday(day)) >= limits.dailyCap) return fail(res, 503, "unavailable");
    const id = readingId(unlockIdFor(env, body.unlock), cast);
    const counted = await store.countMessage({
      readingId: id,
      unlockId: unlockIdFor(env, body.unlock),
      maxMessages: limits.maxMessages,
      maxReadings: limits.maxReadings,
    });
    if (counted === "limit") return fail(res, 429, "limit");
  } catch {
    return fail(res, 503, "unavailable");
  }

  // 3–5. Call the model and stream the reply.
  const model = env.CHING_MODEL?.trim() || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  let startUsage: Record<string, number> = {};
  let deltaUsage: Record<string, number> = {};
  let wrote = false;

  try {
    // The beta endpoint carries server-side refusal fallback ("default" routes a declined
    // request to a suitable model inside the same call). Cast: the installed SDK's types
    // predate `between_tools` and the scalar `fallbacks` form.
    const params = {
      model,
      max_tokens: MAX_TOKENS,
      // The system prompt repeats every turn: cache it.
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages,
      ...thinkingFor(model),
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    } as unknown as Parameters<typeof client.beta.messages.stream>[0];
    const stream = client.beta.messages.stream(params);

    for await (const event of stream) {
      if (event.type === "message_start") {
        startUsage = { ...(event.message.usage as unknown as Record<string, number>) };
      } else if (event.type === "message_delta") {
        deltaUsage = { ...(event.usage as unknown as Record<string, number>) };
      } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        if (!wrote) {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache, no-transform");
          res.setHeader("X-Accel-Buffering", "no");
          res.status(200);
          wrote = true;
        }
        res.write(event.delta.text);
      }
    }
    // A reply that stops at max_tokens is shown as it is (BUILD §6.2 step 5).
    if (!wrote) return fail(res, 503, "unavailable");
    res.end();
  } catch {
    if (!wrote) fail(res, 503, "unavailable");
    else res.end();
  } finally {
    try {
      const used = usageTokens(startUsage, deltaUsage);
      if (used) await store.addTokens(day, used);
    } catch {
      // Counting failed after the reply. Nothing to tell the person; the cap check
      // before the next request still runs.
    }
  }
}
