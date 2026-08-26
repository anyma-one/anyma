// Question bank — transcribed verbatim from ayurveda-core-reading-questions.md.
// Dosha tags (V/P/K) are INTERNAL only and must never be rendered to the user.
// Option order is randomised at render time; the mapping lives here in data.

// General info pop-up, shown at the start of a reading and via the info icon.
export const INFO_POPUP = {
  title: "Why these questions?",
  body: [
    "This reading connects everyday traits, your build, digestion, sleep, temperament and more, to the three doshas of Ayurveda: Vata, Pitta and Kapha. Each answer leans toward one of them.",
    "A few things worth knowing:",
  ],
  bullets: [
    "These are traditional associations, not medical measurements. The reading describes tendencies, it does not diagnose anything.",
    "There is no better or worse type, and most people are a blend of two.",
    "Answer honestly, not as the person you wish you were. That is what makes the reading useful.",
  ],
  footer: "There are no right answers here.",
};

// Per-lens intro lines (the timeframe lives only here, not in the pop-up).
export const LENS = {
  prakriti: {
    key: "prakriti",
    label: "Core Reading",
    intro: "Think about how you have been for most of your life, since childhood.",
    chapterLabel: "Lifelong",
  },
  vikriti: {
    key: "vikriti",
    label: "Current-state pass",
    intro: "Lately, how have you been?",
    chapterLabel: "Lately",
  },
};

// Constitution pass (Core Reading). 20 dimensions.
export const CONSTITUTION_QUESTIONS = [
  { id: 1, dimension: "Body build", prompt: "How would you describe your natural body build?", options: [
    { dosha: "V", text: "Slim and light, I find it hard to gain weight" },
    { dosha: "P", text: "Medium and moderately muscular" },
    { dosha: "K", text: "Rather large and solid, I gain weight easily" },
  ]},
  { id: 2, dimension: "Skin", prompt: "How would you describe your skin most of the time?", options: [
    { dosha: "V", text: "Dry, thin, on the cooler side, sometimes rough" },
    { dosha: "P", text: "Warm, reddish, sensitive, prone to breakouts or rashes" },
    { dosha: "K", text: "Thick, smooth, cool, a little oily" },
  ]},
  { id: 3, dimension: "Disposition", prompt: "Which best describes your general disposition?", options: [
    { dosha: "V", text: "Lively and changeable, can get anxious" },
    { dosha: "P", text: "Intense and driven, can get irritable" },
    { dosha: "K", text: "Calm and steady, easy-going" },
  ]},
  { id: 4, dimension: "Appetite", prompt: "How is your appetite, usually?", options: [
    { dosha: "V", text: "Irregular, it comes and goes" },
    { dosha: "P", text: "Strong and sharp, I get irritable if I skip a meal" },
    { dosha: "K", text: "Steady but light, I can easily skip meals" },
  ]},
  { id: 5, dimension: "Eyes", prompt: "How would you describe your eyes?", options: [
    { dosha: "V", text: "Small or narrow, active, sometimes dry" },
    { dosha: "P", text: "Sharp and penetrating, sensitive to bright light" },
    { dosha: "K", text: "Large and calm, with a moist quality" },
  ]},
  { id: 6, dimension: "Pace", prompt: "How would people describe your natural pace, in speech and movement?", options: [
    { dosha: "V", text: "Fast and quick, a little restless" },
    { dosha: "P", text: "Sharp, precise and purposeful" },
    { dosha: "K", text: "Slow, steady and relaxed" },
  ]},
  { id: 7, dimension: "Sleep", prompt: "How do you sleep, typically?", options: [
    { dosha: "V", text: "Light and easily interrupted, sometimes restless" },
    { dosha: "P", text: "Sound but fairly short, I manage on less" },
    { dosha: "K", text: "Deep, heavy and long, hard to wake" },
  ]},
  { id: 8, dimension: "Thirst", prompt: "How is your thirst, usually?", options: [
    { dosha: "V", text: "Variable, it changes from day to day" },
    { dosha: "P", text: "Strong, I feel thirsty often" },
    { dosha: "K", text: "Low, I rarely feel very thirsty" },
  ]},
  { id: 9, dimension: "At your best", prompt: "When you are at your best, you tend to be:", options: [
    { dosha: "V", text: "Enthusiastic and imaginative" },
    { dosha: "P", text: "Warm, confident and sharp" },
    { dosha: "K", text: "Content, steady and loyal" },
  ]},
  { id: 10, dimension: "Digestion", prompt: "After eating, how does your digestion tend to feel?", options: [
    { dosha: "V", text: "Irregular, with bloating or gas" },
    { dosha: "P", text: "Fast and strong, sometimes acidity or heartburn" },
    { dosha: "K", text: "Slow and heavy, I feel full for a long time" },
  ]},
  { id: 11, dimension: "Weight", prompt: "How does your weight tend to behave over time?", options: [
    { dosha: "V", text: "Stays low, it is hard for me to put weight on" },
    { dosha: "P", text: "Fairly stable and easy to maintain" },
    { dosha: "K", text: "Climbs easily and is hard to shift" },
  ]},
  { id: 12, dimension: "Memory", prompt: "How does your memory tend to work?", options: [
    { dosha: "V", text: "I learn quickly but forget quickly" },
    { dosha: "P", text: "Sharp and clear, I hold on to what matters" },
    { dosha: "K", text: "Slow to learn, but I remember for a long time" },
  ]},
  { id: 13, dimension: "Perspiration", prompt: "How do you tend to sweat?", options: [
    { dosha: "V", text: "Little, even in the heat" },
    { dosha: "P", text: "Easily and heavily, often with a strong odour" },
    { dosha: "K", text: "Moderately and steadily" },
  ]},
  { id: 14, dimension: "Under stress", prompt: "When you are under stress, you tend to feel:", options: [
    { dosha: "V", text: "Worried, anxious or fearful" },
    { dosha: "P", text: "Irritable, frustrated or angry" },
    { dosha: "K", text: "Withdrawn, avoidant or flat" },
  ]},
  { id: 15, dimension: "Hair", prompt: "What is your hair naturally like?", options: [
    { dosha: "V", text: "Dry, thin, frizzy or brittle" },
    { dosha: "P", text: "Fine and soft, with early greying or thinning" },
    { dosha: "K", text: "Thick, wavy, oily and glossy" },
  ]},
  { id: 16, dimension: "Regularity", prompt: "How would you describe your usual bowel habits?", options: [
    { dosha: "V", text: "Tend to be dry or irregular, sometimes constipated" },
    { dosha: "P", text: "Loose, frequent and soft" },
    { dosha: "K", text: "Regular, slow and well formed" },
  ]},
  { id: 17, dimension: "Temperature", prompt: "What kind of temperature do you prefer?", options: [
    { dosha: "V", text: "I dislike cold and crave warmth" },
    { dosha: "P", text: "I dislike heat and seek out cool" },
    { dosha: "K", text: "I handle most, but damp cold bothers me" },
  ]},
  { id: 18, dimension: "Free time", prompt: "Left to your own devices, you tend to:", options: [
    { dosha: "V", text: "Seek variety and new experiences" },
    { dosha: "P", text: "Pursue goals, even while relaxing" },
    { dosha: "K", text: "Prefer routine, comfort and rest" },
  ]},
  { id: 19, dimension: "Energy", prompt: "How does your physical energy tend to work?", options: [
    { dosha: "V", text: "It comes in bursts, then I crash" },
    { dosha: "P", text: "Moderate, focused and driven" },
    { dosha: "K", text: "Strong and steady, slow to start but lasting" },
  ]},
  { id: 20, dimension: "Decisions", prompt: "How do you tend to make decisions?", options: [
    { dosha: "V", text: "I hesitate and often change my mind" },
    { dosha: "P", text: "Quickly and firmly" },
    { dosha: "K", text: "Slowly and deliberately, and I resist changing course" },
  ]},
];

