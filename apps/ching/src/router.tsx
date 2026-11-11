// A small history router under the Vite base (/ching/). Routes never carry the question.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, type MouseEvent } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, ""); // "/ching"

/** Path inside the app, without base or slashes: "", "ask", "learn/history"... */
function currentPath(): string {
  let p = window.location.pathname;
  if (p.startsWith(BASE)) p = p.slice(BASE.length);
  return p.replace(/^\/+|\/+$/g, "");
}

export const href = (path: string) => `${BASE}/${path.replace(/^\/+/, "")}`;

const RouterContext = createContext<{ path: string; navigate: (to: string, opts?: { replace?: boolean }) => void }>({
  path: "",
  navigate: () => {},
});

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    const url = href(to);
    if (opts?.replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
    setPath(currentPath());
    window.scrollTo(0, 0);
  }, []);

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);

export function Link({
  to,
  children,
  className,
  ariaLabel,
  onNavigate,
  ...rest
}: {
  to: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  /** Runs before navigating (e.g. to record the chosen level). Return false to stay. */
  onNavigate?: () => void | false;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const { navigate } = useRouter();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (onNavigate?.() === false) return;
    navigate(to);
  };
  return (
    <a href={href(to)} onClick={onClick} className={className} aria-label={ariaLabel} {...rest}>
      {children}
    </a>
  );
}
