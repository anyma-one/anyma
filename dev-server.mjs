// Minimal static file server for local preview, serving the assembled `dist/`. Not shipped —
// Vercel serves those files directly in production. Run `node build.mjs` first.
//   node dev-server.mjs [port]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("./dist/", import.meta.url));
const PORT = Number(process.argv[2] ?? 8100);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".avif": "image/avif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith("/")) path += "index.html";

  // Contain traversal: resolve inside ROOT or refuse.
  const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  // Mirror Vercel's resolution: `cleanUrls` makes /privacy find privacy.html, and a directory
  // serves its index — which is how the /soul and /dosha tile links resolve without a slash.
  const candidates = extname(file)
    ? [file]
    : [file, `${file}.html`, join(file, "index.html")];

  for (const candidate of candidates) {
    try {
      const data = await readFile(candidate);
      res.writeHead(200, {
        "Content-Type": TYPES[extname(candidate)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
      return;
    } catch {
      /* try the next candidate */
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
}).listen(PORT, () => {
  console.log(`anyma hub → http://localhost:${PORT}/`);
});
