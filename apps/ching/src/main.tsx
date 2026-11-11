import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import { sessionStart } from "./storage";
// The design's four faces, self-hosted (no Google Fonts CDN: GDPR). Only the weights the design uses.
import "@fontsource/young-serif/400.css";
import "@fontsource/crimson-pro/300.css";
import "@fontsource/crimson-pro/400.css";
import "@fontsource/crimson-pro/600.css";
import "@fontsource/crimson-pro/700.css";
import "@fontsource/crimson-pro/300-italic.css";
import "@fontsource/crimson-pro/400-italic.css";
import "@fontsource/ibm-plex-mono/300.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/kaisei-tokumin/400.css";
import "@fontsource/kaisei-tokumin/500.css";
// Fallback for hanzi Kaisei Tokumin (a Japanese font) lacks. Browsers fetch only the subsets a page uses.
import "@fontsource/noto-serif-tc/400.css";
import "@fontsource/noto-serif-tc/500.css";
import "./styles/tokens.css";
import "./styles/app.css";

// Mark the start of this browser session for the re-cast window.
sessionStart();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    <App />
    {/* Vercel Web Analytics: a no-op off Vercel. Events never carry question or message text. */}
    <Analytics />
  </StrictMode>,
);
