<template>
  <div class="roster-grid">
    <CharacterCard v-for="character in activeCharacters" :key="character.id" :character="character" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import CharacterCard from "./CharacterCard.vue";
import { characters } from "../characters.js";

const activeCharacters = computed(() => characters.filter((c) => c.status !== "fallen"));
</script>

<style scoped>
.roster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}
</style>
