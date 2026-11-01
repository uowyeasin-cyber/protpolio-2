// Builds one static, search-friendly page per entry in SERVICE_PAGES
// (data/content.js) at /services/<slug>/index.html, a /services/ hub,
// and a fresh sitemap.xml. Run after editing content:
//   node tools/build-service-pages.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = fs.readFileSync(path.join(root, "data/content.js"), "utf8");
const { SITE, SERVICE_PAGES, PACKAGES } = new Function(src + ";return {SITE,SERVICE_PAGES,PACKAGES}")();
// Other-language text (optional file).
const I18N = fs.existsSync(path.join(root, "data/i18n.js"))
  ? new Function(fs.readFileSync(path.join(root, "data/i18n.js"), "utf8") + ";return {LANGS,NAMES,AREA_NAMES}")()
  : { LANGS: [], NAMES: {}, AREA_NAMES: {} };
const SITE_NAME = SITE.siteName || SITE.name;
if (!SITE.url) throw new Error("Set SITE.url in data/content.js to your live address first.");
const BASE = SITE.url.replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const ICON = "/" + (SITE.icon || (SITE.logo ? SITE.logo.replace(/\.(\w+)$/, "-t.$1") : "img/me-ya-logo-t.webp"));
const AREAS = SITE.areas || ["Worldwide"];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (href) => (/^https?:/.test(href) ? href : BASE + href);
const ext = (href) => /^https?:/.test(href) && !href.startsWith(BASE);
const wa = (text) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;

