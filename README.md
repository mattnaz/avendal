# Avendal

A companion site for the Avendal D&D campaign — session recaps, player-facing lore, and custom house rules, built with [VitePress](https://vitepress.dev).

## Run it locally

```
npm install
npm run dev
```

Then open the local URL it prints (usually http://localhost:5173).

## Build

```
npm run build
npm run preview
```

## Structure

- `docs/index.md` — homepage
- `docs/recaps/` — one file per session, linked from `docs/recaps/index.md`
- `docs/lore/` — world info, factions, NPCs
- `docs/rules/` — house rules and rulings
- `docs/map.md` — interactive map (pan/zoom, pins linking to lore pages)
- `docs/roster/` — party roster grid (`index.md`) plus a per-character hero page generated for each entry in `characters.js` via dynamic routes (`[id].md` / `[id].paths.js`)
- `docs/.vitepress/config.js` — site nav, sidebar, and title

## Publishing

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. Enable Pages once under the repo's **Settings → Pages → Source: GitHub Actions**.

## Adding content

- **New recap:** add `docs/recaps/session-NN.md`, then link it from `docs/recaps/index.md`.
- **New lore page:** add a `.md` file under `docs/lore/`, then link it from `docs/lore/index.md`.
- **New rule:** add to `docs/rules/house-rules.md`, or create a new page under `docs/rules/` and link it from `docs/rules/index.md`.
- **Map pins:** while running `npm run dev`, open `/map` and click **Edit pins**, then **+ Add pin** and click a spot on the map. Pick a lore page from the dropdown and save — it writes straight to `docs/.vitepress/theme/mapPins.json`. Click an existing pin in edit mode to move its link/label or delete it. This editor only exists in dev mode; it's not part of the deployed site.
- **Real map image:** replace `docs/public/map/avendal-map.svg` with your own image, update `mapSrc` in `docs/.vitepress/theme/components/MapView.vue` if the filename changes, then re-place pins to match.
- **Roster:** edit `docs/.vitepress/theme/characters.js` — add/remove entries or change name, class, level, ac, ability stats, description, or portrait. Drop portrait images under `docs/public/roster/` and reference them as `/roster/your-file.png`. Adding an entry automatically gets it a page at `/roster/<id>` — no extra file needed. Cards on the roster grid link there; visiting the grid still works normally.
