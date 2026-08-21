<template>
  <div class="map-page">
    <div class="map-toolbar">
      <button type="button" @click="zoomIn" aria-label="Zoom in">+</button>
      <button type="button" @click="zoomOut" aria-label="Zoom out">−</button>
      <button type="button" @click="fitToViewport" aria-label="Reset view">Reset</button>
      <span class="map-hint">Drag to pan, scroll to zoom, click a pin for lore</span>
    </div>
    <div ref="viewport" class="map-viewport">
      <div ref="stage" class="map-stage">
        <img :src="mapSrc" class="map-image" alt="Map of Avendal" draggable="false" />
        <a
          v-for="pin in pins"
          :key="pin.id"
          :href="withBase(pin.link)"
          class="map-pin"
          :style="{ left: pin.x + '%', top: pin.y + '%' }"
          :title="pin.label"
        >
          <span class="map-pin-dot" />
          <span class="map-pin-label">{{ pin.label }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import panzoom from "panzoom";
import { withBase } from "vitepress";
import { pins } from "../mapPins.js";

const STAGE_WIDTH = 1000;
const STAGE_HEIGHT = 700;

const mapSrc = withBase("/map/avendal-map.svg");
const viewport = ref(null);
const stage = ref(null);
let instance = null;

onMounted(async () => {
  instance = panzoom(stage.value, {
    maxZoom: 6,
    minZoom: 0.4,
    smoothScroll: false,
    bounds: true,
    boundsPadding: 0.15,
    zoomDoubleClickSpeed: 1,
    filterKey: () => true,
  });

  await nextTick();
  fitToViewport();
});

onBeforeUnmount(() => {
  instance?.dispose();
});

function fitToViewport() {
  if (!instance || !viewport.value) return;
  const vpRect = viewport.value.getBoundingClientRect();
  const scale = Math.min(vpRect.width / STAGE_WIDTH, vpRect.height / STAGE_HEIGHT) * 0.95;
  const x = (vpRect.width - STAGE_WIDTH * scale) / 2;
  const y = (vpRect.height - STAGE_HEIGHT * scale) / 2;
  instance.zoomAbs(0, 0, scale);
  instance.moveTo(x, y);
}

function zoomIn() {
  const vpRect = viewport.value.getBoundingClientRect();
  instance?.smoothZoom(vpRect.width / 2, vpRect.height / 2, 1.3);
}

function zoomOut() {
  const vpRect = viewport.value.getBoundingClientRect();
  instance?.smoothZoom(vpRect.width / 2, vpRect.height / 2, 1 / 1.3);
}
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.map-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.map-toolbar button {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.map-toolbar button:hover {
  background: var(--vp-c-bg-elv);
}

.map-hint {
  margin-left: 0.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.map-viewport {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 70vh;
  min-height: 420px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  touch-action: none;
  cursor: grab;
}

.map-viewport:active {
  cursor: grabbing;
}

.map-stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 1000px;
  height: 700px;
  transform-origin: 0 0;
}

.map-image {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  pointer-events: none;
}

.map-pin {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.map-pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #c0392b;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.map-pin-label {
  margin-top: 2px;
  padding: 1px 6px;
  font-size: 12px;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 4px;
  color: #2a2a2a;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.15s, transform 0.15s;
  pointer-events: none;
}

.map-pin:hover .map-pin-label,
.map-pin:focus .map-pin-label {
  opacity: 1;
  transform: translateY(0);
}

.map-pin:hover .map-pin-dot {
  background: #e74c3c;
}
</style>
