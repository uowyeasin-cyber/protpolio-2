// Builds one premium showcase page per entry in SHOWCASE (data/showcase.js)
// at /projects/<slug>/index.html, a /projects/ hub, and /projects/projects.json
// (the same data for other sites, such as an agency website, to reuse).
// Covers come from tools/build-project-covers.mjs. Run after editing:
//   node tools/build-project-pages.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const load = (f, names) => new Function(fs.readFileSync(path.join(root, f), "utf8") + `;return {${names}}`)();
const { SITE } = load("data/content.js", "SITE");
const { SHOWCASE, SHOWCASE_LINKED } = load("data/showcase.js", "SHOWCASE,SHOWCASE_LINKED");
const BASE = SITE.url.replace(/\/$/, "");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const T = (en, bn, tag = "span") => `<${tag} class="en">${esc(en)}</${tag}><${tag} class="bn" lang="bn">${esc(bn)}</${tag}>`;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const wa = (text) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
const cover = (p) => `/img/cover-${p.slug}.webp`;
const ext = (h) => /^https?:/.test(h);
const tgt = (h) => (ext(h) || h.startsWith("/demo/") ? ' target="_blank" rel="noopener"' : "");
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

const CSS = `:root{--bg:#060C18;--card:#0C1526;--raise:#131F36;--line:#1D2A43;--text:#E9EEF8;--soft:#9BA9C2;--faint:#62718D;--wa:#25D366;color-scheme:dark}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(1100px 620px at 85% -8%,var(--glow),transparent 62%),radial-gradient(800px 500px at -10% 30%,rgba(91,140,255,.07),transparent 60%),var(--bg);color:var(--text);font:16px/1.6 Geist,system-ui,-apple-system,"Segoe UI","Hind Siliguri","Noto Sans Bengali",sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
[lang="bn"]{font-family:"Hind Siliguri","Noto Sans Bengali",Geist,system-ui,sans-serif}
html[data-lang="bn"] .en,html:not([data-lang="bn"]) .bn{display:none}
a{color:var(--accent)}img{max-width:100%;display:block}
.wrap{max-width:1160px;margin:0 auto;padding:0 16px}
nav.top{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:18px 0}
nav.top>a{color:var(--text);text-decoration:none;font-weight:600}
.navr{display:flex;gap:8px;align-items:center}
.lang{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:3px;background:var(--card)}
.lang button{border:0;background:none;color:var(--soft);font:600 .8rem Geist,"Hind Siliguri",sans-serif;padding:6px 11px;border-radius:999px;cursor:pointer}
.lang button[aria-pressed="true"]{background:var(--accent);color:#06101f}
.mono{font:500 .74rem "Geist Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}
h1{font-size:clamp(2.1rem,5.4vw,3.9rem);line-height:1.04;letter-spacing:-.035em;margin:.3em 0;text-wrap:balance}
h1 em{font-style:normal;background:linear-gradient(90deg,var(--accent),#fff 140%);-webkit-background-clip:text;background-clip:text;color:transparent}
h2{font-size:clamp(1.5rem,3vw,2.2rem);letter-spacing:-.02em;margin:.2em 0 .6em;line-height:1.15}
.lead{color:var(--soft);font-size:1.12rem;max-width:62ch}
.hero{display:grid;gap:36px;align-items:center;padding:24px 0 40px}
.hero.phone-hero{grid-template-columns:1.15fr .85fr}
.hero.wide{grid-template-columns:1fr}.hero.wide .copy{max-width:780px}
@media(max-width:860px){.hero.phone-hero{grid-template-columns:1fr}}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:#06101f;border:1px solid transparent;border-radius:9px;padding:12px 18px;font:600 .95rem Geist,"Hind Siliguri",sans-serif;text-decoration:none;cursor:pointer;transition:transform .15s,filter .15s}
.btn:hover{transform:translateY(-1px);filter:brightness(1.08)}
.btn.ghost{background:transparent;border-color:var(--line);color:var(--text)}
.btn.wa{background:var(--wa);color:#05210f}
.acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.status{display:inline-flex;gap:8px;align-items:center;margin-top:18px;padding:6px 12px;border:1px solid var(--line);border-radius:999px;font-size:.85rem;color:var(--soft);background:rgba(12,21,38,.6)}
.status i{width:8px;height:8px;border-radius:50%;background:var(--ok,#3DD68C);box-shadow:0 0 0 4px rgba(61,214,140,.15)}
.phone{justify-self:center;width:min(300px,100%);aspect-ratio:300/620;border-radius:44px;padding:10px;background:#0b0f17;border:1px solid #2a3550;box-shadow:0 40px 80px -30px #000,0 0 120px -20px var(--glow2);position:relative}
.phone::before{content:"";position:absolute;top:19px;left:50%;transform:translateX(-50%);width:84px;height:22px;border-radius:20px;background:#0b0f17;z-index:2}
.phone .gate{background-position:82% center}.phone .scr{width:100%;height:100%;border-radius:35px;overflow:hidden;background:#f5f6f8;position:relative}
.phone iframe{width:100%;height:100%;border:0}
.win{border:1px solid #26334f;border-radius:14px;overflow:hidden;background:#0b111e;box-shadow:0 50px 100px -40px #000,0 0 140px -30px var(--glow2)}
.win .bar{display:flex;align-items:center;gap:7px;padding:10px 14px;background:#0f1828;border-bottom:1px solid #1d2a43}
.win .bar i{width:11px;height:11px;border-radius:50%;background:#2a3753}.win .bar i:nth-child(1){background:#ff5f57}.win .bar i:nth-child(2){background:#febc2e}.win .bar i:nth-child(3){background:#28c840}
.win .bar span{flex:1;margin:0 8px;background:#0a1220;border:1px solid #1d2a43;border-radius:7px;padding:4px 12px;font:500 .78rem "Geist Mono",monospace;color:var(--soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.win .bar a{font-size:.8rem;color:var(--soft);text-decoration:none;white-space:nowrap}.win .bar a:hover{color:var(--text)}
.win .scr{position:relative;aspect-ratio:16/10;overflow:hidden;background:#fff}@media(max-width:700px){.win .scr{aspect-ratio:3/4}}
.win .scr iframe{position:absolute;top:0;left:0;width:1280px;height:800px;border:0;transform-origin:0 0}
.gate{position:absolute;inset:0;display:grid;place-items:center;background:#0b111e center/cover no-repeat;cursor:pointer}
.gate::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,12,24,.15),rgba(6,12,24,.75))}
.gate .btn{position:relative;z-index:1;box-shadow:0 10px 30px -8px #000}
.cap{text-align:center;color:var(--soft);font-size:.85rem;margin-top:12px}
section{padding:52px 0;border-top:1px solid var(--line)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.card{background:linear-gradient(180deg,var(--card),rgba(12,21,38,.6));border:1px solid var(--line);border-radius:12px;padding:20px;transition:border-color .2s,transform .2s}
.card:hover{border-color:var(--accent);transform:translateY(-2px)}
.card .ic{width:44px;height:44px;display:grid;place-items:center;border-radius:11px;background:var(--glow);font-size:1.35rem}
.card h3{margin:.7em 0 .3em;font-size:1.06rem}.card p{margin:0;color:var(--soft);font-size:.94rem}
.built{display:grid;grid-template-columns:1.2fr .8fr;gap:22px}@media(max-width:820px){.built{grid-template-columns:1fr}}
.built ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}
.built li{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:13px 16px 13px 42px;position:relative}
.built li::before{content:"";position:absolute;left:17px;top:21px;width:9px;height:9px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--glow)}
.stack{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;align-self:start}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.chip{border:1px solid var(--line);background:var(--raise);border-radius:999px;padding:5px 12px;font:500 .82rem "Geist Mono",monospace;color:var(--text)}
.cta{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--glow),rgba(12,21,38,.9) 55%);border:1px solid var(--line);border-radius:16px;padding:clamp(22px,4vw,40px);display:flex;flex-wrap:wrap;gap:18px;justify-content:space-between;align-items:center}
.cta p{color:var(--soft);margin:.2em 0 0;max-width:56ch}
.more{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.pc{display:flex;flex-direction:column;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;text-decoration:none;color:var(--text);transition:border-color .2s,transform .2s}
.pc:hover{border-color:var(--c,var(--accent));transform:translateY(-3px)}
.pc img{aspect-ratio:16/9;object-fit:cover;object-position:top;width:100%;height:auto;border-bottom:1px solid var(--line)}
.pc div{padding:14px 16px 16px}.pc .mono{color:var(--c,var(--accent));font-size:.68rem}.pc h3{margin:.3em 0 .25em;font-size:1.05rem}.pc p{margin:0;color:var(--soft);font-size:.9rem}
.pcm{position:relative;display:block}.badge{position:absolute;top:10px;left:10px;z-index:1;font:600 .72rem Geist,"Hind Siliguri",sans-serif;padding:5px 10px;border-radius:999px;backdrop-filter:blur(6px)}
.badge.ok{background:rgba(61,214,140,.92);color:#04210f}.badge.wip{background:rgba(242,165,74,.92);color:#2a1700}
.status.wip i{background:#f2a54a;box-shadow:0 0 0 4px rgba(242,165,74,.15)}
.buy{display:grid;grid-template-columns:1.1fr .9fr;gap:22px;align-items:start}@media(max-width:820px){.buy{grid-template-columns:1fr}}
.price{background:linear-gradient(160deg,var(--glow),var(--card) 60%);border:1px solid var(--accent);border-radius:14px;padding:22px}.price b{display:block;font-size:1.5rem;letter-spacing:-.02em;margin:.2em 0}.price p{color:var(--soft);margin:0 0 16px}
.note{background:rgba(242,165,74,.08);border:1px solid rgba(242,165,74,.35);border-radius:12px;padding:16px 18px;color:var(--text)}.note b{color:#f2a54a}
.grouphead{margin:40px 0 14px}.grouphead h2{margin:.2em 0 .2em}.grouphead p{color:var(--soft);margin:0}
.hubhead{padding:20px 0 34px}
footer{padding:30px 0 46px;color:var(--faint);font-size:.88rem;display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:space-between}footer a{color:var(--soft);text-decoration:none}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}`;

