import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, "..");
const configPath = path.resolve(__dirname, "config.js");
const pinsPath = path.resolve(__dirname, "theme", "mapPins.json");

const SECTIONS = {
  lore: {
    dir: path.resolve(docsDir, "lore"),
    indexFile: path.resolve(docsDir, "lore", "index.md"),
    sidebarMarker: "// EDITOR:LORE-LOCATIONS-END",
  },
  rules: {
    dir: path.resolve(docsDir, "rules"),
    indexFile: path.resolve(docsDir, "rules", "index.md"),
    sidebarMarker: "// EDITOR:RULES-END",
  },
};

function sectionConfig(section) {
  const cfg = SECTIONS[section];
  if (!cfg) throw httpError(400, `Unknown section: ${section}`);
  return cfg;
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromContent(content, fallback) {
  const heading = content.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : fallback;
}

function listPages(section) {
  const { dir } = sectionConfig(section);
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && file !== "index.md")
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      return { slug, title: titleFromContent(content, slug) };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function pageFile(section, slug) {
  const { dir } = sectionConfig(section);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw httpError(400, "Invalid slug");
  return path.join(dir, `${slug}.md`);
}

function readPage(section, slug) {
  const file = pageFile(section, slug);
  if (!fs.existsSync(file)) throw httpError(404, "Page not found");
  return fs.readFileSync(file, "utf-8");
}

function insertIndexLink(section, slug, title) {
  const { indexFile } = sectionConfig(section);
  const content = fs.readFileSync(indexFile, "utf-8");
  const link = `- [${title}](./${slug}.md)\n`;
  const marker = content.indexOf("<!--");
  const updated =
    marker === -1 ? content.trimEnd() + "\n" + link : content.slice(0, marker) + link + content.slice(marker);
  fs.writeFileSync(indexFile, updated);
}

function removeIndexLink(section, slug) {
  const { indexFile } = sectionConfig(section);
  const content = fs.readFileSync(indexFile, "utf-8");
  const updated = content
    .split("\n")
    .filter((line) => !line.includes(`(./${slug}.md)`))
    .join("\n");
  fs.writeFileSync(indexFile, updated);
}

function insertSidebarEntry(section, slug, title) {
  const { sidebarMarker } = sectionConfig(section);
  const content = fs.readFileSync(configPath, "utf-8");
  if (!content.includes(sidebarMarker)) {
    throw httpError(
      500,
      `Couldn't find the sidebar marker for "${section}" in config.js — add the nav entry there by hand.`
    );
  }
  const entry = `{ text: ${JSON.stringify(title)}, link: ${JSON.stringify(`/${section}/${slug}`)} },\n            `;
  fs.writeFileSync(configPath, content.replace(sidebarMarker, entry + sidebarMarker));
}

function removeSidebarEntry(section, slug) {
  const content = fs.readFileSync(configPath, "utf-8");
  const linkStr = `"/${section}/${slug}"`;
  const updated = content
    .split("\n")
    .filter((line) => !line.includes(linkStr))
    .join("\n");
  fs.writeFileSync(configPath, updated);
}

function pinsReferencing(slug) {
  if (!fs.existsSync(pinsPath)) return false;
  const pins = JSON.parse(fs.readFileSync(pinsPath, "utf-8"));
  return pins.some((pin) => pin.link === `/lore/${slug}`);
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

function handleError(res, err) {
  const status = err.status || 500;
  sendJson(res, status, { error: err.message || String(err) });
}

// Dev-only middleware backing the lore/rules content editor (/editor).
// Registered only while running `vitepress dev` (see config.js), so it's
// never present in the production build or on the deployed site.
export function contentEditorApi() {
  let base = "/";

  return {
    name: "content-editor-api",
    configResolved(config) {
      base = config.base || "/";
    },
    configureServer(server) {
      const routeFor = (p) => (base.endsWith("/") ? base.slice(0, -1) : base) + p;

      server.middlewares.use(routeFor("/api/content/pages"), (req, res) => {
        try {
          const url = new URL(req.url, "http://localhost");
          const section = url.searchParams.get("section");
          sendJson(res, 200, listPages(section));
        } catch (err) {
          handleError(res, err);
        }
      });

      server.middlewares.use(routeFor("/api/content/page"), async (req, res) => {
        try {
          if (req.method === "GET") {
            const url = new URL(req.url, "http://localhost");
            const section = url.searchParams.get("section");
            const slug = url.searchParams.get("slug");
            sendJson(res, 200, { markdown: readPage(section, slug) });
            return;
          }

          if (req.method === "POST") {
            const body = JSON.parse(await readBody(req));
            const { section, isNew } = body;
            sectionConfig(section);

            if (isNew) {
              const title = (body.title || "").trim();
              if (!title) throw httpError(400, "Title is required");
              const slug = slugify(title);
              if (!slug) throw httpError(400, "Couldn't derive a slug from that title");
              const file = pageFile(section, slug);
              if (fs.existsSync(file)) throw httpError(409, `A page already exists at /${section}/${slug}`);
              fs.writeFileSync(file, body.markdown ?? `# ${title}\n`);
              insertIndexLink(section, slug, title);
              insertSidebarEntry(section, slug, title);
              sendJson(res, 200, { slug, title });
              return;
            }

            const { slug } = body;
            const file = pageFile(section, slug);
            if (!fs.existsSync(file)) throw httpError(404, "Page not found");
            fs.writeFileSync(file, body.markdown ?? "");
            sendJson(res, 200, { ok: true });
            return;
          }

          if (req.method === "DELETE") {
            const url = new URL(req.url, "http://localhost");
            const section = url.searchParams.get("section");
            const slug = url.searchParams.get("slug");
            sectionConfig(section);
            if (section === "lore" && pinsReferencing(slug)) {
              throw httpError(409, "This page still has a map pin pointing to it — remove the pin first.");
            }
            const file = pageFile(section, slug);
            if (fs.existsSync(file)) fs.unlinkSync(file);
            removeIndexLink(section, slug);
            removeSidebarEntry(section, slug);
            sendJson(res, 200, { ok: true });
            return;
          }

          res.statusCode = 405;
          res.end();
        } catch (err) {
          handleError(res, err);
        }
      });
    },
  };
}
