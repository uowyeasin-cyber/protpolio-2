// Local server: static files plus /api/* handlers, with edits stored in ./.cms-data.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const port = +process.env.PORT || 3000;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://local");
  const m = url.pathname.match(/^\/api\/([a-z-]+)$/);
  if (m && fs.existsSync(path.join(root, "api", m[1] + ".js"))) {
    const mod = await import(path.join(root, "api", m[1] + ".js") + "?t=" + Date.now());
    return mod.default(req, res);
  }
  let file = url.pathname.startsWith("/cms-files/")
    ? path.join(path.resolve(process.env.CMS_DATA_DIR || ".cms-data"), decodeURIComponent(url.pathname.slice(11)))
    : path.join(root, decodeURIComponent(url.pathname));
  if (file.endsWith("/")) file += "index.html";
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log("http://localhost:" + port));
