# TossStage (new)

The coin toss with its running count.

## Desktop (above 960px)
Coins left, the building hexagram right. Progress row "Line 3 of 6" with "Heads 3 · Tails 2" pinned right. Coins 88px with 128px headroom above for the arc. Count below the coins: total Young Serif 64px, the sum in mono, the line name Young Serif 30px, the description 18px.

## Tablet and mobile
- Order: progress row, then coins with the count to their right, then the hexagram full width.
- Coins at 0.8 (tablet) or 0.58 (mobile) of desktop size, arc scaled the same.
- The count sits behind a fixed 1px `--divider-count` rule that never disappears between tosses. The count area has a fixed height (220px tablet, 184px mobile) and bottom-aligns its text, so nothing on screen moves as the count changes.
- Count type: total 52 / 38px, name 24 / 19px, description 16 / 14px.
- On mobile the whole toss fits 390 × 844 without scrolling.

Motion: see the changelog's Motion table.
