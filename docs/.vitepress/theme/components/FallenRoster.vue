<template>
  <div v-if="fallenCharacters.length" class="fallen-grid">
    <FallenHeroCard v-for="character in fallenCharacters" :key="character.id" :character="character" />
  </div>
  <p v-else class="fallen-empty">No one yet — long may that last.</p>
</template>

<script setup>
import { computed } from "vue";
import FallenHeroCard from "./FallenHeroCard.vue";
import { characters } from "../characters.js";

const fallenCharacters = computed(() => characters.filter((c) => c.status === "fallen"));
</script>

<style scoped>
.fallen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.fallen-empty {
  color: var(--vp-c-text-2);
  font-style: italic;
}
</style>
