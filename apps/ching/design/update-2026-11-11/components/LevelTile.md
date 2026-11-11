# LevelTile (changed)

One of the three level cards on the landing page; the whole card is the link to the question screen.

## Anatomy
Eyebrow "Level I / II / III" (mono 11px, `0.28em`, bronze) · name (Young Serif 26px) · description (Crimson Pro 17px, bone-300) · price button (bronze, lowercase: "free", "sign-up", "one-time payment").

## States
| State | Surface | Border | Text | Price button |
| --- | --- | --- | --- | --- |
| Rest | `linear-gradient(172deg,#2E241F,#1B1613)` | `--tile-border` | bone | bronze fill, ink label |
| Hover / focus (pointer devices) | `--surface-cinnabar` fades in over 280ms | `--tile-border-hover` | `#F4DACB` title, `#EBC9BA` description | white ghost, label "begin", slides 12% right over 520ms `--ease-slide` |
| Active on touch | same as hover, set by scroll position | | | |

## Touch behaviour (red on scroll)
On `(max-width: 720px), (hover: none)`: the tile whose centre is nearest 55% of the viewport height, and inside 18% to 90% of it, takes the hover state. A tile scrolled past returns to rest. Tapping still navigates.

## Layout
`repeat(auto-fit, minmax(min(200px,100%),1fr))`, gap 18px: three across on desktop and tablet, stacked on mobile.
