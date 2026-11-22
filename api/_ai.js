// Easy Life Pro AI: tries every AI the owner has set up, in order, until one answers.
//   1. GEMINI_API_KEY (Vercel env), 2. keys the owner added from the app (stored encrypted),
//   3. GROQ_API_KEY and AI_KEYS (Vercel env; AI_KEYS = one "provider|key|model|url" per line).
// Gemini uses Google's API; every other service uses the OpenAI chat format.
import crypto from "node:crypto";
import { config, store } from "./_lib.js";

export const PROVIDERS = {
  gemini: { base: "https://generativelanguage.googleapis.com/v1beta", prefer: [] },
  groq: { base: "https://api.groq.com/openai/v1", prefer: [/gpt-oss-120b/, /llama-4-maverick/, /llama-3\.3-70b/, /qwen/, /kimi/, /gpt-oss-20b/, /llama/] },
  openai: { base: "https://api.openai.com/v1", prefer: [/^gpt-[\d.]+-mini$/, /^gpt-[\d.]+o?-mini/, /^gpt-[\d.]+$/, /^gpt-/] },
  openrouter: { base: "https://openrouter.ai/api/v1", prefer: [/^openrouter\/auto$/, /:free$/] },
  xai: { base: "https://api.x.ai/v1", prefer: [/grok-[\d.]+-fast/, /grok-[\d.]+-mini/, /^grok-/] },
  deepseek: { base: "https://api.deepseek.com/v1", prefer: [/deepseek-chat/, /deepseek/] },
  mistral: { base: "https://api.mistral.ai/v1", prefer: [/mistral-small-latest/, /mistral-medium-latest/, /-latest$/] },
  anthropic: { base: "https://api.anthropic.com/v1", prefer: [/haiku/, /sonnet/] },
  custom: { base: "", prefer: [] },
};
const VISION = /vision|llama-4|gpt-[45]|gpt-4o|grok-[2-9]|claude|haiku|sonnet|gemini|pixtral|qwen.*vl/i;

export function detect(key) {
  const k = String(key || "").trim();
  if (/^AIza/.test(k)) return "gemini";
  if (/^gsk_/.test(k)) return "groq";
  if (/^sk-or-/.test(k)) return "openrouter";
  if (/^sk-ant-/.test(k)) return "anthropic";
  if (/^xai-/.test(k)) return "xai";
  if (/^sk-/.test(k)) return "openai";
  return "gemini";
}

export function parseRing(text) {
  const out = [];
  for (const line of String(text || "").split(/\n+/)) {
    const p = line.trim().split("|").map((x) => x.trim());
    if (!p[0]) continue;
    if (p.length === 1) { out.push({ provider: detect(p[0]), key: p[0] }); continue; }
    const provider = p[0] in PROVIDERS ? p[0] : detect(p[1]);
    const k = { provider, key: p[1] || "" };
    if (p[2]) k.model = p[2];
    if (p[3]) k.url = p[3].replace(/\/+$/, "");
    if (k.key && (provider !== "custom" || k.url)) out.push(k);
  }
  return out;
}

export const mask = (key) => (key.length > 10 ? key.slice(0, 4) + "…" + key.slice(-4) : "••••");

// ---- Keys the owner adds from the app: encrypted with a key derived from the site's secret.
const DIR = "easylife-ai/";
const aesKey = () => crypto.createHash("sha256").update("easylife-ai:" + config().secret).digest();
function seal(text) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", aesKey(), iv);
  const data = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return { iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), data: data.toString("base64") };
}
function open(box) {
  const d = crypto.createDecipheriv("aes-256-gcm", aesKey(), Buffer.from(box.iv, "base64"));
  d.setAuthTag(Buffer.from(box.tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(box.data, "base64")), d.final()]).toString("utf8");
}

let cached = null, cachedAt = 0;
export async function storedRing() {
  if (cached && Date.now() - cachedAt < 60e3) return cached;
  try {
    const items = await store.list(DIR);
    cached = items.length ? parseRing(open(await store.getJSON(items[0]))) : [];
  } catch { cached = []; }
  cachedAt = Date.now();
  return cached;
}
export async function saveRing(text) {
  const ring = parseRing(text);
  const name = `${DIR}${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(6).toString("hex")}.json`;
  await store.put(name, JSON.stringify(seal(ring.map((k) => [k.provider, k.key, k.model || "", k.url || ""].join("|")).join("\n"))), "application/json");
  if (store.usesBlob()) {
    const old = (await store.list(DIR)).slice(2);
    if (old.length) { const { del } = await import("@vercel/blob"); await del(old.map((i) => i.url)).catch(() => {}); }
  }
  cached = ring; cachedAt = Date.now();
  return ring;
}

