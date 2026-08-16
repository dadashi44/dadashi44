# 3D model for the error pages

`SpaceScene.vue` loads `/models/car.glb`. If it is missing or fails to parse, the
scene falls back to a **Lexus IS F built in code** (real proportions, stacked
quad exhausts, vented fender, wide arches).

## Shipping a model

```bash
# drop the raw export here, then:
node scripts/optimize-car.mjs path/to/source.glb
```

The script:

1. **strips the cabin interior** — seats, dashboard, door cards and steering
   wheel are ~38% of the triangles and are never visible behind the tinted
   glass of a car floating in space;
2. runs dedup / prune / weld / join to cut draw calls;
3. resizes textures to 1024 and re-encodes them to WebP;
4. Meshopt-compresses the geometry.

The raw export is not kept in the repo — `car.glb` here is the shipped result.
Re-running the script on it is refused (re-compressing an already-compressed
model degrades it); pass a fresh export if you want to re-tune.

Side and rear glass is turned into a solid dark tint at load time in
`SpaceScene.vue`, so no interior is needed and no transmission render pass runs.

## Choosing a model

On Sketchfab filter by *Downloadable* and license **CC-BY** or **CC0**.
"Editorial" is not usable on a portfolio — it forbids promotional use.
Aim for under ~150k triangles before optimization.
