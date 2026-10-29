// Serverless endpoint (Vercel Node function): renders a finished Deep Dive as the 6-page A4
// "night" PDF from design_handoff_anyma_reading_pdf.
//
// WHY THIS IS SERVER-SIDE. The design is dark and full-bleed, which needs `printBackground`.
// A browser's own print dialog exposes that as the "Background graphics" checkbox and leaves
// it OFF by default, so `window.print()` would hand most readers cream text on white paper.
// `print-color-adjust: exact` asks; only a renderer we control can insist.
//
// The stylesheet, fonts, cards and wordmark are fetched by Chromium from this same
// deployment (see PDF_CSS below) rather than inlined, so the design stays editable in
// public/pdf/reading.css instead of being copied into this file and drifting from it.
//
// SELF-CONTAINED on purpose: a function's local imports are not available at runtime on
// this project, so everything here is either inlined or an npm package.
//
// Config (host env): none required. NODE_ENV/VERCEL decide which Chromium to launch.

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

/* ---------- payload ---------- */

interface Animal {
  name: string;
  epithet?: string;
  /** Site-relative card path, e.g. "/soul/cards/bear.webp". */
  card?: string | null;
}
interface ReadingPayload {
  /** The app's build base, so assets resolve in dev ("/") and in the monorepo ("/soul/"). */
  base?: string;
  savedDate?: string;
  primary: Animal;
  secondary?: Animal | null;
  shortVersion?: string[];
  core?: string[];
  secondNature?: string;
  beyond?: string[];
  world?: string[];
  pullQuote?: string;
  challenges?: string[];
  unaware?: string[];
  questions?: string[];
}

interface ReqLike {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}
interface ResLike {
  status: (code: number) => ResLike;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  write: (chunk: Uint8Array) => void;
  end: () => void;
}

/* ---------- helpers ---------- */

const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s) => typeof s === "string" && s.trim()).map(String) : [];

const paras = (items: string[]): string =>
  items.map((p) => `<p class="body">${esc(p)}</p>`).join("\n");

