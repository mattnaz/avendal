import { characters } from "../.vitepress/theme/characters.js";

export default {
  paths: () => characters.map((c) => ({ params: { id: c.id } })),
};
