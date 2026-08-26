// Builds a single self-contained HTML file from the real source files, for publishing as a
// review link. Everything (fonts, images, CSS, JS) is inlined as data URIs, because the
// artifact host blocks requests to external origins.
//
// The legal pages are real routes in production; here they are folded into overlays so the
// whole thing is reviewable from one link.
//
//   node build-review.mjs  ->  .review/anyma-start-screen.html
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Reads the hub's source directly; the assembled dist/ is not needed.
const ROOT = fileURLToPath(new URL("./apps/hub/", import.meta.url));
const OUT = fileURLToPath(new URL("./.review/", import.meta.url));
const read = (p) => readFile(join(ROOT, p), "utf8");
const b64 = async (p) => (await readFile(join(ROOT, p))).toString("base64");

const MIME = { ".woff2": "font/woff2", ".avif": "image/avif", ".png": "image/png" };
const dataUri = async (p) => {
  const ext = p.slice(p.lastIndexOf("."));
  return `data:${MIME[ext]};base64,${await b64(p)}`;
};

/* ---------- css with fonts inlined ---------- */

let fonts = await read("fonts.css");
for (const m of [...fonts.matchAll(/url\(\.\/(assets\/fonts\/[^)]+)\)/g)]) {
  fonts = fonts.replaceAll(m[0], `url(${await dataUri(m[1])})`);
}

let styles = await read("styles.css");
const legalCss = await read("legal.css");

// The live site only ever needs `prefers-color-scheme` — that is the correct signal for a real
// website. The artifact viewer additionally stamps `data-theme` on the root when the reader picks
// a theme explicitly, so the review copy (and only the review copy) also honours that.
const DARK_BLOCK = /@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\n  \}\n\}/;
const darkTokens = styles.match(DARK_BLOCK);
if (!darkTokens) throw new Error("dark token block not found — did styles.css change shape?");
styles =
  styles.replace(
    DARK_BLOCK,
    `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {${darkTokens[1]}\n  }\n}`
  ) + `\n\n:root[data-theme="dark"] {${darkTokens[1]}\n}\n`;

/* ---------- page body ---------- */

let html = await read("index.html");
// Keep only what sits inside <body>; the artifact host supplies the document shell.
html = html.slice(html.indexOf("<body>") + 6, html.lastIndexOf("</body>"));

// Inline the three thumbnails and the logo; drop srcset (one size is enough for review).
for (const name of ["soul", "dosha", "ching"]) {
  const uri = await dataUri(`assets/thumb-${name}-800.avif`);
  html = html.replace(`./assets/thumb-${name}-800.avif`, uri);
  html = html.replace(
    new RegExp(`\\s*srcset="[^"]*thumb-${name}[^"]*"`),
    ""
  );
}
html = html.replaceAll("./assets/anyma-logo.png", await dataUri("assets/anyma-logo.png"));

/* ---------- fold the legal pages into overlays ---------- */

const legalBody = async (file) => {
  const src = await read(file);
  return src.slice(src.indexOf("<main class=\"legal\">"), src.lastIndexOf("</main>") + 7);
};

const overlay = (id, content) => `
  <div class="overlay overlay--doc" id="${id}" role="dialog" aria-modal="true" hidden>
    <div class="card card--doc">
      <button class="card__close" type="button" data-close aria-label="Close">&times;</button>
      ${content}
    </div>
  </div>`;

const docs =
  overlay("doc-imprint", await legalBody("imprint.html")) +
  overlay("doc-privacy", await legalBody("privacy.html"));

// Footer links become overlay openers (in production they are real pages at /imprint, /privacy).
html = html
  .replace('<a class="footer__link" href="/imprint">', '<button class="footer__link" type="button" data-open="doc-imprint">')
  .replace('<a class="footer__link" href="/privacy">', '<button class="footer__link" type="button" data-open="doc-privacy">')
  .replace("Imprint</a>", "Imprint</button>")
  .replace("Data &amp; Privacy</a>", "Data &amp; Privacy</button>");
// The in-form privacy link too.
html = html.replace('<a href="/privacy">Data &amp; Privacy</a>', '<a href="#" data-open="doc-privacy">Data &amp; Privacy</a>');

html = html.replace('<script src="./main.js" type="module"></script>', "");
html += docs;

const js = await read("main.js");

/* ---------- assemble ---------- */

const out = `<title>anyma start screen</title>
<style>
${fonts}
${styles}
${legalCss}

/* review-only: the legal pages are real routes in production; here they are overlays */
.overlay--doc .card--doc { max-width: 760px; padding: 0; }
.overlay--doc .legal { padding: 40px 36px 36px; max-width: none; }
.overlay--doc .legal__back, .overlay--doc .legal__footer { display: none; }
@media (max-width: 767px) {
  .overlay--doc .legal { padding: 28px 22px 24px; }
}
</style>
${html}
<script type="module">
${js}
</script>
`;

await mkdir(OUT, { recursive: true });
const dest = join(OUT, "anyma-start-screen.html");
await writeFile(dest, out, "utf8");
console.log(`${dest}  ${(Buffer.byteLength(out) / 1024).toFixed(0)} KB`);
