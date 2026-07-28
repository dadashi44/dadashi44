<script setup lang="ts">
import type {ResolvedProject} from '~/data/projects'

defineProps<{project: ResolvedProject; index: number}>()

const {t} = useI18n()
const localePath = useLocalePath()

const row = ref<HTMLElement | null>(null)
const preview = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !row.value || !preview.value) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const {gsap} = api

  const xTo = gsap.quickTo(preview.value, 'x', {duration: 0.7, ease: 'power3'})
  const yTo = gsap.quickTo(preview.value, 'y', {duration: 0.7, ease: 'power3'})

  const move = (e: MouseEvent) => {
    const rect = row.value!.getBoundingClientRect()
    xTo(e.clientX - rect.left - 160)
    yTo(e.clientY - rect.top - 110)
  }
  const enter = () => gsap.to(preview.value, {autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out'})
  const leave = () => gsap.to(preview.value, {autoAlpha: 0, scale: 0.85, duration: 0.4})

  row.value.addEventListener('mousemove', move)
  row.value.addEventListener('mouseenter', enter)
  row.value.addEventListener('mouseleave', leave)

  onBeforeUnmount(() => {
    row.value?.removeEventListener('mousemove', move)
    row.value?.removeEventListener('mouseenter', enter)
    row.value?.removeEventListener('mouseleave', leave)
  })
})
</script>

<template>
  <div ref="row" class="relative">
    <NuxtLink
      v-cursor="{mode: 'view', label: t('common.open')}"
      :to="localePath(`/work/${project.slug}`)"
      class="group block border-b border-line/15 py-8 lg:py-10"
    >
      <div class="flex items-baseline gap-5 lg:gap-10">
        <span class="font-display text-xs tracking-[0.2em] text-ink-faint">
          {{ String(index + 1).padStart(2, '0') }}
        </span>

        <h3
          class="font-display text-4xl uppercase leading-none tracking-tight transition-transform duration-700 ease-expo group-hover:translate-x-3 lg:text-7xl"
        >
          {{ project.name }}
        </h3>

        <span class="ml-auto hidden max-w-xs text-right text-sm text-ink-soft lg:block">
          {{ project.stack.slice(0, 3).join(' · ') }}
        </span>
        <span class="hidden shrink-0 font-display text-xs tracking-[0.2em] text-ink-faint sm:inline">
          {{ project.year }}
        </span>
      </div>

      <p class="mt-3 max-w-2xl pl-8 text-sm text-ink-soft lg:hidden">{{ project.client }}</p>
    </NuxtLink>

    <div
      ref="preview"
      class="pointer-events-none absolute left-0 top-0 z-20 hidden h-56 w-80 origin-center overflow-hidden rounded-lg opacity-0 lg:block"
    >
      <ProjectVisual :project="project" />
    </div>
  </div>
</template>
