<script setup lang="ts">
/**
 * Topographic map of Almaty and the Trans-Ili Alatau, drawn from real SRTM
 * elevation data. Contour lines come from a baked heightmap
 * (`public/terrain/almaty.webp`, see scripts/bake-terrain.py), a slow light
 * wave climbs from the city to the peaks, and the lines glow around the cursor.
 *
 * Plain WebGL2 instead of three.js — one fullscreen triangle and a fragment
 * shader, so the home page doesn't pay for the 3D chunk. Colours come from the
 * theme tokens, so it follows the light/dark switch.
 */
const {t, locale} = useI18n()
const {theme} = useTheme()

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const readout = ref<HTMLElement | null>(null)
const failed = ref(false)
const ready = ref(false)

/** the box baked into the heightmap; `min` is the metre offset of the data */
const TERRAIN = {lon0: 76.3, lon1: 77.6, lat0: 42.95, lat1: 43.4, min: 634, src: '/terrain/almaty.webp'}
const COS_LAT = Math.cos((43.17 * Math.PI) / 180)
const KM_PER_DEG = 111.32

/** the visible window is centred between the city and the ridge */
const CENTER = {lat: 43.17, lon: 76.95}
const LAT_SPAN = 0.3
const MAX_LON_SPAN = 1.25

interface Place {
  key: string
  lat: number
  lon: number
  /** official height in metres, shown on the label */
  elevation: number
  home?: boolean
}

const PLACES: Place[] = [
  {key: 'almaty', lat: 43.2389, lon: 76.8897, elevation: 800, home: true},
  {key: 'koktobe', lat: 43.232, lon: 76.976, elevation: 1100},
  {key: 'medeu', lat: 43.1575, lon: 77.0589, elevation: 1691},
  {key: 'shymbulak', lat: 43.128, lon: 77.081, elevation: 2260},
  {key: 'bao', lat: 43.0503, lon: 76.9853, elevation: 2511},
  {key: 'talgar', lat: 43.117, lon: 77.342, elevation: 4979}
]

/** the geographic window currently on screen — recomputed on resize only */
const view = reactive({lon0: 0, lat1: 0, lonSpan: 1, latSpan: LAT_SPAN})

const fitView = (width: number, height: number) => {
  let latSpan = LAT_SPAN
  let lonSpan = ((width / height) * latSpan) / COS_LAT
  if (lonSpan > MAX_LON_SPAN) {
    lonSpan = MAX_LON_SPAN
    latSpan = (lonSpan * COS_LAT * height) / width
  }
  Object.assign(view, {lon0: CENTER.lon - lonSpan / 2, lat1: CENTER.lat + latSpan / 2, lonSpan, latSpan})
}

const project = (lat: number, lon: number) => ({
  x: (lon - view.lon0) / view.lonSpan,
  y: (view.lat1 - lat) / view.latSpan
})

const numberFmt = computed(() => new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'ru-RU'))

const places = computed(() =>
  PLACES.map((place) => ({...place, ...project(place.lat, place.lon)})).filter(
    (p) => p.x > 0.04 && p.x < 0.9 && p.y > 0.12 && p.y < 0.9
  )
)

/** a 10 km bar, as a share of the map width */
const scaleWidth = computed(() => (10 / (view.lonSpan * KM_PER_DEG * COS_LAT)) * 100)

const fmt = (value: number, pos: string, neg: string) => `${Math.abs(value).toFixed(4)}°${value >= 0 ? pos : neg}`
const originLabel = `${fmt(PLACES[0]!.lat, 'N', 'S')} ${fmt(PLACES[0]!.lon, 'E', 'W')}`

