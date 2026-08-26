// Imbalance copy (Full Reading) — transcribed verbatim from ayurveda-result-copy.md.
// Layered on top of the constitution result. Reads vikriti against prakriti.

export const IMBALANCE_INTRO = "This is your vikriti, your current state read against your prakriti.";

// `emphasise` lists exact substrings of the body copy to set bold on the reading. It
// exists so the copy itself stays verbatim — nothing is reworded, only marked. Each
// entry names the sentence a reader should take away if they read nothing else: what
// the elevation looks like, and the reassurance that it describes a state, not them.
// If you edit the body text, update these to match or they will silently stop applying.
//
// Keyed by elevated dosha; "none" when nothing is running notably high.
export const IMBALANCE = {
  V: {
    key: "V",
    emphasise: [
      "it tends to show as a nervous system in overdrive",
      "It reflects how you have been lately, not who you are.",
    ],
    heading: "Right now, Vata is running high.",
    body: [
      "Compared with your prakriti, your baseline constitution, you have been leaning more Vata lately. When Vata rises above it, it tends to show as a nervous system in overdrive: restlessness, racing or anxious thoughts, light or broken sleep, dry skin, irregular digestion, feeling cold, and energy that spikes then crashes. You may feel scattered, ungrounded, or like you are running on empty.",
      "Vata is the quickest dosha to move out of balance and the quickest to respond, so this is common and usually very workable. It reflects how you have been lately, not who you are.",
    ],
  },
  P: {
    key: "P",
    emphasise: [
      "it tends to show as too much heat",
      "This is a current state, not your character.",
    ],
    heading: "Right now, Pitta is running high.",
    body: [
      "Compared with your prakriti, your baseline constitution, you have been leaning more Pitta lately. When Pitta rises above it, it tends to show as too much heat: irritability, a short fuse, acid digestion or heartburn, skin flare-ups, overheating, waking hot at night, and drive that has tipped into pressure or burnout. You may feel wound up, critical, or unable to switch off.",
      "This is a current state, not your character. Pitta elevations often build quietly under stress or overwork, and they respond well once you notice them.",
    ],
  },
  K: {
    key: "K",
    emphasise: [
      "it tends to show as heaviness",
      "It describes how you have been lately, not a fixed state.",
    ],
    heading: "Right now, Kapha is running high.",
    body: [
      "Compared with your prakriti, your baseline constitution, you have been leaning more Kapha lately. When Kapha rises above it, it tends to show as heaviness: sluggishness, low motivation, oversleeping yet still tired, weight gain or water retention, congestion, and a sense of being stuck. You may feel flat, slow, or reluctant to change anything.",
      "Kapha is the slowest dosha to shift, so this kind of elevation settles in gradually and takes a little longer to move. It describes how you have been lately, not a fixed state.",
    ],
  },
  none: {
    key: "none",
    emphasise: [
      "your current state and your nature are roughly aligned",
    ],
    heading: "Right now, nothing is running notably high.",
    body: [
      "How you have been lately stays close to your prakriti, your baseline constitution, with no single dosha notably elevated. In Ayurvedic terms this is a good place to be: your current state and your nature are roughly aligned, which usually means you feel more like yourself.",
      "This shifts with seasons, stress, sleep and diet, so it is worth checking again from time to time. For now the focus is less on correction and more on holding the balance you have.",
    ],
  },
};
