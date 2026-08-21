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
- `docs/.vitepress/config.js` — site nav, sidebar, and title

## Publishing

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. Enable Pages once under the repo's **Settings → Pages → Source: GitHub Actions**.

## Adding content

- **New recap:** add `docs/recaps/session-NN.md`, then link it from `docs/recaps/index.md`.
- **New lore page:** add a `.md` file under `docs/lore/`, then link it from `docs/lore/index.md`.
- **New rule:** add to `docs/rules/house-rules.md`, or create a new page under `docs/rules/` and link it from `docs/rules/index.md`.
