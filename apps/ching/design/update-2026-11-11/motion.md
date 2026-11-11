# Motion spec: cast, lines, reveal

All values are approved on the canvas (cast animation board and "Cast → Reading", 10 to 11 November 2026). Easing is `--ease-ritual` = `cubic-bezier(.22,.61,.36,1)` unless stated.

## Quick Cast sequence (automatic)
Six tosses, then the reveal. Per toss, in order:

| Step | Duration | What happens |
| --- | --- | --- |
| toss | 1000ms + 160ms | Three coins rise and fall (below). Progress row updates to "Line n of 6". |
| land | 400ms | Coins rest flat. Labels "Heads · 3" / "Tails · 2" fade in at landing. |
| count | 400ms | Total, sum ("3 + 3 + 2 = 8"), line name and description appear. |
| draw | 500ms | The line drops into its slot (below). |
| hold | 250ms | Nothing moves. |

After the sixth: 1400ms pause ("Your hexagram" eyebrow fades in), then the reveal. First toss starts 800ms after mount.

Deep Cast is user-driven: the user presses "toss", lands, answers "What do these coins add up to?" (6 / 7 / 8 / 9), sees feedback, then tosses again.

## Coins
- Each coin: 880ms, linear timing on a precomputed parabola. Coin k of toss i uses variant `h = (i*2 + k*5 + 1) % 3`:
  - h0: peak 120px, 3 full turns (rotateX 1080°)
  - h1: peak 150px, 4 full turns (1440°)
  - h2: peak 95px, 2 full turns (720°)
- Whole turns only, so the face shown on landing is the face that was cast. No bounce or settle after landing.
- Take-off delay for coin k of toss i: `ORD[i % 6][k] * 35 + ((i*5 + k*3) % 4) * 8` ms, with `ORD = [[1,0,2],[2,0,1],[0,2,1],[1,2,0],[2,1,0],[0,1,2]]`. Coins leave almost together, in a different order each toss.
- Shadow under each coin shrinks to 45% and fades to 0.15 at the peak.
- Label delay: the coin's take-off delay + 860ms.

## Lines
- Empty slot: one continuous 1px outline `#5D4A3C`, same box as a drawn line.
- Appear (520ms): `translateY(-16px)` at opacity 0 → `translateY(2px)` at 62% → rest. The line arrives SOLID.
- Yin split: after the draw step ends the line opens in the middle; `column-gap` 0 → 16 to 18px over 900ms.
- Changing line: drawn in cinnabar; one glow ring 1100ms, starting 380ms after it appears.

## Reveal (Quick Cast and up)
1. The paper sheet fades in over 350ms where the toss was.
2. The hexagram glides from its toss position to its place in the sheet over 1200ms (FLIP: measure both rects, translate from the old one to none). No fade on the figure.
3. Header text (eyebrow, name, pinyin) fades in at 700ms, the rest at 900ms (1200ms fade, rising 6px).
4. On tablet and mobile the figure travels down and into the sheet; same timings.

## Tile hover (landing)
Cinnabar overlay fades in 280ms. Price button: background to transparent, border and label to white, label text changes to "begin", and it slides 12% right over 520ms `cubic-bezier(.65,0,.35,1)`.

## Reduced motion
`prefers-reduced-motion: reduce`: all animation and transition durations 1ms; coins appear instead of tossing; no glow; Quick Cast uses toss 220ms, land 300ms, count 300ms, draw 120ms, hold 320ms, pause 700ms.

## Reference CSS from the prototype
Use as the source of the numbers, not as code to paste. Class names are prototype names.

