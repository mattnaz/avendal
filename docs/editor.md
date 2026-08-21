---
layout: page
title: Editor
sidebar: false
---

<ContentEditor v-if="isDev" />
<p v-else class="editor-unavailable">
  The content editor only runs during local development — start it with <code>npm run dev</code>, then open
  <code>/editor</code>.
</p>

<script setup>
import { defineAsyncComponent } from "vue";

const isDev = import.meta.env.DEV;
// Dynamically imported so its (fairly heavy) rich-text editor dependency is
// never fetched by the deployed site — only by whoever opens /editor in dev.
const ContentEditor = defineAsyncComponent(() => import("./.vitepress/theme/components/ContentEditor.vue"));
</script>

<style scoped>
.editor-unavailable {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--vp-c-text-2);
}
</style>
