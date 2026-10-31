// Tells IndexNow search engines (Bing, Yahoo, DuckDuckGo via Bing, Yandex, Naver, Seznam, Yep)
// about every page in sitemap.xml. Run after a deploy:  node tools/indexnow.mjs
// Needs SITE.indexNowKey in data/content.js and the key file live at /<key>.txt
// (tools/build-service-pages.mjs writes it).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { SITE } = new Function(fs.readFileSync(path.join(root, "data/content.js"), "utf8") + ";return {SITE}")();
if (!SITE.url || !SITE.indexNowKey) throw new Error("Set SITE.url and SITE.indexNowKey in data/content.js first.");
const host = new URL(SITE.url).host;
const urls = [...fs.readFileSync(path.join(root, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const r = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: SITE.indexNowKey, keyLocation: `https://${host}/${SITE.indexNowKey}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${r.status} ${r.statusText} for ${urls.length} URLs`);
