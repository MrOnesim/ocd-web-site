import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { createApiHandler } from "./api.mjs";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DIST_DIR = path.resolve(process.cwd(), "dist");

const { handleApi } = createApiHandler();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res);
    return;
  }

  const cleanPath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(DIST_DIR, cleanPath);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    // Repli SPA pour / et /admin
    filePath = path.join(DIST_DIR, "index.html");
  }

  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.end("Ressource introuvable. Lancez npm run build.");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const stat = statSync(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.setHeader("Content-Type", contentType);
  if (url.pathname.startsWith("/assets/") || ext === ".woff2") {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (ext === ".html") {
    res.setHeader("Cache-Control", "no-cache");
  } else {
    res.setHeader("Cache-Control", "public, max-age=86400");
  }

  // Prise en charge HTTP Range pour le streaming vidéo MP4 mobile
  const range = req.headers.range;
  if (range && ext === ".mp4") {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = Number(startStr);
    const end = endStr ? Number(endStr) : stat.size - 1;
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Length", end - start + 1);
    createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Length", stat.size);
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Plateforme OCD Live active sur http://${HOST}:${PORT}`);
});