const LANG_JS = `(function(){var h=document.documentElement,q=new URLSearchParams(location.search).get("lang"),s;try{s=localStorage.getItem("sc-lang")}catch(e){}
function set(l){h.setAttribute("data-lang",l);h.lang=l==="bn"?"bn":"en";document.querySelectorAll(".lang button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===l)});try{localStorage.setItem("sc-lang",l)}catch(e){}}
set(q==="bn"||q==="en"?q:s==="bn"?"bn":"en");document.querySelectorAll(".lang button").forEach(function(b){b.onclick=function(){set(b.dataset.l)}});
function fit(){document.querySelectorAll(".win .scr").forEach(function(s){var f=s.querySelector("iframe");if(!f)return;var w=s.clientWidth<700?Math.max(s.clientWidth,360):1280,k=s.clientWidth/w;f.style.width=w+"px";f.style.transform="scale("+k+")";f.style.height=(s.clientHeight/k)+"px"})}
addEventListener("resize",fit);fit();
document.querySelectorAll(".gate").forEach(function(g){g.onclick=function(){var f=document.createElement("iframe");f.src=g.dataset.src;f.title=g.dataset.title;f.setAttribute("allow","clipboard-write");g.replaceWith(f);fit()}});})();`;

const LANG_BTNS = `<div class="lang" role="group" aria-label="Language"><button data-l="en" aria-pressed="true">EN</button><button data-l="bn" aria-pressed="false">বাংলা</button></div>`;

