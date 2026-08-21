<template>
  <div class="pc-card">
    <div class="pc-portrait-wrap">
      <img :src="withBase(character.portrait)" :alt="character.name" class="pc-portrait" />

      <div class="pc-overlay">
        <div class="pc-overlay-header">
          <span class="pc-name">{{ character.name }}</span>
          <span class="pc-subtitle">Level {{ character.level }} {{ character.class }}</span>
        </div>

        <div class="pc-stat-row">
          <div class="pc-stat pc-stat-ac" title="Armor Class">
            <span class="pc-stat-label">AC</span>
            <span class="pc-stat-value">{{ character.ac }}</span>
          </div>
          <div v-for="key in abilityKeys" :key="key" class="pc-stat" :title="abilityNames[key]">
            <span class="pc-stat-label">{{ key.toUpperCase() }}</span>
            <span class="pc-stat-value">{{ character.stats[key] }}</span>
          </div>
        </div>
      </div>
    </div>

    <p class="pc-description">{{ character.description }}</p>
  </div>
</template>

<script setup>
import { withBase } from "vitepress";

defineProps({
  character: { type: Object, required: true },
});

const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"];
const abilityNames = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};
</script>

<style scoped>
.pc-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
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
}

.pc-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.75rem 0.75rem 0.6rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.55) 55%, transparent 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pc-overlay-header {
  display: flex;
  flex-direction: column;
}

.pc-name {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
}

.pc-subtitle {
  font-size: 0.8rem;
  opacity: 0.85;
}

.pc-stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.pc-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2.1rem;
  padding: 0.15rem 0.3rem;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.12);
}

.pc-stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.03em;
  opacity: 0.8;
}

.pc-stat-value {
  font-size: 0.9rem;
  font-weight: 600;
}

.pc-stat-ac {
  background: rgba(197, 161, 90, 0.35);
}

.pc-description {
  margin: 0;
  padding: 0.85rem 1rem 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
</style>
