// /learn and /learn/:slug: the eight Learn sections, rendered from Markdown (design: screens.md §6).
// A numbered list beside the selected section on a paper sheet; on mobile the list collapses
// into a "Section 02 of 08 · <title> ▾" selector.
import { useEffect, useState } from "react";
import { marked } from "marked";
import { copy, fill, pad, titleCase, ui } from "../data";
import { Link } from "../router";
import { tagChinese } from "../components/Text";

const files = import.meta.glob("../../resources/*.md", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;

/** Slug = file name without the number prefix and .md (BUILD §3). */
const slugOf = (file: string) => file.replace(/^\d+-/, "").replace(/\.md$/, "");
export const pages = copy.resources.pages.map((p) => ({ ...p, slug: slugOf(p.file), title: titleCase(p.title) }));

function render(md: string): { title: string; html: string } {
  // The page's own h1 becomes the sheet heading, in title case.
  const m = md.match(/^#\s+(.+)\n/);
  const title = m ? titleCase(m[1].trim()) : "";
  const body = m ? md.slice(m[0].length) : md;
  const html = (marked.parse(body, { async: false }) as string)
    // Section titles and h2s render in title case (copy-overrides).
    .replace(/<h2>([^<]+)<\/h2>/g, (_x, t: string) => `<h2>${titleCase(t)}</h2>`)
    // Wide tables scroll sideways inside their own box, with a sticky first column.
    .replace(/<table>/g, '<div class="table-wrap" tabindex="0"><table>')
    .replace(/<\/table>/g, "</table></div>")
    // External links open in a new tab.
    .replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
  return { title, html: tagChinese(html) };
}

export function Learn({ slug }: { slug: string }) {
  const page = pages.find((p) => p.slug === slug) ?? pages[0];
  const i = pages.indexOf(page);
  const prev = pages[i - 1];
  const next = pages[i + 1];
  const [content, setContent] = useState<{ title: string; html: string } | null>(null);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    setContent(null);
    setListOpen(false);
    let alive = true;
    files[`../../resources/${page.file}`]?.().then((md) => {
      if (alive) setContent(render(md));
    });
    return () => {
      alive = false;
    };
  }, [page]);

  return (
    <div className="page page--learn">
      <nav className="learn-nav" aria-labelledby="learn-h">
        <h1 id="learn-h" className="display-2" tabIndex={-1}>
          {copy.resources.heading}
        </h1>
        <button type="button" className="learn-selector" aria-expanded={listOpen} aria-controls="learn-list" onClick={() => setListOpen(!listOpen)}>
          <span>{fill(ui.learn.selector, { n: pad(i + 1), total: pad(pages.length), title: page.title })}</span>
          <span aria-hidden="true">▾</span>
        </button>
        <ol id="learn-list" className={`learn-list${listOpen ? " is-open" : ""}`}>
          {pages.map((p, k) => (
            <li key={p.slug}>
              <Link to={`learn/${p.slug}`} className={p === page ? "is-current" : undefined} aria-current={p === page ? "page" : undefined}>
                <span className="learn-list__n">{pad(k + 1)}</span>
                <span>{p.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <article className="sheet learn-sheet" aria-busy={!content}>
        <span className="eyebrow eyebrow--paper">{fill(ui.learn.eyebrow, { n: pad(i + 1) })}</span>
        <h2 className="learn-sheet__title">{content?.title ?? page.title}</h2>
        {content && <div className="prose" dangerouslySetInnerHTML={{ __html: content.html }} />}
        <nav className="learn-pager" aria-label={copy.resources.heading}>
          {prev ? (
            <Link to={`learn/${prev.slug}`}>
              <span aria-hidden="true">←</span> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`learn/${next.slug}`}>
              {next.title} <span aria-hidden="true">→</span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
