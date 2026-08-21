<template>
  <div class="map-page">
    <div class="map-toolbar">
      <button type="button" class="map-btn map-btn-icon" @click="zoomIn" aria-label="Zoom in">+</button>
      <button type="button" class="map-btn map-btn-icon" @click="zoomOut" aria-label="Zoom out">−</button>
      <button type="button" class="map-btn" @click="fitToViewport" aria-label="Reset view">Reset</button>

      <template v-if="isDev">
        <span class="map-toolbar-sep" />
        <button
          type="button"
          class="map-btn"
          :class="{ 'is-active': editMode }"
          @click="toggleEditMode"
        >
          {{ editMode ? "Editing pins" : "Edit pins" }}
        </button>
        <button
          v-if="editMode"
          type="button"
          class="map-btn"
          :class="{ 'is-active': placing }"
          @click="startPlacing"
        >
          {{ placing ? "Click the map…" : "+ Add pin" }}
        </button>
        <span v-if="saveStatus" class="map-save-status">{{ saveStatus }}</span>
      </template>

      <span class="map-hint">Drag to pan, scroll to zoom, click a pin for lore</span>
    </div>

    <div
      ref="viewport"
      class="map-viewport"
      :class="{ 'is-placing': placing }"
      @pointerdown="onPointerDown"
      @click="onViewportClick"
    >
      <div ref="stage" class="map-stage">
        <img :src="mapSrc" class="map-image" alt="Map of Avendal" draggable="false" />
        <component
          :is="editMode ? 'button' : 'a'"
          v-for="pin in pinsList"
          :key="pin.id"
          :type="editMode ? 'button' : undefined"
          :href="editMode ? undefined : withBase(pin.link)"
          class="map-pin"
          :class="{ 'is-draggable': editMode }"
          :style="{ left: pin.x + '%', top: pin.y + '%' }"
          :title="editMode ? `${pin.label} (drag to move)` : pin.label"
          @pointerdown="onPinPointerDown($event, pin)"
          @pointermove="onPinPointerMove($event, pin)"
          @pointerup="onPinPointerUp($event, pin)"
          @pointercancel="onPinPointerCancel($event, pin)"
          @click="onPinClick($event, pin)"
        >
          <span class="map-pin-dot" />
          <span class="map-pin-label">{{ pin.label }}</span>
        </component>
      </div>

      <div v-if="formState" class="pin-form-panel">
        <h3>{{ formState.id ? "Edit pin" : "New pin" }}</h3>

        <label class="pin-form-field">
          Label
          <input v-model="formState.label" type="text" placeholder="e.g. Silverwatch Keep" />
        </label>

        <label class="pin-form-field">
          Links to
          <select v-model="formState.link">
            <option value="" disabled>Select a lore page…</option>
            <option v-for="page in lorePages" :key="page.link" :value="page.link">
              {{ page.title }}
            </option>
          </select>
        </label>

        <p v-if="formError" class="pin-form-error">{{ formError }}</p>

        <div class="pin-form-actions">
          <button type="button" class="map-btn" :disabled="!canSave" @click="savePin">Save</button>
          <button v-if="formState.id" type="button" class="map-btn map-btn-danger" @click="deletePin(formState.id)">
            Delete
          </button>
          <button type="button" class="map-btn" @click="cancelForm">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import panzoom from "panzoom";
import { withBase } from "vitepress";
import { pins } from "../mapPins.js";

const STAGE_WIDTH = 1000;
const STAGE_HEIGHT = 700;
const isDev = import.meta.env.DEV;

const mapSrc = withBase("/map/Avendal.jpg");
const viewport = ref(null);
const stage = ref(null);
let instance = null;

const pinsList = ref([...pins]);

const editMode = ref(false);
const placing = ref(false);
const formState = ref(null);
const formError = ref("");
const saveStatus = ref("");
const lorePages = ref([]);
let pointerDownPos = null;
let saveStatusTimer = null;
let dragState = null;
let suppressNextClick = false;

const canSave = computed(() => !!formState.value?.label && !!formState.value?.link);

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

  if (isDev) loadLorePages();
});

