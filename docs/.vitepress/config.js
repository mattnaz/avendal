import { defineConfig } from "vitepress";
import { pinEditorApi } from "./pinEditorApi.js";
import { contentEditorApi } from "./contentEditorApi.js";

export default defineConfig(({ command }) => ({
  title: "Avendal",
  description: "Session recaps, lore, and house rules for the Avendal campaign",
  base: "/avendal/",

  // The content editor is dev-only (see contentEditorApi.js); dropping its page
  // from production builds means the deployed site never ships its editor
  // bundle at all, rather than just leaving it unreachable.
  srcExclude: command === "build" ? ["editor.md"] : [],

  vite: {
    // Only serves the pin/content editors' read/write endpoints during
    // `vitepress dev`; absent from the production build, so neither ships
    // to the deployed site.
    plugins: command === "serve" ? [pinEditorApi(), contentEditorApi()] : [],
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
      { text: "Roster", link: "/roster/" },
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
            { text: "Frostfel", link: "/lore/frostfel" },
            { text: "Tharn Ulihm", link: "/lore/tharn-ulihm" },
            { text: "Kil Danihm", link: "/lore/kil-danihm" },
            { text: "Dim Olihm", link: "/lore/dim-olihm" },
            { text: "Wildekeep", link: "/lore/wildekeep" },
            { text: "Bheraldur", link: "/lore/bheraldur" },
            { text: "Thel Torum", link: "/lore/thel-torum" },
            { text: "Kinhal", link: "/lore/kinhal" },
            { text: "Benwick", link: "/lore/benwick" },
            { text: "Broadmoor", link: "/lore/broadmoor" },
            { text: "Ariscar", link: "/lore/ariscar" },
            { text: "Ghatton", link: "/lore/ghatton" },
            { text: "Whitemill", link: "/lore/whitemill" },
            { text: "Riverwood", link: "/lore/riverwood" },
            { text: "Grendale", link: "/lore/grendale" },
            { text: "Everfaire", link: "/lore/everfaire" },
            { text: "Springshade", link: "/lore/springshade" },
            { text: "Auldemoor", link: "/lore/auldemoor" },
            { text: "Threader's Hollow", link: "/lore/threaders-hollow" },
            { text: "Blackharbour", link: "/lore/blackharbour" },
            { text: "Lifford", link: "/lore/lifford" },
            // EDITOR:LORE-LOCATIONS-END
          ],
        },
      ],
      "/rules/": [
        {
          text: "Custom Rules",
          items: [
            { text: "Overview", link: "/rules/" },
            { text: "House Rules", link: "/rules/house-rules" },
            // EDITOR:RULES-END
          ],
        },
      ],
    },

    search: {
      provider: "local",
    },
  },
}));
