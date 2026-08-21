import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const loreDir = path.resolve(__dirname, "..", "lore");
const pinsFile = path.resolve(__dirname, "theme", "mapPins.json");

function listLorePages() {
  return fs
    .readdirSync(loreDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const content = fs.readFileSync(path.join(loreDir, file), "utf-8");
      const heading = content.match(/^#\s+(.+)$/m);
      const slug = file.replace(/\.md$/, "");
      const title = heading ? heading[1].trim() : slug;
      const link = slug === "index" ? "/lore/" : `/lore/${slug}`;
      return { title, link };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

// Dev-only middleware backing the map page's pin editor (Edit Pins mode).
// Registered only while running `vitepress dev` (see config.js), so it's
// never present in the production build or on the deployed site.
export function pinEditorApi() {
  let base = "/";

  return {
    name: "pin-editor-api",
    configResolved(config) {
      base = config.base || "/";
    },
    configureServer(server) {
      const routeFor = (p) => (base.endsWith("/") ? base.slice(0, -1) : base) + p;

      server.middlewares.use(routeFor("/api/lore-pages"), (req, res) => {
        try {
          sendJson(res, 200, listLorePages());
        } catch (err) {
          sendJson(res, 500, { error: String(err) });
        }
      });

      server.middlewares.use(routeFor("/api/pins"), async (req, res) => {
        if (req.method === "GET") {
          sendJson(res, 200, JSON.parse(fs.readFileSync(pinsFile, "utf-8")));
          return;
        }

        if (req.method === "POST") {
          try {
            const body = await readBody(req);
            const pins = JSON.parse(body);
            if (!Array.isArray(pins)) throw new Error("expected an array of pins");
            fs.writeFileSync(pinsFile, JSON.stringify(pins, null, 2) + "\n");
            sendJson(res, 200, { ok: true });
          } catch (err) {
            sendJson(res, 400, { ok: false, error: String(err) });
          }
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    },
  };
}
