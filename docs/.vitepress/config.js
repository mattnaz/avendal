import { defineConfig } from "vitepress";
import { pinEditorApi } from "./pinEditorApi.js";

export default defineConfig(({ command }) => ({
  title: "Avendal",
  description: "Session recaps, lore, and house rules for the Avendal campaign",
  base: "/avendal/",

  vite: {
    // Only serves the pin editor's read/write endpoints during `vitepress dev`;
    // absent from the production build, so it never ships to the deployed site.
    plugins: command === "serve" ? [pinEditorApi()] : [],
    server: {
      watch: {
        // The pin editor writes here directly; without this, Vite's watcher
        // hot-reloads MapView.vue on every save (it statically imports this
        // file) and wipes the component's local edit-mode state.
        ignored: ["**/docs/.vitepress/theme/mapPins.json"],
      },
    },
  },

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Map", link: "/map" },
      { text: "Recaps", link: "/recaps/" },
      { text: "Lore", link: "/lore/" },
      { text: "Rules", link: "/rules/" },
    ],

    sidebar: {
      "/recaps/": [
        {
          text: "Session Recaps",
          items: [{ text: "Overview", link: "/recaps/" }],
        },
      ],
      "/lore/": [
        {
          text: "Lore",
          items: [
            { text: "Overview", link: "/lore/" },
            { text: "The World of Avendal", link: "/lore/world" },
            { text: "Notable NPCs", link: "/lore/npcs" },
          ],
        },
        {
          text: "Locations",
          items: [
            { text: "Avendal City", link: "/lore/avendal-city" },
            { text: "Whispering Woods", link: "/lore/whispering-woods" },
            { text: "Stonepeak Mountains", link: "/lore/stonepeak-mountains" },
            { text: "Blackmire Swamp", link: "/lore/blackmire-swamp" },
          ],
        },
      ],
      "/rules/": [
        {
          text: "Custom Rules",
          items: [{ text: "Overview", link: "/rules/" }],
        },
      ],
    },

    search: {
      provider: "local",
    },
  },
}));
