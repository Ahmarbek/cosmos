import * as THREE from 'three';
import { ALL_LAND, type Poly } from '../data/landmasses';
import { fbm2, fbmTile, mulberry32 } from './noise';

/**
 * Bakes Earth's day, night and cloud maps into canvases at load time.
 *
 * Nothing here is a photograph. Coastlines come from the coarse polygon set,
 * terrain colour and cloud structure come from noise, and the night side is lit
 * from real city coordinates. If genuine public-domain imagery is placed in
 * /public/textures (earth_day.jpg, earth_night.jpg, earth_clouds.jpg) it is
 * loaded instead — see loadEarthTextures below.
 */

const W = 1024;
const H = 512;

const lonLatToXY = (lon: number, lat: number) => [
  ((lon + 180) / 360) * W,
  ((90 - lat) / 180) * H,
];

function tracePoly(ctx: CanvasRenderingContext2D, poly: Poly, dx = 0) {
  ctx.beginPath();
  poly.forEach(([lon, lat], i) => {
    const [x, y] = lonLatToXY(lon, lat);
    if (i === 0) ctx.moveTo(x + dx, y);
    else ctx.lineTo(x + dx, y);
  });
  ctx.closePath();
}

/** Major population centres — approximate coordinates, used to place night light. */
const CITIES: [number, number, number][] = [
  [-74, 40.7, 1], [-87.6, 41.9, 0.7], [-118, 34, 0.95], [-95.4, 29.8, 0.6],
  [-79.4, 43.7, 0.6], [-99.1, 19.4, 0.85], [-58.4, -34.6, 0.7], [-46.6, -23.5, 0.85],
  [-43.2, -22.9, 0.6], [-70.7, -33.4, 0.5], [-77, -12, 0.55], [-3.7, 40.4, 0.6],
  [2.35, 48.85, 0.85], [-0.13, 51.5, 0.9], [4.9, 52.4, 0.55], [13.4, 52.5, 0.7],
  [12.5, 41.9, 0.6], [9.2, 45.5, 0.55], [30.5, 50.5, 0.5], [37.6, 55.75, 0.8],
  [28.98, 41, 0.75], [31.2, 30, 0.75], [3.4, 6.5, 0.7], [28, -26.2, 0.6],
  [18.4, -33.9, 0.5], [36.8, -1.3, 0.45], [55.3, 25.3, 0.7], [51.4, 35.7, 0.6],
  [72.8, 19, 0.9], [77.2, 28.6, 0.9], [88.4, 22.6, 0.75], [80.3, 13.1, 0.6],
  [67, 24.9, 0.7], [90.4, 23.8, 0.7], [100.5, 13.75, 0.7], [106.8, -6.2, 0.8],
  [103.8, 1.35, 0.6], [116.4, 39.9, 0.9], [121.5, 31.2, 0.95], [113.3, 23.1, 0.85],
  [114.2, 22.3, 0.7], [126.98, 37.57, 0.85], [139.7, 35.7, 1], [135.5, 34.7, 0.75],
  [151.2, -33.9, 0.6], [144.96, -37.8, 0.55], [174.8, -36.85, 0.4],
  [-122.4, 37.8, 0.7], [-122.3, 47.6, 0.5], [-80.2, 25.8, 0.55], [-84.4, 33.7, 0.5],
  [-104.99, 39.7, 0.4], [-97.7, 30.3, 0.45], [-71.06, 42.36, 0.55], [-75.2, 40, 0.55],
  [24.9, 60.2, 0.4], [18.1, 59.3, 0.45], [10.75, 59.9, 0.4], [-6.26, 53.35, 0.4],
  [14.4, 50.1, 0.45], [19.0, 47.5, 0.45], [21.0, 52.2, 0.5], [8.68, 50.1, 0.5],
  [-9.14, 38.7, 0.45], [23.7, 38.0, 0.45], [35.2, 31.8, 0.5], [39.2, 21.5, 0.45],
  [46.7, 24.7, 0.55], [105.8, 21, 0.55], [96.2, 16.8, 0.4], [79.9, 6.9, 0.4],
  [-66.9, 10.5, 0.45], [-74.1, 4.6, 0.55], [-78.5, -0.2, 0.4], [-56.2, -34.9, 0.4],
  [153, -27.5, 0.4], [138.6, -34.9, 0.35], [115.86, -31.95, 0.4], [117.2, 39.1, 0.6],
  [108.9, 34.3, 0.6], [104.07, 30.6, 0.6], [126.6, 45.8, 0.5], [129.0, 35.2, 0.5],
];

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export interface EarthMaps {
  day: THREE.Texture;
  night: THREE.Texture;
  clouds: THREE.Texture;
  dispose: () => void;
}

