// Vercel Analytics events (BUILD §7). Never send question or message text.
import { track as vercelTrack } from "@vercel/analytics";

type Events = {
  level_chosen: { level: string };
  cast_completed: { level: string; changing: number };
  guided_answer: { correct: boolean; toss: number };
  upgrade_clicked: { to: string };
  signup_completed: Record<string, never>;
  unlock_completed: Record<string, never>;
  dialogue_message_sent: Record<string, never>;
};

export function track<K extends keyof Events>(name: K, props?: Events[K]): void {
  try {
    vercelTrack(name, props);
  } catch {
    // Analytics must never break the app.
  }
}
