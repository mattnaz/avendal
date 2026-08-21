<template>
  <div class="roster-grid">
    <CharacterCard v-for="character in characters" :key="character.id" :character="character" />
  </div>
</template>

<script setup>
import CharacterCard from "./CharacterCard.vue";
import { characters } from "../characters.js";
</script>

<style scoped>
.roster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}
</style>