// ---- Owner token: proves the app belongs to the site owner (made after an email + password check).
const hmac = (s) => crypto.createHmac("sha256", config().secret).update(s).digest("base64url");
export function ownerToken() {
  const payload = Buffer.from(JSON.stringify({ o: "easylife", x: Date.now() + 365 * 864e5 })).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}
export function checkOwnerToken(t) {
  const [payload, sig] = String(t || "").split(".");
  if (!payload || !sig || !config().ready) return false;
  const a = Buffer.from(sig), b = Buffer.from(hmac(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()).x > Date.now(); } catch { return false; }
}

// ---- Calling the AIs. One shared deadline keeps the whole answer inside Vercel's time limit.
let deadline = 0;
const left = (most) => Math.max(1000, Math.min(most, deadline - Date.now()));
function parse(raw) {
  try { return JSON.parse(raw); } catch {}
  const m = String(raw || "").match(/\{[\s\S]*\}/);
  try { return m ? JSON.parse(m[0]) : null; } catch { return null; }
}

async function viaGemini(k, prompt, image, temperature) {
  const parts = [{ text: prompt }];
  if (image) parts.push({ inline_data: { mime_type: image.mime, data: image.base64 } });
  const models = [...new Set([k.model, process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest"].filter(Boolean))];
  for (const model of models) {
    const r = await fetch(`${PROVIDERS.gemini.base}/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": k.key },
      body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json", temperature } }),
      signal: AbortSignal.timeout(left(20e3)),
    }).catch(() => null);
    if (!r) continue;
    if ([400, 401, 403].includes(r.status)) return null;
    if (!r.ok) continue;
    const j = await r.json().catch(() => null);
    const out = parse((j?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join(""));
    if (out) return out;
  }
  return null;
}

const modelLists = new Map();
async function chatModels(base, k, vision) {
  if (k.model) return [k.model];
  if (!modelLists.has(base)) {
    const r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${k.key}`, "x-api-key": k.key, "anthropic-version": "2023-06-01" }, signal: AbortSignal.timeout(left(8e3)) }).catch(() => null);
    const j = r && r.ok ? await r.json().catch(() => null) : null;
    const ids = (j?.data || []).filter((m) => m.active !== false).map((m) => m.id);
    if (!ids.length) return [];
    modelLists.set(base, ids);
  }
  const prefer = PROVIDERS[k.provider]?.prefer || [];
  const chat = modelLists.get(base).filter((id) => !/embed|whisper|tts|speech|audio|image|dall-e|moderation|guard|realtime|transcribe|search|rerank|ocr|orpheus|compound/i.test(id) && (!vision || VISION.test(id)));
  const out = [];
  for (const re of prefer) for (const id of chat) if (re.test(id) && !out.includes(id)) out.push(id);
  for (const id of chat) if (!out.includes(id)) out.push(id);
  return out.slice(0, 3);
}

async function viaChat(k, prompt, image, temperature) {
  const base = k.provider === "custom" ? k.url : PROVIDERS[k.provider]?.base;
  if (!base) return null;
  const content = image ? [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:${image.mime};base64,${image.base64}` } }] : prompt;
  for (const model of await chatModels(base, k, !!image)) {
    const body = { model, temperature, messages: [{ role: "user", content }] };
    if (k.provider !== "anthropic") body.response_format = { type: "json_object" };
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${k.key}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(left(20e3)),
    }).catch(() => null);
    if (!r) continue;
    if (r.status === 401 || r.status === 403) return null;
    if (!r.ok) continue;
    const j = await r.json().catch(() => null);
    const out = parse(j?.choices?.[0]?.message?.content || "");
    if (out) return out;
  }
  return null;
}

/** Every key the server can use, in order. */
export async function allKeys() {
  const env = [];
  if (process.env.GEMINI_API_KEY) env.push({ provider: "gemini", key: process.env.GEMINI_API_KEY.trim() });
  const rest = [...parseRing(process.env.AI_KEYS || "")];
  if (process.env.GROQ_API_KEY) rest.unshift({ provider: "groq", key: process.env.GROQ_API_KEY.trim(), model: process.env.GROQ_MODEL || undefined });
  const seen = new Set();
  return [...env, ...(await storedRing()), ...rest].filter((k) => !seen.has(k.key) && seen.add(k.key));
}

/** Returns { result } from the first AI that answers, or { error }. */
export async function askAny(prompt, image = null, temperature = 0.2) {
  if (!prompt) return { error: "Nothing to read." };
  const keys = await allKeys();
  if (!keys.length) return { error: "AI is not set up on the server yet." };
  deadline = Date.now() + 55e3;
  for (const k of keys) {
    if (Date.now() > deadline - 2000) break;
    const out = k.provider === "gemini" ? await viaGemini(k, prompt, image, temperature) : await viaChat(k, prompt, image, temperature);
    if (out) return { result: out };
  }
  return { error: "AI is busy. Try again." };
}
