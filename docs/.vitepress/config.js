import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Avendal",
  description: "Session recaps, lore, and house rules for the Avendal campaign",
  base: "/avendal/",

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
});
