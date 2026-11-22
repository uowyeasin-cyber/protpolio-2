// Easy Life "Circle": a small shared space for a family or group of friends.
// Anyone can post a job (Mother's medicine, the week's bazar); a member claims it with "I'll take it",
// so everyone sees who is doing what; the one who claimed marks it done. An activity feed keeps everyone updated.
//
//   POST /api/circle?a=create {name, member:{id,name}}            -> {circle}
//   POST /api/circle?a=join   {code, member:{id,name}}            -> {circle}
//   POST /api/circle?a=get    {id, m}                             -> {circle}
//   POST /api/circle?a=act    {id, m, op, ...}                    -> {circle}
//        op: add {title, due?} | claim {taskId} | release {taskId} | done {taskId} | undo {taskId}
//            | remove {taskId} | post {text} | leave | rename {name}
//
// A member id is a random id the phone makes once; only members can read or change a circle.
// Storage: one JSON file per circle in Vercel Blob (newest copy wins, older copies pruned).
import crypto from "node:crypto";
import { store, query, readJSON, send } from "./_lib.js";

const DIR = "circles/";
const MAX_TASKS = 300, MAX_FEED = 200, MAX_MEMBERS = 30;
const clean = (v, n = 200) => String(v ?? "").replace(/[<>\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const rid = (n = 6) => crypto.randomBytes(n).toString("hex");
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-") + "-" + rid(2);
const newCode = () => Array.from(crypto.randomBytes(6), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
const memberOf = (b) => ({ id: clean(b?.id, 40), name: clean(b?.name, 40) || "Member" });

async function load(id) {
  if (!/^[a-f0-9]{16}$/.test(id)) return null;
  const items = await store.list(`${DIR}${id}/`);
  if (!items.length) return null;
  return store.getJSON(items[0]).catch(() => null);
}

async function save(c) {
  c.tasks = c.tasks.slice(0, MAX_TASKS);
  c.feed = c.feed.slice(0, MAX_FEED);
  c.updated = Date.now();
  await store.put(`${DIR}${c.id}/${stamp()}.json`, JSON.stringify(c), "application/json");
  if (store.usesBlob()) {
    const old = (await store.list(`${DIR}${c.id}/`)).slice(3);
    if (old.length) { const { del } = await import("@vercel/blob"); await del(old.map((i) => i.url)).catch(() => {}); }
  }
  return c;
}

async function findByCode(code) {
  const items = await store.list(`${DIR}codes/${code}/`);
  if (!items.length) return null;
  const ref = await store.getJSON(items[0]).catch(() => null);
  return ref?.id ? load(ref.id) : null;
}

const feed = (c, who, text) => c.feed.unshift({ at: Date.now(), who: who.name, text: clean(text, 300) });
const view = (c) => ({ id: c.id, code: c.code, name: c.name, members: c.members, tasks: c.tasks, feed: c.feed.slice(0, 60), updated: c.updated });

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return send(res, 405, { error: "POST only." });
    const a = query(req).get("a");
    const b = await readJSON(req, 20_000);

    if (a === "create") {
      const me = memberOf(b.member);
      if (!me.id) return send(res, 400, { error: "Missing member." });
      const c = { id: rid(8), code: newCode(), name: clean(b.name, 60) || "Family", created: Date.now(), members: [{ ...me, joined: Date.now() }], tasks: [], feed: [] };
      feed(c, me, `created the circle`);
      await store.put(`${DIR}codes/${c.code}/ref.json`, JSON.stringify({ id: c.id }), "application/json");
      return send(res, 200, { circle: view(await save(c)) });
    }

    if (a === "join") {
      const me = memberOf(b.member);
      const code = clean(b.code, 12).toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!me.id || code.length !== 6) return send(res, 400, { error: "Check the code." });
      const c = await findByCode(code);
      if (!c) return send(res, 404, { error: "No circle with this code." });
      const old = c.members.find((x) => x.id === me.id);
      if (old) old.name = me.name;
      else {
        if (c.members.length >= MAX_MEMBERS) return send(res, 409, { error: "This circle is full." });
        c.members.push({ ...me, joined: Date.now() });
        feed(c, me, `joined`);
      }
      return send(res, 200, { circle: view(await save(c)) });
    }

    const c = await load(clean(b.id, 20));
    const me = c?.members.find((x) => x.id === clean(b.m, 40));
    if (!c || !me) return send(res, 404, { error: "Circle not found." });
    if (a === "get") return send(res, 200, { circle: view(c) });
    if (a !== "act") return send(res, 400, { error: "Unknown action." });

    const t = c.tasks.find((x) => x.id === b.taskId);
    switch (b.op) {
      case "add": {
        const title = clean(b.title, 140);
        if (!title) return send(res, 400, { error: "Write the job." });
        const due = Number(b.due) > 0 ? Number(b.due) : null;
        c.tasks.unshift({ id: rid(5), title, by: me.name, byId: me.id, created: Date.now(), due, claimedBy: null, claimedById: null, done: false });
        feed(c, me, `added “${title}”`);
        break;
      }
      case "claim":
        if (!t) return send(res, 404, { error: "Job not found." });
        if (t.claimedById && t.claimedById !== me.id) return send(res, 409, { error: `${t.claimedBy} already took it.`, circle: view(c) });
        t.claimedBy = me.name; t.claimedById = me.id; t.claimedAt = Date.now();
        feed(c, me, `will do “${t.title}”`);
        break;
      case "release":
        if (!t || t.claimedById !== me.id) return send(res, 403, { error: "Only the one who took it can give it back." });
        t.claimedBy = null; t.claimedById = null;
        feed(c, me, `gave back “${t.title}”`);
        break;
      case "done":
        if (!t) return send(res, 404, { error: "Job not found." });
        t.done = true; t.doneBy = me.name; t.doneAt = Date.now();
        if (!t.claimedById) { t.claimedBy = me.name; t.claimedById = me.id; }
        feed(c, me, `finished “${t.title}” ✓`);
        break;
      case "undo":
        if (!t) return send(res, 404, { error: "Job not found." });
        t.done = false; t.doneBy = null; t.doneAt = null;
        break;
      case "remove":
        if (!t) return send(res, 404, { error: "Job not found." });
        if (t.byId !== me.id && t.claimedById !== me.id) return send(res, 403, { error: "Only the one who added it can delete it." });
        c.tasks = c.tasks.filter((x) => x !== t);
        feed(c, me, `removed “${t.title}”`);
        break;
      case "post": {
        const text = clean(b.text, 300);
        if (!text) return send(res, 400, { error: "Write something." });
        feed(c, me, text);
        break;
      }
      case "rename":
        c.name = clean(b.name, 60) || c.name;
        break;
      case "leave":
        c.members = c.members.filter((x) => x.id !== me.id);
        feed(c, me, `left`);
        break;
      default:
        return send(res, 400, { error: "Unknown action." });
    }
    return send(res, 200, { circle: view(await save(c)) });
  } catch (e) {
    return send(res, 500, { error: "Something went wrong. Try again." });
  }
}
