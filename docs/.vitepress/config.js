import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Avendal",
  description: "Session recaps, lore, and house rules for the Avendal campaign",
  base: "/avendal/",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
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
          items: [{ text: "Overview", link: "/lore/" }],
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
