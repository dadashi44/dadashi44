<script setup lang="ts">
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js'

/**
 * Zero-gravity car drifting in space, used as the backdrop of the error pages.
 *
 * The car is a Lexus IS F built in code, so the page has no asset dependency.
 * Drop a real model at `public/models/car.glb` and it is loaded instead.
 */
const props = withDefaults(defineProps<{modelUrl?: string; accent?: string}>(), {
  modelUrl: '/models/car.glb',
  accent: '#ff6a3d'
})

const canvas = ref<HTMLCanvasElement | null>(null)
const usingRealModel = ref(false)

const failed = ref(false)

onMounted(() => {
  if (!canvas.value) return

  try {
    setupScene()
  } catch (err) {
    // the error page must survive a broken WebGL scene — fall back to the
    // plain starless background rather than blanking the page
    console.warn('[SpaceScene] disabled:', err)
    failed.value = true
  }
})

function setupScene() {
  const surface = canvas.value!


  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const accent = new THREE.Color(props.accent)

  const renderer = new THREE.WebGLRenderer({canvas: surface, antialias: true, alpha: true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  // ── disposal bookkeeping ────────────────────────────────────────────────
  const disposables: {dispose: () => void}[] = []
  const track = <T extends {dispose: () => void}>(item: T) => {
    disposables.push(item)
    return item
  }

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x05060f, 0.012)

  // Metals reflect the environment, not the lights. Without this every
  // `metalness: 1` surface (rims, chrome, paint) renders pitch black.
  const environment = () => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 64
    const ctx = c.getContext('2d')!

    const sky = ctx.createLinearGradient(0, 0, 0, 64)
    sky.addColorStop(0, '#243055')
    sky.addColorStop(0.45, '#0d1226')
    sky.addColorStop(1, '#05060c')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, 128, 64)

    // a bright key reflection and a warm one opposite it
    const spot = (x: number, y: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, color)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 128, 64)
    }
    spot(32, 14, 26, 'rgba(255,255,255,0.95)')
    spot(96, 40, 30, 'rgba(255,106,61,0.5)')

    const tex = track(new THREE.CanvasTexture(c))
    tex.mapping = THREE.EquirectangularReflectionMapping

    const pmrem = new THREE.PMREMGenerator(renderer)
    const envMap = pmrem.fromEquirectangular(tex).texture
    pmrem.dispose()
    return track(envMap)
  }

  scene.environment = environment()
  scene.environmentIntensity = 0.85

  /** on-screen size the model is normalised to in placeModel() */
  const CAR_SIZE = 5.6

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 400)
  camera.position.set(0, 1.15, 9.4)
  camera.lookAt(0, 0, 0)

  /**
   * Pulls the camera back until the car fits both axes. Portrait phones have a
   * far narrower horizontal field of view, so a fixed distance cropped the car;
   * they also get extra padding so it does not fill the whole screen.
   */
  const fitCamera = () => {
    const aspect = window.innerWidth / window.innerHeight
    camera.aspect = aspect

    const vFov = (camera.fov * Math.PI) / 180
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
    const radius = (CAR_SIZE / 2) * (aspect < 0.9 ? 1.18 : 1.02)

    camera.position.z = Math.max(radius / Math.tan(vFov / 2), radius / Math.tan(hFov / 2))
    camera.updateProjectionMatrix()
  }
  // the moon lives on its own layer so the warm rim light never tints it
  camera.layers.enable(1)

  // ── stars ───────────────────────────────────────────────────────────────
  const starCount = 2600
  const starPos = new Float32Array(starCount * 3)
  const starSize = new Float32Array(starCount)

  for (let i = 0; i < starCount; i++) {
    // shell of stars around the camera, kept off the very centre
    const radius = 40 + Math.random() * 120
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    starPos[i * 3 + 1] = radius * Math.cos(phi)
    starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    starSize[i] = Math.random() < 0.06 ? 2.4 : 0.5 + Math.random()
  }

  const starGeo = track(new THREE.BufferGeometry())
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  starGeo.setAttribute('size', new THREE.BufferAttribute(starSize, 1))

  const starMat = track(
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.55,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    })
  )
  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)

  // ── nebula glow (canvas texture, no external asset) ─────────────────────
  const nebulaTexture = () => {
    const size = 512
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!

    const blobs: [number, number, number, string][] = [
      [0.32, 0.34, 0.42, 'rgba(70,90,220,0.55)'],
      [0.68, 0.28, 0.30, 'rgba(255,106,61,0.30)'],
      [0.55, 0.72, 0.38, 'rgba(40,60,160,0.42)']
    ]

    for (const [x, y, r, color] of blobs) {
      const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size)
      g.addColorStop(0, color)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, size, size)
    }

    return track(new THREE.CanvasTexture(c))
  }

  const nebula = new THREE.Mesh(
    track(new THREE.PlaneGeometry(340, 200)),
    track(
      new THREE.MeshBasicMaterial({
        map: nebulaTexture(),
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    )
  )
  nebula.position.set(-10, 8, -120)
  scene.add(nebula)

  // ── moon ────────────────────────────────────────────────────────────────
  const moonTexture = () => {
    const size = 512
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!

    ctx.fillStyle = '#8d8578'
    ctx.fillRect(0, 0, size, size)

    // craters + maria, deterministic enough to look natural
    for (let i = 0; i < 420; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const r = Math.random() * 16 + 2
      const shade = Math.random() * 40 - 20
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${120 + shade},${112 + shade},${100 + shade},0.55)`
      ctx.fill()
    }

    for (let i = 0; i < 8; i++) {
      const g = ctx.createRadialGradient(
        Math.random() * size,
        Math.random() * size,
        0,
        Math.random() * size,
        Math.random() * size,
        90 + Math.random() * 80
      )
      g.addColorStop(0, 'rgba(70,66,60,0.5)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, size, size)
    }

    return track(new THREE.CanvasTexture(c))
  }

  const moon = new THREE.Mesh(
    track(new THREE.SphereGeometry(16, 48, 48)),
    track(new THREE.MeshStandardMaterial({map: moonTexture(), roughness: 1, metalness: 0}))
  )
  moon.position.set(26, 13, -72)
  moon.layers.set(1)
  scene.add(moon)

  // ── lights ──────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x2a3350, 1.1))

  const key = new THREE.DirectionalLight(0xffffff, 2.8)
  key.position.set(-7, 9, 7)
  key.layers.enable(1) // also lights the moon
  scene.add(key)

  const rim = new THREE.DirectionalLight(accent, 3.4)
  rim.position.set(8, -1, -7)
  scene.add(rim)

  const fill = new THREE.PointLight(0x6f86c9, 45, 34)
  fill.position.set(5, 3.5, 7)
  scene.add(fill)

  const underGlow = new THREE.PointLight(accent, 40, 14)
  underGlow.position.set(0, -2.2, 1)
  scene.add(underGlow)

  // ── car ─────────────────────────────────────────────────────────────────
  const carGroup = new THREE.Group()
  scene.add(carGroup)

  /**
   * Lexus IS F (2008–2014), modelled to the real car's proportions:
   * 4.66 m long, 1.82 m wide, 1.42 m tall, 2.73 m wheelbase, 19" wheels.
   *
   * The recognisable cues are the ones worth the polygons — stacked quad
   * exhausts, the vented front fender, the bulged hood and the wide arches.
   */
  const buildLexusIsF = () => {
    const car = new THREE.Group()

    const BODY_HALF = 0.75 // body sides sit inboard of the wheels
    const TRACK = 0.8 // wheel centre offset
    const WHEEL_R = 0.33
    const AXLE_F = 1.35
    const AXLE_R = -1.38

    const paint = track(new THREE.MeshStandardMaterial({color: 0xe9ecef, metalness: 0.9, roughness: 0.2}))
    const glass = track(
      new THREE.MeshStandardMaterial({
        color: 0x0a0e18,
        metalness: 0.65,
        roughness: 0.07,
        transparent: true,
        opacity: 0.88
      })
    )
    const trim = track(new THREE.MeshStandardMaterial({color: 0x12141a, metalness: 0.45, roughness: 0.65}))
    const mesh = track(new THREE.MeshStandardMaterial({color: 0x05070c, metalness: 0.3, roughness: 0.85}))
    const chrome = track(new THREE.MeshStandardMaterial({color: 0xb9c0c9, metalness: 1, roughness: 0.18}))
    const rubber = track(new THREE.MeshStandardMaterial({color: 0x0c0d10, roughness: 0.96}))
    const rimMat = track(new THREE.MeshStandardMaterial({color: 0xa8aeb8, metalness: 0.95, roughness: 0.24}))
    const caliper = track(new THREE.MeshStandardMaterial({color: 0xd8541f, metalness: 0.4, roughness: 0.5}))
    const lightMat = track(
      new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xe4ecff, emissiveIntensity: 2.2})
    )
    const tailMat = track(
      new THREE.MeshStandardMaterial({color: 0xff2f2f, emissive: 0xff2f2f, emissiveIntensity: 2.6})
    )

    const extrude = (points: [number, number][], depth: number, material: THREE.Material, bevel = 0.04) => {
      const shape = new THREE.Shape()
      shape.moveTo(points[0]![0], points[0]![1])
      points.slice(1).forEach(([x, y]) => shape.lineTo(x, y))
      shape.closePath()

      const geo = track(
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: bevel > 0,
          bevelThickness: bevel,
          bevelSize: bevel,
          bevelSegments: 2
        })
      )
      geo.translate(0, 0, -depth / 2)
      return new THREE.Mesh(geo, material)
    }

    const box = (w: number, h: number, d: number, material: THREE.Material, pos: [number, number, number]) => {
      const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), material)
      m.position.set(...pos)
      return m
    }

    // ── body: sedan side profile up to the beltline ──────────────────────
    car.add(
      extrude(
        [
          [2.33, 0.44],
          [2.3, 0.64],
          [2.08, 0.82],
          [1.55, 0.87],
          [0.75, 0.93],
          [0.3, 0.96],
          [-1.05, 0.97],
          [-1.75, 0.95],
          [-2.2, 0.9],
          [-2.33, 0.8],
          [-2.36, 0.5],
          [-2.25, 0.28],
          [-1.6, 0.22],
          [1.6, 0.22],
          [2.2, 0.26]
        ],
        BODY_HALF * 2,
        paint
      )
    )

    // ── greenhouse: four-door glasshouse, narrower than the body ─────────
    car.add(
      extrude(
        [
          [0.8, 0.93],
          [0.1, 1.38],
          [-1.05, 1.4],
          [-1.62, 0.95]
        ],
        1.5,
        glass
      )
    )

    // roof panel and pillars in body colour
    car.add(box(1.1, 0.05, 1.46, paint, [-0.48, 1.4, 0]))
    for (const z of [0.73, -0.73]) {
      car.add(box(0.07, 0.5, 0.05, paint, [-0.2, 1.16, z])) // B-pillar
      car.add(box(0.09, 0.46, 0.05, paint, [-1.32, 1.15, z])) // C-pillar
    }

    // ── wheel arches ─────────────────────────────────────────────────────
    const archShape = (inner: number, outer: number) => {
      const shape = new THREE.Shape()
      shape.moveTo(-outer, 0)
      shape.absarc(0, 0, outer, Math.PI, 0, true)
      shape.lineTo(inner, 0)
      shape.absarc(0, 0, inner, 0, Math.PI, false)
      shape.closePath()
      return shape
    }

    const archGeo = track(
      new THREE.ExtrudeGeometry(archShape(WHEEL_R + 0.02, WHEEL_R + 0.14), {
        depth: 0.34,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
        curveSegments: 18
      })
    )
    archGeo.translate(0, 0, -0.17)

    for (const x of [AXLE_F, AXLE_R]) {
      for (const z of [TRACK, -TRACK]) {
        const arch = new THREE.Mesh(archGeo, paint)
        arch.position.set(x, WHEEL_R, z * 0.98)
        car.add(arch)
      }
    }

    // ── wheels: 19" split five-spoke ─────────────────────────────────────
    const tyreGeo = track(new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.26, 30))
    const dishGeo = track(new THREE.CylinderGeometry(WHEEL_R - 0.07, WHEEL_R - 0.07, 0.28, 26))
    const hubGeo = track(new THREE.CylinderGeometry(0.07, 0.07, 0.32, 14))
    const spokeGeo = track(new THREE.BoxGeometry(0.04, WHEEL_R - 0.1, 0.05))
    const discGeo = track(new THREE.CylinderGeometry(WHEEL_R - 0.11, WHEEL_R - 0.11, 0.04, 22))

    for (const x of [AXLE_F, AXLE_R]) {
      for (const z of [TRACK, -TRACK]) {
        const wheel = new THREE.Group()

        const tyre = new THREE.Mesh(tyreGeo, rubber)
        tyre.rotation.x = Math.PI / 2
        wheel.add(tyre)

        const dish = new THREE.Mesh(dishGeo, rimMat)
        dish.rotation.x = Math.PI / 2
        wheel.add(dish)

        const brake = new THREE.Mesh(discGeo, trim)
        brake.rotation.x = Math.PI / 2
        wheel.add(brake)

        // ten spokes, paired into five like the factory BBS wheel
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2 + (i % 2 ? 0.16 : -0.16)
          const spoke = new THREE.Mesh(spokeGeo, rimMat)
          spoke.position.set(Math.cos(angle) * (WHEEL_R - 0.14), Math.sin(angle) * (WHEEL_R - 0.14), 0.1)
          spoke.rotation.z = angle - Math.PI / 2
          wheel.add(spoke)
        }

        const hub = new THREE.Mesh(hubGeo, chrome)
        hub.rotation.x = Math.PI / 2
        wheel.add(hub)

        wheel.add(box(0.06, 0.16, 0.1, caliper, [-0.16, 0.02, 0]))

        wheel.position.set(x, WHEEL_R, z)
        car.add(wheel)
      }
    }

    // ── front: grille, intakes, lights, bulged hood ──────────────────────
    car.add(box(0.06, 0.2, 0.86, mesh, [2.31, 0.6, 0])) // upper grille
    car.add(box(0.06, 0.02, 0.88, chrome, [2.33, 0.71, 0])) // grille bar
    car.add(box(0.08, 0.18, 0.5, mesh, [2.29, 0.36, 0])) // centre lower intake
    for (const z of [0.52, -0.52]) {
      car.add(box(0.07, 0.16, 0.3, mesh, [2.26, 0.38, z])) // corner intakes
      car.add(box(0.2, 0.13, 0.38, lightMat, [2.18, 0.76, z])) // headlights
    }
    car.add(box(0.62, 0.05, 0.24, chrome, [2.05, 0.24, 0])) // front lip
    car.add(box(1.0, 0.05, 0.72, paint, [1.5, 0.9, 0])) // hood power dome
    car.add(box(0.26, 0.03, 0.3, mesh, [1.92, 0.93, 0])) // hood vent

    // ── sides: fender vents, door cuts, mirrors, handles ─────────────────
    for (const z of [BODY_HALF + 0.02, -(BODY_HALF + 0.02)]) {
      car.add(box(0.24, 0.14, 0.03, mesh, [0.86, 0.64, z])) // IS F fender vent
      car.add(box(0.03, 0.15, 0.04, chrome, [0.74, 0.64, z])) // vent fin
      car.add(box(0.02, 0.62, 0.03, trim, [0.3, 0.6, z])) // front door cut
      car.add(box(0.02, 0.6, 0.03, trim, [-0.85, 0.6, z])) // rear door cut
      car.add(box(0.14, 0.04, 0.03, chrome, [0.02, 0.83, z])) // handles
      car.add(box(0.14, 0.04, 0.03, chrome, [-1.15, 0.83, z]))
      car.add(box(1.9, 0.05, 0.04, chrome, [-0.4, 0.9, z])) // beltline trim
      car.add(box(0.5, 0.06, 0.05, trim, [-0.4, 0.23, z])) // side skirt
    }

    for (const z of [0.86, -0.86]) {
      car.add(box(0.2, 0.08, 0.12, paint, [0.68, 1.0, z])) // mirror shell
      car.add(box(0.05, 0.05, 0.08, trim, [0.78, 0.96, z])) // mirror stalk
    }

    // ── rear: lights, lip spoiler, diffuser ──────────────────────────────
    for (const z of [0.56, -0.56]) {
      car.add(box(0.12, 0.16, 0.44, tailMat, [-2.33, 0.74, z]))
    }
    car.add(box(0.1, 0.04, 0.7, tailMat, [-2.32, 0.62, 0])) // reflector strip
    car.add(box(0.16, 0.05, 1.24, paint, [-2.22, 0.93, 0])) // trunk lip spoiler
    car.add(box(0.36, 0.14, 1.2, trim, [-2.2, 0.24, 0])) // diffuser
    for (const z of [0.2, 0, -0.2]) {
      car.add(box(0.3, 0.14, 0.04, mesh, [-2.22, 0.24, z])) // diffuser fins
    }

    // ── the giveaway: stacked quad exhausts ──────────────────────────────
    const tipGeo = track(new THREE.CylinderGeometry(0.058, 0.062, 0.16, 16))
    const tipInner = track(new THREE.CylinderGeometry(0.042, 0.042, 0.17, 14))
    for (const z of [0.4, -0.4]) {
      for (const y of [0.46, 0.33]) {
        const tip = new THREE.Mesh(tipGeo, chrome)
        tip.rotation.z = Math.PI / 2
        tip.position.set(-2.36, y, z)
        car.add(tip)

        const hole = new THREE.Mesh(tipInner, mesh)
        hole.rotation.z = Math.PI / 2
        hole.position.set(-2.38, y, z)
        car.add(hole)
      }
    }

    car.position.y = -0.7
    return car
  }

  const placeModel = (object: THREE.Object3D) => {
    // normalise whatever comes in to a consistent on-screen size
    const bounds = new THREE.Box3().setFromObject(object)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const scale = 5.6 / Math.max(size.x, size.y, size.z)

    object.position.sub(center)
    object.scale.setScalar(scale)

    const wrapper = new THREE.Group()
    wrapper.add(object)
    return wrapper
  }

  let car: THREE.Object3D | null = null

  const showCar = (object: THREE.Object3D) => {
    if (car) carGroup.remove(car)
    car = placeModel(object)
    carGroup.add(car)
  }

  // swap in a real model when one is present
  const loader = new GLTFLoader()
  // the shipped car.glb is Meshopt-compressed by scripts/optimize-car.mjs
  loader.setMeshoptDecoder(MeshoptDecoder)

  loader.load(
    props.modelUrl,
    (gltf) => {
      // The cabin geometry is stripped out by scripts/optimize-car.mjs, so the
      // side and rear glass is turned into a solid limo tint: nothing to see
      // through, no transmission render pass, and it reads as dark glass.
      const isWindow = (name: string) => /window|d_glass/i.test(name) && !/light/i.test(name)

      gltf.scene.traverse((child) => {
        const material = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
        if (!material) return

        material.envMapIntensity = 1.1

        if (isWindow(material.name) || material.transmission) {
          material.transmission = 0
          material.transparent = false
          material.opacity = 1
          material.depthWrite = true
          material.color = new THREE.Color(0x06080e)
          material.metalness = 0.2
          material.roughness = 0.06
          material.clearcoat = 1
          material.clearcoatRoughness = 0.04
          material.envMapIntensity = 1.7
          material.needsUpdate = true
        }
      })

      showCar(gltf.scene)
      usingRealModel.value = true
    },
    undefined,
    () => {
      // no model shipped or it failed to parse — fall back to the coded IS F
      showCar(buildLexusIsF())
    }
  )

  // ── interaction + loop ──────────────────────────────────────────────────
  const pointer = {x: 0, y: 0}
  const onPointerMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onPointerMove, {passive: true})

  const onResize = () => {
    fitCamera()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)
  fitCamera()

  carGroup.rotation.set(0.12, -0.6, 0.06)

  let raf = 0
  let running = true
  const clock = new THREE.Clock()

  const render = () => {
    const t = clock.getElapsedTime()

    // slow zero-gravity tumble
    carGroup.rotation.y = -0.6 + t * 0.18
    carGroup.rotation.z = 0.06 + Math.sin(t * 0.4) * 0.07
    carGroup.rotation.x = 0.12 + Math.sin(t * 0.29) * 0.05
    carGroup.position.y = -0.15 + Math.sin(t * 0.5) * 0.2

    stars.rotation.y = t * 0.006
    moon.rotation.y = t * 0.01

    // gentle parallax toward the pointer
    camera.position.x += (pointer.x * 1.1 - camera.position.x) * 0.03
    camera.position.y += (1.6 - pointer.y * 0.7 - camera.position.y) * 0.03
    camera.lookAt(0, -0.1, 0)

    renderer.render(scene, camera)
    raf = requestAnimationFrame(render)
  }

  if (reduced) {
    renderer.render(scene, camera)
  } else {
    render()
  }

  const onVisibility = () => {
    if (reduced) return
    if (document.hidden && running) {
      cancelAnimationFrame(raf)
      running = false
    } else if (!document.hidden && !running) {
      running = true
      render()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('resize', onResize)
    document.removeEventListener('visibilitychange', onVisibility)
    disposables.forEach((item) => item.dispose())
    renderer.dispose()
  })
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden bg-[#05060f]" aria-hidden="true">
    <canvas ref="canvas" class="h-full w-full" :class="failed ? 'opacity-0' : ''" />
    <!-- keeps the copy readable over the brighter parts of the scene -->
    <div
      class="absolute inset-0"
      style="background: radial-gradient(70% 55% at 50% 45%, rgba(5,6,15,0.72) 0%, rgba(5,6,15,0.25) 55%, rgba(5,6,15,0.8) 100%)"
    />
  </div>
</template>
