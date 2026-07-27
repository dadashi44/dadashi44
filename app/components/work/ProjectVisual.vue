<script setup lang="ts">
import type {ResolvedProject} from '~/data/projects'

const props = defineProps<{project: ResolvedProject; parallax?: boolean}>()

const {t} = useI18n()

// Screenshots are opt-in: set `image` on the project to use one, otherwise the
// abstract mock below is rendered (no 404 requests for missing files).
const failed = ref(false)
const isPhone = computed(() => props.project.kind === 'mobile')
const src = computed(() => {
  if (!props.project.image) return undefined
  // mobile projects prefer the portrait capture, e.g. /works/hft-mobile.webp
  return isPhone.value ? props.project.image.replace(/\.webp$/, '-mobile.webp') : props.project.image
})
const host = computed(() => props.project.href.replace(/^https?:\/\//, '').replace(/\/.*$/, ''))

const stage = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!props.parallax) return
  const api = useMotion()
  if (!api || !stage.value) return
  const {gsap, reduced} = api
  if (reduced) return

  // the whole mock drifts — the frame never leaves the crop, so the site
  // header stays visible at every scroll position
  gsap.fromTo(
    stage.value,
    {y: -14},
    {
      y: 14,
      ease: 'none',
      scrollTrigger: {trigger: stage.value.parentElement, start: 'top bottom', end: 'bottom top', scrub: true}
    }
  )
})
</script>

<template>
  <div
    class="relative h-full w-full overflow-hidden"
    :style="{background: `linear-gradient(140deg, ${project.palette.from} 0%, ${project.palette.to} 100%)`}"
  >
    <!-- soft light so flat gradients get some depth -->
    <div
      class="pointer-events-none absolute inset-0 opacity-70"
      style="background: radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.22), transparent 60%)"
    />

    <div ref="stage" class="absolute inset-0 flex items-center justify-center p-[5%]">
      <!-- ─────────── browser mock ─────────── -->
      <div
        v-if="!isPhone"
        class="flex aspect-[16/10.6] max-h-full w-[80%] flex-col overflow-hidden rounded-lg bg-black/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/20 backdrop-blur-sm"
      >
        <div class="flex shrink-0 items-center gap-1.5 border-b border-white/10 px-3 py-[2.5%]">
          <span v-for="d in 3" :key="d" class="h-[0.4rem] w-[0.4rem] rounded-full bg-white/30" />
          <span
            class="ml-2 truncate rounded-full bg-white/10 px-2 py-0.5 text-[0.5rem] tracking-wider text-white/60"
          >
            {{ host }}
          </span>
        </div>

        <div class="relative flex-1 overflow-hidden bg-white/5">
          <img
            v-if="src && !failed"
            :src="src"
            :alt="`${project.name} — ${project.client}`"
            loading="lazy"
            class="h-full w-full object-cover object-top"
            @error="failed = true"
          />
          <!-- abstract fallback -->
          <div v-else class="space-y-[4%] p-[5%]">
            <div class="h-[22%] w-3/5 rounded bg-white/25" />
            <div class="h-[6%] w-4/5 rounded bg-white/15" />
            <div class="h-[6%] w-2/3 rounded bg-white/10" />
            <div class="grid grid-cols-3 gap-[4%] pt-[3%]">
              <div v-for="c in 3" :key="c" class="h-16 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <!-- ─────────── phone mock ─────────── -->
      <!-- the frame shrink-wraps the screenshot, so store captures of different
           device sizes keep their own aspect ratio and are never cropped -->
      <div
        v-else
        class="relative inline-flex h-[92%] max-w-[80%] rounded-[9%/4.5%] bg-black/50 p-[1%] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/25"
      >
        <div class="relative h-full overflow-hidden rounded-[8%/4%] bg-black/30">
          <img
            v-if="src && !failed"
            :src="src"
            :alt="`${project.name} — ${t('work.appScreen')}`"
            loading="lazy"
            class="h-full w-auto max-w-full object-cover object-top"
            @error="failed = true"
          />
          <!-- abstract fallback -->
          <div v-else class="aspect-[9/19.5] h-full p-[8%]">
            <div class="mx-auto mb-[8%] h-1 w-10 rounded-full bg-white/30" />
            <div class="h-[12%] w-full rounded-lg bg-white/25" />
            <div class="mt-[6%] space-y-[4%]">
              <div v-for="r in 4" :key="r" class="h-[8%] rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
  </div>
</template>
