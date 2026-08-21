<template>
  <a :href="withBase(`/roster/${character.id}`)" class="pc-card">
    <div class="pc-portrait-wrap">
      <img :src="withBase(character.portrait)" :alt="character.name" class="pc-portrait" />
      <div class="pc-overlay">
        <span class="pc-name">{{ character.name }}</span>
        <span class="pc-subtitle">Level {{ character.level }} {{ character.class }}</span>
      </div>
    </div>
  </a>
</template>

<script setup>
import { withBase } from "vitepress";

defineProps({
  character: { type: Object, required: true },
});
</script>

<style scoped>
.pc-card {
  display: block;
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.pc-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
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
  padding: 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 65%, transparent 100%);
  color: #fff;
}

.pc-name {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.2;
}

.pc-subtitle {
  display: block;
  font-size: 0.8rem;
  opacity: 0.85;
  margin-top: 0.15rem;
}
</style>
