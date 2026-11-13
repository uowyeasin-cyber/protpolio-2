// License server for the apps sold from this site: Storefront Pro (default) and Easy Life (?app=easylife).
// Each app keeps its own keys, settings and state; `host` is the web address for Storefront Pro and the
// phone's device code for Easy Life. For Easy Life "locked" only means the free plan, never a locked app.
//
// Called by every sold copy of the store (server to server, cached there for a while):
//   POST /api/license            {key, host}   -> { status: active | trial | locked, message, left? }
// Public:
//   GET  /api/license?a=info                   -> plan prices, contact, demo limits, download link
// Owner only (signed in at /#login), used by /store-licences.html:
//   GET  /api/license?a=list                   -> the whole state
//   POST /api/license?a=settings {on, opens, days, grace, prices, contact, download}
//   POST /api/license?a=create   {note, host, plan}            -> new key
//   POST /api/license?a=site     {id, status?, plan?, expires?, host?, note?, maxOpens?, maxDays?, renew?, reset?, delete?}
//
// A copy without a key runs as a demo for its web address until the demo sessions or days run out, then it
// shows a locked page. A key has a plan: lifetime never ends; monthly and yearly stop after `expires` plus
// `grace` days until the owner presses Renew. Switching `on` off lets every copy run freely.
//
// Storage: the whole state is one JSON blob, written as a new file on each change (newest wins, old ones pruned).
import crypto from "node:crypto";
import { guard, sameOrigin, store, query, readJSON, send } from "./_lib.js";

const APPS = {
  storefront: { dir: "store-licences/", prefix: "SP" },
  easylife: { dir: "easylife-licences/", prefix: "EL" },
};
const DAY = 864e5, SESSION_GAP = 30 * 60e3;
const PLANS = { lifetime: 0, monthly: 1, yearly: 12 };
const EL_DEFAULTS = { on: true, opens: 100000, days: 14, grace: 3, download: "https://github.com/uowyeasin-cyber/super-note/releases/latest/download/super-note-beta.apk", prices: { monthly: "৳149 a month", yearly: "৳1,490 a year", lifetime: "৳596 once" }, contact: "WhatsApp +60178151865", sites: [] };
const DEFAULTS = { on: true, opens: 3, days: 1, grace: 3, download: "/downloads/storefront-pro.zip", prices: { monthly: "৳1,500 / $15 a month", yearly: "৳12,000 / $120 a year (save 33%)", lifetime: "৳30,000 / $299 once" }, contact: "WhatsApp +60178151865", sites: [] };

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-") + "-" + crypto.randomBytes(2).toString("hex");
const clean = (v, n = 200) => String(v ?? "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, n);
const num = (v, d) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? Math.min(n, 100000) : d; };
const cleanHost = (h) => String(h || "").toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "").replace(/^www\./, "").slice(0, 120);
const newKey = (prefix = "SP") => `${prefix}-${crypto.randomBytes(9).toString("hex").toUpperCase().match(/.{6}/g).join("-")}`;
const newId = () => crypto.randomBytes(6).toString("hex");
const planOf = (p) => (p in PLANS ? p : "lifetime");

