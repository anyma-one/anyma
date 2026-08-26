// Full Reading guidance. The Favour / Ease off lines were transcribed verbatim from
// ayurveda-guidance.md; lines marked "added" were written for this build against the
// 2026 non-herbal practice evidence review and its follow-up, at the owner's request.
//
// SHAPE: every advice line is { text, badge, note } — not a bare string. Each line
// carries its own evidence rating and a one-line statement of what that rating rests on.
//
// This reverses an earlier divergence, deliberately. A previous version put a dot meter
// on each row whose level was GUESSED by keyword-matching the row's own text; that was
// removed because it invented per-item grades the sources do not contain. The ratings
// here are different: each one is written against a specific finding from the practice
// evidence review, and the `note` says which. The rule is that a badge must be
// defensible from a named finding, not derived from the wording of the advice.
//
// CONSTRAINT #6 applies to every note: saying the ADVICE is supported must never read as
// saying the TYPING is accurate. The evidence tests practices; nothing tests whether
// sorting people into doshas is correct. Every note that carries a "Supported" or
// "Promising" badge says explicitly which part is untested.
//
// CONSTRAINT #7: no herbs or supplements in any advice line. Herbs appear only in the
// evidence block on the Full Reading and in the education library.
//
// Buckets are capped at 9 Favour / 6 Avoid. The Avoid cap moved from 4 to 5 when the
// two Contested lines were split out: "Raw and high-fibre foods" and "Fermented foods"
// each needed their own row because the evidence CONTRADICTS that part of the advice
// while supporting the rest of the line it came from. Three states on one row is the
// taxonomy telling you the line is doing too much — split it instead.
//
// `safetyIds` names PRACTICE_SAFETY records that must render with this dosha's guidance,
// because a practice with a documented risk appears in its buckets.

// When the advice-line ratings were last checked against the evidence. Advice lines were
// previously outside the review policy entirely: the education library showed a review
// date on all 16 practice records while the two result screens — which far more people
// read — showed 47 rated claims with no currency signal at all.
//
// One stamp covers the whole set today because they were all rated in the same pass. When
// a single line is re-reviewed on its own, give that line its own `lastReviewed` and read
// the oldest stamp in the set for the page-level line.
export const GUIDANCE_REVIEWED = "2026-07";

export const GUIDANCE_DISCLAIMER =
  "This is a traditional framework, not medical advice. You are free to explore the low-risk parts, food, routine, warmth, rest, and keep what works for you. Anything you take, like herbs or supplements, and anything at all if you are pregnant, have a health condition, or take medication, is worth checking with a professional first. If something does not feel right, stop.";