const VERTEX = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`

const FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D u_height;
uniform vec2 u_texSize;
uniform vec4 u_view;     // texture-space window: u0, v0 (north), uSpan, vSpan
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;
uniform vec3 u_bg;
uniform vec3 u_bgAlt;
uniform vec3 u_ink;
uniform vec3 u_accent;

out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Cubic B-spline filtering from four bilinear taps: plain bilinear leaves
// visible kinks in the contours at every texel boundary.
float heightAt(vec2 uv) {
  vec2 st = uv * u_texSize - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / u_texSize;
  vec2 h1 = (i + 1.5 + w3 / g1) / u_texSize;
  return g0.y * (g0.x * texture(u_height, vec2(h0.x, h0.y)).r + g1.x * texture(u_height, vec2(h1.x, h0.y)).r)
       + g1.y * (g0.x * texture(u_height, vec2(h0.x, h1.y)).r + g1.x * texture(u_height, vec2(h1.x, h1.y)).r);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 screen = vec2(frag.x / u_res.x, 1.0 - frag.y / u_res.y);
  vec2 uv = u_view.xy + screen * u_view.zw;
  float elev = heightAt(uv);

  // a 100 m contour interval, every fifth one an index line
  // the contour levels rise 6 m a second, so the lines slowly climb from the
  // valleys to the peaks and tighten around them — one full interval every ~17 s
  float bands = (elev - u_time * 6.0) / 100.0;
  float w = fwidth(bands);
  float f = fract(bands);
  float d = min(f, 1.0 - f);
  float major = step(mod(floor(bands + 0.5), 5.0), 0.5);
  float line = 1.0 - smoothstep(0.0, w * mix(0.9, 1.7, major), d);
  // on steep slopes minor lines would merge into a grey smear, so they fade
  line *= mix(1.0 - smoothstep(0.12, 0.35, w), 1.0, major);

  // hypsometric tint: the ground gets lighter with altitude
  float alt = smoothstep(700.0, 4200.0, elev);
  vec3 col = mix(u_bg, u_bgAlt, alt * 0.9);

  // city blocks: a fine dot grid on the flat ground of Almaty
  vec2 cell = fract(frag / 7.0) - 0.5;
  float dots = (1.0 - smoothstep(0.08, 0.16, length(cell))) * (1.0 - smoothstep(880.0, 1000.0, elev));
  col = mix(col, u_ink, dots * 0.07);

  // a slow light wave climbing from the city to the peaks
  float wave = exp(-pow(fract(elev / 2600.0 - u_time * 0.03) - 0.5, 2.0) * 90.0);

  vec2 px = frag - u_mouse * u_res;
  float glow = exp(-dot(px, px) / (180.0 * 180.0)) * u_hover;
  float tint = clamp(glow * 1.5 + wave * 0.35, 0.0, 1.0);
  vec3 lineCol = mix(u_ink, u_accent, tint);
  float alpha = mix(0.14, 0.42, major) + glow * 0.45 + wave * 0.12;
  col = mix(col, lineCol, line * alpha);

  // soft edges keep the frame calm
  vec2 e = frag / u_res;
  float vig = smoothstep(0.0, 0.2, e.x) * smoothstep(1.0, 0.8, e.x) * smoothstep(0.0, 0.18, e.y) * smoothstep(1.0, 0.82, e.y);
  col = mix(u_bg, col, 0.4 + 0.6 * vig);

  col += (hash(frag + fract(u_time)) - 0.5) * 0.02;
  outColor = vec4(col, 1.0);
}`

let stop: (() => void) | null = null
let applyTheme: (() => void) | null = null

onMounted(() => {
  if (!canvas.value || !root.value) return

  // the heightmap is only fetched once the section is close to the viewport
  const lazy = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      lazy.disconnect()
      start()
    },
    {rootMargin: '600px 0px'}
  )
  lazy.observe(root.value)
  stop = () => lazy.disconnect()
})

async function start() {
  try {
    const heights = await loadHeights()
    if (!canvas.value) return
    stop = setup(canvas.value, heights)
    ready.value = true
  } catch (err) {
    // the section must survive a broken GPU or a failed fetch — the plain backdrop stays
    console.warn('[TerrainMap] disabled:', err)
    failed.value = true
  }
}

// the theme toggles a class on <html>; re-read the tokens once it has applied
watch(theme, () => nextTick(() => applyTheme?.()))