const CSS = `:root{--ink:#F6F7F9;--panel:#fff;--raise:#EEF1F6;--line:#E1E6EE;--paper:#0B1B33;--mute:#4B5A73;--faint:#8A95A8;--cobalt:#1F4FD8;--r:8px;--cobalt-soft:rgba(31,79,216,.14);--f-body:var(--f);--f-display:var(--f);--f:"Geist",system-ui,-apple-system,"Segoe UI","Noto Sans Bengali","Noto Sans Devanagari","Noto Sans Arabic","Noto Sans SC","PingFang SC","Microsoft YaHei","Nirmala UI",sans-serif;--m:"Geist Mono",ui-monospace,Menlo,monospace;color-scheme:light}
:root[data-theme="dark"]{--ink:#060C18;--panel:#0C1526;--raise:#131F36;--line:#1D2A43;--paper:#E9EEF8;--mute:#9BA9C2;--faint:#62718D;--cobalt:#5B8CFF;--cobalt-soft:rgba(91,140,255,.18);color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--ink);color:var(--paper);font:400 16px/1.65 var(--f);-webkit-font-smoothing:antialiased;overflow-x:hidden}
[data-theme="dark"] body{background:radial-gradient(1000px 600px at 85% -10%,rgba(91,140,255,.12),transparent 60%),var(--ink)}
a{color:inherit}img{max-width:100%;display:block}h1,h2,h3{font-weight:600;letter-spacing:-.03em;line-height:1.1;margin:0;text-wrap:balance}p{margin:0}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}.mono{font-family:var(--m);font-size:.72rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
header{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--panel) 88%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;height:62px}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:600}
.brand img{width:32px;height:32px;border-radius:var(--r);border:1px solid var(--line)}header nav{display:flex;gap:6px;align-items:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--r);border:1px solid var(--line);background:var(--panel);color:var(--paper);text-decoration:none;font:500 .92rem/1 var(--f);transition:background .2s,border-color .2s}
.btn:hover{border-color:var(--cobalt)}.btn.solid{background:var(--cobalt);border-color:var(--cobalt);color:#fff}.btn.solid:hover{filter:brightness(1.1)}.btn.sm{min-height:38px;padding:0 13px;font-size:.85rem}
.tb{background:none;border:1px solid var(--line);color:var(--paper);border-radius:var(--r);width:38px;height:38px;cursor:pointer;font-size:1rem}
.crumb{padding-top:20px;font-size:.85rem;color:var(--mute)}.crumb a{text-decoration:none}.crumb a:hover{color:var(--cobalt)}
.hero{padding:clamp(22px,4vw,48px) 0 clamp(28px,4vw,44px)}.hero h1{font-size:clamp(2rem,5vw,3.4rem);margin:12px 0 16px}.hero p{font-size:clamp(1.02rem,1.4vw,1.15rem);color:var(--mute);max-width:62ch}
.acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
section{padding:clamp(26px,4vw,48px) 0;border-top:1px solid var(--line)}section h2{font-size:clamp(1.5rem,3vw,2.1rem);margin:8px 0 18px}
.pts{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;padding:0;margin:0;list-style:none}.pts li{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:14px 16px 14px 40px;position:relative}
.pts li::before{content:"";position:absolute;left:16px;top:22px;width:10px;height:10px;border-radius:50%;background:var(--cobalt)}
.work{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}.work a{display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;text-decoration:none;transition:border-color .2s,transform .2s}
.work a:hover{border-color:var(--cobalt);transform:translateY(-2px)}.work img{aspect-ratio:16/10;object-fit:contain;width:100%;padding:10px;background:var(--raise);border-bottom:1px solid var(--line)}.work div{padding:14px 16px}.work h3{font-size:1.02rem;margin-bottom:4px}.work p{font-size:.9rem;color:var(--mute)}
.pk{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.pk article{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:20px;display:flex;flex-direction:column;gap:8px}
.pk article.pop{border-color:var(--cobalt)}.pk h3{font-size:1.15rem}.pk .f{color:var(--mute);font-size:.92rem}.pk b{font-size:1.05rem}.pk ul{margin:4px 0 8px;padding-left:18px;color:var(--mute);font-size:.92rem}.pk .btn{margin-top:auto}
.bn{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:clamp(18px,3vw,28px)}.bn h2{margin-top:0}.bn p{color:var(--mute);max-width:70ch}
.langs{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 16px}.langs button{font:500 .92rem/1 var(--f);min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--paper);cursor:pointer}
.langs button[aria-selected="true"]{background:var(--cobalt);border-color:var(--cobalt);color:#fff}.langs button:hover{border-color:var(--cobalt)}
.lp{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:clamp(18px,3vw,28px);margin-top:10px}.lp h3{font-size:1.35rem;margin-bottom:10px}.lp>p{color:var(--mute);max-width:70ch}.lp details{background:var(--ink)}
.lp[dir="rtl"]{text-align:right}.lp[lang="ar"],.lp[lang="ur"]{font-family:"Noto Naskh Arabic","Noto Nastaliq Urdu","Segoe UI",Tahoma,sans-serif;line-height:1.9}
.js .lp[hidden]{display:none}.hint{color:var(--faint);font-size:.9rem}
.inlang{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}.inlang div{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:14px 16px}.inlang b{display:block;margin-bottom:6px}.inlang a{display:block;margin:4px 0;color:var(--mute);font-size:.92rem;text-decoration:none}.inlang a:hover{color:var(--cobalt)}
details{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:14px 16px;margin-bottom:10px}summary{cursor:pointer;font-weight:600}details p{color:var(--mute);margin-top:8px}
.others{display:flex;flex-wrap:wrap;gap:8px}.cta{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:clamp(20px,4vw,36px);display:flex;flex-wrap:wrap;gap:18px;justify-content:space-between;align-items:center}
footer{padding:26px 0 40px;color:var(--faint);font-size:.85rem}footer .wrap{display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:space-between}footer a{text-decoration:none}footer a:hover{color:var(--cobalt)}
.hub{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}.hub a{display:block;background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:20px;text-decoration:none}.hub a:hover{border-color:var(--cobalt)}.hub h2{font-size:1.2rem;margin:6px 0 8px}.hub p{color:var(--mute);font-size:.92rem}
@media (max-width:600px){header nav .btn:not(.solid){display:none}.hero .acts .btn{flex:1 1 auto}}`;

