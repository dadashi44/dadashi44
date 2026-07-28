<script setup lang="ts">
import type {ResolvedProject} from '~/data/projects'

defineProps<{project: ResolvedProject; index: number}>()

const {t} = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    v-cursor="{mode: 'view', label: t('common.view')}"
    :to="localePath(`/work/${project.slug}`)"
    class="group block"
  >
    <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-alt lg:aspect-[16/11]">
      <div class="absolute inset-0 transition-transform duration-[900ms] ease-expo group-hover:scale-[1.04]">
        <ProjectVisual :project="project" parallax />
      </div>
      <span
        class="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur"
      >
        {{ project.kind === 'mobile' ? t('common.mobileApp') : t('common.website') }}
      </span>
    </div>

    <div class="mt-5 flex items-start justify-between gap-6">
      <div>
        <h3 class="font-display text-3xl uppercase leading-none tracking-tight lg:text-4xl">
          {{ project.name }}
        </h3>
        <p class="mt-2 max-w-md text-sm text-ink-soft">{{ project.client }}</p>
      </div>
      <span class="shrink-0 pt-2 font-display text-xs tracking-[0.2em] text-ink-faint">
        {{ project.year }}
      </span>
    </div>

    <ul class="mt-4 flex flex-wrap gap-2">
      <li
        v-for="tech in project.stack.slice(0, 4)"
        :key="tech"
        class="rounded-full border border-line/20 px-3 py-1 text-[11px] tracking-wide text-ink-soft"
      >
        {{ tech }}
      </li>
    </ul>
  </NuxtLink>
</template>
