// Scroll/entrance reveal. Elements marked `.rv` start hidden (opacity 0, nudged
// down) and animate in. Anything already in the viewport reveals immediately;
// lower sections reveal as they scroll into view. Robust by design: content is
// never left hidden — if the observer never fires, a fallback reveals everything.
export function observeReveals(root = document) {
  const els = [...root.querySelectorAll(".rv")];
  if (!els.length) return;
  const reveal = (e) => e.classList.add("in");

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(reveal);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { reveal(entry.target); io.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  els.forEach((e) => io.observe(e));

  // On the next frame, reveal whatever is already on screen so it animates in on
  // load (rather than the observer having to tick first).
  const vh = window.innerHeight || 800;
  requestAnimationFrame(() => {
    els.forEach((e) => { if (e.getBoundingClientRect().top < vh * 0.92) reveal(e); });
  });

  // Safety net: never leave content hidden if the observer doesn't fire.
  setTimeout(() => els.forEach(reveal), 1400);
}