const themeInit = `<script>try{var t=localStorage.getItem("ya-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}</script>`;
const themeBtn = `<script>(function(){var b=document.getElementById("tb"),r=document.documentElement;function s(){b.textContent=r.dataset.theme==="dark"?"☀":"☾";b.setAttribute("aria-label",r.dataset.theme==="dark"?"Switch to light theme":"Switch to dark theme")}s();b.onclick=function(){r.dataset.theme=r.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem("ya-theme",r.dataset.theme)}catch(e){}s()}})()</script>`;

// Language buttons: open one panel at a time; open the visitor's browser language automatically.
const langJS = `<script>(function(){var w=document.querySelector(".langs");if(!w)return;var bs=w.querySelectorAll("button"),ps=document.querySelectorAll(".lp");function open(c){bs.forEach(function(b){b.setAttribute("aria-selected",b.dataset.l===c?"true":"false")});ps.forEach(function(p){p.hidden=p.lang!==c})}ps.forEach(function(p){p.hidden=true});bs.forEach(function(b){b.onclick=function(){open(b.getAttribute("aria-selected")==="true"?"":b.dataset.l)}});var n=(navigator.language||"").slice(0,2).toLowerCase();if(n!=="en"&&w.querySelector('[data-l="'+n+'"]'))open(n)})()</script>`;
function shell({ title, desc, kw, url, body, schema, img, key }) {
  return `<!doctype html>
<html lang="en" data-theme="dark" class="js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${kw ? `<meta name="keywords" content="${esc(kw)}">\n` : ""}<meta name="author" content="${esc(SITE.name)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#060C18">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img || BASE + "/img/og.jpg"}">
<meta property="og:image:alt" content="${esc(title)}">
<meta property="og:locale" content="en_US">${I18N.LANGS.map((l) => `\n<meta property="og:locale:alternate" content="${l.locale}">`).join("")}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img || BASE + "/img/og.jpg"}">
<link rel="icon" href="/api/icon"><link rel="apple-touch-icon" href="/api/icon">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap">
${themeInit}
<style>${CSS}</style>
${ld(schema)}
</head>
<body>
<header id="sp-head"><div class="wrap"><a class="brand" href="/"><img src="${ICON}" alt="" width="32" height="32">${esc(SITE.name)}</a><nav><a class="btn sm" href="/services/">Services</a><a class="btn sm" href="/#work">Work</a><button class="tb" id="tb" type="button"></button><a class="btn sm solid" href="/#contact">Hire me</a></nav></div></header>
<main id="sp-${key}">
${body}
</main>
<footer id="sp-foot"><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(SITE.name)} · ${esc(SITE.location || "")}</span><span>${SERVICE_PAGES.map((p) => `<a href="/services/${p.slug}/">${esc(p.nav)}</a>`).join(" · ")}</span></div></footer>
${themeBtn}
${langJS}
<script src="/cms.js" defer></script>
</body>
</html>
`;
}