onBeforeUnmount(() => {
  instance?.dispose();
  if (saveStatusTimer) clearTimeout(saveStatusTimer);
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

async function loadLorePages() {
  try {
    const res = await fetch(withBase("/api/lore-pages"));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    lorePages.value = await res.json();
  } catch (err) {
    console.error("Failed to load lore pages for pin editor:", err);
  }
}

function toggleEditMode() {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    placing.value = false;
    formState.value = null;
  }
}

function startPlacing() {
  placing.value = !placing.value;
  formState.value = null;
}

function onPointerDown(event) {
  pointerDownPos = { x: event.clientX, y: event.clientY };
}

function onViewportClick(event) {
  if (!placing.value) return;

  if (pointerDownPos) {
    const dx = event.clientX - pointerDownPos.x;
    const dy = event.clientY - pointerDownPos.y;
    if (Math.hypot(dx, dy) > 5) return; // was a pan/drag, not a placement click
  }

  const { x, y } = clientToStagePercent(event.clientX, event.clientY);
  placing.value = false;
  formError.value = "";
  formState.value = { id: null, label: "", link: "", x, y };
}

function onPinClick(event, pin) {
  if (!editMode.value) return; // normal browsing: let the link navigate
  event.preventDefault();
  if (suppressNextClick) {
    suppressNextClick = false;
    return; // this click is the tail end of a drag, not an intent to edit
  }
  placing.value = false;
  formError.value = "";
  formState.value = { ...pin };
}

function onPinPointerDown(event, pin) {
  if (!editMode.value || placing.value) return;
  event.stopPropagation(); // don't start placing a new pin
  event.currentTarget.setPointerCapture(event.pointerId);
  // panzoom listens for its own mousedown/touchstart on the stage regardless of
  // this pointerdown's propagation, so it keeps panning underneath a drag
  // unless it's explicitly paused for the duration of the drag.
  instance?.pause();
  dragState = { id: pin.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
}

function onPinPointerMove(event, pin) {
  if (!dragState || dragState.id !== pin.id || dragState.pointerId !== event.pointerId) return;
  event.stopPropagation();
  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;
  if (!dragState.moved && Math.hypot(dx, dy) < 4) return; // ignore jitter, keep it a click
  dragState.moved = true;
  const { x, y } = clientToStagePercent(event.clientX, event.clientY);
  const idx = pinsList.value.findIndex((p) => p.id === pin.id);
  if (idx !== -1) pinsList.value[idx] = { ...pinsList.value[idx], x, y };
}

async function onPinPointerUp(event, pin) {
  if (!dragState || dragState.id !== pin.id || dragState.pointerId !== event.pointerId) return;
  event.stopPropagation();
  event.currentTarget.releasePointerCapture(event.pointerId);
  const wasMoved = dragState.moved;
  dragState = null;
  instance?.resume();
  if (wasMoved) {
    suppressNextClick = true;
    await persistPins(pinsList.value, "Moved");
  }
}

function onPinPointerCancel(event, pin) {
  if (!dragState || dragState.id !== pin.id || dragState.pointerId !== event.pointerId) return;
  dragState = null;
  instance?.resume();
}

function clientToStagePercent(clientX, clientY) {
  const vpRect = viewport.value.getBoundingClientRect();
  const transform = instance.getTransform();
  const stageX = (clientX - vpRect.left - transform.x) / transform.scale;
  const stageY = (clientY - vpRect.top - transform.y) / transform.scale;
  const clamp = (n) => Math.min(100, Math.max(0, n));
  return {
    x: Math.round(clamp((stageX / STAGE_WIDTH) * 100) * 10) / 10,
    y: Math.round(clamp((stageY / STAGE_HEIGHT) * 100) * 10) / 10,
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cancelForm() {
  formState.value = null;
  formError.value = "";
}

async function savePin() {
  if (!canSave.value) return;
  const isNew = !formState.value.id;
  const id = formState.value.id || slugify(formState.value.label);
  const entry = { id, label: formState.value.label, x: formState.value.x, y: formState.value.y, link: formState.value.link };

  const updated = isNew
    ? [...pinsList.value, entry]
    : pinsList.value.map((p) => (p.id === id ? entry : p));

  await persistPins(updated, "Saved");
}

async function deletePin(id) {
  const updated = pinsList.value.filter((p) => p.id !== id);
  await persistPins(updated, "Deleted");
}

async function persistPins(updated, verb) {
  try {
    const res = await fetch(withBase("/api/pins"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    pinsList.value = updated;
    formState.value = null;
    formError.value = "";
    saveStatus.value = `${verb} to mapPins.json`;
    if (saveStatusTimer) clearTimeout(saveStatusTimer);
    saveStatusTimer = setTimeout(() => (saveStatus.value = ""), 2500);
  } catch (err) {
    formError.value = `Failed to save: ${err.message}`;
  }
}
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  /* fills exactly the viewport below VitePress's nav bar, no page scroll */
  height: calc(100vh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px));
}

.map-toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
}

.map-toolbar-sep {
  width: 1px;
  height: 1.5rem;
  background: var(--vp-c-border);
  margin: 0 0.25rem;
}

.map-btn {
  height: 2rem;
  padding: 0 0.65rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}

.map-btn-icon {
  width: 2rem;
  padding: 0;
  font-size: 1.1rem;
}

.map-btn:hover {
  background: var(--vp-c-bg-elv);
}

.map-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.map-btn.is-active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.map-btn-danger {
  color: #c0392b;
  border-color: #c0392b;
}

.map-save-status {
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
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
  flex: 1 1 auto;
  min-height: 0;
  background: var(--vp-c-bg-soft);
  touch-action: none;
  cursor: grab;
}

.map-viewport:active {
  cursor: grabbing;
}

.map-viewport.is-placing,
.map-viewport.is-placing:active {
  cursor: crosshair;
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
  /* reset when rendered as a <button> in edit mode */
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  cursor: pointer;
  touch-action: none;
}

.map-pin.is-draggable {
  cursor: grab;
}

.map-pin.is-draggable:active {
  cursor: grabbing;
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

.pin-form-panel {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 20;
  width: min(320px, calc(100% - 2rem));
  padding: 1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.pin-form-panel h3 {
  margin: 0;
  font-size: 1rem;
}

.pin-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.pin-form-field input,
.pin-form-field select {
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.pin-form-error {
  margin: 0;
  font-size: 0.8rem;
  color: #c0392b;
}

.pin-form-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
