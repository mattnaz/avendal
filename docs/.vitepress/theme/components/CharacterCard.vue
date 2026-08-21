<template>
  <a :href="withBase(`/roster/${character.id}`)" class="pc-card" :style="{ '--accent': accentColor }">
    <div class="pc-portrait-wrap">
      <img :src="withBase(character.portrait)" :alt="character.name" class="pc-portrait" />
      <div class="pc-overlay">
        <span class="pc-name">{{ character.name }}</span>
        <span class="pc-class-pill">Level {{ character.level }} · {{ character.class }}</span>
      </div>
    </div>
  </a>
</template>

<script setup>
import { computed } from "vue";
import { withBase } from "vitepress";

const props = defineProps({
  character: { type: Object, required: true },
});

const classColors = {
  Barbarian: "#b23a2f",
  Bard: "#a9598f",
  Cleric: "#c9a15a",
  Druid: "#4f7942",
  Fighter: "#8a6f56",
  Monk: "#e08e45",
  Paladin: "#c9a15a",
  Ranger: "#3f5a44",
  Rogue: "#3f5a44",
  Sorcerer: "#a63d40",
  Warlock: "#5b3a72",
  Wizard: "#4b5a8a",
};

const accentColor = computed(() => classColors[props.character.class] || "#8a6f3d");
</script>

<style scoped>
.pc-card {
  display: block;
  position: relative;
  border: 1px solid var(--vp-c-border);
  border-top: 4px solid var(--accent);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
}

.pc-portrait-wrap {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--vp-c-bg-elv);
}

.pc-portrait {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.pc-card:hover .pc-portrait {
  transform: scale(1.05);
}

.pc-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.85rem 0.85rem 0.9rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.4) 65%, transparent 100%);
  color: #fff;
}

.pc-name {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.pc-class-pill {
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
