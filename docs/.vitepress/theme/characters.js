// Party roster. Add/edit entries here — portrait is any image under docs/public,
// stats are the six ability scores, ac is Armor Class.
export const characters = [
  {
    id: "elara-swift",
    name: "Elara Swift",
    class: "Rogue",
    level: 3,
    ac: 15,
    portrait: "/roster/placeholder-rogue.svg",
    stats: { str: 10, dex: 18, con: 12, int: 14, wis: 11, cha: 13 },
    description:
      "A quick-witted halfling rogue with a knack for finding trouble — and getting out of it. Prefers the shadows to the front line.",
  },
  {
    id: "bram-ironhold",
    name: "Bram Ironhold",
    class: "Fighter",
    level: 3,
    ac: 18,
    portrait: "/roster/placeholder-fighter.svg",
    stats: { str: 17, dex: 12, con: 16, int: 9, wis: 11, cha: 10 },
    description:
      "A dwarven veteran of the Stonepeak mining guard, more comfortable holding a line than a conversation.",
  },
  {
    id: "vesper-nightshade",
    name: "Vesper Nightshade",
    class: "Wizard",
    level: 3,
    ac: 12,
    portrait: "/roster/placeholder-wizard.svg",
    stats: { str: 8, dex: 13, con: 11, int: 17, wis: 14, cha: 10 },
    description:
      "A scholar from Avendal City's arcane college, chasing a theory about the Sundering River that no one else takes seriously.",
  },
];