const share = (u, t) => [["WhatsApp", `https://wa.me/?text=${encodeURIComponent(t + " " + u)}`], ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`], ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`], ["X", `https://x.com/intent/post?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`]].map(([n, h]) => `<a class="btn" href="${h}" target="_blank" rel="noopener">${n}</a>`).join("");
const SAME_AS = ["linkedin", "github", "youtube", "facebook", "instagram", "tiktok", "x"].map((k) => SITE[k]).filter((u) => /^https:\/\/[^/]+\/./.test(u || ""));
const person = { "@type": "Person", "@id": BASE + "/#person", name: SITE.name, url: BASE + "/", ...(SAME_AS.length ? { sameAs: SAME_AS } : {}) };
const pkgHTML = (key, svc) => (PACKAGES[key] || []).map((k) => `<article${k.pop ? ' class="pop"' : ""}><span class="mono">${esc(k.d)}</span><h3>${esc(k.t)}</h3><p class="f">${esc(k.f)}</p><b>${esc(k.price || "Custom quote")}</b><ul>${k.l.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><a class="btn" href="${wa(`Hi ${SITE.name.split(" ")[0]}, I'm interested in the ${k.t} package for ${svc}.`)}" target="_blank" rel="noopener">Ask about ${esc(k.t)}</a></article>`).join("");

// Text for each extra language on one service page.
function langBlocks(pg, P) {
  const names = I18N.NAMES[pg.slug];
  if (!names) return [];
  return I18N.LANGS.filter((L) => names[L.code]).map((L) => {
    const [n, w] = names[L.code];
    const areas = AREAS.map((a) => (I18N.AREA_NAMES[a] || {})[L.code]).filter(Boolean);
    const A = areas.length ? areas.join(L.sep) : L.many;
    const own = L.code === "bn" && pg.bn;
    const faq = [...((own && pg.bn.faq) || []), ...L.faq(n, P).filter(Boolean)];
    return { code: L.code, label: L.label, name: L.name, dir: L.dir, n,
      h: own ? pg.bn.h : L.h(n), p: own ? pg.bn.p : L.p(n, w, A), faq, wa: L.wa(n), btn: L.btn };
  });
}

let n = 0;
for (const pg of SERVICE_PAGES) {
  const url = `${BASE}/services/${pg.slug}/`;
  const faqs = pg.faq;
  const price = ((PACKAGES[pg.pkg] || [])[0] || {}).price;
  const P = price ? price.replace(/^From\s+/i, "") : "";
  const tr = langBlocks(pg, P);
  const others = SERVICE_PAGES.filter((o) => o !== pg);
  const waText = `Hi ${SITE.name.split(" ")[0]}, I found your ${pg.nav.toLowerCase()} page and I'd like a quote.`;
  const body = `<div class="wrap">
<nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/services/">Services</a> / ${esc(pg.nav)}</nav>
<div class="hero"><span class="mono">${esc(pg.nav)} · ${esc(SITE.name)}</span><h1>${esc(pg.h1)}</h1><p>${esc(pg.intro)}</p>
<div class="acts"><a class="btn solid" href="${wa(waText)}" target="_blank" rel="noopener">Get a quote on WhatsApp</a><a class="btn" href="mailto:${esc(SITE.email)}?subject=${encodeURIComponent(pg.nav + " project")}">Email me</a><a class="btn" href="/#work">See all work</a></div></div>
<section><span class="mono">What you get</span><h2>${esc(pg.nav)}: what's included</h2><ul class="pts">${pg.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
${pg.work && pg.work.length ? `<section><span class="mono">Examples</span><h2>Recent ${esc(pg.nav.toLowerCase())} work</h2><div class="work">${pg.work.map(([t, img, href, p]) => `<a href="${esc(href)}"${ext(href) || href.startsWith("/demo/") ? ' target="_blank" rel="noopener"' : ""}><img src="/img/${esc(img)}" alt="${esc(t)}" loading="lazy" width="480" height="300"><div><h3>${esc(t)}</h3><p>${esc(p)}</p></div></a>`).join("")}</div></section>` : ""}
${PACKAGES[pg.pkg] ? `<section><span class="mono">Packages</span><h2>Pick a starting point</h2><div class="pk">${pkgHTML(pg.pkg, pg.nav.toLowerCase())}</div><p class="mono" style="margin-top:14px">${(PACKAGES[pg.pkg] || []).some((k) => k.price) ? "Estimated starting prices. " : ""}You get a fixed quote within 24 hours and approve it before work starts.</p></section>` : ""}
<section><span class="mono">FAQ</span><h2>Common questions</h2>${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>
${tr.length ? `<section><span class="mono">Languages</span><h2>Read this in your language</h2><div class="langs" role="tablist" aria-label="Languages">${tr.map((t) => `<button type="button" role="tab" data-l="${t.code}" lang="${t.code}" aria-selected="false">${esc(t.label)}</button>`).join("")}</div><p class="hint">Tap a language to read about this service and common questions in it.</p>${tr.map((t) => `<div class="lp" lang="${t.code}"${t.dir ? ` dir="${t.dir}"` : ""} role="tabpanel"><span class="mono">${esc(t.label)}</span><h3>${esc(t.h)}</h3><p>${esc(t.p)}</p>${t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}<div class="acts"><a class="btn solid" href="${wa(t.wa)}" target="_blank" rel="noopener">${esc(t.btn)}</a></div></div>`).join("")}</section>` : ""}
<section><span class="mono">Share</span><h2>Know someone who needs this?</h2><div class="others">${share(url, pg.title)}</div></section>
<section><span class="mono">Other services</span><h2>Need something else?</h2><div class="others">${others.map((o) => `<a class="btn" href="/services/${o.slug}/">${esc(o.nav)}</a>`).join("")}</div></section>
<section><div class="cta"><div><h2 style="margin:0 0 6px">Let's talk about your ${esc(pg.nav.toLowerCase())} project</h2><p style="color:var(--mute)">Send a short brief and I'll reply within 24 hours with questions and a fixed quote.</p></div><div class="acts" style="margin:0"><a class="btn solid" href="${wa(waText)}" target="_blank" rel="noopener">WhatsApp</a><a class="btn" href="/#contact">Contact form</a></div></div></section>
</div>`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Service", "@id": url + "#service", name: pg.title.split(" · ")[0], ...(tr.length ? { alternateName: tr.map((t) => t.n) } : {}), serviceType: pg.nav, description: pg.desc, url, provider: person, areaServed: AREAS, availableLanguage: [...new Set(["English", ...(SITE.languages || []), ...tr.map((t) => t.name)])] },
    { "@type": "WebPage", "@id": url, url, name: pg.title, description: pg.desc, inLanguage: "en", isPartOf: { "@id": BASE + "/#website" }, about: { "@id": url + "#service" } },
    { "@type": "FAQPage", "@id": url + "#faq", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BASE + "/" }, { "@type": "ListItem", position: 2, name: "Services", item: BASE + "/services/" }, { "@type": "ListItem", position: 3, name: pg.nav, item: url }] },
  ] };
  const img = pg.work && pg.work[0] ? BASE + "/img/" + pg.work[0][1] : null;
  const dir = path.join(root, "services", pg.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), shell({ title: `${pg.title} | ${SITE.name}`, desc: pg.meta || pg.desc, kw: [pg.kw, ...tr.map((t) => t.n)].filter(Boolean).join(", "), url, body, schema, img, key: pg.slug }));
  n++;
}