const head = ({ title, desc, url, img, accent, schema }) => `<!doctype html>
<html lang="en" data-lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#060C18">
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Hind+Siliguri:wght@400;500;600&display=swap">
${ld(schema)}
<style>:root{--accent:${accent};--glow:${hexA(accent, 0.16)};--glow2:${hexA(accent, 0.38)}}
${CSS}</style>
</head>`;

const badge = (st) => st === "ready" ? `<span class="badge ok">${T("Ready to buy", "কেনার জন্য তৈরি")}</span>` : `<span class="badge wip">${T("Running project · in progress", "চলমান প্রজেক্ট")}</span>`;
const card = (p) => `<a class="pc" href="${p.href}" style="--c:${p.accent}"><span class="pcm">${badge(p.stage)}<img src="${p.img}" alt="${esc(p.n)} cover" loading="lazy" width="1600" height="900"></span><div><span class="mono">${T(p.en.kicker, p.bn.kicker)}</span><h3>${esc(p.n)}</h3><p>${T(p.en.p, p.bn.p)}</p></div></a>`;
// First sentence, or the first two when the first is very short.
const short = (t, sep, end) => { const a = t.split(sep); return (a[0].length < 60 && a[1] ? a[0] + sep + a[1] : a[0]).replace(new RegExp("\\" + end + "?$"), end); };
const asCard = (p) => ({ n: p.n, stage: p.stage, href: `/projects/${p.slug}/`, accent: p.accent, img: cover(p), en: { kicker: p.en.kicker, p: short(p.en.lead, ". ", ".") }, bn: { kicker: p.bn.kicker, p: short(p.bn.lead, "। ", "।") } });
const linkedCards = SHOWCASE_LINKED.map((l) => ({ ...l, img: `/img/${l.shot}`, en: l.en, bn: l.bn }));
const allCards = [...linkedCards, ...SHOWCASE.map(asCard)];