onBeforeUnmount(() => stop?.())

interface Heights {
  width: number
  height: number
  data: Float32Array
}

/** Decodes metres from the R (high byte) and G (low byte) channels. */
async function loadHeights(): Promise<Heights> {
  const blob = await fetch(TERRAIN.src).then((r) => {
    if (!r.ok) throw new Error(`heightmap ${r.status}`)
    return r.blob()
  })
  // no colour management or premultiplication — the bytes are data, not colour
  const bitmap = await createImageBitmap(blob, {colorSpaceConversion: 'none', premultiplyAlpha: 'none'})
  const scratch = document.createElement('canvas')
  scratch.width = bitmap.width
  scratch.height = bitmap.height
  const ctx = scratch.getContext('2d', {willReadFrequently: true})!
  ctx.drawImage(bitmap, 0, 0)
  const pixels = ctx.getImageData(0, 0, scratch.width, scratch.height).data
  // close() zeroes the bitmap's size, so only the scratch canvas is read below
  bitmap.close()

  const data = new Float32Array(scratch.width * scratch.height)
  for (let i = 0; i < data.length; i++) {
    data[i] = pixels[i * 4]! * 256 + pixels[i * 4 + 1]! + TERRAIN.min
  }
  return {width: scratch.width, height: scratch.height, data}
}

