// (See README "Design system" section for the tier-2 / imbalance layout notes.)
// The 7 constitution results — copy transcribed verbatim from ayurveda-result-copy.md,
// with one deliberate change: the three blend records said "Vata-Pitta types",
// "Pitta-Kapha types", "Vata-Kapha types". They now say "These types".
//
// Why: the KEY here is canonical (always Vata-Pitta, never Pitta-Vata) so every result
// resolves to an entry, but the heading is rendered in RANK order — a Pitta-dominant
// blend displays "Pitta–Vata". The prose restating the canonical name contradicted the
// heading on roughly 44% of blend readings. The name was redundant with the heading
// directly above it, so removing it costs nothing. See views/constitution.js.

// The prakriti hook, shared by the six non-tridoshic results (identical wording).
const HOOK =
  "This is your prakriti, the constitution you were born with. It does not tell you how you are doing right now, only how you are built. What is actually running high or low today is a different reading, and that is what Full Reading uncovers.";

export const RESULTS = {
  "Vata": {
    key: "vata",
    name: "Vata",
    element: "The constitution of movement. Air and ether.",
    subtitle: "Air and ether, light and mobile.",
    character:
      "You're built for motion. Vata types tend to be light and quick, in body and in mind: a leaner frame, a fast and curious mind, energy that arrives in bursts. You likely think fast, feel deeply, and move through the world with restless, creative momentum.",
    atBest:
      "imaginative, adaptable, quick to learn, enthusiastic, alive to new ideas. When Vata flows, you are the one who starts things and notices what others miss.",
    whenStretched:
      "that same lightness can scatter. Vata pushed too far tends toward anxiety, restlessness, broken sleep, dryness and depletion. You run on air, and air runs out.",
    hook: HOOK,
  },
  "Pitta": {
    key: "pitta",
    name: "Pitta",
    element: "The constitution of transformation. Fire and water.",
    subtitle: "Fire and water, warm and sharp.",
    character:
      "You run warm and driven. Pitta types tend toward a medium, capable build and a sharp, focused mind: strong appetite, strong opinions, strong will. You likely like things done well and done now, and you have the intensity to make that happen.",
    atBest:
      "focused, decisive, courageous, articulate. When Pitta is balanced, you lead, you cut through confusion, and you turn ideas into results.",
    whenStretched:
      "fire runs hot. Pitta pushed too far tips into irritability, impatience, overheating and burnout, the perfectionism that scorches you and the people around you. Heat that transforms can also consume.",
    hook: HOOK,
  },
  "Kapha": {
    key: "kapha",
    name: "Kapha",
    element: "The constitution of stability. Earth and water.",
    subtitle: "Earth and water, grounded and steady.",
    character:
      "You are built to endure. Kapha types tend toward a solid, strong frame and a calm, steady temperament: good stamina, deep sleep, a grounded and patient nature. You likely bring steadiness where others bring noise, and people rely on you for it.",
    atBest:
      "calm, loyal, patient, strong, warm. When Kapha is balanced, you are the steady center, dependable, compassionate, hard to shake.",
    whenStretched:
      "earth can settle into heaviness. Kapha pushed too far tends toward sluggishness, weight gain, congestion, and a resistance to change that leaves you stuck, holding on to what would be better released. Stability can harden into stagnation.",
    hook: HOOK,
  },
  "Vata-Pitta": {
    key: "vata-pitta",
    name: "Vata-Pitta",
    element: "The blend of movement and transformation. Air, ether, fire and water.",
    subtitle: "Air and fire, closely matched.",
    character:
      "You pair a quick, restless mind with real drive. These types tend to be fast in thought and decisive in action, the ones who both dream up the idea and push it into being. Creative and sharp at once, rarely still, always onto the next thing.",
    atBest:
      "inventive, quick-thinking, courageous, expressive. When this blend is balanced, you generate ideas and have the fire to carry them through, a rare combination.",
    whenStretched:
      "you can run wired and hot at the same time. Vata's anxiety meets Pitta's intensity, and the result is a nervous system pushed from two directions: restless, irritable, and prone to burning out fast. You have two engines, and both can overheat.",
    hook: HOOK,
  },
  "Pitta-Kapha": {
    key: "pitta-kapha",
    name: "Pitta-Kapha",
    element: "The blend of transformation and stability. Fire, water and earth.",
    subtitle: "Fire and earth, warm yet steady.",
    character:
      "You combine drive with staying power. These types tend to be strong and capable, pairing intensity with endurance: the fire to push and the ground to keep pushing. Often the most physically robust of the blends, able to work hard and last.",
    atBest:
      "determined, steady, focused, resilient. When this blend is balanced, you set a direction and hold it, powerful without being fragile.",
    whenStretched:
      "strength turns to stubbornness. Pitta's heat meets Kapha's weight, and you can become immovable, forceful and slow to change at once, running hot inside while resisting on the outside. Hard to shift, even when shifting is what is needed.",
    hook: HOOK,
  },
  "Vata-Kapha": {
    key: "vata-kapha",
    name: "Vata-Kapha",
    element: "The blend of movement and stability. Air, ether, earth and water.",
    subtitle: "Air and earth, mobile yet grounded.",
    character:
      "You hold two opposite natures at once. These types pair lightness with solidity, quickness with calm: capable of restless creativity and deep steadiness, sometimes in the same day. It is the most contrasting of the blends, and you likely feel the pull between motion and rest.",
    atBest:
      "adaptable yet grounded, imaginative yet dependable. When this blend is balanced, you bring ideas and the patience to see them through, movement anchored by stillness.",
    whenStretched:
      "the two can swing rather than settle. Vata and Kapha share a cold, and you may alternate between anxious restlessness and heavy inertia, wired one moment and stuck the next, with circulation and warmth easily thrown off. Two natures that do not always agree.",
    hook: HOOK,
  },
  "Tridoshic (balanced)": {
    key: "tridoshic",
    name: "Tridoshic",
    element: "All three, in balance. Air, ether, fire, water and earth.",
    subtitle: "All three, in rare balance.",
    character:
      "Your answers spread evenly across all three doshas, with no single one dominating. Classically this is called a tridoshic constitution: a rare, even mix that can draw on all three strengths, the creativity of Vata, the drive of Pitta, the steadiness of Kapha, without being ruled by any.",
    atBest:
      "versatile and adaptable, meeting different situations with different strengths. A balanced constitution is considered fortunate in Ayurveda, and often a resilient one.",
    // Tridoshic swaps "when stretched" for an honesty note about even spreads.
    honestNote:
      "an even spread can also mean the reading simply did not find a strong pattern in your answers, which happens. If this result surprises you, it is worth taking again and answering for how you have been across your whole life rather than lately. A clearer type may emerge.",
    hook:
      "This is your prakriti, the constitution you were born with. What is actually running high or low today is a different reading, and that is what Full Reading uncovers.",
  },
};