/** Absolute origin of this deployment, so Chromium can fetch the CSS and art. */
function originOf(req: ReqLike): string {
  const h = (k: string) => {
    const v = req.headers?.[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const host = h("x-forwarded-host") ?? h("host") ?? process.env.VERCEL_URL;
  if (!host) return "http://localhost:5174";
  const proto = h("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** A reading page: dimmed stars, content, footer. Section number/heading are optional so
 *  continuation pages can reuse the same chrome without repeating a heading. */
const readingPage = (inner: string, primaryName: string): string => `
<section class="page">
  <div class="stars stars--dim"></div>
  <div class="page__inner">
    ${inner}
    <div class="footer">
      <span class="label label--muted">anyma · ${esc(primaryName)}</span>
      <span class="label label--muted" data-pageno>— / —</span>
    </div>
  </div>
</section>`;

const section = (num: string, heading: string, body: string): string => `
      <div class="section">
        <span class="label label--accent">${esc(num)}</span>
        <h2 class="h-section">${esc(heading)}</h2>
        ${body}
      </div>`;

function buildHtml(d: ReadingPayload, origin: string): string {
  const name = d.primary?.name ?? "";
  const base = d.base && d.base.startsWith("/") ? d.base : "/soul/";
  const cardUrl = (p?: string | null) => (p ? `${origin}${p}` : "");
  const wordmark = `${origin}${base}pdf/wordmark-aura.png`;

  const short = list(d.shortVersion)
    .slice(0, 4)
    .map((l) => `<p class="short__line">${esc(l)}</p>`)
    .join("\n");

  const pages: string[] = [];

  // 1 · cover
  pages.push(`
<section class="page page--cover night grain">
  <div class="haze"><i></i><i></i><i></i></div>
  <div class="stars"></div>
  <div class="page__inner">
    <div class="cover__top">
      <img class="cover__wordmark" src="${wordmark}" alt="anyma">
      <span class="label">${esc(d.savedDate)}</span>
    </div>
    <div class="cover__hero">
      <div class="cover__title">
        <span class="label label--airy label--accent">Your animal shape</span>
        <h1 class="cover__name">${esc(name)}</h1>
        <span class="cover__epithet">${esc(d.primary?.epithet)}</span>
      </div>
      ${d.primary?.card ? `<img class="card-img" src="${cardUrl(d.primary.card)}" alt="${esc(name)}">` : ""}
    </div>
    <div class="short">
      <span class="label">The short version</span>
      <div class="short__grid">${short}</div>
    </div>
  </div>
</section>`);

  // 2 · at your core
  pages.push(
    readingPage(
      `<div class="content">
        <span class="label label--accent">01</span>
        <h2 class="h-section">At your core</h2>
        ${paras(list(d.core))}
      </div>`,
      name,
    ),
  );

  // 3 · second nature + beyond the spirit
  const secondPanel = d.secondary
    ? `<div class="second">
        ${d.secondary.card ? `<img class="second__img" src="${cardUrl(d.secondary.card)}" alt="${esc(d.secondary.name)}">` : ""}
        <div class="second__text">
          <span class="label">Your second nature</span>
          <h3 class="second__name">${esc(d.secondary.name)}</h3>
          <p class="second__body">${esc(d.secondNature)}</p>
        </div>
      </div>`
    : "";
  pages.push(
    readingPage(
      `<div class="page3__stack">
        ${secondPanel}
        ${section("02", "Beyond the spirit", paras(list(d.beyond)))}
      </div>`,
      name,
    ),
  );

  // 4 · you & the world + pull quote
  pages.push(
    readingPage(
      `<div class="content">
        <span class="label label--accent">03</span>
        <h2 class="h-section">You &amp; the world</h2>
        ${paras(list(d.world))}
      </div>
      ${d.pullQuote ? `<div class="pull"><blockquote>${esc(d.pullQuote)}</blockquote></div>` : ""}`,
      name,
    ),
  );

  // 5 · what challenges you + what you might not be aware of
  pages.push(
    readingPage(
      `<div class="page5__stack">
        ${section("04", "What challenges you", paras(list(d.challenges)))}
        ${section("05", "What you might not be aware of", paras(list(d.unaware)))}
      </div>`,
      name,
    ),
  );

  // 6 · three questions + sign-off
  const numerals = ["I", "II", "III"];
  const questions = list(d.questions)
    .slice(0, 3)
    .map(
      (q, i) =>
        `<div class="q"><span class="label label--accent">${numerals[i]}</span><p>${esc(q)}</p></div>`,
    )
    .join("\n");
  pages.push(`
<section class="page page--close night grain">
  <div class="haze"><i></i><i></i><i></i></div>
  <div class="stars"></div>
  <div class="page__inner">
    <div class="close__head">
      <span class="label label--accent">06</span>
      <h2 class="h-section">Three questions to go deeper</h2>
      <p class="close__intro">Sit with these to see yourself more clearly.</p>
    </div>
    <div class="questions">${questions}</div>
    <div class="signoff">
      <img src="${wordmark}" alt="anyma">
      <p>A reading for reflection, not a diagnosis. Saved ${esc(d.savedDate)}.</p>
      <a href="https://www.anyma.one">www.anyma.one</a>
    </div>
  </div>
</section>`);

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>anyma reading — ${esc(name)}</title>
<link rel="stylesheet" href="${origin}${base}pdf/reading.css">
</head><body>
${pages.join("\n")}
</body></html>`;
}

/**
 * Reflow in the page, per the handoff: a reading page that overflows hands whole trailing
 * paragraphs to a continuation page carrying the same chrome but no repeated heading.
 * Never splits a paragraph, never shrinks type. Returns anything that could not be fixed.
 */
function reflow(): string[] {
  const warnings: string[] = [];
  const overflowing = (page: Element) => {
    const inner = page.querySelector<HTMLElement>(".page__inner");
    return !!inner && inner.scrollHeight > inner.clientHeight + 1;
  };

  let guard = 0;
  for (let i = 0; i < document.querySelectorAll("section.page").length; i++) {
    const page = document.querySelectorAll("section.page")[i];
    if (page.classList.contains("page--cover") || page.classList.contains("page--close")) {
      if (overflowing(page)) {
        warnings.push(
          page.classList.contains("page--cover")
            ? "cover overflows — short version too long"
            : "closing page overflows — questions too long",
        );
      }
      continue;
    }

    while (overflowing(page) && guard++ < 200) {
      // Take from the last block that still has more than one paragraph: a heading with
      // nothing under it is worse than a slightly full page.
      const holders = [...page.querySelectorAll<HTMLElement>(".content, .section")].reverse();
      const holder = holders.find((h) => h.querySelectorAll(":scope > p.body").length > 1);
      if (!holder) break;
      const moved = holder.querySelector<HTMLElement>(":scope > p.body:last-of-type");
      if (!moved) break;

      let cont = page.nextElementSibling;
      if (!cont?.classList.contains("page--cont")) {
        const footer = page.querySelector(".footer")!.outerHTML;
        const el = document.createElement("section");
        el.className = "page page--cont";
        el.innerHTML = `<div class="stars stars--dim"></div><div class="page__inner"><div class="content"></div>${footer}</div>`;
        page.after(el);
        cont = el;
      }
      cont.querySelector(".content")!.prepend(moved);
    }
  }

  // Renumber every footer once the page count is final.
  const pages = [...document.querySelectorAll("section.page")];
  pages.forEach((p, i) => {
    const no = p.querySelector("[data-pageno]");
    if (no) no.textContent = `${i + 1} / ${pages.length}`;
  });
  return warnings;
}

/* ---------- handler ---------- */

export default async function handler(req: ReqLike, res: ResLike): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload =
    typeof req.body === "string"
      ? (JSON.parse(req.body) as ReadingPayload)
      : (req.body as ReadingPayload);

  if (!payload?.primary?.name) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }

  const html = buildHtml(payload, originOf(req));
  const onVercel = Boolean(process.env.VERCEL);

  let browser;
  try {
    browser = await puppeteer.launch(
      onVercel
        ? {
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
          }
        : {
            // Local dev uses the Chrome already on the machine; the bundled binary is for
            // the Lambda filesystem and will not launch on a developer's laptop.
            executablePath:
              process.env.CHROME_PATH ??
              "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless: true,
          },
    );

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    // Fonts decide line breaks, which decide pagination — measure only once they are in.
    await page.evaluate(() => document.fonts.ready);
    const warnings = (await page.evaluate(reflow)) as string[];

    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
    });

    const slug = payload.primary.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="anyma-reading-${slug}.pdf"`);
    if (warnings.length) res.setHeader("X-Anyma-Layout-Warnings", warnings.join("; "));
    res.status(200);

    // STREAMED, deliberately. A Vercel function's response body is capped at 4.5 MB, and
    // this design runs to roughly twice that — the night ground, the haze and the card art
    // all rasterise. Streamed responses are exempt from that cap, so the file is written in
    // chunks with no Content-Length (which is what makes it a chunked transfer).
    //
    // The alternative — upload to storage and hand back a URL — would mean keeping a copy
    // of someone's reading on a server, which the privacy policy says we do not do.
    const CHUNK = 64 * 1024;
    const bytes = Buffer.from(pdf);
    for (let i = 0; i < bytes.length; i += CHUNK) {
      res.write(bytes.subarray(i, i + CHUNK));
    }
    res.end();
  } catch (err) {
    res.status(502).json({
      error: "render_failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  } finally {
    await browser?.close();
  }
}
