// Public runtime for owner edits: loads the published edits and applies them for every visitor.
// The editor itself is only loaded for the signed-in owner.
(function () {
  const PREVIEW = !!window.CMS_PREVIEW;
  const OWNER = "yeasinarafat272003@gmail.com";
  const DYNAMIC = ["#projectBody", "#masonry", "#pk", "#devList", "#homeCards"];
  const FONTS_URL = "https://fonts.googleapis.com/css2?display=swap&family=";
  // Edits made on another page (a service page, a demo) carry that page's path in op.p and apply only there.
  const PAGE = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "").replace(/\/+$/, "") || "/";
  const here = (op) => (op.p || "/") === PAGE;
  const EMPTY = () => ({ v: 1, ops: [], pages: [], hidden: [], theme: {} });
  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  const style = document.createElement("style");
  style.textContent = `
[data-anim]{opacity:0;transition:opacity var(--cms-dur,.7s) ease var(--cms-delay,0s),transform var(--cms-dur,.7s) cubic-bezier(.2,.7,.2,1) var(--cms-delay,0s)}
[data-anim="fade-up"]{transform:translateY(32px)}[data-anim="fade-down"]{transform:translateY(-32px)}
[data-anim="slide-left"]{transform:translateX(-48px)}[data-anim="slide-right"]{transform:translateX(48px)}
[data-anim="zoom"]{transform:scale(.9)}[data-anim="flip"]{transform:perspective(800px) rotateX(35deg)}
[data-anim].cms-in{opacity:1;transform:none}
[data-anim="pulse"].cms-in{animation:cmsPulse 2.4s ease-in-out infinite}
[data-anim="float"].cms-in{animation:cmsFloat 3.2s ease-in-out infinite}
[data-anim="bounce"].cms-in{animation:cmsBounce 1s cubic-bezier(.3,1.6,.5,1) both}
@keyframes cmsPulse{50%{transform:scale(1.04)}}@keyframes cmsFloat{50%{transform:translateY(-10px)}}
@keyframes cmsBounce{0%{transform:scale(.6)}100%{transform:none}}
[data-hover]{transition:transform var(--cms-tr,.25s) ease,box-shadow var(--cms-tr,.25s) ease,filter var(--cms-tr,.25s) ease,background-color var(--cms-tr,.25s) ease,color var(--cms-tr,.25s) ease}
[data-hover="lift"]:hover{transform:translateY(-6px)}[data-hover="grow"]:hover{transform:scale(1.05)}
[data-hover="shrink"]:hover{transform:scale(.96)}[data-hover="tilt"]:hover{transform:rotate(-2deg)}
[data-hover="glow"]:hover{box-shadow:0 0 0 4px var(--cobalt-soft),0 12px 40px color-mix(in srgb,var(--cobalt) 35%,transparent)}
[data-hover="bright"]:hover{filter:brightness(1.18)}[data-hover="shine"]:hover{filter:saturate(1.4) brightness(1.08)}
@media (prefers-reduced-motion:reduce){[data-anim]{opacity:1!important;transform:none!important;animation:none!important;transition:none!important}}
.cms-page h1{font-size:var(--s1);letter-spacing:-.035em}.cms-page p{color:var(--mute);max-width:70ch;margin-top:18px;font-size:1.1rem}
.cms-media{max-width:100%;border-radius:var(--r);display:block}.cms-embed{width:100%;aspect-ratio:16/9;border:0;border-radius:var(--r)}
.cms-login{position:fixed;inset:0;z-index:9999;background:rgba(5,7,12,.82);backdrop-filter:blur(8px);display:grid;place-items:center;padding:16px}
.cms-login form{width:min(420px,100%);background:var(--panel,#0C1526);border:1px solid var(--line,#1D2A43);border-radius:10px;padding:30px;display:grid;gap:14px;color:var(--paper,#E9EEF8);font-family:var(--f-body,system-ui,sans-serif)}
.cms-login h2{font-size:1.6rem}.cms-login p{color:var(--mute,#9BA9C2);font-size:.92rem}
.cms-login label{display:grid;gap:6px;font-size:.85rem;color:var(--mute,#9BA9C2)}
.cms-login input{font:inherit;font-size:1rem;color:var(--paper,#E9EEF8);background:var(--ink,#060C18);border:1px solid var(--line,#1D2A43);border-radius:6px;padding:12px 14px}
.cms-login .err{color:#D92D20;min-height:1.2em}.cms-login .row{display:flex;gap:10px;flex-wrap:wrap}`;
  document.head.appendChild(style);

  // Inserted HTML comes only from the owner, but strip anything that runs code anyway.
  function clean(html) {
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
    doc.querySelectorAll("script,object,embed,link,meta,style").forEach((n) => n.remove());
    doc.querySelectorAll("iframe").forEach((f) => {
      if (!/^https:\/\/(www\.youtube(-nocookie)?\.com|player\.vimeo\.com)\//.test(f.getAttribute("src") || "")) f.remove();
    });
    doc.body.querySelectorAll("*").forEach((n) => {
      [...n.attributes].forEach((a) => {
        if (/^on/i.test(a.name) || (/^(href|src|action|formaction|xlink:href)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) n.removeAttribute(a.name);
      });
    });
    return doc.body.innerHTML;
  }
  const safeAttr = (k, v) => !/^on/i.test(k) && !(/^(href|src)$/i.test(k) && /^\s*javascript:/i.test(v));

  function find(sel) {
    try { return document.querySelector(sel); } catch { return null; }
  }

  function apply(op) {
    if (!here(op)) return false;
    const el = find(op.sel);
    if (!el) return false;
    switch (op.t) {
      case "html": el.innerHTML = clean(op.v); break;
      case "style":
        for (const [k, v] of Object.entries(op.v)) v === "" || v == null ? el.style.removeProperty(k) : el.style.setProperty(k, v);
        break;
      case "attr":
        for (const [k, v] of Object.entries(op.v)) {
          if (v == null || v === "") el.removeAttribute(k);
          else if (safeAttr(k, v)) el.setAttribute(k, v);
        }
        if (el.matches("[data-anim]")) watch(el);
        if (el.tagName === "VIDEO" && op.v.src) el.load();
        break;
      case "del": el.remove(); break;
      case "dup": {
        const c = el.cloneNode(true);
        c.removeAttribute("id");
        c.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        c.querySelectorAll("[data-cms-id]").forEach((n) => n.removeAttribute("data-cms-id"));
        c.dataset.cmsId = op.id;
        el.after(c);
        c.querySelectorAll("[data-anim]").forEach(watch);
        // The site's own scroll-reveal never sees copies, so show them straight away.
        [c, ...c.querySelectorAll(".rv")].forEach((n) => n.classList.contains("rv") && n.classList.add("in"));
        break;
      }
      case "ins": {
        const w = document.createElement("div");
        w.innerHTML = clean(op.html);
        const n = w.firstElementChild;
        if (!n) return false;
        n.dataset.cmsId = op.id;
        [n, ...n.querySelectorAll(".rv")].forEach((x) => x.classList.contains("rv") && x.classList.add("in"));
        op.where === "append" ? el.append(n) : op.where === "before" ? el.before(n) : el.after(n);
        break;
      }
      case "move":
        if (op.dir < 0 && el.previousElementSibling) el.previousElementSibling.before(el);
        if (op.dir > 0 && el.nextElementSibling) el.nextElementSibling.after(el);
        break;
    }
    return true;
  }

  // Scroll-in animations
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("cms-in"); io.unobserve(e.target); } }), { threshold: 0.12 })
    : null;
  function watch(el) {
    el.classList.remove("cms-in");
    io ? io.observe(el) : el.classList.add("cms-in");
  }

  const VIEW_LIST = () => (typeof VIEWS !== "undefined" ? VIEWS : []);

  function renderPages(c) {
    document.querySelectorAll("[data-cms-page]").forEach((n) => n.remove());
    const nav = find("nav.main"), foot = find("footer nav"), main = find("#app");
    const hire = nav && nav.querySelector("a.hire");
    (c.pages || []).forEach((p) => {
      if (!/^[a-z0-9-]+$/.test(p.slug)) return;
      if (!VIEW_LIST().includes(p.slug)) VIEW_LIST().push(p.slug);
      const s = document.createElement("section");
      s.className = "view";
      s.id = "v-" + p.slug;
      s.dataset.cmsPage = p.slug;
      s.innerHTML = clean(p.html || "");
      main && main.appendChild(s);
      if (p.nav !== false) {
        const a = document.createElement("a");
        a.href = "#" + p.slug; a.dataset.r = p.slug; a.dataset.cmsPage = p.slug; a.textContent = p.title;
        nav && (hire ? hire.before(a) : nav.appendChild(a));
        if (foot) { const b = a.cloneNode(true); b.removeAttribute("data-r"); foot.appendChild(b); }
      }
    });
    (c.hidden || []).forEach((v) => {
      document.querySelectorAll(`nav.main a[href="#${v}"], footer nav a[href="#${v}"]`).forEach((a) => a.remove());
    });
  }

  function loadFonts(list) {
    [...new Set(list.filter(Boolean))].forEach((f) => {
      const fam = f.split(",")[0].replace(/["']/g, "").trim();
      if (!fam || /^(system-ui|serif|sans-serif|monospace)$/i.test(fam)) return;
      const id = "cms-font-" + fam.replace(/\W+/g, "-");
      if (document.getElementById(id)) return;
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = FONTS_URL + encodeURIComponent(fam).replace(/%20/g, "+") + ":wght@400;500;600;700;800";
      document.head.appendChild(l);
    });
  }

  function applyTheme(c) {
    const t = c.theme || {};
    const root = document.documentElement;
    Object.entries(t.vars || {}).forEach(([k, v]) => (v ? root.style.setProperty(k, v) : root.style.removeProperty(k)));
    let s = document.getElementById("cms-theme-css");
    if (!s) { s = document.createElement("style"); s.id = "cms-theme-css"; document.head.appendChild(s); }
    const b = t.btn || {};
    let css = "";
    if (b.radius != null && b.radius !== "") css += `.btn{border-radius:${b.radius}px}`;
    if (b.upper) css += `.btn{text-transform:uppercase;letter-spacing:.06em}`;
    if (b.size) css += `.btn{font-size:${b.size}px}`;
    if (b.hover === "lift") css += `.btn:hover{transform:translateY(-3px)}`;
    if (b.hover === "grow") css += `.btn:hover{transform:scale(1.05)}`;
    if (b.hover === "glow") css += `.btn:hover{box-shadow:0 0 0 4px var(--cobalt-soft),0 10px 30px color-mix(in srgb,var(--cobalt) 35%,transparent)}`;
    if (b.hover === "none") css += `.btn:hover{transform:none}`;
    if (b.solidBg) css += `.btn.solid{background:${b.solidBg};border-color:${b.solidBg}}`;
    if (b.solidFg) css += `.btn.solid{color:${b.solidFg}}`;
    s.textContent = css + (t.css || "").replace(/<\/?style/gi, "");
    const fonts = [t.vars && t.vars["--f-display"], t.vars && t.vars["--f-body"]];
    (c.ops || []).forEach((o) => o.t === "style" && o.v["font-family"] && fonts.push(o.v["font-family"]));
    loadFonts(fonts);
  }

  function applyAll(c) {
    applyTheme(c);
    renderPages(c);
    (c.ops || []).forEach(apply);
    document.querySelectorAll("[data-anim]").forEach(watch);
  }

  // Containers the site re-renders (project pages, filters, packages): re-apply their edits each time.
  let busy = false;
  function reapply(root) {
    if (busy) return;
    busy = true;
    (CMS.content.ops || []).filter((o) => o.sel.startsWith(root)).forEach(apply);
    document.querySelectorAll(root + " [data-anim]").forEach(watch);
    busy = false;
  }
  function observeDynamic() {
    DYNAMIC.forEach((root) => {
      const el = find(root);
      if (el) new MutationObserver(() => reapply(root)).observe(el, { childList: true });
    });
  }

  const api = async (path, opts = {}) => {
    const r = await fetch("/api/" + path, { credentials: "same-origin", ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || "Request failed"), { status: r.status });
    return j;
  };

  // Hidden login at #login. Nothing on the page links to it.
  function showLogin() {
    if (document.querySelector(".cms-login")) return;
    const wrap = document.createElement("div");
    wrap.className = "cms-login";
    wrap.innerHTML = `<form><h2>Owner sign in</h2><p>${PREVIEW ? "Preview: use your email and any password. Edits stay in this browser." : "Only the site owner can sign in."}</p>
      <label>Email<input name="email" type="email" autocomplete="username" required></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
      <p class="err" role="alert"></p><div class="row"><button class="btn solid" type="submit">Sign in</button><button class="btn" type="button" data-x>Cancel</button></div></form>`;
    document.body.appendChild(wrap);
    const f = wrap.querySelector("form");
    f.email.focus();
    const close = () => { wrap.remove(); if (location.hash === "#login") PAGE === "/" ? (location.hash = "home") : history.replaceState(null, "", location.pathname); };
    wrap.querySelector("[data-x]").onclick = close;
    f.onsubmit = async (e) => {
      e.preventDefault();
      const err = f.querySelector(".err");
      err.textContent = "";
      try {
        if (PREVIEW) {
          if (f.email.value.trim().toLowerCase() !== OWNER) throw new Error("Wrong email or password.");
          ls.set("cms-preview-owner", true);
        } else {
          await api("login", { method: "POST", body: JSON.stringify({ email: f.email.value, password: f.password.value }) });
        }
        close();
        startEditor();
      } catch (x) {
        err.textContent = x.message;
      }
    };
  }

  async function startEditor() {
    if (window.CMS_EDITOR) return window.CMS_EDITOR.open();
    if (PREVIEW) return window.CMS_EDITOR_BOOT && window.CMS_EDITOR_BOOT();
    const s = document.createElement("script");
    s.src = "/api/editor?t=" + Date.now();
    document.body.appendChild(s);
  }

  const CMS = (window.CMS = {
    preview: PREVIEW, owner: OWNER, page: PAGE, here, content: EMPTY(), publishedId: null,
    apply, applyAll, applyTheme, renderPages, clean, find, watch, api, ls, loadFonts, DYNAMIC,
    async logout() {
      if (PREVIEW) ls.del("cms-preview-owner"); else await api("logout", { method: "POST" }).catch(() => {});
      PAGE === "/" ? (location.hash = "home") : history.replaceState(null, "", location.pathname); location.reload();
    },
  });

  async function boot() {
    let published = EMPTY(), owner = false;
    if (PREVIEW) {
      published = ls.get("cms-preview-published") || EMPTY();
      owner = !!ls.get("cms-preview-owner");
    } else if (location.protocol.startsWith("http")) {
      const [c, me] = await Promise.allSettled([api("content"), api("me")]);
      if (c.status === "fulfilled") { published = c.value.content || EMPTY(); CMS.publishedId = c.value.id; }
      owner = me.status === "fulfilled" && !!me.value.email;
    }
    CMS.published = published;
    const draft = owner ? ls.get("cms-draft") : null;
    CMS.content = draft && draft.content ? draft.content : JSON.parse(JSON.stringify(published));
    CMS.hasDraft = !!(draft && draft.content);
    applyAll(CMS.content);
    if (typeof route === "function") route();
    observeDynamic();
    document.documentElement.classList.remove("cms-wait");
    if (owner) startEditor();
    if (location.hash === "#login") owner ? (PAGE === "/" ? (location.hash = "home") : history.replaceState(null, "", location.pathname)) : showLogin();
  }

  addEventListener("hashchange", () => { if (location.hash === "#login") showLogin(); });
  boot();
})();
