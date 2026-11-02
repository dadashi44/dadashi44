<script setup lang="ts">
import type {HabrArticle} from '~/data/habr'

const props = defineProps<{article: HabrArticle; index: number; date: string}>()

const {t} = useI18n()

const row = ref<HTMLElement | null>(null)
const preview = ref<HTMLElement | null>(null)

// the cover trails the cursor on desktop, the same way case previews do on /work
onMounted(() => {
  const api = useMotion()
  if (!api || !row.value || !preview.value || api.reduced) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const {gsap} = api

  // covers come in any proportions, so the card keeps the image's own height and
  // is centred on the cursor by percentage instead of fixed pixel offsets
  gsap.set(preview.value, {xPercent: -50, yPercent: -50})

  const xTo = gsap.quickTo(preview.value, 'x', {duration: 0.7, ease: 'power3'})
  const yTo = gsap.quickTo(preview.value, 'y', {duration: 0.7, ease: 'power3'})
  const rotateTo = gsap.quickTo(preview.value, 'rotation', {duration: 0.9, ease: 'power3'})
  let lastX = 0

  const move = (e: MouseEvent) => {
    const rect = row.value!.getBoundingClientRect()
    xTo(e.clientX - rect.left)
    yTo(e.clientY - rect.top)
    // a slight tilt in the direction of travel, so the card feels dragged rather than pinned
    rotateTo(gsap.utils.clamp(-6, 6, (e.clientX - lastX) * 0.4))
    lastX = e.clientX
  }
  const enter = (e: MouseEvent) => {
    lastX = e.clientX
    gsap.to(preview.value, {autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out'})
  }
  const leave = () => gsap.to(preview.value, {autoAlpha: 0, scale: 0.85, rotation: 0, duration: 0.4})

  row.value.addEventListener('mousemove', move)
  row.value.addEventListener('mouseenter', enter)
  row.value.addEventListener('mouseleave', leave)

  onBeforeUnmount(() => {
    row.value?.removeEventListener('mousemove', move)
    row.value?.removeEventListener('mouseenter', enter)
    row.value?.removeEventListener('mouseleave', leave)
  })
})

const onClick = () => track('blog_article_clicked', {article_id: props.article.id, placement: 'blog'})
</script>

<template>
  <div ref="row" data-article class="relative">
    <a
      v-cursor="{mode: 'view', label: t('blog.read')}"
      :href="article.url"
      target="_blank"
      rel="noopener"
      class="group relative grid gap-6 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14"
      @click="onClick"
    >
      <div class="flex items-baseline gap-5 lg:col-span-2 lg:flex-col lg:gap-3">
        <span class="font-display text-xs tracking-[0.2em] text-accent">{{ String(index + 1).padStart(2, '0') }}</span>
        <time :datetime="article.publishedAt" class="font-display text-xs uppercase tracking-[0.2em] text-ink-faint">
          {{ date }}
        </time>
      </div>

      <div class="lg:col-span-9">
        <h2
          class="font-display text-[2.1rem] uppercase leading-[0.95] tracking-tight transition-transform duration-700 ease-expo group-hover:translate-x-3 sm:text-5xl lg:text-6xl"
        >
          {{ article.title }}
        </h2>

        <img
          v-if="article.cover"
          :src="article.cover"
          alt=""
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          class="mt-6 h-auto w-full rounded-lg lg:hidden"
        />

        <p class="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft">{{ article.excerpt }}</p>

        <ul class="mt-6 flex flex-wrap gap-2">
          <li
            v-for="name in article.tags.slice(0, 5)"
            :key="name"
            class="rounded-full border border-line/20 px-3 py-1 text-[11px] uppercase tracking-wider text-ink-faint"
          >
            {{ name }}
          </li>
        </ul>
      </div>

      <span
        class="absolute right-0 top-10 hidden h-12 w-12 items-center justify-center rounded-full border border-line/25 transition-colors duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-surface lg:top-14 lg:flex"
        aria-hidden="true"
      >
        <svg viewBox="0 0 16 16" fill="none" class="h-4 w-4 transition-transform duration-500 ease-expo group-hover:rotate-45">
          <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </span>

      <!-- the divider fills with the accent from the left on hover -->
      <span class="absolute inset-x-0 bottom-0 h-px bg-line/15" aria-hidden="true" />
      <span
        class="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-expo group-hover:scale-x-100"
        aria-hidden="true"
      />
    </a>

    <div
      v-if="article.cover"
      ref="preview"
      class="pointer-events-none absolute left-0 top-0 z-20 hidden w-[26rem] origin-center overflow-hidden rounded-lg opacity-0 shadow-2xl lg:block"
    >
      <img :src="article.cover" alt="" referrerpolicy="no-referrer" class="block h-auto w-full" />
    </div>
  </div>
</template>
