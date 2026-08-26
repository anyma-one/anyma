// Assembles all three apps into one `dist/`, which is what Vercel serves.
//
//   dist/            <- apps/hub          (the start screen, owns the root)
//   dist/soul/       <- apps/soul, built  (Vite React app, base /soul/)
//   dist/dosha/      <- apps/dosha        (plain static, no build step)
//
// Serverless functions are NOT handled here: Vercel picks up /api at the repo root on its
// own, independently of the output directory.
import { cp, rm, mkdir, readdir, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(ROOT, "dist");

const exists = async (p) => { try { await access(p); return true; } catch { return false; } };

const run = (cmd, args, cwd) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: "inherit", shell: false });
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`))
    );
  });

// Copies a directory's *contents* into dest.
//
// Everything under dist/ is served publicly, so this excludes anything that is source rather
// than site: build output, VCS and tooling directories, dotfiles, and .md notes. Without the
// last two, an app's HANDOVER.md and .claude/ would be fetchable at anyma.one/<app>/…
const SKIP = new Set(["node_modules", "dist", ".vercel", ".review"]);
const isPrivate = (name) => SKIP.has(name) || name.startsWith(".") || name.endsWith(".md");

async function copyContents(src, dest) {
  await mkdir(dest, { recursive: true });
  for (const entry of await readdir(src)) {
    if (isPrivate(entry)) continue;
    await cp(join(src, entry), join(dest, entry), { recursive: true });
  }
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

/* ---- hub: owns the root ---- */
await copyContents(join(ROOT, "apps/hub"), DIST);
console.log("built  /            <- apps/hub");

/* ---- dosha: plain static, every path already relative ---- */
if (await exists(join(ROOT, "apps/dosha"))) {
  await copyContents(join(ROOT, "apps/dosha"), join(DIST, "dosha"));
  console.log("built  /dosha/      <- apps/dosha");
} else {
  console.log("SKIP   /dosha/      (apps/dosha not present)");
}

/* ---- soul: Vite build, forced to the /soul/ base ---- */
if (await exists(join(ROOT, "apps/soul/package.json"))) {
  // The base is passed here rather than written into soul's vite.config.ts, so the app stays
  // buildable on its own. `--` forwards the flag through npm to `vite build`.
  await run("npm", ["run", "build", "--workspace", "apps/soul", "--", "--base=/soul/"], ROOT);
  await cp(join(ROOT, "apps/soul/dist"), join(DIST, "soul"), { recursive: true });
  console.log("built  /soul/       <- apps/soul");
} else {
  console.log("SKIP   /soul/       (apps/soul not present — see README, 'Folding SOUL in')");
}

console.log("\ndist/ ready");