// ---------------------------------------------------------------------------
// GENERAL — keyed to the CONSTITUTION, not to an imbalance. This is what the Core
// Reading can honestly offer: the classical qualities of a type and the low-risk
// adjustments traditionally matched to it.
//
// Deliberately NOT the same thing as GUIDANCE below. GUIDANCE is corrective — "something
// is running high, what now". This answers "this is how you are built, what generally
// suits that". Mixing them would tell people in balance to correct an imbalance they do
// not have.
// ---------------------------------------------------------------------------
export const GENERAL = {
  V: {
    dosha: "Vata",
    attributes: "light, mobile, cool and dry",
    lines: [
      {
        text: "Regular rhythm — consistent sleep, waking and meal times",
        badge: "Promising",
        note: "Keeping regular hours for sleep and meals does hold up well in research. That Vata types need it more than anyone else is Ayurveda's idea, and no one has tested it.",
      },
      {
        text: "Warm, moist, cooked food in preference to cold or raw",
        badge: "Traditional",
        note: "Cooking does change what food gives you, and can make it easier to digest. But no study has looked at eating warm and cooked as a way of eating, or at matching it to a body type.",
      },
      {
        text: "Warmth generally: clothing, drinks, baths",
        badge: "Traditional",
        note: "Comfortable, and hard to get wrong. People who use a sauna regularly do have better heart health, though that comes from following groups over time rather than from trials — and nobody has studied warmth as a treatment for Vata.",
      },
      {
        text: "Grounding, unhurried movement rather than bursts of intensity",
        badge: "Supported",
        note: "Moving your body is one of the best-evidenced things you can do for strength, balance and mood. Choosing the gentle kind because you are Vata is Ayurveda's idea, not a tested one.",
      },
    ],
  },
  P: {
    dosha: "Pitta",
    attributes: "hot, sharp and intense",
    lines: [
      {
        text: "Not skipping meals — hunger turns sharp quickly in this type",
        badge: "Promising",
        note: "Eating at regular hours holds up well in research. Getting sharp-tempered when hungry is the tradition's way of putting it — recognisable enough, but not something anyone has measured for this type.",
      },
      {
        text: "Cooling, fresh food, and less of the very spicy, sour, fried and fermented",
        badge: "Traditional",
        note: "Calling a food heating or cooling is Ayurveda's own scheme — it is not something you can measure in the food itself. No study has tested a Pitta diet.",
      },
      {
        text: "Shade, water and moderate exertion over midday heat and maximum effort",
        badge: "Traditional",
        note: "Sensible advice for anyone in the heat. Nothing has tested it as a Pitta measure in particular.",
      },
      {
        text: "Deliberate downtime, which is the thing this type is most likely to skip",
        badge: "Promising",
        note: "Rest and recovery are well supported. Meditation helps with anxiety, though much of the effect fades when it is compared against some other activity rather than against doing nothing. Neither has been studied as advice for a dosha.",
      },
    ],
  },
  K: {
    dosha: "Kapha",
    attributes: "heavy, cool, stable and slow to shift",
    lines: [
      {
        text: "Movement most days — this matters more for this type than for the others",
        badge: "Supported",
        note: "Regular activity is well supported for energy and long-term health. That it matters more for Kapha than for anyone else is the tradition's claim, and untested.",
      },
      {
        text: "Lighter, warmer, well-spiced food over heavy, oily and cold",
        badge: "Traditional",
        note: "Ginger genuinely helps with nausea. The wider idea of warming spices, and of a Kapha diet, comes from the tradition rather than from research.",
      },
      {
        text: "An earlier start rather than long lie-ins",
        badge: "Promising",
        note: "Going to bed and getting up at consistent, earlier times fits what is known about the body clock. The dosha timetable behind it has never been tested.",
      },
      {
        text: "Variety and new stimulation, to counter settling in",
        badge: "Traditional",
        note: "No research addresses this at all. It comes from the tradition, and it is harmless to try.",
      },
    ],
  },
  tri: {
    dosha: "Tridoshic",
    attributes: "no single dosha dominates",
    recommendsLabel: "What Ayurveda recommends instead",
    lines: [
      {
        text: "The general basics carry the weight here: regular sleep and meals, daily movement, warmth, rest",
        badge: "Supported",
        note: "These stand on their own evidence, with or without Ayurveda — and they are most of what the type-specific advice comes down to anyway. None of it depends on the typing being right.",
      },
      {
        text: "Watch what shifts with season, stress and workload, and respond to that rather than to a type",
        badge: "Traditional",
        note: "Adjusting to the season is a traditional idea. Keeping a regular routine is well supported in general; the particular schedules Ayurveda gives are not.",
      },
      {
        text: "If a reading later shows one dosha running high, that is the point to adjust",
        badge: "Traditional",
        note: "This is how the tradition works, not a tested procedure.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// GUIDANCE — corrective, keyed to whichever dosha is running high.
// ---------------------------------------------------------------------------
export const GUIDANCE = {
  V: {
    key: "V",
    dosha: "Vata",
    lead: "When Vata is running high, Ayurveda would normally recommend:",
    avoidLead: "When Vata is running high, Ayurveda advises against:",
    favour: [
      {
        text: "Warm, cooked, moist, easily digested food, at regular times",
        badges: ["Promising", "Traditional"],
        note: "The regular-times part is what research backs. Warm and cooked comes from the tradition.",
      },
      {
        text: "A steady daily rhythm with consistent sleep and wake times",
        badge: "Promising",
        note: "Keeping consistent sleep and meal times is well supported as a general habit. The dosha-specific timetable is not.",
      },
      {
        text: "Warmth, and warm oil self-massage (abhyanga)",
        badge: "Traditional",
        note: "What research exists is a handful of small studies where people rated how they felt, one of them run by a company selling the oil. Pleasant and low-risk, but unproven.",
      },
      {
        text: "Slow breathing — a few minutes of unhurried, even breaths",
        badge: "Supported",
        note: "The best-evidenced thing on this list: slow breathing measurably lowers blood pressure — though the people studied already had high blood pressure. That it settles Vata in particular comes from the tradition.",
      },
      {
        text: "Meditation or mindfulness, kept short and regular",
        badge: "Promising",
        note: "Helps with anxiety and low mood — though much of the effect fades when it is compared against some other activity rather than against doing nothing. Nobody has tested choosing it because you are Vata.",
      },
      {
        text: "Daylight within an hour or two of waking",
        badge: "Supported",
        note: "Morning light sets your body clock and helps you sleep earlier and more regularly — the anchor for the routine this type is told to keep. The light part is well established. The Vata part is not.",
      },
      {
        text: "Slow, gentle yoga rather than fast or forceful practice",
        badge: "Supported",
        note: "It works as movement, like other exercise. The main review of yoga for back pain called the benefit \"small and clinically unimportant\" — too slight to notice in practice. Matching the gentle kind to Vata is untested.",
      },
    ],
    easeOff: [
      {
        text: "Cold or dry foods, iced drinks, and skipping or eating at irregular times",
        badges: ["Promising", "Traditional"],
        note: "Skipping meals and eating at odd hours is the part with research behind it. The cold-and-dry rule comes from the tradition.",
      },
      {
        // First Contested rating outside the education layer. The tradition's advice is
        // shown as the tradition gives it, and rated against the evidence that contradicts
        // it — which is the whole point of the product.
        text: "Raw and high-fibre foods",
        badge: "Contested",
        note: "Ayurveda steers Vata types away from raw, fibrous food. Research points the other way: people who eat more fibre live longer, with less heart disease. Cooking vegetables to make them easier to digest keeps the fibre, and is a fair traditional idea — avoiding them is not.",
      },
      {
        text: "Overstimulation: excess caffeine, late nights, constant travel or change",
        badge: "Promising",
        note: "That caffeine and late nights wreck sleep is well established. Tying it to Vata is the tradition's framing.",
      },
      {
        text: "Cold, windy exposure",
        badge: "Traditional",
        note: "A traditional idea. No research addresses it.",
      },
      {
        text: "Fast or forceful breathwork — and never near water",
        badge: "Supported",
        note: "The water part is not a matter of degree — breathing hard before going underwater has made people black out and drown. Fast breathing also causes side effects more often than slow does. That it aggravates Vata in particular comes from the tradition.",
      },
    ],
    safetyIds: ["breathwork"],
  },

  P: {
    key: "P",
    dosha: "Pitta",
    lead: "When Pitta is running high, Ayurveda would normally recommend:",
    avoidLead: "When Pitta is running high, Ayurveda advises against:",
    favour: [
      {
        text: "Cooling, fresh foods, and sweet, bitter and astringent tastes",
        badge: "Traditional",
        note: "The taste categories, and calling food heating or cooling, are Ayurveda's own scheme — not something you can measure in the food itself.",
      },
      {
        text: "Regular meals, since Pitta turns irritable when hungry",
        badge: "Promising",
        note: "Eating at regular hours is well supported for the body clock and for long-term health. That Pitta types need it more than others is the tradition's claim, and not what was studied.",
      },
      {
        text: "Cooling, calming activity, time in nature, moderate rather than intense exercise",
        badge: "Supported",
        note: "Moderate activity is well supported in its own right. Choosing it because you are Pitta is the tradition's idea, and untested.",
      },
      {
        text: "Rest and downtime, easing off self-imposed pressure",
        badge: "Promising",
        note: "Rest and recovery are well supported. Nothing has tested handing them out by body type.",
      },
      {
        text: "Slow breathing, and meditation for the sharper edges of the mind",
        badges: ["Supported", "Promising"],
        note: "Two practices, two different levels of evidence. Slow breathing measurably lowers blood pressure, though the people studied already had it high. Meditation's benefit largely fades when it is compared against some other activity. Neither was studied as advice for a dosha.",
      },
      {
        text: "Gentle, unhurried yoga over heated or competitive classes",
        badge: "Supported",
        note: "It works as movement, though the measured benefits are small. Vigorous styles also have the highest injury rate of any kind of yoga. Matching the gentle kind to Pitta is untested.",
      },
    ],
    easeOff: [
      {
        text: "Spicy, sour, salty and fried foods, and excess alcohol and caffeine",
        badges: ["Promising", "Traditional"],
        note: "The alcohol and caffeine part stands on its own evidence. The taste rules come from the tradition.",
      },
      {
        text: "Ultra-processed foods",
        badge: "Supported",
        note: "The more of it people eat, the worse their health tends to be — heart disease and early death above all. That comes from following large groups over time rather than from trials, so it is a strong and consistent pattern rather than proof. Nobody has tested the link to Pitta.",
      },
      {
        text: "Fermented foods",
        badge: "Contested",
        note: "Ayurveda treats fermented and sour food as heating, and steers Pitta away from it. A controlled feeding study found the opposite: more fermented food meant a more varied gut microbiome and less inflammation. It was small, and its authors called it an early result — but it points against the avoidance, not for it. If these foods don't personally agree with you, that is a separate matter.",
      },
      {
        text: "Overheating: intense heat, midday sun, over-exertion",
        badge: "Traditional",
        note: "Reasonable advice for anyone. Nothing has tested it as a Pitta measure.",
      },
      {
        text: "Overwork, competition, and perfectionism turned inward",
        badge: "Traditional",
        note: "A traditional idea, and hard to test. Recognisable to most people all the same.",
      },
      {
        text: "Heated or competitive exercise when you are already running hot",
        badge: "Traditional",
        note: "Follows the tradition's own logic. No research behind it.",
      },
    ],
  },

  K: {
    key: "K",
    dosha: "Kapha",
    lead: "When Kapha is running high, Ayurveda would normally recommend:",
    avoidLead: "When Kapha is running high, Ayurveda advises against:",
    favour: [
      {
        text: "Light, warm, well-spiced food, and pungent, bitter and astringent tastes",
        badge: "Traditional",
        note: "Ginger genuinely helps with nausea, but that is one specific effect — it does not back the wider spice scheme or a Kapha diet, both of which come from the tradition.",
      },
      {
        text: "Regular movement most days — around 7,000 steps, or vigorous yoga",
        badge: "Supported",
        note: "People who walk around 7,000 steps a day live longer than people who barely move, and the gain flattens out there rather than climbing forever. That comes from following large groups, not from trials. Vigorous yoga also has the highest injury rate of any kind. Nothing has tested any of this as advice for a Kapha type.",
      },
      {
        text: "Resistance or strength training, about an hour a week",
        badge: "Supported",
        note: "People who do any strength training live longer, with the best return at around an hour a week and no extra gain beyond that — more is not better. Again from following large groups rather than from trials. Whether it matters more for a Kapha type than for anyone else is untested.",
      },
      {
        text: "Daylight within an hour or two of waking",
        badge: "Supported",
        note: "Morning light sets your body clock and helps you sleep earlier and more regularly — one of the most reliable findings there is about sleep. Matching an early start to a dosha is not.",
      },
      {
        text: "Fibre-rich cooked vegetables and whole grains",
        badge: "Supported",
        note: "People who eat more fibre live longer, with less heart disease — one of the steadiest findings in nutrition, though it comes from following large groups rather than from trials. Cooking keeps the fibre while making vegetables easier to digest, which is where the tradition and the research agree. The Kapha link itself is untested.",
      },
      {
        text: "Variety, stimulation and new challenges to counter inertia",
        badge: "Traditional",
        note: "No research addresses this at all. It comes from the tradition, and it is harmless to try.",
      },
      {
        text: "Warmth and dryness over damp and cold",
        badge: "Traditional",
        note: "A traditional idea. The sauna research is general, and comes from following people over time rather than from trials — none of it is about Kapha.",
      },
      {
        text: "Scraping your tongue in the morning",
        badge: "Promising",
        note: "The one review of it called its own evidence weak and unreliable — a small effect on bad breath that does not last. Harmless either way. Clearing out ama is the traditional explanation.",
      },
      {
        text: "Saline nasal rinsing when congested — safe water only, see below",
        badge: "Promising",
        note: "Widely recommended for blocked sinuses and easy to tolerate, though the trials behind it are few, small and poor quality. As a way of clearing Kapha, untested. The water you use genuinely matters — see below.",
      },
    ],
    easeOff: [
      {
        text: "Heavy, oily, sweet and cold foods",
        badge: "Traditional",
        note: "A traditional rule. Nobody has tested it.",
      },
      {
        text: "Too much rest, oversleeping, and long stretches of unbroken sitting",
        badge: "Supported",
        note: "People who sit for long unbroken stretches have worse health — but an hour or so of daily movement seems to cancel that out, which makes this more an \"and move\" message than a \"sit less\" one. From following large groups rather than trials. Tying it to Kapha is the tradition's framing.",
      },
      {
        text: "Ultra-processed foods",
        badge: "Supported",
        note: "The more of it people eat, the worse their health tends to be — heart disease and early death above all. That comes from following large groups over time rather than from trials, so it is a strong and consistent pattern rather than proof. Nobody has tested the link to Kapha.",
      },
      {
        text: "Damp, cold environments",
        badge: "Traditional",
        note: "A traditional idea. No research addresses it.",
      },
    ],
    safetyIds: ["nasalWater"],
  },
};
