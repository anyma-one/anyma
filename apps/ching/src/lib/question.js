// question.js: helpers for the question screen.

// Maximum question length, enforced in the question field at every level and again on the server.
export const MAX_QUESTION_LENGTH = 500;

const YES_NO_OPENERS =
  /^(will|won't|would|wouldn't|should|shouldn't|shall|is|isn't|are|aren't|am|was|wasn't|were|weren't|can|can't|could|couldn't|do|don't|does|doesn't|did|didn't|have|haven't|has|hasn't|had|may|might|must)\b/i;

// True when a question looks like a yes/no question. Used only to show a gentle,
// non-blocking notice (copy: question.yesNoNotice). Never block the cast.
export function isYesNo(question) {
  const q = question.trim().replace(/^["'“‘(\s]+/, '').replace(/’/g, "'");
  return YES_NO_OPENERS.test(q);
}

// Lowercase, strip accents and punctuation, collapse whitespace.
export function normalizeQuestion(question) {
  return question
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(q) {
  return new Set(normalizeQuestion(q).split(' ').filter((w) => w.length > 2));
}

// True when `question` is the same as, or nearly the same as, an earlier one.
// Used to show the re-cast note (copy: recast). Skip the check when the user is
// re-casting on purpose to move from Quick Cast to Deep Cast.
export function isRecast(question, previousQuestions, threshold = 0.9) {
  const nq = normalizeQuestion(question);
  if (!nq) return false;
  if (previousQuestions.some((p) => normalizeQuestion(p) === nq)) return true;
  const a = words(question);
  if (a.size === 0) return false;
  return previousQuestions.some((p) => {
    const b = words(p);
    const overlap = [...a].filter((w) => b.has(w)).length;
    return overlap / new Set([...a, ...b]).size >= threshold;
  });
}
