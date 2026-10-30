import { session, send } from "./_lib.js";
import code from "./_editor-src.js";

// The editor script is only ever sent to the signed-in owner.
export default function handler(req, res) {
  if (!session(req)) return send(res, 401, "// not signed in");
  res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
  res.end(code);
}
