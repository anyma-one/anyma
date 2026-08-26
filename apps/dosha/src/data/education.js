import { REVIEW_POLICY, isStale } from "../lib/review.js";

// Education module. The six spec sections are transcribed verbatim from
// ayurveda-education-module.md, preceded by an added primer on Ayurveda's own basic
// principles (section 01) so the tradition is explained before it is examined.
// Open, never gated. Reading order preserved. Evidence rated with the four badge states.

export const EVIDENCE_LIBRARY = [
  {
    name: "Ashwagandha",
    badge: "Supported",
    tradition: "a rejuvenating tonic for strength, calm and vitality.",
    evidence:
      "multiple trials show moderate reductions in stress and anxiety, the best-supported of the common herbs. Carries liver and interaction cautions, see Safety.",
  },
  {
    name: "Turmeric / curcumin",
    badge: "Supported",
    tradition: "anti-inflammatory, blood-purifier, digestive aid.",
    evidence:
      "reasonable support for arthritis pain and cholesterol. Poorly absorbed, and supplement doses carry a real if rare liver-injury signal, see Safety.",
  },
  {
    name: "Triphala",
    badge: "Promising",
    tradition: "a gentle digestive cleanser used for regularity.",
    evidence:
      "small studies suggest benefits for cholesterol, blood sugar and oral health; its signature use for constipation lacks solid trials.",
  },
  {
    name: "Brahmi (Bacopa monnieri)",
    badge: "Promising",
    tradition: "a mind tonic for memory and calm.",
    evidence:
      "early support for memory and mild anxiety from small, low-quality studies; no proven benefit for dementia.",
  },
  {
    name: "Daily and seasonal routine",
    badge: "Traditional",
    tradition: "aligning daily and seasonal rhythms with the doshas preserves health.",
    evidence:
      "the general principle of regular sleep, meals and seasonal living has circadian and metabolic support, but the specific dosha schedules are untested.",
  },
  {
    name: "Dosha-based diet and typing itself",
    badge: "Traditional",
    tradition: "eating and living for your dosha keeps you in balance.",
    evidence: "no validated biological basis for dosha typing. See “Is dosha typing real?”",
  },
];

// Practice-specific safety records. Defined once and referenced from every place the
// practice can appear — the Safety section, the practice's own evidence record, and
// the Full Reading guidance — so the warning cannot drift out of sync or be dropped
// from one surface. Both render through safetyNote() at "high".
//
// These two are here because they are the only practices in the review with a named,
// documented mechanism of serious harm. Both risks are avoidable and conditional on
// how the practice is done, which is why the copy states the safe method rather than
// telling people not to do it.
export const PRACTICE_SAFETY = {
  nasalWater: {
    id: "nasalWater",
    title: "Nasal rinsing: the water matters more than the rinse.",
    body: "Use only distilled or sterile water, or tap water that has been boiled and cooled. Filtered water — including a Brita or similar jug filter — does not qualify. Untreated tap water can carry Naegleria fowleri and Acanthamoeba; nasal exposure has caused primary amebic meningoencephalitis, which is almost always fatal, and the CDC and FDA document deaths in the US from exactly this route. Rinse devices must also be cleaned and air-dried. If you are immunocompromised, speak to a clinician before starting.",
  },
  oilAspiration: {
    id: "oilAspiration",
    title: "Never swallow or inhale the oil.",
    // CORRECTED in source verification. This previously said the published cases
    // "concentrate in people with swallowing or aspiration difficulty" — which the case
    // literature does not support and which quietly told an ordinarily healthy reader
    // that the reports were about someone else. Kuroyama 2015's two cases were a
    // 66-year-old former smoker (nasal use, 8 months, "often aspirated the oil") and a
    // 38-year-old woman with no relevant history (oral use, 6 months); neither had a
    // documented swallowing problem. Only the Monaldi 2018 pair (both with tongue
    // carcinoma) fit that description. Do not reinstate the qualifier.
    body: "Oil that reaches the lungs can cause exogenous lipoid pneumonia. This is documented in peer-reviewed case reports for both oil pulling (from aspiration while swishing) and oil-based nasya, which is named specifically as a risk factor; some cases have been serious, needing steroid treatment and lung lavage. The published cases are few, and exposure was typically months of daily use — but they include otherwise healthy people with no swallowing problem, who simply aspirated a little oil each time. Difficulty swallowing raises the risk rather than being required for it. Spit the oil out, never swallow it, and avoid the practice entirely if you have swallowing difficulty, a weak gag reflex, reflux, or any other reason you are prone to aspiration.",
  },
  // Scoped rather than alarmist, per the follow-up review: the one lethal mechanism is
  // stated absolutely, the general caution is light, and the condition list is marked
  // as expert opinion because that is all it is.
  breathwork: {
    id: "breathwork",
    title: "Fast breathing and water are the dangerous combination.",
    body: [
      "**Never** combine fast or forceful breathing, or breath-holding, with going underwater — pools and bathtubs included. Hyperventilating lowers carbon dioxide, which delays the urge to breathe while oxygen keeps falling, and people have drowned this way without ever feeling short of breath. This is the one part of this note that is not a matter of degree.",
      "Otherwise: fast or forceful breathing (kapalabhati, bhastrika) and breath-holds can make you light-headed or faint. Practise sitting or lying down, never while driving, and build up gradually. Slow breathing is not the risky kind — the review that compared them found adverse events more often with fast techniques than slow.",
      "Check with a clinician first if you are pregnant, or have uncontrolled high blood pressure, heart disease, glaucoma, epilepsy, a hernia, recent abdominal or chest surgery, or panic disorder. These lists come from experienced teachers and physiological reasoning rather than from trials, so treat them as sensible caution rather than measured risk.",
    ],
  },
  coldExposure: {
    id: "coldExposure",
    title: "Two specific cautions, not a general warning.",
    body: [
      "**Cold shock is a drowning and cardiac hazard, not just discomfort.** Immersion triggers an involuntary gasp and uncontrollable fast breathing within about thirty seconds, and blood pressure rises sharply. Never enter cold open water alone. If you have heart disease or high blood pressure, get medical clearance first. A cold shower carries far less of this risk than whole-body immersion.",
      "**Do not do cold immersion in the hours after resistance training if you are training for strength or muscle.** This is well established: post-exercise cold blunts the long-term adaptation you did the training for.",
    ],
  },
};

