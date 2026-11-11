import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { devApiPlugin } from "./dev/vite-plugin-dev-api";

// ching is served at anyma.one/ching. The monorepo build also passes --base=/ching/,
// which matches this, so the app builds the same on its own and inside the monorepo.
export default defineConfig({
  base: "/ching/",
  // devApiPlugin runs the Vercel-style api/*.ts handlers under `npm run dev`. Dev-only.
  plugins: [react(), devApiPlugin()],
  server: { port: 5174 },
});