function setup(surface: HTMLCanvasElement, heights: Heights) {
  const gl = surface.getContext('webgl2', {antialias: false, alpha: false, powerPreference: 'low-power'})
  if (!gl) throw new Error('WebGL2 unavailable')

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader')
    return shader
  }

  const program = gl.createProgram()!
  const vs = compile(gl.VERTEX_SHADER, VERTEX)
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT)
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link')
  gl.useProgram(program)

  // one oversized triangle covers the viewport without a diagonal seam
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const pos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(pos)
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

  // R16F is filterable in WebGL2 and holds metres to ~2–4 m — plenty for 100 m contours
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, heights.width, heights.height, 0, gl.RED, gl.FLOAT, heights.data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const u = (name: string) => gl.getUniformLocation(program, name)
  const uniforms = {
    height: u('u_height'),
    texSize: u('u_texSize'),
    view: u('u_view'),
    res: u('u_res'),
    time: u('u_time'),
    mouse: u('u_mouse'),
    hover: u('u_hover'),
    bg: u('u_bg'),
    bgAlt: u('u_bgAlt'),
    ink: u('u_ink'),
    accent: u('u_accent')
  }
  gl.uniform1i(uniforms.height, 0)
  gl.uniform2f(uniforms.texSize, heights.width, heights.height)

  const lonRange = TERRAIN.lon1 - TERRAIN.lon0
  const latRange = TERRAIN.lat1 - TERRAIN.lat0

  /** metres at a point, bilinear — used by the cursor readout */
  const sample = (lat: number, lon: number) => {
    const x = Math.min(Math.max(((lon - TERRAIN.lon0) / lonRange) * heights.width - 0.5, 0), heights.width - 1.001)
    const y = Math.min(Math.max(((TERRAIN.lat1 - lat) / latRange) * heights.height - 0.5, 0), heights.height - 1.001)
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const fx = x - ix
    const fy = y - iy
    const at = (cx: number, cy: number) => heights.data[cy * heights.width + cx]!
    return (
      at(ix, iy) * (1 - fx) * (1 - fy) +
      at(ix + 1, iy) * fx * (1 - fy) +
      at(ix, iy + 1) * (1 - fx) * fy +
      at(ix + 1, iy + 1) * fx * fy
    )
  }

  const token = (name: string) =>
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
      .split(/\s+/)
      .map((c) => Number(c) / 255) as [number, number, number]

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const startedAt = performance.now()
  let running = false
  let visible = true
  let frame = 0
  let tick = 0

  // pointer is eased towards its target so the glow trails the cursor
  const mouse = {x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, hover: 0, thover: 0}

  const draw = (now: number) => {
    mouse.x += (mouse.tx - mouse.x) * 0.08
    mouse.y += (mouse.ty - mouse.y) * 0.08
    mouse.hover += (mouse.thover - mouse.hover) * 0.06

    gl.uniform1f(uniforms.time, reduced ? 12 : (now - startedAt) / 1000)
    gl.uniform2f(uniforms.mouse, mouse.x, mouse.y)
    gl.uniform1f(uniforms.hover, mouse.hover)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  // written straight into the DOM: a reactive ref here would re-render 60×/s
  const updateReadout = () => {
    const el = readout.value
    if (!el) return
    el.style.opacity = String(mouse.hover)
    if (mouse.hover < 0.05) return
    const lat = view.lat1 - (1 - mouse.y) * view.latSpan
    const lon = view.lon0 + mouse.x * view.lonSpan
    const metres = numberFmt.value.format(Math.round(sample(lat, lon)))
    el.textContent = `${fmt(lat, 'N', 'S')}  ${fmt(lon, 'E', 'W')}  ·  ${metres} ${t('home.map.metres')}`
  }

  applyTheme = () => {
    gl.uniform3fv(uniforms.bg, token('--c-surface'))
    gl.uniform3fv(uniforms.bgAlt, token('--c-surface-alt'))
    gl.uniform3fv(uniforms.ink, token('--c-ink'))
    gl.uniform3fv(uniforms.accent, token('--c-accent'))
    if (!running) draw(performance.now())
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    surface.width = Math.round(surface.clientWidth * dpr)
    surface.height = Math.round(surface.clientHeight * dpr)
    gl.viewport(0, 0, surface.width, surface.height)
    gl.uniform2f(uniforms.res, surface.width, surface.height)

    fitView(surface.clientWidth, surface.clientHeight)
    gl.uniform4f(
      uniforms.view,
      (view.lon0 - TERRAIN.lon0) / lonRange,
      (TERRAIN.lat1 - view.lat1) / latRange,
      view.lonSpan / lonRange,
      view.latSpan / latRange
    )
    if (!running) draw(performance.now())
  }

  const onPointer = (e: PointerEvent) => {
    const rect = surface.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
    // the glow fades out in place when the cursor leaves the map
    if (inside) {
      mouse.tx = x
      mouse.ty = 1 - y
    }
    mouse.thover = inside && e.pointerType === 'mouse' ? 1 : 0
  }
  const onLeave = () => (mouse.thover = 0)

  const loop = (now: number) => {
    draw(now)
    if (++tick % 4 === 0) updateReadout()
    frame = requestAnimationFrame(loop)
  }

  const sync = () => {
    const shouldRun = visible && !document.hidden && !reduced
    if (shouldRun === running) return
    running = shouldRun
    if (running) frame = requestAnimationFrame(loop)
    else cancelAnimationFrame(frame)
  }

  // no point burning GPU on a map that's scrolled away or in a hidden tab
  const io = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting
    sync()
  })
  io.observe(surface)

  const ro = new ResizeObserver(resize)
  ro.observe(surface)

  window.addEventListener('pointermove', onPointer, {passive: true})
  document.documentElement.addEventListener('pointerleave', onLeave)
  document.addEventListener('visibilitychange', sync)

  applyTheme()
  resize()
  sync()

  return () => {
    cancelAnimationFrame(frame)
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('pointermove', onPointer)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    document.removeEventListener('visibilitychange', sync)
    gl.deleteTexture(texture)
    gl.deleteBuffer(buffer)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteProgram(program)
    applyTheme = null
  }
}
</script>

