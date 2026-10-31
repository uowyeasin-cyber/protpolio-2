import { store } from "./_lib.js";

// The site icon for browser tabs and search results. The owner sets it in Customise > Theme
// (saved as theme.icon in the published content). Without one, the default file is used.
const DEFAULT = "/img/icon-512.png";

export default async function handler(req, res) {
  let to = DEFAULT;
  try {
    if (!/[?&]default=1/.test(req.url || "")) {
      const items = await store.list("content/");
      const icon = items[0] && ((await store.getJSON(items[0])).theme || {}).icon;
      if (icon && /^(https:\/\/|\/cms-files\/)/.test(icon)) to = icon;
    }
  } catch {}
  res.writeHead(302, { Location: to, "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" });
  res.end();
}