// Safety points. The first three are the highest-signal risks.
export const SAFETY = {
  intro: "Read it before taking anything.",
  points: [
    {
      head: "Contamination is the biggest real risk.",
      // VERIFIED against the primary source. Saper 2008, JAMA: 193 Ayurvedic medicines
      // bought from US and Indian manufacturers' websites, 20.7% (95% CI 15.2-27.1)
      // containing detectable lead, mercury or arsenic; rasa shastra 40.6% vs 17.1% for
      // the rest. "Around one in five" is exact, and sits at the conservative end of
      // what later summaries report. The pregnant-women line is CDC MMWR 2012 (61:641),
      // six cases in New York City, products containing up to 2.4% lead.
      body: "When a US study bought 193 Ayurvedic products online and tested them, around one in five contained detectable lead, mercury or arsenic. The risk is concentrated in mineral-based preparations (rasa shastra or bhasma), where metals are added deliberately — more than twice the rate of the rest — and documented poisonings exist, including in pregnant women. Avoid mineral or metal-based products entirely, and prefer single-herb products from makers who publish third-party heavy-metal testing.",
    },
    {
      head: "Two common herbs can affect the liver.",
      body: "Ashwagandha and turmeric each carry a documented, if uncommon, signal for liver injury, sometimes serious. Stop and seek care for jaundice (yellowing skin or eyes), dark urine, persistent nausea, or unusual fatigue. People with existing liver conditions should be especially cautious.",
    },
    {
      head: "Herbs interact with medications.",
      body: "The clearest concerns: turmeric with blood thinners; ashwagandha with thyroid medication, sedatives, and blood-sugar, blood-pressure and immune-suppressing drugs. If you take prescription medication, treat any herb as something to clear with a pharmacist or doctor first.",
    },
    {
      head: "Regulation guarantees less than you think.",
      body: "Whether something is sold as a supplement, a traditional herbal medicine, or under AYUSH rules, that status mostly certifies manufacturing process and sometimes long traditional use. It does not guarantee the product works, is free of contaminants, or matches its label. “Traditional” and “regulated” are not the same as “proven safe.”",
    },
    {
      head: PRACTICE_SAFETY.nasalWater.title,
      body: PRACTICE_SAFETY.nasalWater.body,
    },
    {
      head: PRACTICE_SAFETY.oilAspiration.title,
      body: PRACTICE_SAFETY.oilAspiration.body,
    },
    {
      head: PRACTICE_SAFETY.breathwork.title,
      body: PRACTICE_SAFETY.breathwork.body,
    },
    {
      head: PRACTICE_SAFETY.coldExposure.title,
      body: PRACTICE_SAFETY.coldExposure.body,
    },
    {
      head: "Some people should be extra careful.",
      body: "If you are pregnant or breastfeeding, have a liver or kidney condition, or take regular medication, treat everything here as educational and check with a professional before acting.",
    },
  ],
};

// Non-herbal practices, rated. Source: the 2026 evidence review of 15 non-herbal
// Ayurvedic practices, using the same four-state taxonomy as the herb library.
//
// SHAPE: `ratings` is an array of { badge, scope } rather than a single badge, because
// almost every practice needs two. The evidence tests the general modality; Ayurveda
// prescribes it by constitution; those are different claims and the review found the
// second one untested nearly everywhere. Scope wording is per-record — most pairs are
// general-vs-dosha, but oil pulling is rinse-vs-detox and nasya has no split at all.
//
// IMPORTANT (hard constraint #6): a "Supported" rating here says the practice holds up
// as a general practice. It says nothing about whether dosha typing is accurate — there
// is no validated ground truth to test that against. The two claims are kept apart in
// every line below, and no record may be reworded in a way that merges them.
//
// The review splits yoga, pranayama and spices into sub-practices with materially
// different evidence, so those are rated separately rather than averaged — 16 records
// for the review's 15 numbered practices.
// REVIEW POLICY (D7). The unit of update is one practice's badge, not the taxonomy —
// per Akl et al. 2017 on living guideline recommendations. Every record carries a
// `lastReviewed` stamp; anything older than STALE_AFTER_MONTHS is surfaced as possibly
// out of date rather than silently presented as current.
//
// Promote (e.g. Traditional -> Promising -> Supported) on either: a new synthesis
// raising GRADE certainty by >= 1 level for a clinically meaningful benefit, or >= 2 new
// adequately powered independent RCTs concordant with existing positive data.
// Demote on any of: a higher-quality synthesis lowering certainty or reversing
// direction; a credible new safety signal (case series, regulatory action, or
// professional-body warning); or evidence the positive base was driven by a single
// funder or country and fails a sensitivity check.
// The policy itself now lives in lib/review.js — it governs the guidance advice lines
// too, so it is no longer a property of this file. Imported (not just re-exported) so
// REVIEW_POLICY is also a local binding for the record stamping below.
export { REVIEW_POLICY, isStale };

