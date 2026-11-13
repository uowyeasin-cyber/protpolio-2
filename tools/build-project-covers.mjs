// Renders a premium 1600x900 cover for each SHOWCASE project into
// img/cover-<slug>.webp (used on the project page, the hub and as og:image).
// Needs Playwright and ImageMagick on the machine that runs it:
//   node tools/build-project-covers.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { SHOWCASE } = new Function(fs.readFileSync(path.join(root, "data/showcase.js"), "utf8") + ";return {SHOWCASE}")();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

const html = (p) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1600px;height:900px;overflow:hidden;font-family:Geist,"Inter","Segoe UI",system-ui,sans-serif;color:#E9EEF8;
background:radial-gradient(900px 700px at 78% 20%,${hexA(p.accent, 0.35)},transparent 60%),radial-gradient(700px 500px at 0% 100%,${hexA(p.accent, 0.14)},transparent 60%),#060C18;position:relative}
body::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(900px 600px at 60% 40%,#000,transparent 75%)}
.txt{position:absolute;left:88px;top:0;bottom:0;width:560px;display:flex;flex-direction:column;justify-content:center;gap:22px}
.k{font:600 18px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:${p.accent}}
h1{font-size:76px;line-height:1;letter-spacing:-.04em;font-weight:700}
h2{font-size:34px;line-height:1.15;letter-spacing:-.02em;font-weight:500;color:#C9D3E6}
h2 b{color:${p.accent};font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}.chips span{border:1px solid #2a3753;background:rgba(19,31,54,.8);border-radius:999px;padding:8px 16px;font:500 17px ui-monospace,Menlo,monospace}
.live{display:inline-flex;align-items:center;gap:10px;font-size:19px;color:#9BA9C2}.live i{width:12px;height:12px;border-radius:50%;background:#3DD68C;box-shadow:0 0 0 6px rgba(61,214,140,.18)}
.win{position:absolute;left:720px;top:130px;width:1000px;border-radius:18px;overflow:hidden;border:1px solid #2a3753;background:#0b111e;
box-shadow:0 60px 120px -30px rgba(0,0,0,.9),0 0 160px -20px ${hexA(p.accent, 0.5)};transform:perspective(1800px) rotateY(-9deg) rotateX(3deg);transform-origin:left center}
.bar{height:44px;display:flex;align-items:center;gap:9px;padding:0 18px;background:#0f1828;border-bottom:1px solid #1d2a43}
.bar i{width:13px;height:13px;border-radius:50%}.bar i:nth-child(1){background:#ff5f57}.bar i:nth-child(2){background:#febc2e}.bar i:nth-child(3){background:#28c840}
.win img{display:block;width:100%;height:auto;max-height:625px;object-fit:cover;object-position:top}
.badge{position:absolute;right:56px;bottom:48px;font:600 16px ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#62718D}
</style></head><body>
<div class="txt"><div class="k">${esc(p.en.kicker)}</div><h1>${esc(p.n.split(":")[0])}</h1><h2>${esc(p.en.title)} <b>${esc(p.en.em)}</b></h2>
<div class="chips">${p.tags.slice(0, 4).map((t) => `<span>${esc(t)}</span>`).join("")}</div><div class="live"><i></i>Try the live demo · yeasinarafatbd.vercel.app/projects</div></div>
<div class="win"><div class="bar"><i></i><i></i><i></i></div><img src="file://${path.join(root, "img", p.shot)}"></div>
<div class="badge">AVERROES AI</div>
</body></html>`;

const only = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
for (const p of SHOWCASE) {
  if (only.length && !only.includes(p.slug)) continue;
  const tmpHtml = path.join(root, `.cover-${p.slug}.html`), png = path.join(root, `.cover-${p.slug}.png`);
  fs.writeFileSync(tmpHtml, html(p));
  await page.goto("file://" + tmpHtml);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: png });
  execFileSync("convert", [png, "-quality", "82", path.join(root, "img", `cover-${p.slug}.webp`)]);
  fs.rmSync(tmpHtml); fs.rmSync(png);
  console.log("cover", p.slug);
}
await browser.close();