// hub page
const hubUrl = BASE + "/services/";
const hubBody = `<div class="wrap"><nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> / Services</nav>
<div class="hero"><span class="mono">Services · ${esc(SITE.name)}</span><h1>Websites, apps and design, built for you</h1><p>Pick what you need. Each page explains what's included, shows real examples and has a quick way to get a quote.</p></div>
<div class="hub">${SERVICE_PAGES.map((p) => `<a href="/services/${p.slug}/"><span class="mono">${esc(p.nav)}</span><h2>${esc(p.h1)}</h2><p>${esc(p.desc)}</p></a>`).join("")}</div>
${I18N.LANGS.length ? `<section style="margin-top:32px" id="languages"><span class="mono">Languages</span><h2>Services in your language</h2><div class="inlang">${I18N.LANGS.map((L) => `<div lang="${L.code}"${L.dir ? ` dir="${L.dir}"` : ""}><b>${esc(L.label)}</b>${SERVICE_PAGES.filter((p) => I18N.NAMES[p.slug] && I18N.NAMES[p.slug][L.code]).map((p) => `<a href="/services/${p.slug}/">${esc(I18N.NAMES[p.slug][L.code][0])}</a>`).join("")}</div>`).join("")}</div></section>` : ""}
<section style="margin-top:32px"><div class="cta"><div><h2 style="margin:0 0 6px">Not sure which one you need?</h2><p style="color:var(--mute)">Tell me about your project and I'll suggest the simplest way to do it.</p></div><a class="btn solid" href="${wa(`Hi ${SITE.name.split(" ")[0]}, I'd like to talk about a project.`)}" target="_blank" rel="noopener">WhatsApp</a></div></section></div>`;
fs.writeFileSync(path.join(root, "services", "index.html"), shell({
  title: `Services: Websites, Apps, UI/UX & Design | ${SITE.name}`,
  desc: `${SITE.name} builds websites, online stores, mobile and web apps, UI/UX and graphic design for clients ${SITE.areas ? "in " + AREAS.filter((a) => a !== "Worldwide").slice(0, 2).join(", ") + " and worldwide" : "worldwide"}.`,
  kw: SERVICE_PAGES.map((p) => p.nav).join(", "), url: hubUrl, body: hubBody, key: "hub",
  schema: { "@context": "https://schema.org", "@type": "CollectionPage", url: hubUrl, name: "Services", hasPart: SERVICE_PAGES.map((p) => ({ "@type": "WebPage", url: `${BASE}/services/${p.slug}/`, name: p.title })) },
}));