function buildDay(): HTMLCanvasElement {
  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d', { willReadFrequently: true })!;

  // --- ocean: deeper toward the abyssal middle of each basin ---------------
  const og = ctx.createLinearGradient(0, 0, 0, H);
  og.addColorStop(0, '#0a2a4a');
  og.addColorStop(0.25, '#0d3c68');
  og.addColorStop(0.5, '#0f4d80');
  og.addColorStop(0.75, '#0d3c68');
  og.addColorStop(1, '#0a2646');
  ctx.fillStyle = og;
  ctx.fillRect(0, 0, W, H);

  // --- land ---------------------------------------------------------------
  ctx.fillStyle = '#3f6b3a';
  for (const poly of ALL_LAND) {
    // drawn three times so shapes crossing the antimeridian wrap correctly
    for (const dx of [-W, 0, W]) {
      tracePoly(ctx, poly, dx);
      ctx.fill();
    }
  }
  return c;
}

/**
 * Second pass over the flat land/ocean plate: biome colour by latitude and
 * noise, coastal shelves, ice caps — and a separate water mask, kept in its own
 * texture because canvas alpha gets premultiplied on upload.
 */
function shadeDay(plate: HTMLCanvasElement) {
  const ctx = plate.getContext('2d', { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  // an untouched copy to sample from, so the coastline warp below reads the
  // original silhouette rather than pixels it has already rewritten
  const src = Uint8ClampedArray.from(d);

  /**
   * Land test with the lookup displaced by noise. The source polygons are
   * coarse by design, and a straight test against them leaves visibly straight
   * coastlines; warping the sample position breaks every edge into inlets and
   * headlands at no extra authoring cost.
   */
  const landAt = (x: number, y: number) => {
    const wx = fbmTile((x / W) * 26, (y / H) * 13, 26, 3, 41) - 0.5;
    const wy = fbmTile((x / W) * 26 + 5.5, (y / H) * 13 + 5.5, 26, 3, 77) - 0.5;
    const sx = (((Math.round(x + wx * 22) % W) + W) % W) | 0;
    const sy = Math.max(0, Math.min(H - 1, Math.round(y + wy * 16))) | 0;
    const i = (sy * W + sx) * 4;
    return src[i + 1] > src[i + 2];
  };

  const mask = makeCanvas(W, H);
  const mctx = mask.getContext('2d')!;
  const mimg = mctx.createImageData(W, H);
  const m = mimg.data;

  for (let y = 0; y < H; y++) {
    const lat = 90 - (y / H) * 180;
    const latAbs = Math.abs(lat);
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const isLand = landAt(x, y);

      // noise fields, wrapped in x so the seam at the antimeridian is invisible
      const nx = (x / W) * 12;
      const ny = (y / H) * 6;
      const n = fbmTile(nx, ny, 12, 4, 7);
      const n2 = fbmTile(nx * 3.1, ny * 3.1, 37, 3, 19);

      let r: number, g: number, b: number;

      if (isLand) {
        const arid = Math.exp(-Math.pow((latAbs - 24) / 11, 2));       // desert belts
        const boreal = Math.max(0, (latAbs - 46) / 22);                // taiga to tundra
        const elev = n * 0.75 + n2 * 0.35;

        // green base, drifting toward ochre in arid belts and grey at altitude
        r = 46 + elev * 70;
        g = 84 + elev * 58;
        b = 44 + elev * 40;

        const desert = Math.min(1, arid * (0.45 + n * 1.25));
        r = r * (1 - desert) + (168 + n2 * 50) * desert;
        g = g * (1 - desert) + (140 + n2 * 42) * desert;
        b = b * (1 - desert) + (92 + n2 * 30) * desert;

        const cold = Math.min(1, boreal * (0.6 + n * 0.8));
        r = r * (1 - cold) + 128 * cold;
        g = g * (1 - cold) + 134 * cold;
        b = b * (1 - cold) + 130 * cold;

        // permanent ice
        const ice = Math.min(1, Math.max(0, (latAbs - 66 + n * 9) / 8));
        r = r * (1 - ice) + 238 * ice;
        g = g * (1 - ice) + 244 * ice;
        b = b * (1 - ice) + 252 * ice;

        m[i] = 0;
      } else {
        // continental shelf: lighter where the ocean noise runs shallow
        const depth = 0.45 + n * 0.9;
        r = 8 + depth * 14;
        g = 34 + depth * 54;
        b = 70 + depth * 86;

        const ice = Math.min(1, Math.max(0, (latAbs - 70 + n * 8) / 7));
        r = r * (1 - ice) + 226 * ice;
        g = g * (1 - ice) + 236 * ice;
        b = b * (1 - ice) + 248 * ice;

        m[i] = Math.round(255 * (1 - ice));
      }

      d[i] = Math.max(0, Math.min(255, r));
      d[i + 1] = Math.max(0, Math.min(255, g));
      d[i + 2] = Math.max(0, Math.min(255, b));
      d[i + 3] = 255;
      m[i + 1] = m[i];
      m[i + 2] = m[i];
      m[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  mctx.putImageData(mimg, 0, 0);
  return { day: plate, mask };
}

function buildNight(dayPlate: HTMLCanvasElement): HTMLCanvasElement {
  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // land lookup so no light is ever placed in open ocean
  const dctx = dayPlate.getContext('2d', { willReadFrequently: true })!;
  const dd = dctx.getImageData(0, 0, W, H).data;
  const isLand = (x: number, y: number) => {
    const i = ((y | 0) * W + (x | 0)) * 4;
    return dd[i + 1] >= dd[i + 2];
  };

  ctx.globalCompositeOperation = 'lighter';
  const rand = mulberry32(1337);

  for (const [lon, lat, weight] of CITIES) {
    const [cx, cy] = lonLatToXY(lon, lat);

    // metropolitan halo
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 9 + weight * 16);
    halo.addColorStop(0, `rgba(255,206,140,${0.5 * weight})`);
    halo.addColorStop(0.45, `rgba(255,170,90,${0.14 * weight})`);
    halo.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 9 + weight * 16, 0, Math.PI * 2);
    ctx.fill();

    // scattered settlement around it, land only, thinning with distance
    const count = Math.round(50 + weight * 190);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.pow(rand(), 1.9) * (14 + weight * 34);
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr * 0.72;
      if (px < 0 || px >= W || py < 0 || py >= H) continue;
      if (!isLand(px, py)) continue;
      const b = (1 - rr / (14 + weight * 34)) * weight;
      ctx.fillStyle = `rgba(255,${200 + rand() * 55},${120 + rand() * 90},${0.10 + b * 0.55})`;
      ctx.fillRect(px, py, 1 + (rand() < 0.12 ? 1 : 0), 1);
    }
  }

  // sparse rural light everywhere else habitable
  for (let i = 0; i < 14000; i++) {
    const x = rand() * W;
    const y = H * 0.12 + rand() * H * 0.7;
    if (!isLand(x, y)) continue;
    const lat = Math.abs(90 - (y / H) * 180);
    if (lat > 62 && rand() > 0.12) continue;
    ctx.fillStyle = `rgba(255,190,120,${0.05 + rand() * 0.16})`;
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.globalCompositeOperation = 'source-over';
  return c;
}

function buildClouds(): HTMLCanvasElement {
  const cw = 512;
  const ch = 256;
  const c = makeCanvas(cw, ch);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(cw, ch);
  const d = img.data;

  for (let y = 0; y < ch; y++) {
    const lat = 90 - (y / ch) * 180;
    // banded circulation: ITCZ, dry subtropics, storm tracks at mid latitudes
    const itcz = Math.exp(-Math.pow(lat / 12, 2)) * 0.55;
    const dry = -Math.exp(-Math.pow((Math.abs(lat) - 26) / 11, 2)) * 0.42;
    const storm = Math.exp(-Math.pow((Math.abs(lat) - 55) / 15, 2)) * 0.4;
    const belt = 0.34 + itcz + dry + storm;

    for (let x = 0; x < cw; x++) {
      const nx = (x / cw) * 9;
      const ny = (y / ch) * 4.5;
      // domain-warped fbm gives fronts and swirls rather than even mush
      const warp = fbmTile(nx * 0.7, ny * 0.7, 6.3, 3, 3);
      let n = fbmTile(nx + warp * 1.7, ny + warp * 1.1, 9, 5, 11);
      n = n * 1.25 + fbm2(x * 0.06, y * 0.06, 2, 5) * 0.22;
      const v = Math.max(0, n - (1.13 - belt)) * 3.1;
      const a = Math.max(0, Math.min(1, v)) ** 1.25;
      const i = (y * cw + x) * 4;
      const g = Math.round(255 * a);
      d[i] = g;
      d[i + 1] = g;
      d[i + 2] = g;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Anisotropic filtering, which matters more here than anywhere else in the
 * project.
 *
 * An equirectangular map on a sphere is the worst case for a trilinear
 * sampler: near the limb a screen pixel covers a long, thin strip of texels,
 * so the sampler picks a mip level coarse enough to cover the strip's *length*
 * and throws away everything across its width. The whole rim of the planet
 * goes soft — which is exactly the part of the disc the eye reads as detail.
 * Four samples was leaving most of that on the table on hardware that offers
 * sixteen, and it costs nothing on any GPU that can run this scene at all.
 */
let maxAnisotropy = 4;

/** Raise the filtering quality to whatever this renderer supports. */
export function setEarthAnisotropy(n: number) {
  const v = Math.max(1, Math.floor(n));
  if (v === maxAnisotropy) return;
  maxAnisotropy = v;
  // the maps may already be built and bound, so bring them along
  if (!built) return;
  for (const t of [built.day, built.night, built.clouds, built.mask]) {
    t.anisotropy = v;
    t.needsUpdate = true;
  }
}

function toTexture(c: HTMLCanvasElement, srgb: boolean) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = maxAnisotropy;
  t.needsUpdate = true;
  return t;
}

export interface EarthTextureSet {
  day: THREE.Texture;
  night: THREE.Texture;
  clouds: THREE.Texture;
  mask: THREE.Texture;
  dispose(): void;
}

let built: EarthTextureSet | null = null;

/** Bake once, reuse everywhere (the solar system and the Earth chapter share one Earth). */
export function getEarthTextures(): EarthTextureSet {
  if (built) return built;
  const plate = buildDay();
  const night = buildNight(plate);
  const { day, mask } = shadeDay(plate);
  const clouds = buildClouds();

  const set: EarthTextureSet = {
    day: toTexture(day, true),
    night: toTexture(night, true),
    clouds: toTexture(clouds, false),
    mask: toTexture(mask, false),
    dispose() {
      set.day.dispose();
      set.night.dispose();
      set.clouds.dispose();
      set.mask.dispose();
      built = null;
    },
  };
  built = set;
  return set;
}

/**
 * Water mask derived from real imagery.
 *
 * The generated plate knows where its own coastlines are; a photograph does
 * not, so the mask has to be read back out of it. On NASA's Blue Marble the
 * ocean is the only large surface where blue dominates both other channels —
 * ice and cloud are bright and neutral, land is warm — which separates water
 * cleanly enough for a specular mask.
 */
function maskFromDayImage(img: TexImageSource & { width: number; height: number }) {
  const w = Math.min(img.width, 1024);
  const h = Math.min(img.height, 512);
  const src = makeCanvas(w, h);
  const sctx = src.getContext('2d', { willReadFrequently: true })!;
  sctx.drawImage(img as CanvasImageSource, 0, 0, w, h);
  const data = sctx.getImageData(0, 0, w, h);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const blue = b - Math.max(r, g);
    const bright = (r + g + b) / 3;
    // blue-dominant and not bright: open water. Ice caps fail the second test.
    const water = Math.max(0, Math.min(1, (blue - 4) / 22)) * (1 - Math.max(0, Math.min(1, (bright - 150) / 60)));
    const v = Math.round(water * 255);
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  sctx.putImageData(data, 0, 0);
  return src;
}

/**
 * Real imagery, if it is there.
 *
 * NASA's Blue Marble, cloud composite and city-lights maps are public domain
 * and ship in /public/textures. When they load they replace the generated maps
 * and the water mask is re-derived from the photograph so the ocean specular
 * lands on the actual ocean. If a file is missing the generated version simply
 * stays — the site never depends on them.
 *
 * The swap happens *inside* the existing textures rather than by handing back
 * new ones, and that is the whole point of how this is written. Materials copy
 * a texture into a uniform when they are built, and nothing tells them to look
 * again; replacing `set.day` therefore only reaches materials that happen not
 * to exist yet. Earth's material is built the moment the canvas mounts and
 * this runs a second and a half later behind a loading screen, so the planet
 * that was actually being shown was the coarse generated plate — the real maps
 * loaded, were assigned, and were never looked at, while the originals they
 * displaced were disposed out from under the material still pointing at them.
 *
 * Keeping the texture objects and changing what is inside them makes the
 * ordering irrelevant: every material already holding one picks up the imagery
 * on the next frame, whether it was built before this ran or after.
 */
export async function tryLoadRealTextures(set: EarthTextureSet): Promise<boolean> {
  const loader = new THREE.ImageLoader();
  const attempt = (url: string) =>
    new Promise<HTMLImageElement | null>((resolve) => {
      loader.load(url, resolve, undefined, () => resolve(null));
    });

  const [day, night, clouds] = await Promise.all([
    attempt('/textures/earth_day.jpg'),
    attempt('/textures/earth_night.jpg'),
    attempt('/textures/earth_clouds.jpg'),
  ]);

  /**
   * Re-point a texture at a new image without changing the object identity.
   *
   * The dispose() is load-bearing and not obvious. A renderer allocates a
   * texture's GPU storage immutably, with texStorage2D, and only on the first
   * upload — every later version bump goes down a texSubImage2D path into
   * storage that is still the size it was originally given. The generated
   * plate is 1024x512 and these photographs are 2048x1024 and larger, so the
   * new imagery simply will not fit the allocation the plate created: the
   * upload fails, quietly, and the old plate stays on screen while every
   * property on the CPU side insists the map has been replaced.
   *
   * Disposing clears the cached allocation, so the next frame allocates again
   * at the photograph's real dimensions. It frees the GPU copy only — the
   * texture object, and every material uniform pointing at it, survives.
   */
  const swap = (t: THREE.Texture, image: TexImageSource) => {
    t.dispose();
    t.image = image;
    t.needsUpdate = true;
  };

  if (day) {
    swap(set.day, day);
    try {
      if (day.width) swap(set.mask, maskFromDayImage(day));
    } catch {
      /* keep the generated mask if the image cannot be read back */
    }
  }
  if (night) swap(set.night, night);
  if (clouds) swap(set.clouds, clouds);

  return !!day;
}
