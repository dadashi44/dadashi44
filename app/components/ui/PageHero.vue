<script setup lang="ts">
defineProps<{title: string; subtitle?: string; index?: string; meta?: {label: string; value: string}[]}>()
</script>

<template>
  <header class="container pb-14 pt-16 lg:pb-20 lg:pt-24">
    <div class="flex items-center gap-4 border-b border-line/15 pb-5">
      <span v-if="index" class="font-display text-xs tracking-[0.3em] text-accent">{{ index }}</span>
      <span class="font-display text-xs uppercase tracking-[0.3em] text-ink-soft">
        <slot name="eyebrow">Dauren Abasov</slot>
      </span>
    </div>

    <h1 class="mt-8 font-display uppercase leading-[0.85] tracking-tight">
      <SplitReveal as="span" type="chars" :stagger="0.02" class="block text-display" :text="title" />
    </h1>

    <div v-if="subtitle || meta?.length" class="mt-8 flex flex-wrap items-start justify-between gap-8">
      <SplitReveal v-if="subtitle" as="p" class="max-w-xl text-base text-ink-soft lg:text-lg" :text="subtitle" />
      <dl v-if="meta?.length" class="grid grid-cols-2 gap-x-10 gap-y-4 text-sm sm:grid-cols-3">
        <div v-for="item in meta" :key="item.label">
          <dt class="font-display text-[10px] uppercase tracking-[0.25em] text-ink-faint">{{ item.label }}</dt>
          <dd class="mt-1 text-ink">{{ item.value }}</dd>
        </div>
      </dl>
    </div>
  </header>
</template>
