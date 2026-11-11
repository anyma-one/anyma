import { useEffect } from "react";
import logoUrl from "./assets/anyma-ching.svg";
import { levelName, ui } from "./data";
import { Link, RouterProvider, useRouter } from "./router";
import { StoreProvider, useStore } from "./store";
import { Landing } from "./screens/Landing";
import { Ask } from "./screens/Ask";
import { Cast } from "./screens/Cast";
import { Reading } from "./screens/Reading";
import { MakeItYours } from "./screens/MakeItYours";
import { Learn, pages } from "./screens/Learn";

function Screen() {
  const { path } = useRouter();

  // Focus the new screen's heading after navigation, for keyboard and screen-reader users.
  useEffect(() => {
    if (path === "reading" || path === "cast") return; // these move focus themselves
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [path]);

  useEffect(() => {
    const page = path.startsWith("learn/") ? pages.find((p) => `learn/${p.slug}` === path) : null;
    document.title = page ? `${page.title} · anyma CHING` : "anyma CHING";
  }, [path]);

  if (path === "ask") return <Ask />;
  if (path === "cast") return <Cast />;
  if (path === "reading") return <Reading />;
  if (path === "make-it-yours") return <MakeItYours />;
  if (path === "learn" || path.startsWith("learn/")) return <Learn slug={path.slice("learn/".length)} />;
  return <Landing />;
}

/** Header right: the page label or the Learn link (design: screens.md). Cast adds its skip link
 *  into #header-extra through a portal. */
function HeaderRight() {
  const { path } = useRouter();
  const { flow, current } = useStore();
  if (path === "" || path === "ask" && !flow.chosenLevel) {
    return (
      <Link to="learn" className="site-header__label site-header__link">
        {ui.header.learn}
      </Link>
    );
  }
  if (path.startsWith("learn")) return <span className="site-header__label is-current">{ui.header.learn}</span>;
  const level = path === "reading" || path === "make-it-yours" ? current?.level : flow.chosenLevel;
  return level ? <span className="site-header__label">{levelName(level)}</span> : null;
}

export default function App() {
  return (
    <RouterProvider>
      <StoreProvider>
        <div className="frame">
          <header className="site-header">
            <Link to="" className="site-header__home" ariaLabel={ui.header.home}>
              <img className="header-logo" src={logoUrl} alt="" />
            </Link>
            <div className="site-header__right">
              <HeaderRight />
              <div id="header-extra" />
            </div>
          </header>
          <main id="main">
            <Screen />
          </main>
          <footer className="site-footer">
            {/* About opens the Learn (resources) page (owner, 11 Nov 2026). */}
            <Link to="learn" className="site-footer__item">
              {ui.footer.about}
            </Link>
            <a className="site-footer__item" href={ui.footer.imprint.href}>
              {ui.footer.imprint.label}
            </a>
            <a className="site-footer__item" href={ui.footer.privacy.href}>
              {ui.footer.privacy.label}
            </a>
          </footer>
        </div>
      </StoreProvider>
    </RouterProvider>
  );
}
