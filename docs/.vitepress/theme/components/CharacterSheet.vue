<template>
  <div v-if="character" class="character-page">
    <a :href="withBase('/roster/')" class="back-link">← Back to roster</a>

    <div class="character-hero">
      <img :src="withBase(character.portrait)" :alt="character.name" class="hero-bg" />
      <div class="hero-gradient" />

      <div class="hero-content">
        <h1 class="hero-name">{{ character.name }}</h1>
        <p class="hero-subtitle">Level {{ character.level }} · {{ character.class }}</p>

        <div class="hero-stats">
          <div class="hero-stat hero-stat-ac" title="Armor Class">
            <span class="hero-stat-label">AC</span>
            <span class="hero-stat-value">{{ character.ac }}</span>
          </div>
          <div v-for="key in abilityKeys" :key="key" class="hero-stat" :title="abilityNames[key]">
            <span class="hero-stat-label">{{ key.toUpperCase() }}</span>
            <span class="hero-stat-value">{{ character.stats[key] }}</span>
          </div>
        </div>

        <h2 class="hero-desc-heading">Description</h2>
        <p class="hero-description">{{ character.description }}</p>
      </div>
    </div>
  </div>

  <div v-else class="character-not-found">
    <p>Character not found.</p>
    <a :href="withBase('/roster/')">← Back to roster</a>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { characters } from "../characters.js";

const { params } = useData();
const character = computed(() => characters.find((c) => c.id === params.value?.id));

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
.back-link {
  display: inline-block;
  margin: 1.25rem 0 0 1.5rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.back-link:hover {
  color: var(--vp-c-brand-1);
}

.character-hero {
  position: relative;
  min-height: calc(100vh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px) - 3rem);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
  margin-top: 1rem;
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to right,
    transparent 15%,
    rgba(10, 10, 14, 0.45) 35%,
    rgba(8, 8, 10, 0.85) 58%,
    rgba(5, 5, 6, 0.95) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 2;
  width: min(720px, 100%);
  padding: 3rem 3.5rem 3.5rem;
  color: #fff;
}

.hero-name {
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 3.4rem);
  font-weight: 700;
  line-height: 1.05;
}

.hero-subtitle {
  margin: 0.4rem 0 0;
  font-size: 1.1rem;
  opacity: 0.85;
}

.hero-stats {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin: 1.5rem 0 1.75rem;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
  padding: 0.5rem 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
}

.hero-stat-label {
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  opacity: 0.75;
}

.hero-stat-value {
  font-size: 1.3rem;
  font-weight: 700;
}

.hero-stat-ac {
  background: rgba(197, 161, 90, 0.3);
  border-color: rgba(197, 161, 90, 0.55);
}

.hero-desc-heading {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

.hero-description {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.95;
}

.character-not-found {
  padding: 4rem 1.5rem;
  text-align: center;
}

@media (max-width: 768px) {
  .character-hero {
    position: static;
    display: block;
    min-height: 0;
    margin-top: 0;
  }

  .hero-bg {
    position: static;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 3;
  }

  .hero-gradient {
    display: none;
  }

  .hero-content {
    position: static;
    width: 100%;
    padding: 1.5rem 1.25rem 2rem;
    color: var(--vp-c-text-1);
  }

  .hero-subtitle {
    opacity: 0.75;
  }

  .hero-stats {
    flex-wrap: wrap;
  }

  .hero-stat {
    flex: 0 1 auto;
    min-width: 56px;
    border-color: var(--vp-c-border);
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
  }

  .hero-stat-ac {
    background: rgba(197, 161, 90, 0.18);
  }

  .hero-desc-heading,
  .hero-description {
    opacity: 1;
    color: var(--vp-c-text-2);
  }
}
</style>