// End date after one more period of the plan, counted from the later of today and the current end date.
function extend(plan, from = "") {
  const months = PLANS[plan] || 0;
  if (!months) return "";
  const d = new Date(Math.max(Date.now(), from ? new Date(from).getTime() || 0 : 0));
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
const expired = (s, grace, now) => !!s.expires && s.plan !== "lifetime" && now > new Date(s.expires).getTime() + (grace + 1) * DAY;
const endedMsg = (s) => `This ${s.plan || ""} license ended on ${s.expires}. Contact the seller to renew.`;

async function load(APP) {
  const D = APP === APPS.easylife ? EL_DEFAULTS : DEFAULTS;
  const items = await store.list(APP.dir);
  const v = items.length ? await store.getJSON(items[0]).catch(() => ({})) : {};
  return { ...D, ...v, prices: { ...D.prices, ...(v.prices || {}) }, sites: v.sites || [] };
}
async function save(state, APP) {
  state.sites = state.sites.slice(0, APP === APPS.easylife ? 5000 : 500);
  await store.put(`${APP.dir}${stamp()}.json`, JSON.stringify(state), "application/json");
  // Keep only the newest few copies.
  if (store.usesBlob()) {
    const old = (await store.list(APP.dir)).slice(5);
    if (old.length) { const { del } = await import("@vercel/blob"); await del(old.map((i) => i.url)).catch(() => {}); }
  }
}

async function check(rawKey, rawHost, APP) {
  const host = cleanHost(rawHost), key = clean(rawKey, 60).toUpperCase();
  if (!host) return { status: "locked", message: "This copy could not tell its web address." };
  const l = await load(APP);
  if (!l.on) return { status: "active", message: "" };
  const now = Date.now(), iso = new Date(now).toISOString();
  let changed = false, answer;
  if (key) {
    const s = l.sites.find((x) => x.key === key);
    if (!s) answer = { status: "locked", message: "This license key is not valid." };
    else if (s.status === "blocked") answer = { status: "locked", message: "This license has been switched off by the seller." };
    else if (s.host && s.host !== host) answer = { status: "locked", message: `This license key belongs to ${s.host}. Ask the seller to move it.` };
    else if (expired(s, l.grace, now)) answer = { status: "locked", message: endedMsg(s) };
    else {
      if (!s.host || s.status !== "active" || !s.last || now - new Date(s.last).getTime() > 6 * 3600e3) {
        s.host ||= host; s.status = "active"; s.last = iso; s.first ||= iso; changed = true;
      }
      answer = { status: "active", message: "" };
    }
  } else {
    let s = l.sites.find((x) => x.host === host && !x.key);
    if (!s) { s = { id: newId(), host, key: "", status: "trial", opens: 0, maxOpens: l.opens, maxDays: l.days, first: iso, last: "", note: "", plan: "lifetime", expires: "" }; l.sites.unshift(s); changed = true; }
    if (!s.last || now - new Date(s.last).getTime() > SESSION_GAP) { s.opens++; s.last = iso; changed = true; }
    const usedDays = (now - new Date(s.first).getTime()) / DAY;
    if (s.status === "active") answer = expired(s, l.grace, now) ? { status: "locked", message: endedMsg(s) } : { status: "active", message: "" };
    else if (s.status === "blocked") answer = { status: "locked", message: "This copy has been switched off by the seller." };
    else if (s.opens > s.maxOpens || usedDays > s.maxDays) answer = { status: "locked", message: "The free demo has ended. Contact the seller to buy a license." };
    else answer = { status: "trial", message: "Demo", left: { opens: Math.max(0, s.maxOpens - s.opens), days: Math.max(0, Math.ceil(s.maxDays - usedDays)) } };
  }
  if (changed) await save(l, APP);
  return answer;
}

// Easy Life Pro reads notes with the site owner's Gemini key (GEMINI_API_KEY), so buyers need no key of their own.
const AREAS = ["academic", "business", "skills", "social", "family", "personal"];
async function aiRead(text, nowIso, weekday) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "AI is not set up on the server yet." };
  const prompt = `You organise a personal note app. The user may speak Bangla, English or both.
Now is ${nowIso} (${weekday}).
Read the note and return JSON only:
{"area": one of ${JSON.stringify(AREAS)}, "title": short title in the note's own language (max 8 words),
 "tasks": [{"title": short action in the note's language, "at": ISO 8601 local time with offset or null, "repeat": "none"|"daily"|"weekly", "level": "normal"|"urgent"|"critical"}]}
Rules: one task per separate thing to do that has a time or day; if only a day is given use 09:00; bare hours 1-6 mean PM;
medicine and bills are "urgent"; "must/অবশ্যই/wake me" is "critical"; ideas and plain notes have no tasks.
Note: ${JSON.stringify(text)}`;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.1 } }),
  });
  if (!r.ok) return { error: "AI is busy. Try again." };
  const j = await r.json();
  const raw = j?.candidates?.[0]?.content?.parts?.[0]?.text;
  try { return { result: JSON.parse(raw) }; } catch { return { error: "AI gave an unreadable answer." }; }
}

