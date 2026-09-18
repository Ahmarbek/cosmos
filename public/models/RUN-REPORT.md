# Generation run — 17–18 September 2026

All ten figures in `public/models/` are generated, textured, rigged and
animated. 4.7 MB for the set. Verified in the running app, not just on disk.

## What ships

| Figure | Size | Likeness |
|---|---|---|
| `albert-einstein` | 536K | good — the hair and moustache read immediately |
| `leonardo-da-vinci` | 828K | good — red robe, cap, long beard |
| `charlie-chaplin` | 464K | good — bowler, cane, the Tramp silhouette |
| `nikola-tesla` | 453K | good — period three-piece |
| `michael-jackson` | 393K | good — sequinned suit, fedora |
| `muhammad-ali` | 422K | good — trunks and gloves |
| `marilyn-monroe` | 465K | fair — right dress and hair; a floor slab is baked in from ground shadow, and one side smears |
| `steve-jobs` | 388K | **not him** — right clothes, wrong face |
| `cristiano-ronaldo` | 425K | **not him** — right kit, wrong face |
| `lionel-messi` | 392K | **not him** — right kit, wrong face |

Each carries a projected texture, a 19-bone skeleton and a 6.4s looping `idle`.

## The limit that did not move

Historical figures come out recognisable. **Living public figures do not.**
Ronaldo, Messi and Jobs return as plausible strangers in the right clothes, on
every setting tried, because the local image model softens recognisable
likenesses of living people. This is not a tuning problem. Fixing those three
needs a per-person LoRA, a model without that behaviour, or the paid Meshy
route. `GENERATING.md` predicted this exactly.

Two source-material problems, distinct from the above: da Vinci's "portrait" is
a Renaissance drawing, so there is no photographic face to transfer (the robe
and beard carry him instead); and every portrait in `public/portraits` is
head-and-shoulders, which is why the pose has to be supplied separately.

## The pipeline

1. **Reference image** — SDXL + ControlNet OpenPose + IP-Adapter (image) at
   0.85. The pose comes from an A-pose skeleton drawn directly in code rather
   than detected, because no photograph of the wanted pose exists.
2. **Mesh** — Hunyuan3D **2.0**, ~86s per figure.
3. **Texture + rig, one Blender pass** — the photograph projected back from an
   orthographic front camera, plus an armature bound with automatic weights and
   a keyframed idle.
4. **Compress** — `simplify --ratio 0.4`, then `resize`, `webp`, `draco`.

Scripts and full resume notes: `D:\Tools\cosmos-pipeline\`.

## Four things that were wrong, and cost time

**Hunyuan3D 2.1 does not run here.** Access violation (`0xC0000005`) during
model construction, reproducible from two shells, and it crashes with the
pipeline pinned to `device='cpu'` — so not VRAM, not RAM, not the shell. A
fault in vendored native code. 2.0 is bundled alongside it and works.

**`HF_HUB_DISABLE_XET=1` is required.** HuggingFace's Xet CDN fails TLS
handshakes on this connection and retries forever. It presents as a hang: no
output, 0% GPU, memory flat. Cost about an hour before it was diagnosed.

**FaceID was the wrong tool, and looked like the right one.** IP-Adapter-FaceID
conditions on a face-recognition embedding. That space encodes identity, not
appearance, so what comes back is a generic face that *scores* as the person.
Einstein came back as a tidy grey-haired man in a suit. The plain image adapter
copies appearance — the wild hair, the particular features — which is what a
human actually recognises. It had only been turned down because it dragged the
source portrait's framing along with it; once ControlNet owned the framing,
that reason was gone.

**The skin binding was silently lost, and every cheap check passed.** Texturing
in one Blender pass and re-importing to rig produced files with `JOINTS_0` and
`WEIGHTS_0` attributes, an `idle` clip of the right length, sensible file sizes,
and correct-looking Blender renders — but `skins: 0`. three.js therefore loaded
plain `Object3D`s instead of `Bone`s and a plain `Mesh` instead of a
`SkinnedMesh`, so every figure would have stood frozen while its animation
played against nothing. Only loading the actual page and counting
`isSkinnedMesh` in the scene graph revealed it. Texture and rig now happen in a
single Blender session, and the chain asserts the glTF `skins` array on every
output.

Two lessons worth keeping: `gltf-transform inspect` showing JOINTS_0/WEIGHTS_0
does **not** mean a mesh is skinned, and a Blender render proves nothing about
glTF export because Blender re-imports its own hierarchy happily either way.

## Verified in the browser

Dev server, hall loaded: 10 GLBs fetched 200, no `CharacterModel` height or
triangle warnings, `skinned: 10`, `bones: 190`, all materials carrying
`map` + `emissiveMap` (so they are self-lit in the near-lightless hall rather
than rendering black), and the `chest` bone rotation changing across stepped
frames — the figures are breathing.

## Known cosmetic faults

Single-camera projection means the **back** of each figure receives the front
image smeared along the view axis; acceptable where figures face the visitor,
but it is not multi-view PBR texturing. White fringes appear at silhouette
edges where surfaces turn away from the camera — worst on Monroe. Hunyuan's own
texturing could replace this, but it needs `custom_rasterizer`, a CUDA C++
extension, and this machine has no MSVC or CUDA toolkit.
