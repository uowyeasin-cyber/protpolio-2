import { guard, session, store, query, readJSON, send, versionId } from "./_lib.js";

const EMPTY = { v: 1, ops: [], pages: [], hidden: [], theme: {} };

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const want = query(req).get("v");
      const items = await store.list("content/");
      if (want) {
        if (!guard(req, res)) return;
        const item = items.find((i) => versionId(i.pathname) === want);
        return item ? send(res, 200, { id: want, content: await store.getJSON(item) }) : send(res, 404, { error: "No such version." });
      }
      const latest = items[0];
      const body = latest ? { id: versionId(latest.pathname), content: await store.getJSON(latest) } : { id: null, content: EMPTY };
      return send(res, 200, body, {
        "Cache-Control": session(req) ? "no-store" : "public, max-age=0, s-maxage=5, stale-while-revalidate=30",
      });
    }
    if (req.method === "PUT") {
      if (!guard(req, res, { write: true })) return;
      const content = await readJSON(req, 2_000_000);
      if (!content || content.v !== 1 || !Array.isArray(content.ops)) return send(res, 400, { error: "Bad content." });
      const id = new Date().toISOString().replace(/[:.]/g, "-") + "-" + Math.random().toString(36).slice(2, 6);
      await store.put(`content/${id}.json`, JSON.stringify(content), "application/json");
      return send(res, 200, { id });
    }
    send(res, 405, { error: "GET or PUT only." });
  } catch (e) {
    send(res, e.status || 500, { error: e.status ? e.message : "Server error." });
  }
}
