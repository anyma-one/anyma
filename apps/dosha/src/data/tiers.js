// The three tiers, in one place. Landing and /tiers both render these cards and the
// copy used to be duplicated verbatim in each view, so an edit to one silently left
// the other stale. Only the `meta` line differs between the two screens (it reflects
// progress), so that stays with the views.

export const TIERS = {
  core: {
    index: 1,
    name: "Core Reading · Prakriti",
    tagline: "Determine your core type. Prakriti is a lifelong constitution in Ayurveda — how you were born and what classic elements live through you. Everything is based on this.",
    commitment: "5–10 min",
    href: "#/core",
  },
  full: {
    index: 2,
    name: "Full Reading · Vikriti",
    tagline: "Learn about the ayurvedic relationship between your current state and your core type. Vikriti shows how balanced or imbalanced you might be — and how to change that.",
    commitment: "5–10 min",
    href: "#/full/start",
  },
  individual: {
    index: 3,
    name: "Individual Reading",
    tagline: "Go further than a questionnaire can. Explore your reading in detail — against your own situation, your preferences and your doubts.",
    meta: "Paid · coming soon",
    locked: true,
  },
};
