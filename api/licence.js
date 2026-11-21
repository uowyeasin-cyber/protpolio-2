// Licence server for apps sold from this site (Portfolio Studio trial downloads).
//
// Public:
//   POST /api/licence?a=trial    {name, email, whatsapp}   -> { key, status, download }
//   POST /api/licence?a=check    {key, host, session}       -> { status, used, limit }   (called by the buyer's app)
// Owner only (signed in at /#login):
//   GET  /api/licence?a=list                                -> { settings, licences[] }
//   POST /api/licence?a=settings {trialLimit, autoApprove}
//   POST /api/licence?a=update   {key, limit?, status?, note?}
//   POST /api/licence?a=issue    {key, domain?}             -> { token }  (full licence, works offline forever)
//
// Storage is append-only (one new blob per change) so reads never see a stale cached copy:
//   licences/<key>/<time>.json   newest = current record
//   licence-uses/<key>/<time>    one file per trial use
//   licence-settings/<time>.json newest = current settings
import crypto from "node:crypto";
import { guard, sameOrigin, store, query, readJSON, send } from "./_lib.js";

const DEFAULTS = { trialLimit: 3, autoApprove: true };
const DOWNLOAD = "/downloads/portfolio-studio-trial.zip";
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-") + "-" + crypto.randomBytes(2).toString("hex");
const KEY_RE = /^PST-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function newKey() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const b = crypto.randomBytes(16);
  const s = [...b].map((x) => abc[x % abc.length]).join("");
  return `PST-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}`;
}

async function latest(prefix) {
  const items = await store.list(prefix);
  return items.length ? store.getJSON(items[0]) : null;
}
const settings = async () => ({ ...DEFAULTS, ...((await latest("licence-settings/")) || {}) });
const getRec = (key) => (KEY_RE.test(key || "") ? latest(`licences/${key}/`) : Promise.resolve(null));
const putRec = (rec) => store.put(`licences/${rec.key}/${stamp()}.json`, JSON.stringify(rec), "application/json");
// Works with Vercel Blob (lists nested files) and the local folder store (lists sub-folders).
const allKeys = async () => [...new Set((await store.list("licences/")).map((i) => i.pathname.split("/")[1]).filter(Boolean))];
const usesOf = async (key) => (await store.list(`licence-uses/${key}/`)).length;

function view(rec, uses, s) {
  const limit = rec.limit ?? s.trialLimit;
  let status = rec.status;
  if (status === "trial" && uses >= limit) status = "expired";
  return { ...rec, uses, limit, status };
}

// Full licence: "PSL1.<payload>.<signature>", Ed25519, verified offline by the app with the public key.
function issueToken(rec, domain) {
  const pem = (process.env.LICENCE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!pem) throw Object.assign(new Error("Add LICENCE_PRIVATE_KEY in Vercel first."), { status: 503 });
  const payload = Buffer.from(JSON.stringify({ k: rec.key, n: rec.name, e: rec.email, d: domain || "", iat: Date.now() })).toString("base64url");
  const sig = crypto.sign(null, Buffer.from("PSL1." + payload), crypto.createPrivateKey(pem)).toString("base64url");
  return `PSL1.${payload}.${sig}`;
}

const tries = new Map(); // ip -> { n, t }
function limited(req, max) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  const now = Date.now(), t = tries.get(ip);
  if (!t || now - t.t > 3600e3) return tries.set(ip, { n: 1, t: now }), false;
  t.n++;
  return t.n > max;
}