<template>
  <div ref="root" class="relative h-full w-full overflow-hidden bg-surface">
    <canvas
      v-show="!failed"
      ref="canvas"
      class="block h-full w-full transition-opacity duration-1000"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    />

    <!-- survey-sheet overlay: decorative, so hidden from assistive tech -->
    <div
      class="pointer-events-none absolute inset-0 font-display text-[11px] uppercase tracking-[0.25em] text-ink-faint transition-opacity duration-1000 lg:text-xs"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    >
      <span class="hud-corner left-4 top-4 border-l border-t lg:left-8 lg:top-8" />
      <span class="hud-corner right-4 top-4 border-r border-t lg:right-8 lg:top-8" />
      <span class="hud-corner bottom-4 left-4 border-b border-l lg:bottom-8 lg:left-8" />
      <span class="hud-corner bottom-4 right-4 border-b border-r lg:bottom-8 lg:right-8" />

      <div class="absolute left-8 top-8 lg:left-14 lg:top-14">
        <p class="text-ink-soft">{{ t('home.map.sheet') }}</p>
        <p class="mt-1">{{ t('home.map.interval') }}</p>
      </div>

      <div class="absolute right-8 top-8 flex flex-col items-end gap-3 lg:right-14 lg:top-14">
        <p class="hidden sm:block">{{ originLabel }}</p>
        <p class="flex flex-col items-center leading-none text-ink-soft">
          <span class="mb-1 block h-0 w-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-ink-soft" />
          {{ t('home.map.north') }}
        </p>
      </div>

      <!-- places, positioned from their real coordinates -->
      <div
        v-for="place in places"
        :key="place.key"
        class="absolute"
        :style="{left: `${place.x * 100}%`, top: `${place.y * 100}%`}"
      >
        <template v-if="place.home">
          <span class="absolute -left-1 -top-1 block h-2 w-2 rounded-full bg-accent" />
          <span class="hud-pulse absolute -left-1 -top-1 block h-2 w-2 rounded-full bg-accent" />
          <!-- the label sits to the left so it never covers Kok-Tobe next door -->
          <span class="absolute right-4 top-0 h-px w-8 bg-ink/30" />
          <span class="hud-label absolute right-14 -top-[0.6em] whitespace-nowrap text-ink">
            {{ t(`home.map.places.${place.key}`) }} · {{ t('home.map.marker') }}
          </span>
        </template>
        <template v-else>
          <span class="absolute -left-[3px] -top-[3px] block h-1.5 w-1.5 rotate-45 border border-ink/60" />
          <span class="hud-label absolute left-3 -top-[0.6em] whitespace-nowrap text-ink-soft">
            <span class="text-ink">{{ t(`home.map.places.${place.key}`) }}</span>
            {{ numberFmt.format(place.elevation) }} {{ t('home.map.metres') }}
          </span>
        </template>
      </div>

      <div class="absolute bottom-8 left-8 lg:bottom-14 lg:left-14">
        <div class="flex h-2 border-x border-b border-ink/40" :style="{width: `${scaleWidth}%`, minWidth: '4rem'}">
          <span class="w-1/2 border-r border-ink/40" />
        </div>
        <p class="mt-2">0 — 10 {{ t('home.map.km') }}</p>
        <p class="mt-1 normal-case tracking-normal opacity-70">{{ t('home.map.credit') }}</p>
      </div>

      <p class="absolute bottom-8 right-8 hidden text-right lg:bottom-14 lg:right-14 lg:block">
        {{ t('home.map.hint') }}
      </p>
      <p
        ref="readout"
        class="absolute bottom-8 right-8 whitespace-pre bg-surface px-2 py-1 text-right tabular-nums text-ink opacity-0 lg:bottom-14 lg:right-14"
      />
    </div>
  </div>
</template>

<style scoped>
.hud-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: rgb(var(--c-ink) / 0.35);
}

.hud-label {
  /* a halo in the page colour keeps labels readable over dense contours */
  text-shadow:
    0 0 6px rgb(var(--c-surface)),
    0 0 3px rgb(var(--c-surface)),
    0 0 1px rgb(var(--c-surface));
}

.hud-pulse {
  animation: hud-pulse 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes hud-pulse {
  from {
    transform: scale(1);
    opacity: 0.7;
  }
  to {
    transform: scale(6);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hud-pulse {
    animation: none;
  }
}
</style>