const footer = (name) => `<div class="wrap"><footer><span>${esc(name)} · <a href="/">${esc(SITE.name)}</a> · Averroes AI</span><span><a href="/projects/">${T("All projects", "সব প্রজেক্ট")}</a> · <a href="/services/">${T("Services", "সার্ভিস")}</a> · <a href="/#contact">${T("Contact", "যোগাযোগ")}</a></span></footer></div>`;

function demoBlock(p) {
  const title = `${p.n} live demo`;
  const inner = p.external
    ? `<div class="gate" data-src="${p.demo}" data-title="${esc(title)}" style="background-image:url('/img/${p.shot}')"><span class="btn">▶ ${T("Load the live app here", "লাইভ অ্যাপ এখানে চালু করুন")}</span></div>`
    : `<iframe src="${p.demo}" title="${esc(title)}" loading="lazy"></iframe>`;
  if (p.frame === "phone") return `<div class="phone"><div class="scr">${inner}</div></div><p class="cap">${T("Live app. Tap around.", "লাইভ অ্যাপ। চাপ দিয়ে দেখুন।")}</p>`;
  const shown = ext(p.demo) ? p.demo.replace(/^https?:\/\//, "").replace(/\/$/, "") : (BASE + p.demo).replace(/^https?:\/\//, "");
  return `<div class="win"><div class="bar"><i></i><i></i><i></i><span>${esc(shown)}</span><a href="${p.demo}"${tgt(p.demo)}>${T("Full screen ↗", "ফুল স্ক্রিন ↗")}</a></div><div class="scr">${inner}</div></div><p class="cap">${T("This is the real, running project. Click around.", "এটা আসল, চালু প্রজেক্ট। ক্লিক করে দেখুন।")}</p>`;
}

// "What you get" block for complete projects that are for sale.
function buySection(p, href, attr) {
  const get = [["The complete, working project, set up with your name, logo and colours", "সম্পূর্ণ, চালু প্রজেক্ট, আপনার নাম, লোগো আর রঙে সাজানো"], ["Installed on your own domain, hosting or app account", "আপনার নিজের ডোমেইন, হোস্টিং বা অ্যাপ অ্যাকাউন্টে বসিয়ে দেওয়া"], ["A short walkthrough on how to use and update it", "কীভাবে ব্যবহার ও আপডেট করবেন, তার ছোট গাইড"], ["30 days of free fixes and support", "৩০ দিন ফ্রি ঠিকঠাক ও সাপোর্ট"]];
  return `<section id="buy"><div class="wrap">
  <span class="mono">${T("Ready to buy", "কেনার জন্য তৈরি")}</span>
  <h2>${T(`Get ${p.n} for your business`, `আপনার ব্যবসার জন্য ${p.n} নিন`)}</h2>
  <div class="buy"><div class="built"><ul style="grid-column:1/-1">${get.map(([e, b]) => `<li>${T(e, b)}</li>`).join("")}</ul></div>
  <div class="price"><span class="mono">${T("Price", "দাম")}</span><b>${T("Based on what you need", "আপনার প্রয়োজন অনুযায়ী")}</b><p>${T("Tell me your business and what you need on WhatsApp, and I'll send you a clear price before any work starts.", "হোয়াটসঅ্যাপে আপনার ব্যবসা আর কী দরকার জানান, কাজ শুরুর আগেই পরিষ্কার দাম জানিয়ে দেব।")}</p><a class="btn wa" href="${href}"${attr}>${T("Buy this", "এটি কিনুন")}</a></div></div>
</div></section>`;
}

function page(p) {
  const url = `${BASE}/projects/${p.slug}/`;
  const { en, bn, links } = p;
  const ready = p.stage === "ready";
  const waText = `Hi Yeasin, I saw ${p.n} on your portfolio and I want something like it.`;
  const buyText = `Hi Yeasin, I want to buy ${p.n}. Please send me the price and details.`;
  const buyHref = p.buyHref || wa(buyText);
  const buyAttr = p.buyHref ? "" : ' target="_blank" rel="noopener"';
  const schema = { "@context": "https://schema.org", "@type": p.frame === "phone" || /app|code/i.test(en.kicker) ? "SoftwareApplication" : "CreativeWork", name: p.n, url, image: BASE + cover(p), description: en.lead, ...(p.frame === "phone" || /app/i.test(en.kicker) ? { applicationCategory: "WebApplication", operatingSystem: "Web, Android, iOS" } : {}), keywords: p.tags.join(", "), creator: { "@id": `${BASE}/#person` } };
  const copy = `<div class="copy"><span class="mono">${T(en.kicker, bn.kicker)}</span>
      <h1><span class="en">${esc(en.title)} <em>${esc(en.em)}</em></span><span class="bn" lang="bn">${esc(bn.title)} <em>${esc(bn.em)}</em></span></h1>
      <p class="lead">${T(en.lead, bn.lead)}</p>
      <div class="acts">
        <a class="btn" href="${p.external ? links.live[1] : "#demo"}"${p.external ? tgt(links.live[1]) : ""}>${p.external ? T(links.live[0] + " ↗", "লাইভ অ্যাপ খুলুন ↗") : T("Try the live demo", "লাইভ ডেমো চালান")}</a>
        ${ready ? `<a class="btn wa" href="${buyHref}"${buyAttr}>${T("Buy this", "এটি কিনুন")}</a>` : `<a class="btn ghost" href="${wa(waText)}" target="_blank" rel="noopener">${T("Want one like this?", "এমন একটি চান?")}</a>`}
        ${links.gh ? `<a class="btn ghost" href="https://github.com/uowyeasin-cyber/${links.gh}" target="_blank" rel="noopener">${T("Code on GitHub ↗", "GitHub-এ কোড ↗")}</a>` : ""}
        ${links.more ? `<a class="btn ghost" href="${links.more[1]}">${esc(links.more[0])}</a>` : ""}
      </div>
      <span class="status${ready ? "" : " wip"}"><i></i>${T(en.status, bn.status)}</span></div>`;
  const hero = p.frame === "phone"
    ? `<div class="hero phone-hero" id="demo">${copy}<div>${demoBlock(p)}</div></div>`
    : `<div class="hero wide">${copy}</div><div id="demo" style="scroll-margin-top:16px">${demoBlock(p)}</div>`;
  const others = allCards.filter((c) => c.href !== `/projects/${p.slug}/`).slice(0, 6);
  return `${head({ title: `${p.n} · ${en.title} ${en.em} | ${SITE.name}`, desc: en.lead, url, img: BASE + cover(p), accent: p.accent, schema })}
<body>
<div class="wrap">
  <nav class="top"><a href="/projects/">← ${T("All projects", "সব প্রজেক্ট")}</a><div class="navr">${LANG_BTNS}</div></nav>
  ${hero}
</div>

<section><div class="wrap">
  <span class="mono">${T("What's inside", "ভেতরে যা আছে")}</span>
  <h2>${T("Built to be used every day", "প্রতিদিন ব্যবহারের জন্য বানানো")}</h2>
  <div class="cards">${en.feats.map((f, i) => `<div class="card"><div class="ic">${f[0]}</div><h3>${T(f[1], bn.feats[i][1])}</h3><p>${T(f[2], bn.feats[i][2])}</p></div>`).join("")}</div>
</div></section>

<section><div class="wrap">
  <span class="mono">${T("Under the hood", "কীভাবে বানানো")}</span>
  <h2>${T("How it's built", "প্রযুক্তি ও কাঠামো")}</h2>
  <div class="built"><ul>${en.built.map((b, i) => `<li>${T(b, bn.built[i])}</li>`).join("")}</ul>
  <div class="stack"><span class="mono">${T("Tech stack", "টেক স্ট্যাক")}</span><div class="chips">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div></div></div>
</div></section>

${ready ? buySection(p, buyHref, buyAttr) : `<section><div class="wrap"><div class="note"><b>${T("Running project, still in progress.", "চলমান প্রজেক্ট, এখনো কাজ চলছে।")}</b> ${T("This project isn't finished yet, so it isn't for sale. The demo shows how it works so far.", "এই প্রজেক্টটি এখনো শেষ হয়নি, তাই বিক্রির জন্য নয়। এখন পর্যন্ত কীভাবে কাজ করে, ডেমোতে দেখুন।")}</div></div></section>`}

<section><div class="wrap">
  <div class="cta"><div><h2 style="margin:0">${T(en.cta[0], bn.cta[0])}</h2><p>${T(en.cta[1], bn.cta[1])}</p></div>
  <div class="acts" style="margin:0"><a class="btn wa" href="${wa(waText)}" target="_blank" rel="noopener">${T("Talk on WhatsApp", "হোয়াটসঅ্যাপে কথা বলুন")}</a><a class="btn ghost" href="/services/">${T("See services", "সার্ভিস দেখুন")}</a></div></div>
</div></section>

<section><div class="wrap">
  <span class="mono">${T("Keep exploring", "আরও দেখুন")}</span>
  <h2>${T("More projects", "আরও প্রজেক্ট")}</h2>
  <div class="more">${others.map(card).join("")}</div>
</div></section>
${footer(p.n)}
<script>${LANG_JS}</script>
</body>
</html>
`;
}

function hub() {
  const url = `${BASE}/projects/`;
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: `Projects | ${SITE.name}`, url, hasPart: allCards.map((c) => ({ "@type": "CreativeWork", name: c.n, url: BASE + c.href })) };
  return `${head({ title: `Projects with live demos | ${SITE.name}`, desc: "Apps, websites, AI agents, systems and games by Yeasin Arafat. Every project has a live demo you can run in the browser.", url, img: BASE + cover(SHOWCASE[0]), accent: "#5B8CFF", schema })}
<body>
<div class="wrap">
  <nav class="top"><a href="/">← ${esc(SITE.name)}</a><div class="navr">${LANG_BTNS}</div></nav>
  <div class="hubhead"><span class="mono">${T("Projects · live demos", "প্রজেক্ট · লাইভ ডেমো")}</span>
  <h1><span class="en">Don't just look. <em>Run it.</em></span><span class="bn" lang="bn">শুধু দেখবেন না। <em>চালিয়ে দেখুন।</em></span></h1>
  <p class="lead">${T("Apps, websites, AI agents, systems and games. Open any project and try the real, running version right on the page.", "অ্যাপ, ওয়েবসাইট, AI এজেন্ট, সিস্টেম আর গেম। যেকোনো প্রজেক্ট খুলে পেজেই আসল, চালু ভার্সনটা চালিয়ে দেখুন।")}</p></div>
  <div class="grouphead"><span class="mono">${T("Ready to buy", "কেনার জন্য তৈরি")}</span><h2>${T("Finished and for sale", "সম্পূর্ণ, বিক্রির জন্য")}</h2><p>${T("Complete projects you can buy and use for your own business.", "সম্পূর্ণ প্রজেক্ট, কিনে নিজের ব্যবসায় ব্যবহার করতে পারবেন।")}</p></div>
  <div class="more">${allCards.filter((c) => c.stage === "ready").map(card).join("")}</div>
  <div class="grouphead"><span class="mono">${T("Running projects", "চলমান প্রজেক্ট")}</span><h2>${T("In progress right now", "এখন যেগুলোর কাজ চলছে")}</h2><p>${T("Working previews of projects that aren't finished yet. Try them, but they aren't for sale.", "যেগুলো এখনো শেষ হয়নি, সেগুলোর চালু প্রিভিউ। চালিয়ে দেখুন, তবে এগুলো বিক্রির জন্য নয়।")}</p></div>
  <div class="more">${allCards.filter((c) => c.stage !== "ready").map(card).join("")}</div>
  <section style="margin-top:52px"><div class="cta"><div><h2 style="margin:0">${T("Have a project in mind?", "মাথায় কোনো প্রজেক্ট আছে?")}</h2><p>${T("Apps, websites, stores and AI agents, designed and built end to end.", "অ্যাপ, ওয়েবসাইট, স্টোর আর AI এজেন্ট, ডিজাইন থেকে লঞ্চ পর্যন্ত।")}</p></div><div class="acts" style="margin:0"><a class="btn wa" href="${wa("Hi Yeasin, I saw your projects and want to discuss a project.")}" target="_blank" rel="noopener">${T("Talk on WhatsApp", "হোয়াটসঅ্যাপে কথা বলুন")}</a><a class="btn ghost" href="/services/">${T("See services", "সার্ভিস দেখুন")}</a></div></div></section>
</div>
${footer("Projects")}
<script>${LANG_JS}</script>
</body>
</html>
`;
}

