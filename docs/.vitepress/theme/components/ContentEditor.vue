<template>
  <div class="editor-page">
    <aside class="editor-sidebar">
      <div v-for="section in SECTIONS" :key="section.key" class="sidebar-section">
        <div class="sidebar-section-header">
          <h3>{{ section.label }}</h3>
          <button
            type="button"
            class="editor-btn editor-btn-icon"
            title="New page"
            @click="startNewPage(section.key)"
          >
            +
          </button>
        </div>

        <div v-if="newDraft.section === section.key" class="new-page-form">
          <input
            v-model="newDraft.title"
            type="text"
            placeholder="Page title"
            @keyup.enter="createPage"
            @keyup.escape="cancelNewPage"
          />
          <div class="new-page-actions">
            <button type="button" class="editor-btn" :disabled="!newDraft.title.trim() || saving" @click="createPage">
              Create
            </button>
            <button type="button" class="editor-btn" @click="cancelNewPage">Cancel</button>
          </div>
        </div>

        <ul class="page-list">
          <li v-for="page in pages[section.key]" :key="page.slug">
            <button
              type="button"
              class="page-list-item"
              :class="{ 'is-active': isSelected(section.key, page.slug) }"
              @click="selectPage(section.key, page.slug)"
            >
              {{ page.title }}
            </button>
          </li>
          <li v-if="!pages[section.key].length" class="page-list-empty">No pages yet</li>
        </ul>
      </div>
    </aside>

    <main class="editor-main">
      <p v-if="error" class="editor-error">{{ error }}</p>

      <template v-if="selected">
        <div class="editor-toolbar">
          <span class="editor-path">/{{ selected.section }}/{{ selected.slug }}</span>
          <span v-if="dirty" class="editor-status editor-status-dirty">Unsaved changes</span>
          <span v-else-if="saveStatus" class="editor-status">{{ saveStatus }}</span>
          <div class="editor-toolbar-actions">
            <button type="button" class="editor-btn" :disabled="saving || !dirty" @click="save">
              {{ saving ? "Saving…" : "Save" }}
            </button>
            <button type="button" class="editor-btn editor-btn-danger" :disabled="deleting" @click="removePage">
              {{ deleting ? "Deleting…" : "Delete" }}
            </button>
          </div>
        </div>
        <div ref="editorRootEl" class="editor-canvas"></div>
      </template>

      <p v-else class="editor-placeholder">Pick a page on the left, or create a new one.</p>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { withBase } from "vitepress";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/classic.css";

const SECTIONS = [
  { key: "lore", label: "Lore" },
  { key: "rules", label: "Rules" },
];

const pages = reactive({ lore: [], rules: [] });
const selected = ref(null); // { section, slug }
const newDraft = reactive({ section: null, title: "" });
const dirty = ref(false);
const saving = ref(false);
const deleting = ref(false);
const saveStatus = ref("");
const error = ref("");
const editorRootEl = ref(null);

let crepeInstance = null;
let lastSavedMarkdown = "";
let saveStatusTimer = null;

