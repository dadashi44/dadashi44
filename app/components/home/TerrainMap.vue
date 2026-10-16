<script setup lang="ts">
/**
 * A living topographic map of Almaty for the location section. Domain-warped noise is drawn as
 * contour lines that drift slowly and light up in the accent colour around
 * the cursor.
 *
 * Plain WebGL2 instead of three.js — one fullscreen triangle and a fragment
 * shader, so the home page doesn't pay for the 3D chunk. Colours come from the
 * theme tokens, so it follows the light/dark switch.
 */
const {t} = useI18n()
const {theme} = useTheme()

const canvas = ref<HTMLCanvasElement | null>(null)
const readout = ref<HTMLElement | null>(null)
const failed = ref(false)

/** Almaty sits under the marker; the cursor readout is relative to it */
const ORIGIN = {lat: 43.2389, lon: 76.8897}
const MARKER = {x: 0.64, y: 0.38}
const SPAN = {lat: 0.12, lon: 0.2}

const coords = (x: number, y: number) => ({
  lat: ORIGIN.lat + (MARKER.y - y) * SPAN.lat,
  lon: ORIGIN.lon + (x - MARKER.x) * SPAN.lon
})
const fmt = (value: number, pos: string, neg: string) => `${Math.abs(value).toFixed(4)}°${value >= 0 ? pos : neg}`
const originLabel = `${fmt(ORIGIN.lat, 'N', 'S')} ${fmt(ORIGIN.lon, 'E', 'W')}`

const VERTEX = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`

const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;
uniform float u_scroll;
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

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.03;
    a *= 0.5;
  }
  return v;
}

// terrain height at a point; m is the cursor in the same space
float height(vec2 p, vec2 m) {
  float t = u_time * 0.035;
  vec2 q = p * 1.35 + vec2(0.0, u_scroll * 0.6);

  // the cursor raises a soft hill, so the contours bend around it
  float md = length(p - m);
  float hill = exp(-md * md * 7.0) * u_hover;

  vec2 warp = vec2(fbm(q + vec2(0.0, t)), fbm(q + vec2(5.2, 1.3) - t));
  return fbm(q + 1.8 * warp + vec2(t * 0.6, -t * 0.4)) + hill * 0.22;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);
  float md = length(p - m);
  float h = height(p, m);

  float bands = h * 16.0;
  float w = fwidth(bands);
  float f = fract(bands);
  float d = min(f, 1.0 - f);

  // every fifth contour is an index line, like on a real survey map
  float major = step(mod(floor(bands + 0.5), 5.0), 0.5);
  float width = mix(0.9, 1.8, major);
  float line = 1.0 - smoothstep(0.0, w * width, d);

  vec3 col = mix(u_bg, u_bgAlt, smoothstep(0.25, 0.85, h) * 0.55);

  float glow = exp(-md * md * 5.0) * u_hover;
  vec3 lineCol = mix(u_ink, u_accent, clamp(glow * 1.6 + smoothstep(0.74, 0.8, h) * 0.8, 0.0, 1.0));
  float alpha = mix(0.16, 0.42, major) + glow * 0.5;
  col = mix(col, lineCol, line * alpha);

  // edge falloff keeps the lines from crowding the frame
  vec2 uv = frag / u_res;
  float vig = smoothstep(0.0, 0.35, uv.x) * smoothstep(1.0, 0.65, uv.x) * smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
  col = mix(u_bg, col, 0.35 + 0.65 * vig);

  col += (hash(frag + fract(u_time)) - 0.5) * 0.025;
  outColor = vec4(col, 1.0);

  // The bottom-left pixel doubles as a probe: it stores the height under the
  // cursor (16-bit, in R and G) so the readout shows the real terrain.
  if (frag.x < 1.0 && frag.y < 1.0) {
    float v = clamp(height(m, m) / 1.5, 0.0, 1.0) * 255.0;
    outColor = vec4(floor(v) / 255.0, fract(v), 0.0, 1.0);
  }
}`

let stop: (() => void) | null = null
let applyTheme: (() => void) | null = null

onMounted(() => {
  if (!canvas.value) return
  try {
    stop = setup(canvas.value)
  } catch (err) {
    // the section must survive a broken GPU — the CSS backdrop stays visible
    console.warn('[TerrainMap] disabled:', err)
    failed.value = true
  }
})

// the theme toggles a class on <html>; re-read the tokens once it has applied
watch(theme, () => nextTick(() => applyTheme?.()))

onBeforeUnmount(() => stop?.())