// sitemap: home, résumé PDF, service pages, demos
// Images per URL (image sitemap) so the photo and work show up in Google Images.
const imgUrl = (f) => BASE + "/" + String(f).replace(/^\/+/, "");
const homeImgs = [[SITE.photo || (fs.existsSync(path.join(root, "img/me-headshot.webp")) ? "img/me-headshot.webp" : "img/avatar.webp"), SITE.name], ["img/og.jpg", SITE.name + " portfolio"]];
const urls = [[BASE + "/", "weekly", "1.0", homeImgs], [hubUrl, "monthly", "0.9", []]];
for (const p of SERVICE_PAGES) urls.push([`${BASE}/services/${p.slug}/`, "monthly", "0.9", (p.work || []).map(([t, img]) => ["img/" + img, t + " by " + SITE.name])]);
for (const f of fs.readdirSync(root).filter((f) => f.endsWith(".pdf"))) urls.push([`${BASE}/${f}`, "monthly", "0.7"]);
const demoDir = path.join(root, "demo");
if (fs.existsSync(demoDir)) for (const f of fs.readdirSync(demoDir).filter((f) => f.endsWith(".html")).sort()) urls.push([`${BASE}/demo/${f}`, "monthly", "0.6"]);
fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(([u, c, p, im]) => `  <url><loc>${encodeURI(u)}</loc><lastmod>${today}</lastmod><changefreq>${c}</changefreq><priority>${p}</priority>${(im || []).filter(([f]) => fs.existsSync(path.join(root, f))).map(([f, t]) => `<image:image><image:loc>${encodeURI(imgUrl(f))}</image:loc><image:title>${esc(t)}</image:title></image:image>`).join("")}</url>`).join("\n")}
</urlset>
`);
// IndexNow key file, and llms.txt (a plain summary that AI search tools such as ChatGPT and Perplexity read).
if (SITE.indexNowKey && /^[a-zA-Z0-9-]{8,128}$/.test(SITE.indexNowKey)) fs.writeFileSync(path.join(root, SITE.indexNowKey + ".txt"), SITE.indexNowKey);
fs.writeFileSync(path.join(root, "llms.txt"), `# ${SITE_NAME}

> ${SITE.name}${SITE.role ? ", " + SITE.role : ""}${SITE.location ? ", based in " + SITE.location : ""}. Works with clients ${AREAS.includes("Worldwide") ? "worldwide" : "in " + AREAS.join(", ")}, remotely, in ${(SITE.languages || ["English"]).join(" and ")}.

Contact: ${SITE.email}${SITE.whatsapp ? " · WhatsApp +" + SITE.whatsapp : ""}

## Services
${SERVICE_PAGES.map((p) => `- [${p.title.split(" · ")[0]}](${BASE}/services/${p.slug}/): ${p.desc}`).join("\n")}

## More
- [Home and portfolio](${BASE}/)
- [All services](${BASE}/services/)
`);
console.log(`Built ${n} service pages, the /services/ hub and sitemap.xml (${urls.length} URLs).`);
