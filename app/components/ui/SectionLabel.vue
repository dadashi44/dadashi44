<script setup lang="ts">
defineProps<{index?: string; title: string}>()
</script>

<template>
  <div class="mb-10 flex items-center gap-4 border-b border-line/15 pb-4 lg:mb-16">
    <span v-if="index" class="font-display text-xs tracking-[0.3em] text-accent">{{ index }}</span>
    <span class="font-display text-xs uppercase tracking-[0.3em] text-ink-soft">{{ title }}</span>
    <span class="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
  </div>
</template>