function setup(surface: HTMLCanvasElement) {
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

  const u = (name: string) => gl.getUniformLocation(program, name)
  const uniforms = {
    res: u('u_res'),
    time: u('u_time'),
    mouse: u('u_mouse'),
    hover: u('u_hover'),
    scroll: u('u_scroll'),
    bg: u('u_bg'),
    bgAlt: u('u_bgAlt'),
    ink: u('u_ink'),
    accent: u('u_accent')
  }

  const token = (name: string) =>
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
      .split(/\s+/)
      .map((c) => Number(c) / 255) as [number, number, number]

  applyTheme = () => {
    gl.uniform3fv(uniforms.bg, token('--c-surface'))
    gl.uniform3fv(uniforms.bgAlt, token('--c-surface-alt'))
    gl.uniform3fv(uniforms.ink, token('--c-ink'))
    gl.uniform3fv(uniforms.accent, token('--c-accent'))
    if (!running) draw(performance.now())
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    surface.width = Math.round(surface.clientWidth * dpr)
    surface.height = Math.round(surface.clientHeight * dpr)
    gl.viewport(0, 0, surface.width, surface.height)
    gl.uniform2f(uniforms.res, surface.width, surface.height)
    if (!running) draw(performance.now())
  }

  // pointer is eased towards its target so the glow trails the cursor
  const mouse = {x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, hover: 0, thover: 0}

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

  const start = performance.now()
  let running = false
  let visible = true
  let frame = 0

  // probe pixel → metres; the city floor is ~700 m, the ridges ~3300 m
  const probe = new Uint8Array(4)
  const elevation = () => {
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, probe)
    const h = ((probe[0]! + probe[1]! / 255) / 255) * 1.5
    return Math.round(700 + h * 2600)
  }

  // written straight into the DOM: a reactive ref here would re-render 60×/s
  const updateReadout = () => {
    const el = readout.value
    if (!el) return
    el.style.opacity = String(mouse.hover)
    if (mouse.hover < 0.05) return
    const {lat, lon} = coords(mouse.x, 1 - mouse.y)
    el.textContent = `${fmt(lat, 'N', 'S')}  ${fmt(lon, 'E', 'W')}  ·  ${elevation()} ${t('home.map.metres')}`
  }

  const draw = (now: number) => {
    const time = reduced ? 40 : (now - start) / 1000
    mouse.x += (mouse.tx - mouse.x) * 0.06
    mouse.y += (mouse.ty - mouse.y) * 0.06
    mouse.hover += (mouse.thover - mouse.hover) * 0.04

    gl.uniform1f(uniforms.time, time)
    gl.uniform2f(uniforms.mouse, mouse.x, mouse.y)
    gl.uniform1f(uniforms.hover, mouse.hover)
    // 0 → 1 while the map crosses the viewport. Read here rather than passed
    // in as a prop, so scrolling never re-renders the parent.
    const rect = surface.getBoundingClientRect()
    gl.uniform1f(uniforms.scroll, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  let tick = 0
  const loop = (now: number) => {
    draw(now)
    // a sync readPixels every frame would stall the GPU; ~15 Hz is plenty
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
    gl.deleteBuffer(buffer)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteProgram(program)
    applyTheme = null
  }
}
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-surface-alt">
    <canvas v-show="!failed" ref="canvas" class="block h-full w-full" aria-hidden="true" />

    <!-- survey-sheet overlay: decorative, so hidden from assistive tech -->
    <div
      class="pointer-events-none absolute inset-0 font-display text-[11px] uppercase tracking-[0.25em] text-ink-faint lg:text-xs"
      aria-hidden="true"
    >
      <span class="hud-corner left-4 top-4 border-l border-t lg:left-8 lg:top-8" />
      <span class="hud-corner right-4 top-4 border-r border-t lg:right-8 lg:top-8" />
      <span class="hud-corner bottom-4 left-4 border-b border-l lg:bottom-8 lg:left-8" />
      <span class="hud-corner bottom-4 right-4 border-b border-r lg:bottom-8 lg:right-8" />

      <div class="absolute left-8 top-8 lg:left-14 lg:top-14">
        <p class="text-ink-soft">{{ t('home.map.sheet') }}</p>
        <p class="mt-1">{{ t('home.map.place') }}</p>
      </div>

      <p class="absolute right-8 top-8 text-right lg:right-14 lg:top-14">{{ originLabel }}</p>

      <!-- marker over Almaty -->
      <div class="absolute" :style="{left: `${MARKER.x * 100}%`, top: `${MARKER.y * 100}%`}">
        <span class="absolute -left-1 -top-1 block h-2 w-2 rounded-full bg-accent" />
        <span class="hud-pulse absolute -left-1 -top-1 block h-2 w-2 rounded-full bg-accent" />
        <span class="absolute left-4 top-0 h-px w-10 bg-ink/30" />
        <span class="absolute left-16 -top-[0.6em] whitespace-nowrap text-ink">{{ t('home.map.marker') }}</span>
      </div>

      <div class="absolute bottom-8 left-8 lg:bottom-14 lg:left-14">
        <div class="flex h-2 w-28 border-x border-b border-ink/40 lg:w-36">
          <span class="w-1/2 border-r border-ink/40" />
        </div>
        <p class="mt-2">0 — 5 {{ t('home.map.km') }}</p>
      </div>

      <p class="absolute bottom-8 right-8 hidden text-right lg:bottom-14 lg:right-14 lg:block">
        <span class="hud-hint">{{ t('home.map.hint') }}</span>
      </p>
      <p
        ref="readout"
        class="absolute bottom-8 right-8 whitespace-pre bg-surface-alt/80 px-2 py-1 text-right tabular-nums text-ink opacity-0 lg:bottom-14 lg:right-14"
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
