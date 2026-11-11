// The reveal glide (design: motion.md "Reveal"): the hexagram moves from its place in the toss to
// its place in the reading sheet (FLIP: measure both rects, translate from the old one to none).
// The cast screen records where its figure was just before it hands over to the reading.

let last: { rect: DOMRect; at: number } | null = null;

export function rememberFigure(el: HTMLElement | null) {
  last = el ? { rect: el.getBoundingClientRect(), at: Date.now() } : null;
}

/** True once, right after a cast handed over: the reading plays its entrance. */
export function takeReveal(): DOMRect | null {
  const r = last && Date.now() - last.at < 2000 ? last.rect : null;
  last = null;
  return r;
}

export function glide(el: HTMLElement, from: DOMRect, duration: number) {
  const to = el.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const s = to.width ? from.width / to.width : 1;
  el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: "none" }], {
    duration,
    easing: "cubic-bezier(.22,.61,.36,1)",
  });
}
