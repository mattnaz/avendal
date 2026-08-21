<template>
  <a :href="withBase(`/roster/${character.id}`)" class="fh-card">
    <div class="fh-portrait-wrap">
      <img :src="withBase(character.portrait)" :alt="character.name" class="fh-portrait" />
      <span class="fh-ribbon">Fallen</span>
      <div class="fh-overlay">
        <span class="fh-name">{{ character.name }}</span>
        <span class="fh-subtitle">Level {{ character.level }} · {{ character.class }}</span>
      </div>
    </div>
    <p v-if="character.epitaph" class="fh-epitaph">{{ character.epitaph }}</p>
  </a>
</template>

<script setup>
import { withBase } from "vitepress";

defineProps({
  character: { type: Object, required: true },
});
</script>

<style scoped>
.fh-card {
  display: block;
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fh-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.fh-portrait-wrap {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--vp-c-bg-elv);
}

.fh-portrait {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(85%) brightness(0.8);
}

.fh-ribbon {
  position: absolute;
  top: 0.75rem;
  left: -0.5rem;
  padding: 0.2rem 0.9rem;
  background: #6b6f76;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.fh-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.45) 65%, transparent 100%);
  color: #fff;
}

.fh-name {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.2;
}

.fh-subtitle {
  display: block;
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 0.15rem;
}

.fh-epitaph {
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-style: italic;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
</style>
