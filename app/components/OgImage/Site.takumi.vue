<script setup lang="ts">
/**
 * 1200×630 share card, rendered by Takumi. One template for every page:
 * project cases pass their palette, everything else gets the site accent.
 * Prop-driven colours go through :style — the module only resolves static
 * classes at build time.
 */
const {
  title = 'Dauren Abasov',
  description = '',
  eyebrow = '',
  footer = 'Dauren Abasov · Frontend developer',
  accent = '#ff6a3d',
  glow = '#2f4bd8'
} = defineProps<{
  title?: string
  description?: string
  eyebrow?: string
  footer?: string
  accent?: string
  glow?: string
}>()

// no line-clamp in the renderer, so long copy is trimmed here — at a word boundary
const clip = (text: string, max: number) => {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : max).replace(/[\s,.;:—–-]+$/, '')}…`
}
// Bebas Neue has no Cyrillic, so Russian titles are set in Inter like on the site
const latinTitle = /^[\x20-\x7E—–·]+$/.test(title)
</script>

<template>
  <div
    class="flex h-full w-full flex-col justify-between"
    :style="{
      padding: '64px 72px',
      color: '#f0f0ed',
      backgroundColor: '#080808',
      backgroundImage: [
        // contour rings around a peak off the bottom-right corner
        'repeating-radial-gradient(circle at 92% 118%, rgba(240,240,237,0.09) 0px, rgba(240,240,237,0.09) 1.5px, transparent 1.5px, transparent 30px)',
        `radial-gradient(circle at 88% 100%, ${glow}66 0%, transparent 55%)`,
        `radial-gradient(circle at 100% 0%, ${accent}33 0%, transparent 40%)`
      ].join(', ')
    }"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center" style="gap: 16px">
        <div
          class="flex items-center justify-center"
          style="width: 48px; height: 48px; border-radius: 9999px; background: #f0f0ed; color: #080808; font-family: 'Bebas Neue'; font-size: 28px"
        >
          D
        </div>
        <div style="font-family: 'Bebas Neue'; font-size: 28px; letter-spacing: 8px">DADASHI</div>
      </div>
      <div
        v-if="eyebrow"
        :style="{fontFamily: 'Inter', fontSize: '22px', letterSpacing: '4px', textTransform: 'uppercase', color: accent}"
      >
        {{ eyebrow }}
      </div>
    </div>

    <div class="flex flex-col" style="gap: 24px; max-width: 980px">
      <div
        :style="{
          fontFamily: latinTitle ? 'Bebas Neue' : 'Inter',
          fontSize: latinTitle ? '124px' : '84px',
          fontWeight: latinTitle ? 400 : 500,
          lineHeight: latinTitle ? 0.9 : 1,
          letterSpacing: latinTitle ? '0px' : '-2px',
          textTransform: 'uppercase'
        }"
      >
        {{ clip(title, 60) }}
      </div>
      <div v-if="description" style="font-family: Inter; font-size: 28px; line-height: 1.35; color: #a0a09b">
        {{ clip(description, 125) }}
      </div>
    </div>

    <div class="flex items-center justify-between" style="font-family: Inter; font-size: 22px; color: #a0a09b">
      <div class="flex items-center" style="gap: 14px">
        <div :style="{width: '12px', height: '12px', borderRadius: '9999px', background: accent}" />
        {{ footer }}
      </div>
      <div style="letter-spacing: 2px">dadashi44.is-a.dev</div>
    </div>
  </div>
</template>