onMounted(() => {
  fetchPages("lore");
  fetchPages("rules");
  window.addEventListener("beforeunload", onBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
  destroyEditor();
});

function onBeforeUnload(event) {
  if (!dirty.value) return;
  event.preventDefault();
  event.returnValue = "";
}

function isSelected(section, slug) {
  return selected.value?.section === section && selected.value?.slug === slug;
}

async function fetchPages(section) {
  try {
    const res = await fetch(withBase(`/api/content/pages?section=${section}`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    pages[section] = await res.json();
  } catch (err) {
    error.value = `Failed to load ${section} pages: ${err.message}`;
  }
}

function confirmDiscard() {
  return !dirty.value || window.confirm("Discard unsaved changes?");
}

function startNewPage(section) {
  if (!confirmDiscard()) return;
  newDraft.section = section;
  newDraft.title = "";
}

function cancelNewPage() {
  newDraft.section = null;
}

async function createPage() {
  const title = newDraft.title.trim();
  const section = newDraft.section;
  if (!title || !section) return;
  saving.value = true;
  error.value = "";
  try {
    const res = await fetch(withBase("/api/content/page"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, title, isNew: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    newDraft.section = null;
    await fetchPages(section);
    await openPage(section, data.slug);
  } catch (err) {
    error.value = `Failed to create page: ${err.message}`;
  } finally {
    saving.value = false;
  }
}

async function selectPage(section, slug) {
  if (isSelected(section, slug)) return;
  if (!confirmDiscard()) return;
  await openPage(section, slug);
}

async function openPage(section, slug) {
  error.value = "";
  try {
    const res = await fetch(withBase(`/api/content/page?section=${section}&slug=${slug}`));
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    selected.value = { section, slug };
    await mountEditor(data.markdown);
  } catch (err) {
    error.value = `Failed to open page: ${err.message}`;
  }
}

async function mountEditor(markdown) {
  await destroyEditor();
  crepeInstance = new Crepe({ root: editorRootEl.value, defaultValue: markdown });
  crepeInstance.on((listener) => {
    listener.markdownUpdated((_ctx, md) => {
      dirty.value = md !== lastSavedMarkdown;
    });
  });
  await crepeInstance.create();
  lastSavedMarkdown = markdown;
  dirty.value = false;
}

async function destroyEditor() {
  if (!crepeInstance) return;
  const instance = crepeInstance;
  crepeInstance = null;
  await instance.destroy();
}

async function save() {
  if (!selected.value || !crepeInstance || saving.value) return;
  saving.value = true;
  error.value = "";
  try {
    const markdown = crepeInstance.getMarkdown();
    const { section, slug } = selected.value;
    const res = await fetch(withBase("/api/content/page"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, slug, markdown, isNew: false }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    lastSavedMarkdown = markdown;
    dirty.value = false;
    saveStatus.value = "Saved";
    if (saveStatusTimer) clearTimeout(saveStatusTimer);
    saveStatusTimer = setTimeout(() => (saveStatus.value = ""), 2500);
    await fetchPages(section); // title (H1) may have changed
  } catch (err) {
    error.value = `Failed to save: ${err.message}`;
  } finally {
    saving.value = false;
  }
}

async function removePage() {
  if (!selected.value || deleting.value) return;
  const { section, slug } = selected.value;
  if (!window.confirm(`Delete "${slug}"? This can't be undone.`)) return;
  deleting.value = true;
  error.value = "";
  try {
    const res = await fetch(withBase(`/api/content/page?section=${section}&slug=${slug}`), { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    await destroyEditor();
    selected.value = null;
    dirty.value = false;
    await fetchPages(section);
  } catch (err) {
    error.value = `Failed to delete: ${err.message}`;
  } finally {
    deleting.value = false;
  }
}
</script>

<style scoped>
.editor-page {
  display: flex;
  height: calc(100vh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px));
  border-top: 1px solid var(--vp-c-border);
}

.editor-sidebar {
  flex: 0 0 260px;
  overflow-y: auto;
  padding: 1rem 0.75rem;
  border-right: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

.sidebar-section + .sidebar-section {
  margin-top: 1.5rem;
}

.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem;
}

.sidebar-section-header h3 {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-2);
}

.new-page-form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0.5rem 0.25rem;
}

.new-page-form input {
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
}

.new-page-actions {
  display: flex;
  gap: 0.4rem;
}

.page-list {
  list-style: none;
  margin: 0.4rem 0 0;
  padding: 0;
}

.page-list-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.4rem 0.5rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  cursor: pointer;
}

.page-list-item:hover {
  background: var(--vp-c-bg-elv);
}

.page-list-item.is-active {
  background: var(--vp-c-brand-1);
  color: white;
}

.page-list-empty {
  padding: 0.4rem 0.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.editor-main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.editor-error {
  margin: 0;
  padding: 0.6rem 1.5rem;
  background: #c0392b;
  color: white;
  font-size: 0.85rem;
}

.editor-toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.5rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.editor-path {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.editor-status {
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
}

.editor-status-dirty {
  color: var(--vp-c-text-2);
}

.editor-toolbar-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.editor-btn {
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

.editor-btn:hover {
  background: var(--vp-c-bg-elv);
}

.editor-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-btn-icon {
  width: 1.6rem;
  height: 1.6rem;
  padding: 0;
  font-size: 1rem;
}

.editor-btn-danger {
  color: #c0392b;
  border-color: #c0392b;
}

.editor-canvas {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1.5rem 2rem 4rem;
  background: var(--crepe-color-background, var(--vp-c-bg));
}

.editor-placeholder {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--vp-c-text-2);
}
</style>
