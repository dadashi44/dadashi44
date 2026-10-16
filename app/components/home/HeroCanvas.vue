<script setup lang="ts">
/**
 * Hero backdrop: a living topographic map. Domain-warped noise is drawn as
 * contour lines that drift slowly and light up in the accent colour around
 * the cursor.
 *
 * Plain WebGL2 instead of three.js — one fullscreen triangle and a fragment
 * shader, so the home page doesn't pay for the 3D chunk. Colours come from the
 * theme tokens, so it follows the light/dark switch.
 */
const canvas = ref<HTMLCanvasElement | null>(null)
const failed = ref(false)
const {theme} = useTheme()

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

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);

  float t = u_time * 0.035;
  vec2 q = p * 1.35 + vec2(0.0, u_scroll * 0.6);

  // the cursor raises a soft hill, so the contours bend around it
  float md = length(p - m);
  float hill = exp(-md * md * 7.0) * u_hover;

  vec2 warp = vec2(fbm(q + vec2(0.0, t)), fbm(q + vec2(5.2, 1.3) - t));
  float h = fbm(q + 1.8 * warp + vec2(t * 0.6, -t * 0.4)) + hill * 0.22;

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
}`

let stop: (() => void) | null = null
let applyTheme: (() => void) | null = null

onMounted(() => {
  if (!canvas.value) return
  try {
    stop = setup(canvas.value)
  } catch (err) {
    // the hero must survive a broken GPU — the CSS backdrop stays visible
    console.warn('[HeroCanvas] disabled:', err)
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
    mouse.tx = (e.clientX - rect.left) / rect.width
    mouse.ty = 1 - (e.clientY - rect.top) / rect.height
    mouse.thover = e.pointerType === 'mouse' ? 1 : 0
  }
  const onLeave = () => (mouse.thover = 0)

  const start = performance.now()
  let running = false
  let visible = true
  let frame = 0

  const draw = (now: number) => {
    const time = reduced ? 40 : (now - start) / 1000
    mouse.x += (mouse.tx - mouse.x) * 0.06
    mouse.y += (mouse.ty - mouse.y) * 0.06
    mouse.hover += (mouse.thover - mouse.hover) * 0.04

    gl.uniform1f(uniforms.time, time)
    gl.uniform2f(uniforms.mouse, mouse.x, mouse.y)
    gl.uniform1f(uniforms.hover, mouse.hover)
    // 0 → 1 while the hero crosses the viewport. Read here rather than passed
    // in as a prop, so scrolling never re-renders the parent.
    const rect = surface.getBoundingClientRect()
    gl.uniform1f(uniforms.scroll, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const loop = (now: number) => {
    draw(now)
    frame = requestAnimationFrame(loop)
  }

  const sync = () => {
    const shouldRun = visible && !document.hidden && !reduced
    if (shouldRun === running) return
    running = shouldRun
    if (running) frame = requestAnimationFrame(loop)
    else cancelAnimationFrame(frame)
  }

  // no point burning GPU on a hero that's scrolled away or in a hidden tab
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
  <div class="relative h-full w-full bg-surface-alt">
    <canvas v-show="!failed" ref="canvas" class="block h-full w-full" aria-hidden="true" />
  </div>
</template>