const clean = (v, n = 120) => String(v || "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, n);

export default async function handler(req, res) {
  const a = query(req).get("a");
  try {
    // ---------- public ----------
    if (a === "trial") {
      if (req.method !== "POST") return send(res, 405, { error: "POST only." });
      if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
      if (limited(req, 5)) return send(res, 429, { error: "Too many requests. Try again in an hour." });
      const b = await readJSON(req, 5_000);
      const name = clean(b.name, 80), email = clean(b.email, 120).toLowerCase(), whatsapp = clean(b.whatsapp, 30).replace(/[^\d+]/g, "");
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(res, 400, { error: "Please enter your name and a valid email." });
      const s = await settings();
      // One trial per email: return the existing key.
      for (const k of await allKeys()) {
        const r = await latest(`licences/${k}/`).catch(() => null);
        if (r && r.email === email) {
          const v = view(r, await usesOf(r.key), s);
          return send(res, 200, { key: v.key, status: v.status, limit: v.limit, download: DOWNLOAD });
        }
      }
      const rec = { key: newKey(), name, email, whatsapp, created: new Date().toISOString(), status: s.autoApprove ? "trial" : "pending", limit: null, note: "" };
      await putRec(rec);
      return send(res, 200, { key: rec.key, status: rec.status, limit: s.trialLimit, download: DOWNLOAD });
    }

    if (a === "check") {
      if (req.method !== "POST") return send(res, 405, { error: "POST only." });
      if (limited(req, 600)) return send(res, 429, { status: "error", error: "Too many requests." });
      const b = await readJSON(req, 2_000);
      const key = String(b.key || "").trim().toUpperCase();
      const rec = await getRec(key);
      if (!rec) return send(res, 200, { status: "invalid" });
      const s = await settings();
      let uses = await usesOf(key);
      const limit = rec.limit ?? s.trialLimit;
      let status = rec.status; // trial | pending | blocked | active
      if (status === "trial") {
        if (b.session) {
          // A new browser session is one "use". Count it only while uses are left.
          if (uses < limit) {
            await store.put(`licence-uses/${key}/${stamp()}`, JSON.stringify({ host: clean(b.host, 100), at: new Date().toISOString() }), "application/json");
            uses++;
          } else status = "expired";
        } else if (uses > limit) status = "expired"; // owner lowered the limit
      }
      return send(res, 200, { status, used: Math.min(uses, limit), limit, name: rec.name });
    }

    // ---------- owner ----------
    if (a === "list") {
      if (!guard(req, res)) return;
      const s = await settings();
      const out = [];
      for (const k of await allKeys()) {
        const rec = await latest(`licences/${k}/`);
        if (!rec) continue;
        const uses = await store.list(`licence-uses/${k}/`);
        let lastHost = "";
        if (uses[0]) lastHost = (await store.getJSON(uses[0]).catch(() => ({}))).host || "";
        out.push({ ...view(rec, uses.length, s), lastUse: uses[0]?.uploadedAt || null, lastHost });
      }
      out.sort((x, y) => (x.created < y.created ? 1 : -1));
      return send(res, 200, { settings: s, licences: out });
    }

    if (["settings", "update", "issue"].includes(a)) {
      if (req.method !== "POST") return send(res, 405, { error: "POST only." });
      if (!guard(req, res, { write: true })) return;
      const b = await readJSON(req, 5_000);
      if (a === "settings") {
        const s = await settings();
        const next = {
          trialLimit: Math.max(0, Math.min(1000, parseInt(b.trialLimit ?? s.trialLimit, 10) || 0)),
          autoApprove: b.autoApprove === undefined ? s.autoApprove : Boolean(b.autoApprove),
        };
        await store.put(`licence-settings/${stamp()}.json`, JSON.stringify(next), "application/json");
        return send(res, 200, { settings: next });
      }
      const rec = await getRec(String(b.key || ""));
      if (!rec) return send(res, 404, { error: "No such key." });
      if (a === "update") {
        if (b.limit !== undefined) rec.limit = b.limit === null || b.limit === "" ? null : Math.max(0, Math.min(1000, parseInt(b.limit, 10) || 0));
        if (b.status !== undefined) {
          if (!["trial", "pending", "blocked", "active"].includes(b.status)) return send(res, 400, { error: "Bad status." });
          if (b.status === "active" && !rec.token) return send(res, 400, { error: "Use Issue licence to activate." });
          rec.status = b.status;
        }
        if (b.note !== undefined) rec.note = clean(b.note, 300);
        await putRec(rec);
        return send(res, 200, { ok: true });
      }
      // issue
      rec.token = issueToken(rec, clean(b.domain, 100).toLowerCase());
      rec.status = "active";
      rec.issued = new Date().toISOString();
      await putRec(rec);
      return send(res, 200, { token: rec.token });
    }

    send(res, 400, { error: "Unknown action." });
  } catch (e) {
    send(res, e.status || 500, { error: e.status ? e.message : "Server error." });
  }
}