// Current-state pass (Full Reading). Same 20 dimensions, present-tense,
// leaning toward each dosha's aggravated presentation. Same dosha mapping.
//
// THREE options here describe "no change from normal" rather than an aggravated
// state: q1 "Solid and steady, much as usual", q11 "Holding steady", q13 "Moderate,
// steady". The spec tagged them P, P and K, which meant a person who felt entirely
// fine still accumulated +2 Pitta and +1 Kapha — against an elevation threshold of
// 3. They are tagged "N" (neutral) instead: scoring ignores anything that is not
// V/P/K, so a "nothing has changed" answer now contributes nothing to either side.
// The option TEXT is untouched, and "N" is never rendered (hard constraint #1).
export const CURRENT_STATE_QUESTIONS = [
  { id: 1, dimension: "Body", prompt: "Lately, how does your body feel day to day?", options: [
    { dosha: "V", text: "Light, thin, a bit depleted" },
    { dosha: "N", text: "Solid and steady, much as usual" },
    { dosha: "K", text: "Heavy or sluggish" },
  ]},
  { id: 2, dimension: "Skin", prompt: "How has your skin been recently?", options: [
    { dosha: "V", text: "Drier or rougher than usual" },
    { dosha: "P", text: "More reactive, red or breaking out" },
    { dosha: "K", text: "Oilier or more congested" },
  ]},
  { id: 3, dimension: "Disposition", prompt: "How has your mood been lately?", options: [
    { dosha: "V", text: "Restless, changeable or anxious" },
    { dosha: "P", text: "Intense, irritable or on edge" },
    { dosha: "K", text: "Calm, or flat and unmotivated" },
  ]},
  { id: 4, dimension: "Appetite", prompt: "How has your appetite been recently?", options: [
    { dosha: "V", text: "Irregular, forgetting to eat" },
    { dosha: "P", text: "Sharp, hungry and impatient" },
    { dosha: "K", text: "Low, or eating for comfort" },
  ]},
  { id: 5, dimension: "Eyes", prompt: "How have your eyes felt lately?", options: [
    { dosha: "V", text: "Dry, tired or strained" },
    { dosha: "P", text: "Hot, red or light-sensitive" },
    { dosha: "K", text: "Heavy, watery or puffy" },
  ]},
  { id: 6, dimension: "Pace", prompt: "What has your pace been like recently?", options: [
    { dosha: "V", text: "Hurried, scattered, hard to settle" },
    { dosha: "P", text: "Fast and pushing hard" },
    { dosha: "K", text: "Slow, heavy, hard to get going" },
  ]},
  { id: 7, dimension: "Sleep", prompt: "How have you been sleeping lately?", options: [
    { dosha: "V", text: "Light, broken, hard to switch off" },
    { dosha: "P", text: "Short, or waking hot and alert" },
    { dosha: "K", text: "Long and heavy, still groggy" },
  ]},
  { id: 8, dimension: "Thirst", prompt: "How has your thirst been recently?", options: [
    { dosha: "V", text: "Up and down, forgetting to drink" },
    { dosha: "P", text: "Strong, often thirsty" },
    { dosha: "K", text: "Low, rarely thirsty" },
  ]},
  { id: 9, dimension: "At your best", prompt: "When you have felt good lately, it has been:", options: [
    { dosha: "V", text: "Lively and inspired" },
    { dosha: "P", text: "Sharp and driven" },
    { dosha: "K", text: "Warm and settled" },
  ]},
  { id: 10, dimension: "Digestion", prompt: "How has your digestion been recently?", options: [
    { dosha: "V", text: "Irregular, bloated or gassy" },
    { dosha: "P", text: "Acidic, loose or burning" },
    { dosha: "K", text: "Slow, heavy, sluggish" },
  ]},
  { id: 11, dimension: "Weight", prompt: "Has your weight shifted lately?", options: [
    { dosha: "V", text: "Dropping or hard to keep on" },
    { dosha: "N", text: "Holding steady" },
    { dosha: "K", text: "Creeping up" },
  ]},
  { id: 12, dimension: "Memory", prompt: "How has your focus been lately?", options: [
    { dosha: "V", text: "Forgetful, scattered" },
    { dosha: "P", text: "Sharp but tense" },
    { dosha: "K", text: "Foggy or slow" },
  ]},
  { id: 13, dimension: "Perspiration", prompt: "How have you been sweating recently?", options: [
    { dosha: "V", text: "Little, dry skin" },
    { dosha: "P", text: "More than usual, easily" },
    { dosha: "N", text: "Moderate, steady" },
  ]},
  { id: 14, dimension: "Under stress", prompt: "When stressed lately, you have mostly felt:", options: [
    { dosha: "V", text: "Anxious or overwhelmed" },
    { dosha: "P", text: "Irritable or angry" },
    { dosha: "K", text: "Shut down or withdrawn" },
  ]},
  { id: 15, dimension: "Hair", prompt: "How has your hair or scalp been lately?", options: [
    { dosha: "V", text: "Dry, brittle, flyaway" },
    { dosha: "P", text: "Oily scalp, thinning or shedding" },
    { dosha: "K", text: "Heavy, greasy roots" },
  ]},
  { id: 16, dimension: "Regularity", prompt: "How have your bowels been recently?", options: [
    { dosha: "V", text: "Dry, irregular or constipated" },
    { dosha: "P", text: "Loose, frequent or urgent" },
    { dosha: "K", text: "Slow but regular, heavy" },
  ]},
  { id: 17, dimension: "Temperature", prompt: "How have you handled temperature lately?", options: [
    { dosha: "V", text: "Feeling the cold more" },
    { dosha: "P", text: "Overheating easily" },
    { dosha: "K", text: "Bothered by damp or cold" },
  ]},
  { id: 18, dimension: "Free time", prompt: "In your downtime recently, you have wanted:", options: [
    { dosha: "V", text: "Stimulation and change" },
    { dosha: "P", text: "To keep achieving, hard to switch off" },
    { dosha: "K", text: "Rest and comfort" },
  ]},
  { id: 19, dimension: "Energy", prompt: "How has your energy been lately?", options: [
    { dosha: "V", text: "Spiky, then crashing" },
    { dosha: "P", text: "Driven but burning out" },
    { dosha: "K", text: "Low, heavy, slow" },
  ]},
  { id: 20, dimension: "Decisions", prompt: "How have you been making decisions lately?", options: [
    { dosha: "V", text: "Second-guessing, changing my mind" },
    { dosha: "P", text: "Fast, maybe rushed or forceful" },
    { dosha: "K", text: "Putting them off, stalling" },
  ]},
];
