/**
 * Prepares a car model for the error pages.
 *
 *   node scripts/optimize-car.mjs <source.glb>   # from a fresh export
 *   node scripts/optimize-car.mjs                # re-run on public/models/car.glb
 *
 * Step 1 strips the cabin interior. The car floats in space behind tinted
 * glass — seats, dashboard and steering wheel are never visible, and they were
 * ~38% of the triangles of the IS F export.
 *
 * Step 2 is the usual pipeline: dedup, prune, weld, join draw calls, resize and
 * re-encode textures to WebP, then Meshopt-compress the geometry. The loader in
 * SpaceScene.vue is wired with MeshoptDecoder to match.
 */
import {execFileSync} from 'node:child_process'
import {statSync, rmSync, readFileSync} from 'node:fs'
import {NodeIO} from '@gltf-transform/core'
import {ALL_EXTENSIONS} from '@gltf-transform/extensions'
import {prune} from '@gltf-transform/functions'

const OUTPUT = 'public/models/car.glb'
const SOURCE = process.argv[2] ?? OUTPUT
const STAGE = 'public/models/.car.stripped.glb'

/** meshes whose names match are dropped before compression */
const DROP = /_INT_|INTERIOR|STEERING_WHEEL|SEAT|DASH/i

/**
 * Reads `extensionsUsed` straight from the GLB header. This has to happen
 * before NodeIO touches the file: reading a Meshopt-compressed GLB needs a
 * decoder registered, and it throws before any guard downstream could run.
 */
const usesMeshopt = (path) => {
  const buffer = readFileSync(path)
  if (buffer.subarray(0, 4).toString() !== 'glTF') return false
  const jsonLength = buffer.readUInt32LE(12)
  const json = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString())
  return (json.extensionsUsed ?? []).includes('EXT_meshopt_compression')
}

// Re-compressing an already-optimized file quantizes what was already
// quantized and re-encodes lossy textures a second time. Bail out instead.
if (usesMeshopt(SOURCE) && SOURCE === OUTPUT) {
  console.error(
    `${SOURCE} is already Meshopt-compressed.\n` +
      'Re-running would degrade it. Pass the original export instead:\n' +
      '  node scripts/optimize-car.mjs path/to/source.glb'
  )
  process.exit(1)
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)

const before = statSync(SOURCE).size
const document = await io.read(SOURCE)
const root = document.getRoot()

let dropped = 0
for (const node of root.listNodes()) {
  const mesh = node.getMesh()
  if (!mesh) continue
  if (DROP.test(node.getName()) || DROP.test(mesh.getName())) {
    node.dispose()
    dropped++
  }
}

await document.transform(prune())
await io.write(STAGE, document)
console.log(`dropped ${dropped} interior nodes`)

execFileSync(
  'npx',
  [
    'gltf-transform',
    'optimize',
    STAGE,
    OUTPUT,
    '--compress', 'meshopt',
    '--texture-compress', 'webp',
    '--texture-size', '1024',
    '--simplify', 'false' // geometry is already light; keep the silhouette exact
  ],
  {stdio: 'inherit'}
)

rmSync(STAGE, {force: true})

const after = statSync(OUTPUT).size
console.log(
  `\n${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024).toFixed(0)} KB ` +
    `(−${Math.round((1 - after / before) * 100)}%)`
)
