"""
Bakes the Almaty heightmap used by the terrain map on the home page.

    python3 scripts/bake-terrain.py

Downloads AWS Terrain Tiles (Terrarium encoding, mostly SRTM) for the box
below, reprojects them from Web Mercator to a plain lon/lat grid, softens the
SRTM noise a little and writes `public/terrain/almaty.webp`.

Each pixel stores whole metres above MIN_ELEVATION as a 16-bit number split
across R (high byte) and G (low byte). Lossless WebP keeps it at ~165 KB.
If you change the box or the size, update TERRAIN in TerrainMap.vue — the
script prints the values.

Needs Pillow and numpy; tiles are fetched with curl.
"""
import math
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

LON0, LON1 = 76.3, 77.6
LAT0, LAT1 = 42.95, 43.4
WIDTH = 768
ZOOM = 11
OUT = Path(__file__).resolve().parent.parent / 'public' / 'terrain' / 'almaty.webp'


def tile_x(lon):
    return (lon + 180) / 360 * 2**ZOOM


def tile_y(lat):
    r = math.radians(lat)
    return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2**ZOOM


def fetch_mosaic(cache: Path):
    x0, x1 = int(tile_x(LON0)), int(tile_x(LON1))
    y0, y1 = int(tile_y(LAT1)), int(tile_y(LAT0))
    mosaic = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256))

    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            file = cache / f'{x}_{y}.png'
            url = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{x}/{y}.png'
            subprocess.run(['curl', '-sfo', str(file), url], check=True)
            rgb = np.asarray(Image.open(file).convert('RGB')).astype(np.float64)
            # Terrarium: metres = R * 256 + G + B / 256 - 32768
            height = rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768
            mosaic[(y - y0) * 256:(y - y0 + 1) * 256, (x - x0) * 256:(x - x0 + 1) * 256] = height

    return mosaic, x0, y0


def blur(v, sigma=1.0):
    kernel = np.exp(-np.arange(-3, 4) ** 2 / (2 * sigma**2))
    kernel /= kernel.sum()
    padded = np.pad(v, 3, mode='edge')
    v = sum(k * padded[:, i:i + v.shape[1]] for i, k in enumerate(kernel))[3:-3]
    padded = np.pad(v, ((3, 3), (0, 0)), mode='edge')
    return sum(k * padded[i:i + v.shape[0]] for i, k in enumerate(kernel))


def main():
    with tempfile.TemporaryDirectory() as tmp:
        mosaic, x0, y0 = fetch_mosaic(Path(tmp))

    # same metric aspect as the box, so one pixel is square on the ground
    height = round(WIDTH * (LAT1 - LAT0) / ((LON1 - LON0) * math.cos(math.radians((LAT0 + LAT1) / 2))))
    lons = LON0 + (np.arange(WIDTH) + 0.5) / WIDTH * (LON1 - LON0)
    lats = LAT1 - (np.arange(height) + 0.5) / height * (LAT1 - LAT0)  # row 0 is north

    px = (tile_x(lons) - x0) * 256 - 0.5
    py = (np.array([tile_y(lat) for lat in lats]) - y0) * 256 - 0.5
    X, Y = np.meshgrid(px, py)
    ix, iy = np.floor(X).astype(int), np.floor(Y).astype(int)
    fx, fy = X - ix, Y - iy
    m = mosaic
    grid = (
        m[iy, ix] * (1 - fx) * (1 - fy)
        + m[iy, ix + 1] * fx * (1 - fy)
        + m[iy + 1, ix] * (1 - fx) * fy
        + m[iy + 1, ix + 1] * fx * fy
    )
    grid = blur(grid)

    low = math.floor(grid.min())
    metres = np.round(grid - low).astype(np.uint16)
    rgb = np.zeros((height, WIDTH, 3), np.uint8)
    rgb[..., 0] = metres >> 8
    rgb[..., 1] = metres & 255

    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgb).save(OUT, 'WEBP', lossless=True, quality=100, method=6)

    print(f'{OUT.relative_to(OUT.parents[2])}: {WIDTH}×{height}, {OUT.stat().st_size // 1024} KB')
    print(f'TERRAIN = {{lon0: {LON0}, lon1: {LON1}, lat0: {LAT0}, lat1: {LAT1}, min: {low}}}')


if __name__ == '__main__':
    main()
