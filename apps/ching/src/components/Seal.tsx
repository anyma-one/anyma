// Seal SVGs, inlined so --seal-color applies, loaded on demand (BUILD §2, §7).
import { useEffect, useId, useState } from "react";

const loaders = import.meta.glob("../../seals/svg/*.svg", { query: "?raw", import: "default" }) as Record<
  string,
  () => Promise<string>
>;

const cache = new Map<number, string>();

function loaderFor(n: number) {
  return loaders[`../../seals/svg/${String(n).padStart(2, "0")}.svg`];
}

export function Seal({ number, shape, label, className = "" }: { number: number; shape: string; label?: string; className?: string }) {
  const [svg, setSvg] = useState(() => cache.get(number) ?? "");
  // Each file uses mask id seal-mask-NN; make it unique so one seal can appear twice on a page.
  const uid = useId().replace(/[^a-z0-9]/gi, "");

  useEffect(() => {
    let alive = true;
    const cached = cache.get(number);
    if (cached) {
      setSvg(cached);
      return;
    }
    loaderFor(number)?.().then((raw) => {
      cache.set(number, raw);
      if (alive) setSvg(raw);
    });
    return () => {
      alive = false;
    };
  }, [number]);

  const nn = String(number).padStart(2, "0");
  const html = svg.replaceAll(`seal-mask-${nn}`, `seal-mask-${nn}-${uid}`);
  // The box is sized by shape before the SVG arrives, so nothing shifts (BUILD §9, Phase 4).
  return (
    <span
      className={`seal seal--${shape} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
