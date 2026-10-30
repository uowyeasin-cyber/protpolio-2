import { guard, store, query, readBody, send } from "./_lib.js";

const OK = /^(image\/(png|jpe?g|webp|gif|avif|svg\+xml)|video\/(mp4|webm|quicktime))$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "POST only." });
  if (!guard(req, res, { write: true })) return;
  const type = String(req.headers["content-type"] || "").split(";")[0].trim();
  if (!OK.test(type)) return send(res, 415, { error: "Only images and MP4/WebM videos." });
  const name = (query(req).get("name") || "file").toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-60);
  try {
    const data = await readBody(req, 4_300_000);
    const url = await store.put(`media/${Date.now()}-${name}`, data, type);
    send(res, 200, { url });
  } catch (e) {
    send(res, e.status || 500, { error: e.status === 413 ? "File is over 4 MB. Paste a link instead." : "Upload failed." });
  }
}