export default async function handler(req, res) {
  const q = query(req), a = q.get("a");
  const APP = q.get("app") === "easylife" ? APPS.easylife : APPS.storefront;
  try {
    if (!a) {
      if (req.method !== "POST") return send(res, 405, { error: "POST only." });
      const b = await readJSON(req, 2_000);
      const r = await check(b.key, b.host, APP);
      if (APP === APPS.easylife) {
        // Tell the phone its plan and end date so it can keep working offline.
        const l = await load(APP);
        const s = b.key ? l.sites.find((x) => x.key === clean(b.key, 60).toUpperCase()) : null;
        if (s && r.status === "active") Object.assign(r, { plan: s.plan, expires: s.expires || "" });
      }
      return send(res, 200, r);
    }
    if (a === "ai" && APP === APPS.easylife) {
      if (req.method !== "POST") return send(res, 405, { error: "POST only." });
      const b = await readJSON(req, 8_000);
      const r = await check(b.key, b.host, APP);
      if (r.status === "locked") return send(res, 402, { error: "AI needs Easy Life Pro." });
      const out = await aiRead(clean(b.text, 2000), clean(b.now, 40), clean(b.weekday, 12));
      return send(res, out.error ? 503 : 200, out);
    }
    if (a === "info") {
      const l = await load(APP);
      return send(res, 200, { on: l.on, opens: l.opens, days: l.days, prices: l.prices, contact: l.contact, download: l.download });
    }
    if (a === "list") {
      if (!guard(req, res)) return;
      return send(res, 200, await load(APP));
    }
    if (!["settings", "create", "site"].includes(a)) return send(res, 400, { error: "Unknown action." });
    if (req.method !== "POST") return send(res, 405, { error: "POST only." });
    if (!guard(req, res, { write: true })) return;
    if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
    const b = await readJSON(req, 10_000);
    const l = await load(APP);
    if (a === "settings") {
      l.on = Boolean(b.on); l.opens = num(b.opens, l.opens); l.days = num(b.days, l.days); l.grace = num(b.grace, l.grace);
      l.download = clean(b.download, 300) || l.download; l.contact = clean(b.contact, 300);
      for (const p of Object.keys(PLANS)) l.prices[p] = clean(b.prices?.[p], 80);
    } else if (a === "create") {
      const plan = planOf(b.plan);
      l.sites.unshift({ id: newId(), host: cleanHost(b.host), key: newKey(APP.prefix), status: "active", opens: 0, maxOpens: 0, maxDays: 0, first: "", last: "", note: clean(b.note), plan, expires: extend(plan) });
    } else {
      const i = l.sites.findIndex((x) => x.id === b.id);
      if (i < 0) return send(res, 404, { error: "Not found." });
      if (b.delete) l.sites.splice(i, 1);
      else {
        const s = l.sites[i];
        if (["trial", "active", "blocked"].includes(b.status)) s.status = b.status;
        if (b.plan !== undefined) {
          const plan = planOf(b.plan);
          if (plan !== s.plan) { s.plan = plan; s.expires = extend(plan); }
          else if (plan === "lifetime") s.expires = "";
          else if (/^\d{4}-\d{2}-\d{2}$/.test(b.expires || "")) s.expires = b.expires;
        }
        if (b.renew && s.plan && s.plan !== "lifetime") { s.expires = extend(s.plan, s.expires); if (s.status === "blocked") s.status = "active"; }
        if (b.reset) { s.opens = 0; s.first = new Date().toISOString(); }
        if (b.maxOpens !== undefined) s.maxOpens = num(b.maxOpens, s.maxOpens);
        if (b.maxDays !== undefined) s.maxDays = num(b.maxDays, s.maxDays);
        if (s.key && b.host !== undefined) s.host = cleanHost(b.host);
        if (b.note !== undefined) s.note = clean(b.note);
      }
    }
    await save(l, APP);
    return send(res, 200, l);
  } catch (e) {
    console.error("license", e);
    send(res, e.status || 500, { error: e.status ? e.message : "Server error." });
  }
}