```css
@keyframes chToss0{0%{transform:translateY(-0.0px) rotateX(0deg)}10%{transform:translateY(-43.2px) rotateX(108deg)}20%{transform:translateY(-76.8px) rotateX(216deg)}30%{transform:translateY(-100.8px) rotateX(324deg)}40%{transform:translateY(-115.2px) rotateX(432deg)}50%{transform:translateY(-120.0px) rotateX(540deg)}60%{transform:translateY(-115.2px) rotateX(648deg)}70%{transform:translateY(-100.8px) rotateX(756deg)}80%{transform:translateY(-76.8px) rotateX(864deg)}90%{transform:translateY(-43.2px) rotateX(972deg)}100%{transform:translateY(-0.0px) rotateX(1080deg)}}
@keyframes chTossSh0{0%{transform:scale(1.00);opacity:0.55}10%{transform:scale(0.80);opacity:0.41}20%{transform:scale(0.65);opacity:0.29}30%{transform:scale(0.54);opacity:0.21}40%{transform:scale(0.47);opacity:0.17}50%{transform:scale(0.45);opacity:0.15}60%{transform:scale(0.47);opacity:0.17}70%{transform:scale(0.54);opacity:0.21}80%{transform:scale(0.65);opacity:0.29}90%{transform:scale(0.80);opacity:0.41}100%{transform:scale(1.00);opacity:0.55}}
@keyframes chToss1{0%{transform:translateY(-0.0px) rotateX(0deg)}10%{transform:translateY(-54.0px) rotateX(144deg)}20%{transform:translateY(-96.0px) rotateX(288deg)}30%{transform:translateY(-126.0px) rotateX(432deg)}40%{transform:translateY(-144.0px) rotateX(576deg)}50%{transform:translateY(-150.0px) rotateX(720deg)}60%{transform:translateY(-144.0px) rotateX(864deg)}70%{transform:translateY(-126.0px) rotateX(1008deg)}80%{transform:translateY(-96.0px) rotateX(1152deg)}90%{transform:translateY(-54.0px) rotateX(1296deg)}100%{transform:translateY(-0.0px) rotateX(1440deg)}}
@keyframes chTossSh1{0%{transform:scale(1.00);opacity:0.55}10%{transform:scale(0.80);opacity:0.41}20%{transform:scale(0.65);opacity:0.29}30%{transform:scale(0.54);opacity:0.21}40%{transform:scale(0.47);opacity:0.17}50%{transform:scale(0.45);opacity:0.15}60%{transform:scale(0.47);opacity:0.17}70%{transform:scale(0.54);opacity:0.21}80%{transform:scale(0.65);opacity:0.29}90%{transform:scale(0.80);opacity:0.41}100%{transform:scale(1.00);opacity:0.55}}
@keyframes chToss2{0%{transform:translateY(-0.0px) rotateX(0deg)}10%{transform:translateY(-34.2px) rotateX(72deg)}20%{transform:translateY(-60.8px) rotateX(144deg)}30%{transform:translateY(-79.8px) rotateX(216deg)}40%{transform:translateY(-91.2px) rotateX(288deg)}50%{transform:translateY(-95.0px) rotateX(360deg)}60%{transform:translateY(-91.2px) rotateX(432deg)}70%{transform:translateY(-79.8px) rotateX(504deg)}80%{transform:translateY(-60.8px) rotateX(576deg)}90%{transform:translateY(-34.2px) rotateX(648deg)}100%{transform:translateY(-0.0px) rotateX(720deg)}}
@keyframes chTossSh2{0%{transform:scale(1.00);opacity:0.55}10%{transform:scale(0.80);opacity:0.41}20%{transform:scale(0.65);opacity:0.29}30%{transform:scale(0.54);opacity:0.21}40%{transform:scale(0.47);opacity:0.17}50%{transform:scale(0.45);opacity:0.15}60%{transform:scale(0.47);opacity:0.17}70%{transform:scale(0.54);opacity:0.21}80%{transform:scale(0.65);opacity:0.29}90%{transform:scale(0.80);opacity:0.41}100%{transform:scale(1.00);opacity:0.55}}
.ch-coin.tossing.h0{animation:chToss0 880ms linear both}.ch-shadow.tossing.h0{animation:chTossSh0 880ms linear both}
.ch-coin.tossing.h1{animation:chToss1 880ms linear both}.ch-shadow.tossing.h1{animation:chTossSh1 880ms linear both}
.ch-coin.tossing.h2{animation:chToss2 880ms linear both}.ch-shadow.tossing.h2{animation:chTossSh2 880ms linear both}
.ch-ln.draw{animation:chSettleIn 520ms cubic-bezier(.22,.61,.36,1) both}
@keyframes chSettleIn{0%{opacity:0;transform:translateY(-16px)}62%{opacity:1;transform:translateY(2px)}100%{opacity:1;transform:none}}
.ch-ln.ln-empty>span{box-shadow:none!important;background:transparent!important}
.ch-ln.ln-empty{box-shadow:inset 0 0 0 1px #5D4A3C;border-radius:1px}
.ch-ln.ln-ch::after{content:"";position:absolute;inset:-5px -6px;border-radius:3px;pointer-events:none;animation:chLnPulse 1100ms cubic-bezier(.4,0,.2,1) 380ms both}
@keyframes chLnPulse{0%{box-shadow:0 0 0 1px rgba(197,90,76,0),0 0 18px rgba(153,22,19,0)}35%{box-shadow:0 0 0 1px rgba(197,90,76,.75),0 0 22px rgba(153,22,19,.55)}100%{box-shadow:0 0 0 1px rgba(197,90,76,0),0 0 18px rgba(153,22,19,0)}}
      cls: (l.state === 'drawing' ? 'draw' : '') + (empty ? ' ln-empty' : (l.yang ? ' ln-yang' : ' ln-yin') + (l.changing ? ' ln-ch' : '')),
```