const out = path.join(root, "projects");
fs.mkdirSync(out, { recursive: true });
for (const p of SHOWCASE) {
  fs.mkdirSync(path.join(out, p.slug), { recursive: true });
  fs.writeFileSync(path.join(out, p.slug, "index.html"), page(p));
}
fs.writeFileSync(path.join(out, "index.html"), hub());
// Machine-readable copy for other sites (agency website etc.).
const json = {
  source: BASE, updated: new Date().toISOString().slice(0, 10),
  projects: SHOWCASE.map((p) => ({ slug: p.slug, name: p.n, stage: p.stage, url: `${BASE}/projects/${p.slug}/`, cover: BASE + cover(p), demo: ext(p.demo) ? p.demo : BASE + p.demo, accent: p.accent, tags: p.tags, links: p.links, en: p.en, bn: p.bn })),
  products: SHOWCASE_LINKED.map((l) => ({ name: l.n, stage: l.stage, url: BASE + l.href, cover: `${BASE}/img/${l.shot}`, en: l.en, bn: l.bn })),
};
fs.writeFileSync(path.join(out, "projects.json"), JSON.stringify(json, null, 2));

// Add the pages to sitemap.xml once. build-service-pages.mjs rewrites the sitemap,
// so run this script after it.
const smPath = path.join(root, "sitemap.xml");
let sm = fs.readFileSync(smPath, "utf8");
const today = new Date().toISOString().slice(0, 10);
const urls = [`${BASE}/projects/`, ...SHOWCASE.map((p) => `${BASE}/projects/${p.slug}/`)].filter((u) => !sm.includes(`<loc>${u}</loc>`));
if (urls.length) {
  sm = sm.replace("</urlset>", urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`).join("") + "</urlset>");
  fs.writeFileSync(smPath, sm);
}
console.log(`Built ${SHOWCASE.length} project pages, the hub, projects.json; sitemap +${urls.length}.`);