// PROVENANCE FLAG (D3). Kept deliberately separate from the badge: following Cochrane,
// conflict of interest and funding concentration do not belong inside a quality score,
// because they are not a mechanism of bias in an individual trial — they are a reason to
// hold the whole body of evidence more loosely. The trigger is the empirically
// established pattern "small + single funder or country + uniformly positive".
//
// The wording must say lower-confidence, never false. It flags bias RISK.
export const PROVENANCE_NOTE = {
  label: "Concentrated evidence",
  body: "What evidence exists here comes from a small number of trials that tend to share a funder, a country, or an institution, and to report positive results. Where that pattern has been studied, it is associated with more favourable findings than independent research produces. So hold this rating more loosely than the badge alone suggests. It means the evidence is concentrated, not that the practice does not work.",
};

const RAW_PRACTICES = [
  {
    id: "yoga-gentle",
    name: "Yoga — gentle and restorative",
    ratings: [
      { badge: "Supported", scope: "as movement" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "slow, grounding postures settle the anxious, dry, mobile Vata type, and cool an overheated Pitta.",
    evidence:
      "a 2022 Cochrane review (21 trials, 2,223 people) found improvements in back function and pain against no exercise that it described as small and **clinically unimportant**, and probably little or no difference against other back-focused exercise. Every trial was unblinded and at high risk of bias. The same review found yoga raised the risk of adverse events at six to twelve months, mostly more back pain. Across nine observational studies of 9,129 practitioners, about 23% reported an adverse event during a class and roughly 2% a serious one. Nothing tests whether matching gentle yoga to a Vata constitution beats simply offering it to anyone anxious or stiff.",
  },
  {
    id: "yoga-vigorous",
    name: "Yoga — vigorous, vinyasa or power",
    ratings: [
      { badge: "Supported", scope: "as exercise" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "heating, dynamic practice lifts the heavy, sluggish Kapha type.",
    evidence:
      "it works as aerobic exercise, with the fitness and metabolic benefits that implies. No trial tests prescribing it for a Kapha type specifically. Power yoga carries the highest injury rate of any style in the one survey that compared them — around 1.50 injuries per 1,000 practice hours against 0.60 for yoga overall, self-reported, and imprecise enough that the ranking is a signal rather than a measurement. Inversions are cautioned in glaucoma, and forceful practice in anyone with compromised bone.",
  },
  {
    id: "pranayama-slow",
    name: "Pranayama — slow breathing",
    ratings: [
      { badge: "Supported", scope: "as general practice" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "regulating the breath steadies prana and calms Vata and Pitta.",
    evidence:
      // The range spans the two syntheses this record rests on: Chaddha 2019 (17 RCTs,
      // -5.62 / -2.97) and Cheng (13 RCTs, 1,097 patients, -7.68 / -4.02). It read "6 to
      // 8" systolic, which rounded the floor up past the more conservative of the two.
      "the best-supported practice in this list. Meta-analyses find real reductions in blood pressure — roughly 5 to 8 mmHg systolic and 3 to 4 mmHg diastolic — but note the population: these trials were in people who already had raised or high blood pressure, so the same drop should not be assumed for someone whose blood pressure is normal. Heterogeneity is high and many trials are of low methodological quality. Adverse events are reported more often with fast breathing than slow. The autonomic effect is general; the dosha assignment is not what was tested.",
    safetyId: "breathwork",
  },
  {
    id: "pranayama-nadi",
    name: "Pranayama — alternate-nostril (nadi shodhana)",
    ratings: [
      { badge: "Promising", scope: "as general practice" },
      { badge: "Traditional", scope: "as channel-balancing" },
    ],
    tradition: "alternating the nostrils balances the ida and pingala channels, and through them the doshas.",
    evidence:
      "a review of 44 trials reports autonomic and cognitive effects, but ten were at high risk of bias, and the set is dominated by small, short, single-institution studies in healthy volunteers. The channel-balancing rationale itself has never been tested. Forceful breath-holding is cautioned in uncontrolled hypertension, pregnancy, and some cardiac and eye conditions.",
    provenance: true,
  },
  {
    id: "meditation",
    name: "Meditation and mindfulness",
    ratings: [
      { badge: "Supported", scope: "as general practice" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "prescribed to settle the mind, particularly for Vata and Pitta agitation.",
    evidence:
      "a 47-trial synthesis (3,515 participants) found moderate evidence for improved anxiety and depression and **low** evidence for pain, with small effect sizes measured against nonspecific active controls, shrinking further against real comparisons like exercise or CBT. It is not harm-free: across 83 studies and 6,703 participants, about 8% reported an adverse event — though that figure spans 3.7% in experimental studies and 33.2% in observational ones, so the true rate is genuinely unsettled. No study tests selecting a meditation style by dosha.",
  },
  {
    id: "abhyanga",
    name: "Abhyanga (warm oil self-massage)",
    ratings: [
      { badge: "Promising", scope: "for relaxation" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "the signature Vata practice — daily warm-oil self-massage grounds and lubricates the dry, mobile type.",
    evidence:
      "thin. Small pilot studies and one manufacturer-affiliated conference poster (49 completers) report lower stress and better sleep, on subjective outcomes. Massage in general has a stronger base, but none of it is abhyanga-specific. Safe topically; take care over broken skin or acute inflammation, and watch for sesame sensitivity.",
    provenance: true,
  },
  {
    id: "nasal-irrigation",
    name: "Saline nasal irrigation (neti)",
    // Corrected from Supported after checking the primary source: the Cochrane review
    // rests on two trials, 116 adults, both at high risk of bias, rated low-quality.
    // That is a Promising signal, not "meets current evidence".
    ratings: [
      { badge: "Promising", scope: "as a sinus rinse" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "jala neti clears Kapha from the head and sinuses.",
    evidence:
      "saline rinsing is well tolerated and widely recommended for chronic sinus symptoms, but the Cochrane review rests on two trials with 116 adults between them, both judged at high risk of bias and rated low-quality. Hypertonic saline appears to beat isotonic for nasal symptoms. So: a reasonable thing to try for sinuses on thin evidence; as a Kapha intervention, untested. The water you use is the part that genuinely matters — see the note below.",
    safetyId: "nasalWater",
  },
  {
    id: "nasya",
    name: "Nasya (oil-based nasal instillation)",
    ratings: [{ badge: "Contested", scope: "all uses" }],
    tradition: "medicated oils such as Anu taila are instilled into the nostrils to settle Vata and Kapha disorders of the head and neck.",
    evidence:
      "the weakest entry in this library, and the reason it is rated rather than recommended. Independent reviews call the evidence extremely limited and of very low certainty: no blinded, sham-controlled, adequately powered trial exists for any indication, blinding is not reported in any trial, and the largest synthesis is a non-peer-reviewed preprint authored and funded by a government Ayurveda body. Because no trial compares nasya against placebo, the dosha-specific claim cannot be separated from placebo effect. Against that, oil in the nose is a documented cause of lipoid pneumonia — and the efficacy trials did essentially no adverse-event monitoring, so how often it happens in practice is simply unknown. Near-zero evidence of benefit alongside a named mechanism of harm is what Contested means.",
    safetyId: "oilAspiration",
    provenance: true,
  },
  {
    id: "tongue-scraping",
    name: "Tongue scraping",
    ratings: [
      { badge: "Promising", scope: "for bad breath" },
      { badge: "Traditional", scope: "as ama removal" },
    ],
    tradition: "scraping the tongue each morning removes ama, the residue of incomplete digestion.",
    evidence:
      "a Cochrane review of two trials with 40 people between them described its own finding as **weak and unreliable evidence** of a small but statistically significant reduction in the sulphur compounds behind bad breath, versus a toothbrush; the effect was short-lived and the review was later withdrawn rather than updated. Mechanical tongue cleaning is a harmless habit that may help breath a little; the ama framing is traditional. Occasional minor tongue trauma from prolonged use of a single scraper.",
  },
  {
    id: "oil-pulling",
    name: "Oil pulling",
    // Demoted from Promising. First firing of the demotion policy: the best synthesis
    // is GRADE very-low certainty for benefit over chlorhexidine OR standard hygiene, a
    // second meta-analysis found no robust difference on plaque and gingival indices,
    // and the ADA states it does not recommend the practice. A 3-dot Promising meter
    // claimed more than that supports.
    ratings: [
      { badge: "Traditional", scope: "as an oral rinse" },
      { badge: "Contested", scope: "as bodily detox" },
    ],
    tradition: "swishing sesame or coconut oil cleans the mouth, firms the gums, and draws toxins from the body.",
    evidence:
      "the best review of 21 trials rates the certainty of any benefit over chlorhexidine or an ordinary hygiene routine as **very low**, with high risk of bias in every trial; a second meta-analysis found reduced salivary bacterial counts but no robust difference in plaque or gum inflammation. Trials are short and mostly in people without oral disease, and evidence that it adds anything *on top of* normal brushing is essentially absent. The American Dental Association states that it does not recommend oil pulling as a dental hygiene practice. The systemic detoxification claim has no support at all. **The main risk is displacement: this must never replace brushing, flossing and fluoride.** Aspirating the oil can also cause lipoid pneumonia — see the note below.",
    safetyId: "oilAspiration",
  },
  {
    id: "cooked-food",
    name: "Warm cooked food over raw",
    ratings: [{ badge: "Traditional", scope: "as a dosha prescription" }],
    tradition: "warm, cooked food protects agni, the digestive fire; Vata and Kapha are steered away from raw, while Pitta tolerates more of it.",
    evidence:
      "cooking genuinely changes food — it raises the availability of lycopene and beta-carotene, lowers heat-sensitive vitamin C and folate, and softens insoluble fibre in ways that can ease some digestive conditions. But that is food chemistry, not clinical outcomes: no trial shows warm cooked food as a dietary pattern improving hard health outcomes, and nothing tests matching cooked-versus-raw to constitution. Mainstream advice is a mix of both.",
  },
  {
    id: "meal-timing",
    name: "Meal regularity and timing",
    ratings: [
      { badge: "Promising", scope: "as general practice" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "eat at regular hours with the largest meal at midday, when agni peaks.",
    evidence:
      // CORRECTED in source verification, twice over. The 3-5% figure is real but is
      // reported for adults with overweight or obesity — stating it unscoped repeated
      // the exact error the blood-pressure line was already fixed for. And "apparently
      // independent of calorie restriction" was not supportable: the same summary says
      // calorie restriction combined with TRE may enhance weight loss, and that some
      // well-designed RCTs find no advantage over standard dietary advice at all.
      "the closest thing here to independent convergence. Time-restricted-eating reviews report clinically meaningful weight loss of roughly 3–5% with improved fasting glucose and blood lipids — but in adults with overweight or obesity, which is who was studied; whether it does anything for someone at a healthy weight is a different question, and unanswered. Some well-designed trials find no advantage over ordinary dietary advice, and it is unsettled how much of the effect is the eating window rather than simply eating less. Trials are short and adherence varies, so long-term outcomes are unproven. The midday-meal intuition lines up with the research; the dosha framing is not what was studied. Caution with medicated diabetes, a history of disordered eating, or pregnancy.",
  },
  {
    id: "ginger",
    name: "Ginger",
    ratings: [
      { badge: "Supported", scope: "for nausea" },
      { badge: "Traditional", scope: "as an agni kindler" },
    ],
    tradition: "the classical warming spice, said to kindle digestive fire.",
    evidence:
      "the best-evidenced single item in this library after slow breathing. A review of 12 trials in 1,278 pregnant women found ginger significantly improved **nausea** against placebo — though it did not significantly reduce the number of vomiting episodes, a distinction usually lost in summary. Doses below about 1.5 g/day were favoured. What is supported is the anti-nausea effect, not the classification of ginger as heating or its role in an agni model. May aggravate reflux, and interacts with anticoagulants at high supplement doses.",
  },
  {
    id: "minor-spices",
    name: "Cumin, fennel, coriander and cardamom",
    ratings: [{ badge: "Traditional", scope: "culinary use" }],
    tradition: "carminative and digestive spices, classed as heating or cooling and matched to the dosha being cooked for.",
    evidence:
      // CORRECTED in source verification. The old line ended "What evidence exists is
      // often at supplement rather than culinary doses" — which contradicts the cited
      // review, whose whole selection criterion was doses "that could reasonably be
      // achieved in the diet" (1-6 g for single spices). It also flattened cardamom into
      // "comparatively little" when 5 of its 6 inflammatory-marker studies were positive.
      // An error against the tradition is still an error.
      "a scoping review of 142 studies on culinary-dose herbs and spices — doses reachable in ordinary cooking — found cinnamon, fenugreek and ginger carried most of the support, mainly for blood-sugar control. Cardamom has a signal for inflammatory markers, though only in people who were already ill; coriander, cumin and fennel are barely studied at all. A quarter of the studies were rated low quality, and excluding them made fenugreek's benefit for blood lipids disappear. Culinary amounts are safe; the heating and cooling classification is a traditional scheme, not a measured property.",
    provenance: true,
  },
  {
    id: "heat",
    name: "Heat exposure (sauna, warmth)",
    ratings: [
      { badge: "Promising", scope: "as general practice" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "warmth settles cold, dry Vata; dry heat also moves stagnant Kapha.",
    evidence:
      "a Finnish cohort of 2,315 men followed for two decades found frequent sauna use associated with substantially lower cardiovascular and all-cause mortality, with a dose-response pattern. That is observational, in one population, and a randomised trial of eight weeks of sauna in coronary patients found no improvement in vascular function — so association is not yet causation. Nothing tests warmth as a Vata-specific therapy. Watch for dehydration and orthostatic hypotension; caution in unstable cardiovascular disease and pregnancy, and never combine with alcohol.",
  },
  {
    id: "cold",
    name: "Cold exposure (cold water, cooling)",
    // Scope narrowed from "as general practice": the signal is specifically a
    // short-lived stress reduction, from few trials in a non-diverse population. The
    // badge stays Promising — there is a real signal — but the scope should not imply
    // general wellbeing benefit.
    ratings: [
      { badge: "Promising", scope: "for short-term stress" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "cooling practices pacify hot, sharp Pitta.",
    evidence:
      "a 2025 review (11 studies, 3,177 participants) found reduced stress twelve hours after cold-water immersion, alongside an inflammation spike immediately after, with inconsistent effects on sleep and quality of life and no consistent mood or immune benefit. Few randomised trials, small samples, mostly single sessions, limited female representation. Two specific downsides matter more than the tradition mentions: cold immersion in the hours after resistance training blunts long-term muscle and strength gains, and the cold-shock response is a genuine drowning and cardiac hazard rather than a discomfort to push through.",
    safetyId: "coldExposure",
  },

  // ---------------------------------------------------------------------------
  // The everyday basics the Full Reading recommends.
  //
  // These six were added when the result-page notes were simplified. The advice lines
  // for them used to carry their own study counts, effect sizes and GRADE wording, which
  // made the reading dense and put the app's most detailed evidence writing on the
  // screen least suited to it. The notes are now plain; the numbers live here, which is
  // what the education layer is for. **Nothing was dropped — it was moved.** If you
  // simplify a note further, check the detail still has a home in this list first.
  //
  // They are also, collectively, the honest core of the advice: the items with the
  // strongest evidence in the whole app are the ones with the weakest connection to
  // Ayurveda. Section 07 is the place that says so.
  //
  // NOTE ON VERIFICATION: unlike the 16 records above, these figures came from the 2026
  // research reports and have NOT been primary-source checked — see
  // PRACTICE-EVIDENCE-REVIEW.md §4. They were already user-facing before this move.
  // ---------------------------------------------------------------------------
  {
    id: "morning-light",
    name: "Morning daylight",
    ratings: [
      { badge: "Supported", scope: "for circadian timing" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "rising near sunrise (brahma muhurta) suits Vata and Kapha, and the day's rhythm follows the sun's.",
    evidence:
      "that morning light advances the body clock is among the most reliable findings in chronobiology, and it supports earlier, more regular sleep. Dose matters less than people assume: about half an hour in the morning produced roughly 75% of the phase shift a two-hour exposure did. What is established is the effect of light on circadian timing — not the classical hour, and not matching an early start to a constitution. People with bipolar disorder should treat bright-light timing as something to raise with a clinician, since it can affect mood episodes.",
  },
  {
    id: "step-count",
    name: "Daily walking (step count)",
    ratings: [
      { badge: "Supported", scope: "for mortality risk" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "daily movement counters heavy, static Kapha; it is the classical prescription for that type above any other.",
    evidence:
      "a 2025 dose-response review across 14 studies found about 7,000 steps a day associated with 47% lower all-cause mortality than 2,000, at moderate certainty. The shape of the curve matters as much as the number: benefit largely plateaus around 7,000 rather than climbing to 10,000, so the familiar target is not a threshold. This is cohort data — an association, not proof that adding steps causes the drop. That movement matters more for a Kapha type than for anyone else is the traditional claim.",
  },
  {
    id: "strength-training",
    name: "Resistance and strength training",
    ratings: [
      { badge: "Supported", scope: "for mortality risk" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "not a classical category. Ayurveda prescribes vigorous movement for Kapha, without distinguishing the kind.",
    evidence:
      "any resistance training is associated with about 15% lower all-cause mortality across 10 studies, rising to roughly 27% at about an hour a week — and falling away beyond that, so more is not better. Cohort data rather than trials. The dose finding is the useful part: an hour a week is a far smaller commitment than most people assume they need. Nothing tests prescribing it by constitution.",
  },
  {
    id: "fibre",
    name: "Dietary fibre",
    ratings: [
      { badge: "Supported", scope: "for mortality risk" },
      { badge: "Contested", scope: "as something Vata should limit" },
    ],
    tradition: "raw and fibrous food is held to aggravate light, dry, mobile Vata, and is steered away from for that type.",
    evidence:
      "higher fibre intake is associated with 15–30% lower all-cause and cardiovascular mortality across 185 prospective studies, with the greatest benefit between 25 and 29 grams a day. The mortality findings are observational, though the pattern is unusually consistent. This is one of only two places where the evidence contradicts the tradition rather than simply not testing it: steering a whole constitutional type away from fibre runs against it. Cooking vegetables to make them easier to digest keeps the fibre, which is where the classical instinct and the evidence can both be honoured.",
  },
  {
    id: "ultra-processed",
    name: "Ultra-processed food",
    ratings: [
      { badge: "Supported", scope: "as something to limit" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "stale, over-refined and long-stored food is classed as tamasic and dulling, and is discouraged for everyone.",
    evidence:
      "higher intake is consistently linked to worse outcomes across 45 pooled meta-analyses covering roughly 10 million people, strongest for all-cause and cardiovascular mortality. GRADE rates that evidence low to very low, because all of it is observational and none randomised — what carries it is the consistency of the direction, not trial proof. The classical category is not the same category: tamasic food is defined by staleness and heaviness, not by industrial processing, and the overlap is partial. Nothing tests the link to any particular dosha.",
  },
  {
    id: "sitting",
    name: "Prolonged sitting",
    ratings: [
      { badge: "Supported", scope: "as something to break up" },
      { badge: "Traditional", scope: "as a dosha prescription" },
    ],
    tradition: "long stillness compounds Kapha's tendency to settle and stagnate.",
    evidence:
      "pooled data on over a million adults found high sitting time associated with raised mortality — but that roughly 60 to 75 minutes a day of moderate activity appears to eliminate the increased risk. That reframes the finding: the problem is better described as too little movement than as too much sitting, and \"sit less\" is the weaker half of the message. Observational. The Kapha framing is traditional.",
  },
];

// Every practice carries a review stamp. They share one date because they were all
// rated in the same pass; a record can override it with its own `lastReviewed` when it
// is re-reviewed on its own, which is the whole point of a per-badge update unit.
export const PRACTICE_EVIDENCE = RAW_PRACTICES.map((p) => ({
  lastReviewed: REVIEW_POLICY.defaultReviewed,
  ...p,
}));

// Sections in reading order. Each is rendered by the education view.
// Section 01 is an added primer on the tradition's own basic principles — the rest
// are the six spec sections, which hold those claims against the evidence.
export const EDU_SECTIONS = [
  {
    id: "basics",
    kicker: "01",
    title: "The Basics of Ayurveda",
    type: "prose",
    paragraphs: [
      "Ayurveda — literally \"the knowledge of life\" — is India's classical system of medicine and daily living. Its central idea is simple: people are different, those differences follow patterns, and health comes from living in a way that suits your own pattern rather than a general rule.",
      "**Everything is made of five elements.** The tradition describes the physical world through the *pancha mahabhuta*: ether (space), air, fire, water and earth. These are not chemistry, they are qualities — ether is openness, air is movement, fire is transformation, water is cohesion, earth is structure. You carry all five, in your own proportion.",
      "**The elements pair into three doshas.** The five elements combine into three functional principles that govern how your body and mind actually behave. **Vata** (air and ether) governs movement — breath, circulation, nerve impulse, thought. **Pitta** (fire and water) governs transformation — digestion, metabolism, body heat, perception. **Kapha** (earth and water) governs structure and cohesion — tissue, stability, lubrication, endurance. Everyone has all three; the proportion is what differs.",
      "**Your constitution is prakriti; your current state is vikriti.** Prakriti is the mix you were born with — the tradition treats it as stable for life, and it is what the Core Reading estimates. Vikriti is how you are right now, which drifts with season, stress, sleep, age and diet. The gap between the two is what Ayurveda calls imbalance, and it is what the Full Reading looks at. Most people are a blend of two doshas rather than a pure type.",
      "**Like increases like; opposites balance.** This is the tradition's core working rule. Qualities accumulate — cold, dry, windy conditions raise Vata; heat and intensity raise Pitta; heavy, damp, static conditions raise Kapha. So the classical remedy for an excess is its opposite: warmth and routine for elevated Vata, cooling and rest for Pitta, stimulation and lightness for Kapha. Food, daily rhythm, season and activity are the main levers, which is also why most of the guidance here is about how you live rather than what you take.",
      "**Digestion sits at the centre.** The tradition places unusual weight on *agni*, digestive fire, and on *ama*, the residue left when digestion is poor. Much classical advice — eat at regular times, favour warm cooked food, don't overload a weak appetite — follows from that emphasis.",
      "That is the framework this app uses. What follows is the honest part: which of these ideas hold up when tested, which are simply untested, and where the tradition and the evidence genuinely disagree.",
    ],
  },
  {
    id: "two-systems",
    kicker: "02",
    title: "The Two Systems",
    type: "prose",
    paragraphs: [
      "Ayurveda is one of the world's oldest systems of medicine, developed across the Indian subcontinent over roughly three thousand years. It treats health as balance: you have a constitution built from three functional principles, the doshas, and wellbeing comes from keeping that constitution in balance through food, routine, season and lifestyle. It is a whole-system tradition, making claims about the entire person at once rather than isolating single causes.",
      "Modern evidence-based medicine works differently. It isolates variables, tests them in controlled trials, and treats a claim as provisional until evidence supports it. Its strength is telling whether something actually works, independent of how long it has been believed. Its limit is that it struggles to test whole-system, individualized traditions on their own terms.",
      "These are not the same way of knowing, and pretending they are helps no one. But they are not enemies either, and they overlap more than either side tends to admit. Both take individual variation seriously. Both recognize that food, sleep, routine and stress shape health. And a handful of specific Ayurvedic interventions do hold up when tested, while many others do not.",
      "The honest way to hold both is this. Treat the tradition as a rich source of ideas about living well, and a coherent language for patterns people really do experience. Treat the evidence as the check on which of those ideas actually do what they claim. Where they agree, act with some confidence. Where the tradition is untested, enjoy it as tradition, not as proof. And where safety is concerned, evidence always wins, without exception.",
      "This module keeps those three threads visible throughout: what the tradition says, what the evidence says, and where the honest gaps are.",
    ],
  },
  {
    id: "evidence-library",
    kicker: "03",
    title: "The Evidence Library",
    type: "library",
  },
  {
    id: "practices",
    kicker: "04",
    title: "The Practices, Rated",
    type: "practices",
  },
  {
    id: "safety",
    kicker: "05",
    title: "Safety",
    type: "safety",
  },
  {
    id: "is-typing-real",
    kicker: "06",
    title: "Is Dosha Typing Real?",
    type: "prose",
    paragraphs: [
      "Short answer: as a way of describing patterns people recognize in themselves, it is useful. As validated biology, it is not, at least not yet. Here is the honest state of it.",
      "**Even trained practitioners often disagree.** When researchers have had several experienced Ayurvedic doctors assess the same people, their agreement on constitution has been only fair, better than chance but not by much. If the same person can be typed differently by different experts, the type is not a precise measurement.",
      "**There is no proven biological basis.** A research thread sometimes called Ayurgenomics has tried to link constitution to genetics. A few small studies report patterns, but they are single-group, rarely replicated by independent teams, and hard to separate from ordinary differences in ancestry and background. The objective markers that do replicate, like cholesterol or blood sugar, have not lined up neatly with the doshas.",
      "**So what is a dosha reading good for?** It is a structured, coherent language for tendencies you really do have, in energy, digestion, temperament, sleep. Many people find that language clarifying for thinking about how they live. That is real value, and it does not require the doshas to be biological facts. The trouble only starts when a reading is sold as a diagnosis, which is exactly what this app does not do.",
      "This is why nothing here claims to be accurate in a medical sense, and why the deeper tiers are described as more personal and more thorough, never as more true.",
    ],
  },
  {
    // Written for this build, at the owner's prompting, after a pattern became visible in
    // section 04: nearly every Supported rating lands on Kapha advice. This section says
    // why, without letting "research studied one direction" slide into "so the tradition
    // is right" — the last paragraph is the load-bearing one and must not be softened.
    id: "what-gets-studied",
    kicker: "07",
    title: "What Research Chose to Study",
    type: "prose",
    paragraphs: [
      "Read the ratings in this library and a pattern shows up. The strongest evidence — walking, strength training, morning daylight, fibre, sitting less — sits almost entirely on the advice Ayurveda gives to **Kapha**: move more, eat lighter, start earlier, do not settle. The advice given to Vata and Pitta is mostly rated Traditional. That is not because the classical texts were more careful about one type than another. It is because of what modern research decided to measure.",
      "**Health research has mostly studied one kind of change.** The interventions with the biggest evidence bases move people toward being more active, lighter, more regular and calmer. The outcomes that count as success — mortality, blood pressure, metabolic markers — reward exactly that direction. In dosha terms, the entire apparatus is pointed at pacifying Kapha, and to a degree at regularising Vata. So when we rate Kapha advice against the evidence, we are checking it against a body of research built to answer that question. When we rate Vata or Pitta advice, we are checking it against research that never really asked.",
      "**Ayurveda's question was a different one.** It did not propose a single ideal state that everyone should converge on. It proposed that people come with different tendencies — fast and mobile, hot and driven, steady and slow — and that the task is finding a workable life *for that tendency*, not correcting everyone toward the same calm, regular, moderate middle. Whether or not the three-dosha model is the right way to carve people up, that question is a real one, and it is largely not the question the research literature has been asking.",
      "**This is not a defence of the tradition, and it must not be read as one.** That science has concentrated on one direction does not make the untested claims true. An absence of research is an absence of evidence, not hidden support — and every Traditional rating in this library means exactly what it says: nobody has checked. The honest position is narrower and less satisfying than either side would like. Where the evidence exists, we report it. Where it does not, we say so. And it is worth knowing that the map has been surveyed unevenly, because that shapes which parts of it look solid.",
    ],
  },
  {
    id: "one-conversation",
    kicker: "08",
    title: "One Long Conversation",
    type: "prose",
    paragraphs: [
      "It helps to see these two systems not as rivals but as the same human project at different points in time. Ayurveda was an early, careful attempt to answer a question we still ask: how do we live well and stay well? It gathered centuries of observation into a working model, long before the tools existed to test it.",
      "Modern medicine is our current attempt at the same question, with sharper tools: controlled trials, biochemistry, statistics. It can confirm or overturn old ideas in ways the original observers never could.",
      "Neither is the final word. Medicine will keep revising itself too, and much of what feels settled today will look partial in a century. The honest stance is not to pick a side but to keep the conversation going: carry the useful observations of the past forward, test them with the best tools we have, let go of what fails, and stay open to reintroducing what once seemed wrong when better evidence arrives. Ideas have been vindicated before, and discarded before, and both are how knowledge is meant to work.",
      "Seen this way, a system like Ayurveda is not a relic or a rulebook. It is a set of hypotheses from people who were paying attention, handed forward for us to check.",
    ],
  },
  {
    id: "using-this-well",
    kicker: "09",
    title: "Using This Well",
    type: "prose",
    paragraphs: [
      "**Treat it as a lens, not a verdict.** A reading is a way to notice patterns and think about how you live. Take what is useful, leave what is not, and hold it lightly.",
      "**Experiment where it is safe.** Food, routine, warmth, rest, movement are low-risk to adjust and easy to reverse. Try them, keep what helps.",
      "**Be cautious with anything you take.** Herbs and supplements are where the real risks sit: contamination, liver effects, drug interactions. Treat them as education here, and clear them with a pharmacist or doctor before use.",
      "**Know when to step outside this.** Persistent or worsening symptoms, anything acute, pregnancy, existing conditions, or regular medication all call for a professional, not a quiz. This app is a starting point for curiosity and self-reflection, not a substitute for care.",
    ],
  },
];

export const EDU_INTRO = {
  title: "Tradition, Held Against the Evidence",
  paragraphs: [
    "The traditional Ayurvedic system, set against what modern evidence can and cannot confirm about it. It is free to read, with no account and no reading required, and it always will be — the safety section especially.",
    "Every section keeps three things visible: what the tradition says, what the evidence says, and where the honest gaps are.",
  ],
};
