# Dropdown (new)

A collapsible reading section built on `<details>`/`<summary>`, so it works without script.

## Anatomy
Summary row: Young Serif 20px title (title case) · optional lock tag (padlock + tier name, mono 10px) · chevron. Body: section content.

## Rules
- Titles: Traditional Meaning, Image, In Few Words, Modern Meaning, Reflection, Changing Lines (or All Six Lines / The Six Lines), Second Hexagram.
- Chevron rotates 180° in 200ms `--ease-ritual`; the title turns cinnabar on hover.
- Locked: the summary shows a 1px line padlock icon and the tier name ("Deep Cast" or "Full Cast"); the body shows redacted bars. Never blur real copy.
- Default open: In Few Words and Modern Meaning on Deep Cast; all open on Full Cast; the rest closed.
- Mobile: summary min-height 56px.
- Long bodies follow the paragraph rule: keep author breaks; otherwise split texts over about 420 characters at sentence ends, about every 300 characters.
