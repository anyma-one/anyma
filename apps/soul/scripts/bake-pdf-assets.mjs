// Bakes the reading PDF's heavy artwork into JPEGs (macOS, run by hand when the design changes):
//
//   public/pdf/bg-night.jpg   cover + closing page: night ground, haze, starfield, film grain
//   public/pdf/bg-page.jpg    reading pages: void ground + dimmed starfield
//   public/pdf/glow-lg.png    the aura behind the cover card   (--glow-aura-lg)
//   public/pdf/glow-sm.png    the aura behind the second card  (--glow-aura)
//   public/pdf/cards/<id>.jpg the 16 cards, from the source PNGs in "animal cards/"
//
// WHY. Chromium cannot keep blur, blend modes or layered gradients as vectors in a PDF, so it
// rasterised every one of those effects losslessly on every page, and re-encoded the WebP cards
// losslessly too: ~11 MB and 169 images, slow to scroll in any PDF reader. JPEGs are embedded
// as they are (DCTDecode), so baking the atmosphere once keeps the look at a fraction of the
// size. The text stays live, selectable vector type.
//
// The backgrounds are rendered from public/pdf/reading.css itself (.night, .grain, .haze,
// .stars), at the same 794x1123 viewport the renderer uses, so a tweak there is one re-run away.
//
// Usage (from apps/soul):  node scripts/bake-pdf-assets.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const SOUL = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(SOUL, "public/pdf");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCALE = 2; // 1588x2246 px for A4: sharp on screen and in print at this subtlety
const QUALITY = 82;

/* ---------- backgrounds ---------- */
const css = readFileSync(join(OUT, "reading.css"), "utf8")
  // fonts are irrelevant to an empty page and would only slow the load
  .replace(/@font-face\s*\{[^}]*\}/g, "");

const pages = {
  "bg-night": `<section class="page night grain"><div class="haze"><i></i><i></i><i></i></div><div class="stars"></div></section>`,
  "bg-page": `<section class="page"><div class="stars stars--dim"></div></section>`,
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: SCALE });
for (const [name, html] of Object.entries(pages)) {
  await page.setContent(
    `<!doctype html><style>${css} .page{margin:0!important} body{background:none}</style>${html}`,
  );
  await page.screenshot({
    path: join(OUT, `${name}.jpg`),
    type: "jpeg",
    quality: QUALITY,
    clip: { x: 0, y: 0, width: 794, height: 1123 },
  });
  console.log(`baked ${name}.jpg`);
}
/* ---------- card auras ---------- */
// A blurred box-shadow becomes a soft-masked page-sized bitmap in Chromium's PDF, which Apple's
// renderer (Preview, Mail, iOS) draws as hard pale rectangles or not at all. A plain PNG with
// alpha (like the wordmark) renders the same everywhere. The card itself covers the middle, so
// only the halo matters. Rendered at 1x: it is a blur, more pixels would only add bytes.
for (const [name, w, h, radius, shadow, pad] of [
  ["glow-lg", 320, 480, 16, "var(--glow-aura-lg)", 240],
  ["glow-sm", 200, 300, 10, "var(--glow-aura)", 190],
]) {
  await page.setViewport({ width: w + pad * 2, height: h + pad * 2, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><style>${css} html,body{background:transparent!important;margin:0}</style>` +
    `<div style="position:absolute;left:${pad}px;top:${pad}px;width:${w}px;height:${h}px;` +
    `border-radius:${radius}px;box-shadow:${shadow}"></div>`,
  );
  await page.screenshot({ path: join(OUT, `${name}.png`), omitBackground: true });
  console.log(`baked ${name}.png (pad ${pad}px)`);
}
await browser.close();

/* ---------- cards ---------- */
// Source file names differ from the app's ids in three places.
const SOURCE = {
  lion: "Anyma Lion Card 2.png",
  octopus: "Anyma Octopus Card 2.png",
  tortoise: "Anyma Turtle Card.png",
};
const IDS = ["bear", "cat", "coyote", "dolphin", "elephant", "fox", "hawk", "honeybee", "horse",
  "hummingbird", "lion", "octopus", "owl", "raven", "tortoise", "wolf"];

mkdirSync(join(OUT, "cards"), { recursive: true });
for (const id of IDS) {
  const src = SOURCE[id] ?? `Anyma ${id[0].toUpperCase()}${id.slice(1)} Card.png`;
  execFileSync("sips", [
    "-Z", "1248", "-s", "format", "jpeg", "-s", "formatOptions", String(QUALITY),
    join(SOUL, "animal cards", src), "--out", join(OUT, "cards", `${id}.jpg`),
  ], { stdio: "ignore" });
}
console.log(`baked ${IDS.length} cards`);
