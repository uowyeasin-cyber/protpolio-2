// Owner-only visual editor. Served by /api/editor to the signed-in owner (inlined in the preview build).
(function () {
  const CMS = window.CMS;
  if (!CMS || window.CMS_EDITOR) return;
  const $ = (s, r = document) => r.querySelector(s);
  const ls = CMS.ls;
  const ss = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const uid = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const FONTS = ["", "Geist", "Inter", "Instrument Serif", "Hanken Grotesk", "Bricolage Grotesque", "Figtree", "Cormorant Garamond", "Fraunces", "Poppins", "Montserrat", "Manrope", "Outfit", "Sora", "Space Grotesk", "DM Sans", "Raleway", "Archivo", "Oswald", "Bebas Neue", "Playfair Display", "DM Serif Display", "Lora", "Merriweather", "JetBrains Mono", "Hind Siliguri", "Noto Sans Bengali", "Tiro Bangla"];
  const ANIMS = [["", "None"], ["fade", "Fade in"], ["fade-up", "Fade up"], ["fade-down", "Fade down"], ["slide-left", "Slide from left"], ["slide-right", "Slide from right"], ["zoom", "Zoom in"], ["flip", "Flip in"], ["bounce", "Bounce in"], ["pulse", "Pulse (loop)"], ["float", "Float (loop)"]];
  const HOVERS = [["", "None"], ["lift", "Lift up"], ["grow", "Grow"], ["shrink", "Shrink"], ["tilt", "Tilt"], ["glow", "Glow"], ["bright", "Brighten"], ["shine", "Shine"]];
  const SHADOWS = { none: "none", soft: "0 8px 30px rgba(0,0,0,.25)", strong: "0 20px 60px rgba(0,0,0,.5)", glow: "0 0 0 4px rgba(94,139,255,.18), 0 12px 40px rgba(94,139,255,.35)" };
  const THEME_COLORS = [["--ink", "Background"], ["--panel", "Cards"], ["--raise", "Raised parts"], ["--line", "Lines & borders"], ["--paper", "Text"], ["--mute", "Soft text"], ["--cobalt", "Accent"], ["--ember", "Highlight"]];
  // Off the main page (e.g. /services/...), jumping to a section means going back to the home page.
  const goTo = (slug) => (document.getElementById("app") ? (location.hash = slug) : (location.href = "/#" + slug));
  const BUILTIN = [["home", "Home"], ["work", "Work"], ["code", "Code"], ["awards", "Awards"], ["services", "Services"], ["about", "About"], ["cv", "Résumé"], ["contact", "Contact"]];
  const BLOCKS = {
    heading: () => `<h2 style="margin:28px 0 12px">New heading</h2>`,
    text: () => `<p style="color:var(--mute);margin:12px 0;max-width:70ch">New paragraph. Click it, then press Edit text to change it.</p>`,
    button: () => `<a class="btn solid" href="#contact" style="margin:12px 0">New button</a>`,
    image: () => `<img class="cms-media" src="img/me-headshot.webp" alt="New image" style="margin:16px 0;width:320px">`,
    video: () => `<video class="cms-media" controls playsinline preload="metadata" style="margin:16px 0;width:100%" src=""></video>`,
    youtube: () => `<iframe class="cms-embed" src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="Video" allowfullscreen loading="lazy" style="margin:16px 0"></iframe>`,
    divider: () => `<hr style="border:0;border-top:1px solid var(--line);margin:32px 0">`,
    spacer: () => `<div style="height:48px" aria-hidden="true"></div>`,
    card: () => `<div style="border:1px solid var(--line);border-radius:var(--r);background:var(--panel);padding:26px;margin:16px 0"><h3>Card title</h3><p style="color:var(--mute);margin-top:8px">Card text goes here.</p></div>`,
    section: () => `<section class="wrap block tight"><div class="sec-head"><div><span class="mono">New section</span><h2>Section title</h2></div></div><p style="color:var(--mute);max-width:70ch">Write something about this section.</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px"><a class="btn solid" href="#contact">Get in touch</a></div></section>`,
  };

  // ---------- state ----------
  let content = CMS.content;
  let editing = false, sel = null, hover = null, inline = null, tab = "edit";
  const undo = ss.get("cms-undo") || { past: [], future: [] };

  function saveDraft() {
    ls.set("cms-draft", { content, base: CMS.publishedId, at: Date.now() });
    CMS.hasDraft = true;
    dot();
  }
  function snapshot() {
    undo.past.push(JSON.stringify(content));
    if (undo.past.length > 40) undo.past.shift();
    undo.future = [];
    ss.set("cms-undo", undo);
  }
  function reloadWith(c, keep = true) {
    content = c;
    keep ? saveDraft() : ls.del("cms-draft");
    ss.set("cms-reopen", { editing, tab: tab === "edit" ? "edit" : tab });
    location.reload();
  }

  // Record an edit: apply it now and keep it in the draft. Style/attr edits on the same element merge.
  function commit(op, { snap = true } = {}) {
    if (snap) snapshot();
    if (CMS.page && CMS.page !== "/") op.p = CMS.page;
    CMS.apply(op);
    const last = content.ops[content.ops.length - 1];
    if (last && (op.t === "style" || op.t === "attr") && last.t === op.t && last.sel === op.sel && last.p === op.p) Object.assign(last.v, op.v);
    else content.ops.push(op);
    saveDraft();
  }

  // ---------- selectors ----------
  function selOf(el) {
    const parts = [];
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.dataset.cmsId) { parts.unshift(`[data-cms-id="${el.dataset.cmsId}"]`); return parts.join(">"); }
      if (el.id) {
        let s = "#" + CSS.escape(el.id);
        if (el.id === "projectBody" && el.dataset.slug) s += `[data-slug="${el.dataset.slug}"]`;
        parts.unshift(s);
        return parts.join(">");
      }
      const p = el.parentElement;
      parts.unshift(`${el.tagName.toLowerCase()}:nth-child(${[...p.children].indexOf(el) + 1})`);
      el = p;
    }
    parts.unshift("body");
    return parts.join(">");
  }
  const inUI = (n) => n && n.closest && n.closest("#cms-ui,.cms-login");

  // ---------- UI ----------
  const css = document.createElement("style");
  css.textContent = `
#cms-ui,#cms-ui *{box-sizing:border-box}
#cms-ui{font:14px/1.4 Figtree,system-ui,sans-serif;color:#EEEBE3;--cx-bg:#10141d;--cx-line:#2a3142;--cx-acc:#5E8BFF}
:where(#cms-ui) :where(button,input,select,textarea,label){font:inherit;color:inherit}
.cx-dock{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:10001;display:flex;gap:4px;padding:6px;background:rgba(12,15,22,.94);border:1px solid var(--cx-line);border-radius:999px;box-shadow:0 12px 40px rgba(0,0,0,.5);backdrop-filter:blur(10px);max-width:calc(100vw - 20px);overflow-x:auto;scrollbar-width:none}
.cx-dock button{border:0;background:transparent;padding:9px 13px;border-radius:999px;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px}
.cx-dock button:hover{background:#1d2333}
.cx-dock button[aria-pressed=true]{background:var(--cx-acc);color:#fff}
.cx-dock .pub{background:#EEEBE3;color:#0B0D13;font-weight:700}
.cx-dock .pub:hover{background:#fff}
.cx-dock i.d{width:8px;height:8px;border-radius:50%;background:#F2A541;display:none}
.cx-dock.dirty i.d{display:inline-block}
.cx-panel{position:fixed;top:0;right:0;bottom:0;width:360px;z-index:10000;background:var(--cx-bg);border-left:1px solid var(--cx-line);display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.35)}
.cx-panel[hidden]{display:none}
.cx-head{display:flex;align-items:center;gap:8px;padding:14px 14px 10px;border-bottom:1px solid var(--cx-line)}
.cx-head b{flex:1;font-size:15px}
.cx-tabs{display:flex;gap:4px;padding:8px 10px;border-bottom:1px solid var(--cx-line);overflow-x:auto}
.cx-tabs button{border:1px solid transparent;background:transparent;padding:6px 11px;border-radius:999px;cursor:pointer;white-space:nowrap;color:#959BAC}
.cx-tabs button[aria-pressed=true]{background:#1d2333;color:#EEEBE3;border-color:var(--cx-line)}
.cx-body{flex:1;overflow-y:auto;padding:12px 14px 90px}
.cx-sec{border:1px solid var(--cx-line);border-radius:12px;padding:12px;margin-bottom:12px}
.cx-sec h4{margin:0 0 10px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#959BAC;font-weight:700}
.cx-row{display:grid;grid-template-columns:96px 1fr;gap:8px;align-items:center;margin-bottom:8px}
.cx-row>span{color:#959BAC;font-size:12.5px}
.cx-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cx-in{width:100%;min-width:0;background:#0B0D13;border:1px solid var(--cx-line);border-radius:8px;padding:7px 9px}
.cx-in:focus{outline:2px solid var(--cx-acc);outline-offset:0}
textarea.cx-in{min-height:80px;resize:vertical;font-family:"JetBrains Mono",monospace;font-size:12px}
.cx-col{display:flex;gap:6px;align-items:center}
.cx-col input[type=color]{width:38px;height:32px;padding:2px;border:1px solid var(--cx-line);border-radius:8px;background:#0B0D13;flex:none}
.cx-b{border:1px solid var(--cx-line);background:#171c28;padding:7px 11px;border-radius:8px;cursor:pointer;white-space:nowrap}
.cx-b:hover{border-color:#5F6678}
.cx-b.p{background:var(--cx-acc);border-color:var(--cx-acc);color:#fff}
.cx-b.r{color:#ff8a8a}
.cx-btns{display:flex;flex-wrap:wrap;gap:6px}
.cx-note{color:#959BAC;font-size:12.5px;margin:0 0 10px}
.cx-crumb{font-family:"JetBrains Mono",monospace;font-size:11.5px;color:#959BAC;margin-bottom:10px;overflow-wrap:anywhere}
.cx-list{display:grid;gap:6px}
.cx-li{display:flex;gap:8px;align-items:center;border:1px solid var(--cx-line);border-radius:10px;padding:8px 10px}
.cx-li>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cx-hl{position:fixed;pointer-events:none;z-index:9998;border:2px dashed rgba(94,139,255,.8);border-radius:4px;transition:all .06s}
.cx-sel{position:fixed;pointer-events:none;z-index:9999;border:2px solid #F2A541;border-radius:4px;box-shadow:0 0 0 9999px rgba(0,0,0,.08)}
.cx-sel span{position:absolute;top:-22px;left:-2px;background:#F2A541;color:#0B0D13;font:600 11px/1 Figtree,sans-serif;padding:4px 6px;border-radius:4px 4px 4px 0;white-space:nowrap}
.cx-toast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:10002;background:#EEEBE3;color:#0B0D13;padding:10px 16px;border-radius:999px;font-weight:600}
.cx-banner{position:fixed;top:0;left:0;right:0;z-index:10001;background:#F2A541;color:#0B0D13;text-align:center;font:600 12.5px/1.3 Figtree,sans-serif;padding:6px 12px}
body.cx-editing{cursor:crosshair}
body.cx-editing [contenteditable=true]{cursor:text;outline:2px solid #3ddc84!important;outline-offset:2px}
body.cx-open .bot-fab,body.cx-open .bot{display:none!important}
body.cx-open{padding-bottom:70px}
@media (min-width:821px){body.cx-panel-on{margin-right:360px}body.cx-panel-on header.top{right:360px}}
@media (max-width:820px){.cx-panel{top:auto;left:0;width:auto;height:62vh;border-left:0;border-top:1px solid var(--cx-line);border-radius:18px 18px 0 0}.cx-dock{bottom:calc(62vh + 8px)}.cx-panel[hidden]~.cx-dock,.cx-dock.low{bottom:14px}}`;
  document.head.appendChild(css);

  const ui = document.createElement("div");
  ui.id = "cms-ui";
  ui.innerHTML = `
<div class="cx-hl" hidden></div><div class="cx-sel" hidden><span></span></div>
<aside class="cx-panel" hidden aria-label="Customise panel"><div class="cx-head"><b>Customise</b><button class="cx-b" data-a="close" aria-label="Close panel">✕</button></div>
<div class="cx-tabs" role="tablist"></div><div class="cx-body"></div></aside>
<div class="cx-dock">
<button data-a="edit" aria-pressed="false">✎ Edit</button>
<button class="pub" data-a="publish"><i class="d"></i>Publish</button>
<button data-a="undo" title="Undo (Ctrl+Z)">↶</button><button data-a="redo" title="Redo">↷</button>
<button data-a="tab" data-t="theme">🎨 Theme</button><button data-a="tab" data-t="pages">☰ Pages</button><button data-a="tab" data-t="history">🕘 History</button><button data-a="tab" data-t="more">⋯ More</button></div>`;
  document.body.appendChild(ui);
  document.body.classList.add("cx-open");
  if (CMS.preview) {
    const b = document.createElement("div");
    b.className = "cx-banner";
    b.textContent = "Preview mode: your edits are saved in this browser only. On the live site they are saved for every visitor.";
    ui.appendChild(b);
  }
  const panel = $(".cx-panel", ui), body = $(".cx-body", ui), tabs = $(".cx-tabs", ui), dock = $(".cx-dock", ui);
  const hl = $(".cx-hl", ui), selBox = $(".cx-sel", ui);

  function dot() { dock.classList.toggle("dirty", !!CMS.hasDraft); }
  dot();
  function toast(t) {
    const d = document.createElement("div");
    d.className = "cx-toast"; d.textContent = t; ui.appendChild(d);
    setTimeout(() => d.remove(), 2200);
  }

  function openPanel(t) {
    tab = t;
    panel.hidden = false;
    dock.classList.remove("low");
    document.body.classList.add("cx-panel-on");
    render();
  }
  function closePanel() {
    panel.hidden = true;
    dock.classList.add("low");
    document.body.classList.remove("cx-panel-on");
    select(null);
  }

  function setEditing(on) {
    editing = on;
    $('[data-a="edit"]', dock).setAttribute("aria-pressed", on);
    document.body.classList.toggle("cx-editing", on);
    hl.hidden = true;
    if (!on) { stopInline(); select(null); }
    else openPanel("edit");
  }

  // ---------- selection ----------
  function place(box, el) {
    const r = el.getBoundingClientRect();
    Object.assign(box.style, { top: r.top - 3 + "px", left: r.left - 3 + "px", width: r.width + 6 + "px", height: r.height + 6 + "px" });
  }
  function label(el) {
    const t = el.tagName.toLowerCase();
    const names = { h1: "Title", h2: "Heading", h3: "Heading", h4: "Heading", p: "Text", a: el.classList.contains("btn") ? "Button" : "Link", img: "Photo", video: "Video", iframe: "Embed", button: "Button", section: "Section", header: "Header", footer: "Footer", nav: "Menu", ul: "List", li: "List item", figure: "Figure", span: "Text", article: "Card" };
    return names[t] || (el.classList[0] ? "Block ." + el.classList[0] : "Block");
  }
  function select(el) {
    stopInline();
    sel = el;
    selBox.hidden = !el;
    if (el) { place(selBox, el); $("span", selBox).textContent = label(el); }
    if (!panel.hidden && tab === "edit") render();
  }
  addEventListener("scroll", () => { if (sel && sel.isConnected) place(selBox, sel); hl.hidden = true; }, true);
  addEventListener("resize", () => { if (sel && sel.isConnected) place(selBox, sel); });

  document.addEventListener("mousemove", (e) => {
    if (!editing || inline) return;
    const t = e.target.closest && e.target.closest(".w") && e.target.closest("[data-split]") ? e.target.closest("[data-split]") : e.target;
    if (inUI(t) || t === document.body || t === document.documentElement) { hl.hidden = true; return; }
    hover = t; hl.hidden = false; place(hl, t);
  }, true);
  const block = (e) => {
    if (!editing || inUI(e.target)) return;
    if (inline && inline.contains(e.target)) { if (e.type === "click") e.preventDefault(); return; }
    e.preventDefault(); e.stopImmediatePropagation();
    // Headlines are split into animated word spans; select the whole headline instead of one word.
    const t = e.target.closest(".w") && e.target.closest("[data-split]") ? e.target.closest("[data-split]") : e.target;
    if (e.type === "click") select(t === document.body ? null : t);
    if (e.type === "dblclick" && sel) startInline();
  };
  ["click", "submit", "dblclick"].forEach((ev) => document.addEventListener(ev, block, true));

  // ---------- inline text ----------
  function startInline() {
    if (!sel) return;
    inline = sel;
    if (inline.dataset.split) inline.querySelectorAll(".w").forEach((w) => w.replaceWith(document.createTextNode(w.textContent)));
    inline.normalize();
    inline.dataset.cxBefore = inline.innerHTML;
    inline.contentEditable = "true";
    inline.focus();
    hl.hidden = true;
    inline.addEventListener("blur", stopInline, { once: true });
    inline.addEventListener("keydown", inlineKeys);
    if (tab === "edit") render();
  }
  function inlineKeys(e) {
    if (e.key === "Escape") { inline.innerHTML = inline.dataset.cxBefore; inline.blur(); }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) inline.blur();
  }
  function stopInline() {
    if (!inline) return;
    const el = inline;
    inline = null;
    el.removeAttribute("contenteditable");
    el.removeEventListener("keydown", inlineKeys);
    const before = el.dataset.cxBefore;
    delete el.dataset.cxBefore;
    if (el.innerHTML !== before) commit({ sel: selOf(el), t: "html", v: CMS.clean(el.innerHTML) });
    if (sel === el) place(selBox, el);
    if (sel === el && tab === "edit" && !panel.hidden) render();
  }

  // ---------- helpers for panel ----------
  const rgb2hex = (c) => {
    const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
    if (!m) return /^#/.test(c) ? c : "#000000";
    return "#" + [m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, "0")).join("");
  };
  const unit = (v) => (/^-?\d+(\.\d+)?$/.test(String(v).trim()) ? v + "px" : v);
  const row = (lab, html) => `<label class="cx-row"><span>${lab}</span>${html}</label>`;
  const color = (k, val, isVar) => `<div class="cx-col"><input type="color" value="${rgb2hex(val)}" ${isVar ? `data-var="${k}"` : `data-s="${k}"`}><input class="cx-in" value="${esc(val)}" ${isVar ? `data-var="${k}"` : `data-s="${k}"`} data-text><button type="button" class="cx-b" title="Reset" ${isVar ? `data-clrvar="${k}"` : `data-clr="${k}"`}>×</button></div>`;
  const txt = (k, ph, val = "") => `<input class="cx-in" data-s="${k}" placeholder="${esc(ph)}" value="${esc(val)}">`;
  const opt = (list, cur) => list.map(([v, l]) => `<option value="${esc(v)}" ${v === cur ? "selected" : ""}>${esc(l)}</option>`).join("");

  function renderTabs() {
    const T = [["edit", "Element"], ["theme", "Theme"], ["pages", "Pages"], ["history", "History"], ["more", "More"]];
    tabs.innerHTML = T.map(([k, l]) => `<button data-tab="${k}" aria-pressed="${k === tab}">${l}</button>`).join("");
  }

  function render() {
    renderTabs();
    $(".cx-head b", panel).textContent = { edit: "Customise", theme: "Theme & style", pages: "Pages & menu", history: "Version history", more: "More" }[tab];
    ({ edit: renderEdit, theme: renderTheme, pages: renderPages, history: renderHistory, more: renderMore })[tab]();
  }

  // ---------- Element tab ----------
  function renderEdit() {
    if (!editing) {
      body.innerHTML = `<p class="cx-note">Turn on <b>✎ Edit</b>, then click anything on the page: text, titles, buttons, photos, videos, cards, sections, the header or the footer.</p><div class="cx-btns"><button class="cx-b p" data-a="edit">Start editing</button></div>`;
      return;
    }
    if (!sel || !sel.isConnected) {
      body.innerHTML = `<p class="cx-note">Click anything on the page to edit it. Double-click text to type straight into it.</p>
      <p class="cx-note">To change another page, use the menu at the top while editing is off, or open it here:</p>
      <div class="cx-btns">${[...BUILTIN, ...(content.pages || []).map((p) => [p.slug, p.title])].map(([s, l]) => `<button class="cx-b" data-go="${s}">${esc(l)}</button>`).join("")}</div>`;
      return;
    }
    const el = sel, cs = getComputedStyle(el), tag = el.tagName;
    const link = el.closest("a");
    const isMedia = /^(IMG|VIDEO|IFRAME|SOURCE)$/.test(tag);
    const hasText = !isMedia && el.textContent.trim().length > 0;
    let h = `<div class="cx-crumb">${esc(label(el))} · ${esc(selOf(el)).slice(-90)}</div>
    <div class="cx-btns" style="margin-bottom:12px">
      ${hasText ? `<button class="cx-b p" data-x="inline">${inline ? "Done typing" : "✎ Edit text"}</button>` : ""}
      <button class="cx-b" data-x="parent" title="Select the box around this">⬑ Parent</button>
      <button class="cx-b" data-x="dup">⧉ Duplicate</button>
      <button class="cx-b" data-x="up">↑</button><button class="cx-b" data-x="down">↓</button>
      <button class="cx-b r" data-x="del">🗑 Delete</button>
    </div>`;

    if (link || isMedia) {
      h += `<div class="cx-sec"><h4>Content</h4>`;
      if (link) h += row("Link", `<input class="cx-in" data-attr="href" data-on="link" value="${esc(link.getAttribute("href") || "")}" placeholder="https://… or #contact">`) +
        row("New tab", `<input type="checkbox" data-newtab ${link.target === "_blank" ? "checked" : ""}>`);
      if (tag === "IMG") h += row("Photo URL", `<input class="cx-in" data-attr="src" value="${esc(el.getAttribute("src") || "")}">`) +
        row("Upload", `<input type="file" accept="image/*" data-up="src" class="cx-in">`) +
        row("Alt text", `<input class="cx-in" data-attr="alt" value="${esc(el.getAttribute("alt") || "")}">`) +
        row("Fit", `<select class="cx-in" data-s="object-fit">${opt([["", "Default"], ["cover", "Fill (crop)"], ["contain", "Fit inside"]], el.style.objectFit)}</select>`);
      if (tag === "VIDEO") h += row("Video URL", `<input class="cx-in" data-attr="src" value="${esc(el.getAttribute("src") || el.currentSrc || "")}">`) +
        row("Upload", `<input type="file" accept="video/mp4,video/webm" data-up="src" class="cx-in">`) +
        row("Cover image", `<input class="cx-in" data-attr="poster" value="${esc(el.getAttribute("poster") || "")}">`);
      if (tag === "IFRAME") h += row("Embed URL", `<input class="cx-in" data-attr="src" value="${esc(el.getAttribute("src") || "")}" placeholder="YouTube or Vimeo link">`);
      h += `</div>`;
    }

    h += `<div class="cx-sec"><h4>Text</h4>
      ${row("Colour", color("color", cs.color))}
      ${row("Font", `<select class="cx-in" data-s="font-family">${FONTS.map((f) => `<option value="${f ? `'${f}', sans-serif` : ""}" ${f && el.style.fontFamily.includes(f) ? "selected" : ""}>${f || "Default"}</option>`).join("")}</select>`)}
      <div class="cx-two">${txt("font-size", "Size " + cs.fontSize, el.style.fontSize)}<select class="cx-in" data-s="font-weight">${opt([["", "Weight"], ["300", "Light"], ["400", "Regular"], ["500", "Medium"], ["600", "Semi-bold"], ["700", "Bold"], ["800", "Extra bold"]], el.style.fontWeight)}</select></div>
      <div class="cx-two" style="margin-top:8px">${txt("line-height", "Line height " + cs.lineHeight, el.style.lineHeight)}${txt("letter-spacing", "Spacing " + cs.letterSpacing, el.style.letterSpacing)}</div>
      <div class="cx-btns" style="margin-top:8px">${[["left", "⯇ Left"], ["center", "Centre"], ["right", "Right ⯈"]].map(([v, l]) => `<button class="cx-b" data-set="text-align:${v}">${l}</button>`).join("")}<button class="cx-b" data-set="font-style:${cs.fontStyle === "italic" ? "" : "italic"}"><i>I</i></button><button class="cx-b" data-set="text-decoration:${/underline/.test(cs.textDecorationLine) ? "" : "underline"}"><u>U</u></button><button class="cx-b" data-set="text-transform:${cs.textTransform === "uppercase" ? "" : "uppercase"}">AA</button></div>
    </div>
    <div class="cx-sec"><h4>Box</h4>
      ${row("Background", color("background-color", cs.backgroundColor))}
      <div class="cx-two">${txt("width", "Width " + Math.round(el.offsetWidth) + "px", el.style.width)}${txt("height", "Height " + Math.round(el.offsetHeight) + "px", el.style.height)}</div>
      <div class="cx-two" style="margin-top:8px">${txt("padding", "Inner space " + cs.padding, el.style.padding)}${txt("margin", "Outer space " + cs.margin, el.style.margin)}</div>
      <div class="cx-two" style="margin-top:8px">${txt("max-width", "Max width", el.style.maxWidth)}${txt("min-height", "Min height", el.style.minHeight)}</div>
    </div>
    <div class="cx-sec"><h4>Corner, border & shape</h4>
      ${row("Corner", `<input type="range" min="0" max="80" value="${parseInt(cs.borderTopLeftRadius) || 0}" data-range="border-radius" class="cx-in">`)}
      <div class="cx-btns" style="margin-bottom:8px"><button class="cx-b" data-set="border-radius:0px">▢ Square</button><button class="cx-b" data-set="border-radius:14px">▢ Rounded</button><button class="cx-b" data-set="border-radius:999px">⬭ Pill</button><button class="cx-b" data-shape="circle">◯ Circle</button><button class="cx-b" data-shape="blob">✿ Blob</button></div>
      <div class="cx-two">${txt("border-width", "Border " + cs.borderTopWidth, el.style.borderWidth)}<select class="cx-in" data-s="border-style">${opt([["", "Style"], ["solid", "Solid"], ["dashed", "Dashed"], ["dotted", "Dotted"], ["double", "Double"], ["none", "None"]], el.style.borderStyle)}</select></div>
      <div style="margin-top:8px">${row("Border colour", color("border-color", cs.borderTopColor))}</div>
      ${row("Shadow", `<select class="cx-in" data-shadow>${opt([["", "Default"], ["none", "None"], ["soft", "Soft"], ["strong", "Strong"], ["glow", "Glow"]], "")}</select>`)}
      ${row("Opacity", `<input type="range" min="0" max="100" value="${Math.round(parseFloat(cs.opacity) * 100)}" data-range="opacity" class="cx-in">`)}
    </div>
    <div class="cx-sec"><h4>Position</h4>
      <div class="cx-two">${txt("--cx-x", "Move right (px)", (el.style.translate || "").split(" ")[0] || "")}${txt("--cx-y", "Move down (px)", (el.style.translate || "").split(" ")[1] || "")}</div>
      <div class="cx-two" style="margin-top:8px">${txt("rotate", "Rotate e.g. 5deg", el.style.rotate)}${txt("z-index", "Layer (z-index)", el.style.zIndex)}</div>
      <div class="cx-btns" style="margin-top:8px"><button class="cx-b" data-set="margin-left:auto;margin-right:auto;display:block">Centre box</button><button class="cx-b" data-set="display:none">Hide</button><button class="cx-b" data-set="display:">Show</button></div>
    </div>
    <div class="cx-sec"><h4>Animation & transition</h4>
      ${row("On scroll", `<select class="cx-in" data-anim>${opt(ANIMS, el.dataset.anim || "")}</select>`)}
      <div class="cx-two">${txt("--cms-dur", "Duration e.g. 0.8s", el.style.getPropertyValue("--cms-dur"))}${txt("--cms-delay", "Delay e.g. 0.2s", el.style.getPropertyValue("--cms-delay"))}</div>
      <div style="margin-top:8px">${row("On hover", `<select class="cx-in" data-hover>${opt(HOVERS, el.dataset.hover || "")}</select>`)}</div>
      ${row("Speed", txt("--cms-tr", "Transition e.g. 0.3s", el.style.getPropertyValue("--cms-tr")))}
    </div>
    <div class="cx-sec"><h4>Add something new</h4>
      <div class="cx-row"><span>Where</span><select class="cx-in" data-where><option value="after">After this</option><option value="before">Before this</option><option value="append">Inside, at the end</option></select></div>
      <div class="cx-btns">${[["heading", "Heading"], ["text", "Text"], ["button", "Button"], ["image", "Photo"], ["video", "Video file"], ["youtube", "YouTube"], ["card", "Card"], ["section", "Section"], ["divider", "Line"], ["spacer", "Space"]].map(([k, l]) => `<button class="cx-b" data-ins="${k}">+ ${l}</button>`).join("")}</div>
    </div>
    <div class="cx-sec"><h4>Advanced</h4>
      ${row("CSS classes", `<input class="cx-in" data-attr="class" value="${esc(el.getAttribute("class") || "")}">`)}
      <div class="cx-btns"><button class="cx-b" data-x="reset">Undo all edits on this element</button></div>
    </div>`;
    body.innerHTML = h;
  }

  function setStyle(v) {
    if (!sel) return;
    commit({ sel: selOf(sel), t: "style", v }, { snap: false });
    place(selBox, sel);
  }
  let snapTimer;
  function snapOnce() { if (!snapTimer) snapshot(); clearTimeout(snapTimer); snapTimer = setTimeout(() => (snapTimer = null), 800); }

  body.addEventListener("input", (e) => {
    const t = e.target;
    if (tab === "theme") return themeInput(t);
    if (tab !== "edit" || !sel) return;
    snapOnce();
    if (t.dataset.s) {
      let k = t.dataset.s, v = t.value.trim();
      if (k === "--cx-x" || k === "--cx-y") {
        const [x0, y0] = (sel.style.translate || "0px 0px").split(" ");
        const x = k === "--cx-x" ? unit(v || "0") : x0 || "0px", y = k === "--cx-y" ? unit(v || "0") : y0 || "0px";
        return setStyle({ translate: x === "0px" && y === "0px" ? "" : `${x} ${y}` });
      }
      if (/^(width|height|padding|margin|max-width|min-height|font-size|border-width|letter-spacing)$/.test(k)) v = v.split(/\s+/).map(unit).join(" ");
      if (k === "border-width" && v && !sel.style.borderStyle && getComputedStyle(sel).borderTopStyle === "none") setStyle({ "border-style": "solid" });
      if (t.type === "color") { const tx = t.parentElement.querySelector("[data-text]"); if (tx) tx.value = v; }
      if (t.dataset.text !== undefined) { const c = t.parentElement.querySelector("input[type=color]"); if (c && /^#[0-9a-f]{6}$/i.test(v)) c.value = v; }
      if (k === "font-family") CMS.loadFonts([v]);
      return setStyle({ [k]: v });
    }
    if (t.dataset.range) return setStyle({ [t.dataset.range]: t.dataset.range === "opacity" ? String(t.value / 100) : t.value + "px" });
  });
  body.addEventListener("change", async (e) => {
    const t = e.target;
    if (tab === "theme") return themeChange(t);
    if (tab !== "edit" || !sel) return;
    if (t.dataset.attr) {
      const target = t.dataset.on === "link" ? sel.closest("a") : sel;
      commit({ sel: selOf(target), t: "attr", v: { [t.dataset.attr]: t.value.trim() } });
      if (t.dataset.attr === "class") select(target);
      return;
    }
    if (t.dataset.newtab !== undefined) {
      const a = sel.closest("a");
      return commit({ sel: selOf(a), t: "attr", v: t.checked ? { target: "_blank", rel: "noopener" } : { target: "", rel: "" } });
    }
    if (t.dataset.shadow !== undefined) return setStyle({ "box-shadow": SHADOWS[t.value] ?? "" });
    if (t.dataset.anim !== undefined) {
      commit({ sel: selOf(sel), t: "attr", v: { "data-anim": t.value } });
      if (t.value) { sel.classList.remove("cms-in"); void sel.offsetWidth; requestAnimationFrame(() => sel.classList.add("cms-in")); }
      return;
    }
    if (t.dataset.hover !== undefined) return commit({ sel: selOf(sel), t: "attr", v: { "data-hover": t.value } });
    if (t.dataset.up) return upload(t);
  });

  async function upload(input) {
    const f = input.files[0];
    if (!f) return;
    let file = f;
    if (f.type.startsWith("image/") && f.type !== "image/gif" && f.type !== "image/svg+xml") file = await shrink(f);
    if (CMS.preview) {
      if (file.size > 1.5e6) return toast("In preview, use files under 1.5 MB or paste a link.");
      const url = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
      commit({ sel: selOf(sel), t: "attr", v: { [input.dataset.up]: url } });
      return render();
    }
    if (file.size > 4.2e6) return toast("That file is over 4 MB. Upload it to YouTube or Google Drive and paste the link.");
    toast("Uploading…");
    try {
      const r = await fetch("/api/upload?name=" + encodeURIComponent(f.name), { method: "POST", body: file, headers: { "Content-Type": file.type }, credentials: "same-origin" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      commit({ sel: selOf(sel), t: "attr", v: { [input.dataset.up]: j.url } });
      toast("Uploaded");
      render();
    } catch (x) { toast(x.message || "Upload failed"); }
  }
  // Large photos are resized to 2000px WebP before upload.
  async function shrink(f) {
    try {
      const img = await createImageBitmap(f);
      const k = Math.min(1, 2000 / Math.max(img.width, img.height));
      if (k === 1 && f.size < 1.2e6) return f;
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const b = await new Promise((r) => c.toBlob(r, "image/webp", 0.85));
      return b ? new File([b], f.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" }) : f;
    } catch { return f; }
  }

  body.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.go) { setEditing(false); goTo(b.dataset.go); setTimeout(() => setEditing(true), 50); return; }
    if (tab !== "edit") return;
    if (b.dataset.a === "edit") return setEditing(true);
    if (b.dataset.clr) return setStyle({ [b.dataset.clr]: "" }), render();
    if (b.dataset.set) {
      snapshot();
      const v = {};
      b.dataset.set.split(";").forEach((p) => { const [k, ...r] = p.split(":"); v[k] = r.join(":"); });
      setStyle(v);
      return render();
    }
    if (b.dataset.shape) {
      snapshot();
      setStyle(b.dataset.shape === "circle" ? { "border-radius": "50%", "aspect-ratio": "1", "object-fit": "cover" } : { "border-radius": "62% 38% 46% 54% / 55% 44% 56% 45%" });
      return render();
    }
    if (b.dataset.ins) {
      const where = $("[data-where]", body).value;
      const id = uid();
      commit({ sel: selOf(sel), t: "ins", where, html: BLOCKS[b.dataset.ins](), id });
      const n = document.querySelector(`[data-cms-id="${id}"]`);
      if (n) { n.scrollIntoView({ block: "center", behavior: "smooth" }); select(n); }
      return;
    }
    const x = b.dataset.x;
    if (!x || !sel) return;
    if (x === "inline") return inline ? inline.blur() : startInline();
    if (x === "parent") return sel.parentElement && sel.parentElement !== document.body && select(sel.parentElement);
    if (x === "dup") {
      const id = uid();
      commit({ sel: selOf(sel), t: "dup", id });
      return select(document.querySelector(`[data-cms-id="${id}"]`));
    }
    if (x === "up" || x === "down") {
      const el = sel;
      commit({ sel: selOf(el), t: "move", dir: x === "up" ? -1 : 1 });
      return select(el);
    }
    if (x === "del") {
      if (!confirm("Delete this " + label(sel).toLowerCase() + "? You can undo it.")) return;
      commit({ sel: selOf(sel), t: "del" });
      return select(null);
    }
    if (x === "reset") {
      const s = selOf(sel);
      snapshot();
      content.ops = content.ops.filter((o) => o.sel !== s || !CMS.here(o) || o.t === "dup" || o.t === "ins");
      return reloadWith(content);
    }
  });

  // ---------- Theme tab ----------
  function renderTheme() {
    const t = (content.theme ||= {});
    const v = (t.vars ||= {});
    const b = (t.btn ||= {});
    const cs = getComputedStyle(document.documentElement);
    const val = (k) => v[k] || cs.getPropertyValue(k).trim();
    body.innerHTML = `
    <div class="cx-sec"><h4>Colours</h4>${THEME_COLORS.map(([k, l]) => row(l, color(k, val(k), true))).join("")}
      <div class="cx-btns"><button class="cx-b" data-preset="dark">Navy & white (default)</button><button class="cx-b" data-preset="midnight">Midnight (dark)</button><button class="cx-b" data-preset="light">Warm light</button><button class="cx-b" data-preset="emerald">Emerald</button><button class="cx-b" data-preset="royal">Royal purple</button><button class="cx-b" data-preset="sunset">Sunset</button></div></div>
    <div class="cx-sec"><h4>Fonts</h4>
      ${row("Headings", `<select class="cx-in" data-var="--f-display">${FONTS.map((f) => `<option value="${f ? `'${f}', system-ui, sans-serif` : ""}" ${f && (v["--f-display"] || "").includes(f) ? "selected" : ""}>${f || "Default"}</option>`).join("")}</select>`)}
      ${row("Body text", `<select class="cx-in" data-var="--f-body">${FONTS.map((f) => `<option value="${f ? `'${f}', system-ui, sans-serif` : ""}" ${f && (v["--f-body"] || "").includes(f) ? "selected" : ""}>${f || "Default"}</option>`).join("")}</select>`)}
      ${row("Big titles", `<input class="cx-in" data-var="--s1" value="${esc(v["--s1"] || "")}" placeholder="${esc(cs.getPropertyValue("--s1").trim())}">`)}
      ${row("Headings", `<input class="cx-in" data-var="--s2" value="${esc(v["--s2"] || "")}" placeholder="${esc(cs.getPropertyValue("--s2").trim())}">`)}</div>
    <div class="cx-sec"><h4>Layout</h4>
      ${row("Card corners", `<input type="range" min="0" max="40" value="${parseInt(val("--r")) || 8}" data-var="--r" data-px class="cx-in">`)}
      ${row("Page width", `<input type="range" min="960" max="1600" step="20" value="${parseInt(val("--wrap")) || 1200}" data-var="--wrap" data-px class="cx-in">`)}</div>
    <div class="cx-sec"><h4>All buttons</h4>
      ${row("Corners", `<input type="range" min="0" max="40" value="${b.radius ?? 8}" data-btn="radius" class="cx-in">`)}
      ${row("Text size", `<input type="range" min="12" max="20" value="${b.size || 15}" data-btn="size" class="cx-in">`)}
      ${row("Main colour", `<div class="cx-col"><input type="color" value="${b.solidBg || "#0B1B33"}" data-btn="solidBg"><input type="color" value="${b.solidFg || "#FFFFFF"}" data-btn="solidFg" title="Text colour"><button class="cx-b" data-btnclr>×</button></div>`)}
      ${row("Hover", `<select class="cx-in" data-btn="hover">${opt([["", "Default"], ["lift", "Lift"], ["grow", "Grow"], ["glow", "Glow"], ["none", "None"]], b.hover || "")}</select>`)}
      ${row("CAPITALS", `<input type="checkbox" data-btn="upper" ${b.upper ? "checked" : ""}>`)}</div>
    <div class="cx-sec"><h4>Custom CSS (advanced)</h4><textarea class="cx-in" data-css placeholder=".hero h1{letter-spacing:-.05em}">${esc(t.css || "")}</textarea></div>
    <div class="cx-btns"><button class="cx-b r" data-themereset>Reset theme</button></div>`;
  }
  const PRESETS = {
    dark: {},
    midnight: { "--ink": "#0A1222", "--panel": "#0F192D", "--raise": "#16223A", "--line": "#22304B", "--paper": "#EEF2F8", "--mute": "#A3AEC2", "--faint": "#6B778C", "--cobalt": "#6E96FF", "--ember": "#8FB0FF", "--brass-hi": "#8FB0FF", "--brass-lo": "#3F6BE0" },
    light: { "--ink": "#F7F5F0", "--panel": "#FFFFFF", "--raise": "#EFECE4", "--line": "#E2DED4", "--paper": "#14161C", "--mute": "#5E6472", "--faint": "#9AA0AD", "--cobalt": "#2F5BEA", "--ember": "#5C7CF0" },
    emerald: { "--ink": "#F5F8F7", "--panel": "#FFFFFF", "--raise": "#EAF1EE", "--line": "#DCE6E2", "--paper": "#0E1F1A", "--mute": "#4A5E57", "--faint": "#8A9B95", "--cobalt": "#0F7A5C", "--ember": "#1E9C77" },
    royal: { "--ink": "#F7F6FB", "--panel": "#FFFFFF", "--raise": "#EFEDF7", "--line": "#E2DFEE", "--paper": "#17122B", "--mute": "#565070", "--faint": "#9690AD", "--cobalt": "#6D3FE0", "--ember": "#8B63F0" },
    sunset: { "--ink": "#FBF7F5", "--panel": "#FFFFFF", "--raise": "#F5ECE8", "--line": "#EADFDA", "--paper": "#24130F", "--mute": "#6A524B", "--faint": "#A8928B", "--cobalt": "#D9480F", "--ember": "#F07A3E" },
  };
  function themeSave() {
    const v = content.theme.vars;
    if (v["--cobalt"]) {
      const h = v["--cobalt"].replace("#", "");
      if (h.length === 6) v["--cobalt-soft"] = `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},.14)`;
    }
    CMS.applyTheme(content);
    saveDraft();
  }
  function themeInput(t) {
    snapOnce();
    const th = content.theme;
    if (t.dataset.var) {
      let v = t.value.trim();
      if (t.dataset.px !== undefined) v += "px";
      th.vars[t.dataset.var] = v;
      if (t.type === "color") { const tx = t.parentElement.querySelector("[data-text]"); if (tx) tx.value = v; }
      return themeSave();
    }
    if (t.dataset.btn) { th.btn[t.dataset.btn] = t.type === "checkbox" ? t.checked : t.value; return themeSave(); }
    if (t.dataset.css !== undefined) { th.css = t.value; return themeSave(); }
  }
  function themeChange(t) { if (t.tagName === "SELECT" || t.type === "checkbox") themeInput(t); }
  body.addEventListener("click", (e) => {
    if (tab !== "theme") return;
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.preset) { snapshot(); content.theme.vars = { ...PRESETS[b.dataset.preset] }; return reloadWith(content); }
    if (b.dataset.clrvar) { snapshot(); delete content.theme.vars[b.dataset.clrvar]; document.documentElement.style.removeProperty(b.dataset.clrvar); themeSave(); return render(); }
    if (b.dataset.btnclr !== undefined) { snapshot(); delete content.theme.btn.solidBg; delete content.theme.btn.solidFg; themeSave(); return render(); }
    if (b.dataset.themereset !== undefined) { if (confirm("Reset all theme colours, fonts and button styles?")) { snapshot(); content.theme = {}; reloadWith(content); } }
  });

  // ---------- Pages tab ----------
  function renderPages() {
    const hidden = content.hidden || [];
    body.innerHTML = `
    <div class="cx-sec"><h4>Main pages</h4><p class="cx-note">Untick a page to remove it from the menu. Click a menu item in edit mode to rename it.</p><div class="cx-list">
      ${BUILTIN.map(([s, l]) => `<div class="cx-li"><input type="checkbox" data-show="${s}" ${hidden.includes(s) ? "" : "checked"} ${s === "home" ? "disabled" : ""}><span>${l}</span><button class="cx-b" data-open="${s}">Open</button></div>`).join("")}</div></div>
    <div class="cx-sec"><h4>Your pages</h4><div class="cx-list">
      ${(content.pages || []).map((p, i) => `<div class="cx-li"><input type="checkbox" title="Show in menu" data-pnav="${i}" ${p.nav !== false ? "checked" : ""}><span>${esc(p.title)}</span><button class="cx-b" data-open="${p.slug}">Open</button><button class="cx-b" data-pren="${i}">Rename</button><button class="cx-b r" data-pdel="${i}">Delete</button></div>`).join("") || `<p class="cx-note">No extra pages yet.</p>`}</div>
      <div class="cx-row" style="margin-top:10px"><span>New page</span><input class="cx-in" data-newtitle placeholder="e.g. Blog, Gallery, Pricing"></div>
      <div class="cx-btns"><button class="cx-b p" data-padd>+ Add page</button></div></div>`;
  }
  const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "page";
  body.addEventListener("click", (e) => {
    if (tab !== "pages") return;
    const b = e.target.closest("button");
    if (!b) return;
    const pages = (content.pages ||= []);
    if (b.dataset.open) { goTo(b.dataset.open); return; }
    if (b.dataset.padd !== undefined) {
      const title = $("[data-newtitle]", body).value.trim();
      if (!title) return toast("Type a page name first");
      let slug = slugify(title);
      const taken = new Set([...BUILTIN.map((x) => x[0]), ...pages.map((p) => p.slug), "project", "login"]);
      for (let i = 2; taken.has(slug); i++) slug = slugify(title) + "-" + i;
      snapshot();
      pages.push({ slug, title, nav: true, html: `<div class="wrap block cms-page"><span class="mono">${esc(title)}</span><h1 style="margin-top:14px">${esc(title)}</h1><p>Write something here. Turn on Edit and click any text to change it, or add photos, videos, buttons and sections.</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:28px"><a class="btn solid" href="#contact">Get in touch</a></div></div>` });
      if (!document.getElementById("app")) { saveDraft(); location.href = "/#" + slug; return; }
      location.hash = slug;
      return reloadWith(content);
    }
    if (b.dataset.pren) {
      const p = pages[+b.dataset.pren];
      const t = prompt("New name for this page", p.title);
      if (!t) return;
      snapshot(); p.title = t.trim(); return reloadWith(content);
    }
    if (b.dataset.pdel) {
      const p = pages[+b.dataset.pdel];
      if (!confirm(`Delete the page "${p.title}" and everything on it?`)) return;
      snapshot();
      pages.splice(+b.dataset.pdel, 1);
      content.ops = content.ops.filter((o) => !o.sel.startsWith("#v-" + p.slug));
      if (location.hash === "#" + p.slug) location.hash = "home";
      return reloadWith(content);
    }
  });
  body.addEventListener("change", (e) => {
    if (tab !== "pages") return;
    const t = e.target;
    snapshot();
    if (t.dataset.show) {
      const h = new Set(content.hidden || []);
      t.checked ? h.delete(t.dataset.show) : h.add(t.dataset.show);
      content.hidden = [...h];
      return reloadWith(content);
    }
    if (t.dataset.pnav) { content.pages[+t.dataset.pnav].nav = t.checked; return reloadWith(content); }
  });

  // ---------- History tab ----------
  async function versions() {
    if (CMS.preview) return (ls.get("cms-preview-versions") || []).map((v) => ({ id: v.id, at: v.at }));
    return (await CMS.api("versions")).versions;
  }
  async function loadVersion(id) {
    if (CMS.preview) return (ls.get("cms-preview-versions") || []).find((v) => v.id === id)?.content;
    return (await CMS.api("content?v=" + encodeURIComponent(id))).content;
  }
  async function renderHistory() {
    body.innerHTML = `<p class="cx-note">Every time you publish, a copy is saved here. Open an older one to bring it back, then press Publish.</p><div class="cx-list" data-vl><p class="cx-note">Loading…</p></div>`;
    try {
      const vs = await versions();
      $("[data-vl]", body).innerHTML = vs.length
        ? vs.map((v, i) => `<div class="cx-li"><span>${new Date(v.at).toLocaleString()}${i === 0 ? " · live now" : ""}</span><button class="cx-b" data-ver="${esc(v.id)}">Bring back</button></div>`).join("")
        : `<p class="cx-note">Nothing published yet.</p>`;
    } catch (x) { $("[data-vl]", body).innerHTML = `<p class="cx-note">${esc(x.message)}</p>`; }
  }
  body.addEventListener("click", async (e) => {
    if (tab !== "history") return;
    const b = e.target.closest("[data-ver]");
    if (!b) return;
    if (!confirm("Replace your current draft with this version?")) return;
    const c = await loadVersion(b.dataset.ver);
    if (c) { snapshot(); reloadWith(c); }
  });

  // ---------- More tab ----------
  function renderMore() {
    body.innerHTML = `
    <div class="cx-sec"><h4>Draft</h4><p class="cx-note">${CMS.hasDraft ? "You have changes that visitors can't see yet. Press Publish to make them live." : "Everything you see is live."}</p>
      <div class="cx-btns"><button class="cx-b" data-m="discard" ${CMS.hasDraft ? "" : "disabled"}>Discard draft</button></div></div>
    <div class="cx-sec"><h4>Backup</h4><div class="cx-btns"><button class="cx-b" data-m="export">⬇ Download backup</button><label class="cx-b">⬆ Restore backup<input type="file" accept="application/json" data-import hidden></label></div></div>
    <div class="cx-sec"><h4>Start over</h4><p class="cx-note">Removes every edit and goes back to the original design (as a draft, until you publish).</p><div class="cx-btns"><button class="cx-b r" data-m="reset">Reset everything</button></div></div>
    <div class="cx-sec"><h4>Help</h4><p class="cx-note">Edit ✎ → click anything → change it in this panel. Double-click text to type. Ctrl+Z undoes. Esc deselects. Nothing is public until you press Publish.</p></div>
    <div class="cx-btns"><button class="cx-b" data-m="logout">Sign out</button></div>`;
  }
  body.addEventListener("click", (e) => {
    if (tab !== "more") return;
    const b = e.target.closest("[data-m]");
    if (!b) return;
    const m = b.dataset.m;
    if (m === "discard" && confirm("Throw away your unpublished changes?")) return reloadWith(clone(CMS.published), false);
    if (m === "export") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: "application/json" }));
      a.download = "portfolio-edits-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      return;
    }
    if (m === "reset" && confirm("Remove every edit and go back to the original design?")) { snapshot(); return reloadWith({ v: 1, ops: [], pages: [], hidden: [], theme: {} }); }
    if (m === "logout") return CMS.logout();
  });
  body.addEventListener("change", async (e) => {
    if (tab !== "more" || e.target.dataset.import === undefined) return;
    try {
      const c = JSON.parse(await e.target.files[0].text());
      if (c.v !== 1 || !Array.isArray(c.ops)) throw 0;
      snapshot();
      reloadWith(c);
    } catch { toast("That file isn't a portfolio backup"); }
  });

  // ---------- dock ----------
  async function publish() {
    stopInline();
    const btn = $(".pub", dock);
    btn.disabled = true;
    try {
      if (CMS.preview) {
        const vs = ls.get("cms-preview-versions") || [];
        const id = String(Date.now());
        vs.unshift({ id, at: new Date().toISOString(), content });
        if (!ls.set("cms-preview-versions", vs.slice(0, 15))) ls.set("cms-preview-versions", vs.slice(0, 3));
        ls.set("cms-preview-published", content);
      } else {
        const r = await CMS.api("content", { method: "PUT", body: JSON.stringify(content) });
        CMS.publishedId = r.id;
      }
      CMS.published = clone(content);
      ls.del("cms-draft");
      CMS.hasDraft = false;
      dot();
      toast("Published. Everyone sees it now.");
      if (tab === "history" || tab === "more") render();
    } catch (x) {
      toast(x.status === 401 ? "You were signed out. Sign in again at #login." : "Couldn't publish: " + x.message);
    } finally { btn.disabled = false; }
  }
  function doUndo(dir) {
    const from = dir < 0 ? undo.past : undo.future, to = dir < 0 ? undo.future : undo.past;
    if (!from.length) return toast(dir < 0 ? "Nothing to undo" : "Nothing to redo");
    to.push(JSON.stringify(content));
    const c = JSON.parse(from.pop());
    ss.set("cms-undo", undo);
    reloadWith(c);
  }
  dock.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const a = b.dataset.a;
    if (a === "edit") return setEditing(!editing);
    if (a === "undo") return doUndo(-1);
    if (a === "redo") return doUndo(1);
    if (a === "publish") return publish();
    if (a === "tab") return !panel.hidden && tab === b.dataset.t ? closePanel() : openPanel(b.dataset.t);
  });
  tabs.addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) openPanel(b.dataset.tab); });
  $('[data-a="close"]', panel).onclick = () => { closePanel(); setEditing(false); };
  addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || inline;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing) { e.preventDefault(); doUndo(e.shiftKey ? 1 : -1); }
    if (e.key === "Escape" && !typing && sel) select(null);
  });
  addEventListener("hashchange", () => { select(null); });
  addEventListener("beforeunload", stopInline);

  window.CMS_EDITOR = { open: () => openPanel("edit") };
  const re = ss.get("cms-reopen");
  sessionStorage.removeItem && (() => { try { sessionStorage.removeItem("cms-reopen"); } catch {} })();
  if (re) { if (re.editing) setEditing(true); if (re.tab && re.tab !== "edit") openPanel(re.tab); }
  else { dock.classList.add("low"); toast("Signed in. Press ✎ Edit to start."); }
})();
