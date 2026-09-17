# Generating the ten figures

The route chosen over the Sketchfab downloads in `CANDIDATES.md`: a full-body
reference image per person, then image-to-3D with rigging and an idle clip.

It is written twice. First as a hosted run — one call per figure, paid in
credits, every parameter checked against the live model catalogue. Then as
**The free route** further down, which produces the same files on a local
NVIDIA card and costs nothing but the afternoon. Neither has been run: the
account this was set up on holds **0 credits on the free plan**, and the
machine it was written on has integrated graphics. Both are written out so the
run is mechanical whenever the credits or the GPU turn up.

## Cost

Priced through the tools' own `get_cost`, not estimated:

| Step | Model | Credits |
|---|---|---|
| Reference image | `gpt_image_2_5` | 1 each |
| Textured, PBR, rigged, animated mesh | `image_to_3d` (Meshy) | 38 each |

Ten figures at one image apiece is **390 credits**. Budget nearer 420: some
likenesses will want a second or third reference image before they are worth
converting, and an image is the cheap half by a factor of thirty-eight.

## Step 1 — the reference image

The portrait photographs already in `public/portraits` are the likeness source,
and every one of them is a Wikimedia file whose licence is recorded in
`credits.json`. Import one by URL, then generate a full-body A-pose from it:

```
media_import_url  https://upload.wikimedia.org/wikipedia/commons/8/89/Muhammad_Ali_NYWTS.jpg
generate_image    model: gpt_image_2_5
                  aspect_ratio: 2:3
                  medias: [{ role: image_references, value: <media_id> }]
                  prompt: <below>
```

The prompt wants four things and nothing else: the person, the outfit they are
remembered in, an A-pose, and a background the mesher can cut away.

> Full-body photograph of <person>, <wardrobe>, standing straight and facing
> the camera in a relaxed A-pose with arms slightly away from the body and feet
> shoulder-width apart, whole figure in frame from head to shoes, even
> diffuse lighting, plain mid-grey seamless background, sharp focus, no
> cropping, no props held in front of the body.

Wardrobe, taken from the palettes and props the procedural figures already use,
so the hall stays recognisable whichever figure is standing on the plinth:

| id | Wardrobe | Height |
|---|---|---|
| `michael-jackson` | black sequinned stage suit, white socks, single white glove, black fedora | 1.82 |
| `cristiano-ronaldo` | Portugal home kit, red shirt and green shorts, white boots | 1.92 |
| `albert-einstein` | grey-brown tweed jacket over a soft collar, dark trousers, white hair | 1.75 |
| `leonardo-da-vinci` | deep red Renaissance robe and cap, long grey beard | 1.78 |
| `steve-jobs` | black turtleneck, blue jeans, grey trainers, rimless glasses | 1.83 |
| `marilyn-monroe` | white halter dress, platinum blonde hair | 1.68 |
| `muhammad-ali` | boxing trunks, white with a red waistband, red gloves, bare torso | 1.91 |
| `lionel-messi` | Argentina home kit, blue and white stripes, navy shorts | 1.70 |
| `nikola-tesla` | black three-piece formal suit of the 1890s, high collar | 1.88 |
| `charlie-chaplin` | the Tramp: tight black jacket, baggy grey trousers, bowler hat, cane | 1.65 |

Heights are the ones in `FIGURES` (`src/world/humanoid.ts`). They are what the
loader scales to, and passing the same number to the rigger keeps the skeleton
proportioned to the body it is going into.

## Step 2 — the mesh

```
generate_3d  model: image_to_3d
             medias: [{ role: image, value: <image job_id> }]
             should_texture: true
             enable_pbr: true
             enable_rigging: true
             enable_animation: true
             animation_action_id: 0        # idle
             pose_mode: a-pose
             target_polycount: 60000
             rigging_height_meters: <height from the table>
```

`target_polycount: 60000` sits under the 80k the hall wants and well under the
180k the loader complains at. `enable_pbr` is what makes the self-lighting in
`CharacterModel` look like a material rather than a flat decal. `pose_mode:
a-pose` is what makes the rig come out clean.

Download the GLB to `public/models/<id>.glb`, walk to the plinth, and read the
console: a height warning or a triangle warning is the loader telling you the
file needs another pass.

## The free route, on a local GPU

Everything above costs credits. The same ten figures can be produced for
nothing on a consumer NVIDIA card, at the price of doing by hand what the paid
route does in one call. Written for the machine this is planned on:

```
RTX 3050, 8 GB VRAM · 32 GB DDR4 · Windows
```

Both numbers matter, and the second is the one people forget.

**Use the portable Windows build, not the official repository.** Tencent's own
Hunyuan3D-2.1 wants 10 GB of VRAM for shape and 21 GB for texture, which an
8 GB card does not have. `YanWenKun/Hunyuan3D-2-WinPortable` bundles the `mmgp`
memory optimisations and comes down to ≥3 GB for geometry and ≥6 GB for
texture, which it does. The model is not cut down; the weights are streamed
between VRAM and system RAM instead of being held resident, which is why the
32 GB matters — it is what the offloaded weights land in, and 16 GB would
thrash. A 3050 is RTX 30-series, so the CUDA extensions are supported;
20-series cards are not. One thing left to check on the machine itself: the
driver must be newer than 550.

**Turn off Sysmem Fallback first.** From driver 536 on, Windows silently spills
VRAM into system RAM over PCIe rather than raising an error — which turns a
two-minute generation into a multi-hour crawl that looks like a hang. NVIDIA
Control Panel → CUDA — Sysmem Fallback Policy → *Prefer No Sysmem Fallback*.
A clear out-of-memory error in ten seconds is worth more than a run that never
visibly fails. The deliberate offloading above is a different mechanism and is
unaffected by this.

The steps, in order:

1. **Full-body reference image.** The portraits in `public/portraits` are head
   and shoulders, and a portrait in gives a bust out — which is exactly the
   complaint `CANDIDATES.md` records about the Einstein model. So a standing
   figure has to be generated first: SDXL img2img locally fits in 8 GB, with
   the portrait as the identity reference and the wardrobe table above as the
   prompt.
2. **Image to mesh.** Hunyuan3D 2.1 WinPortable. Out comes a textured GLB with
   PBR maps, and no skeleton.
3. **Rig and idle.** Mixamo — free, browser-based, nothing asked of the GPU.
   It takes FBX or OBJ rather than GLB, so Blender converts on the way in, and
   its auto-rigger wants a T-pose-ish upright figure. Pick any idle from the
   library and export.
4. **Back to GLB, and under budget.** Mixamo exports FBX; Blender converts back.
   Then squeeze it:

   ```bash
   npx @gltf-transform/cli simplify        in.glb  a.glb --ratio 0.5 --error 0.001
   npx @gltf-transform/cli textureCompress a.glb   b.glb --format webp --limit 2048
   npx @gltf-transform/cli draco           b.glb   public/models/<id>.glb
   ```

   The Draco step is why the decoder is vendored in `public/draco` — the loader
   reads the result directly.

Two notes on how this lands in the hall. Mixamo names its clip `mixamo.com`
rather than anything matching `/idle/`, so `idleClip()` falls through to its
first-clip fallback, which is correct when there is only one. And its root bone
is `mixamorigHips`, so the root-motion stripping catches it. Nothing in
`CharacterModel.tsx` needs changing for a Mixamo file.

Mixamo is also the weak link: Adobe stopped developing it years ago and it
works most days rather than every day. If it is down, Meshy's auto-rigger does
the same job and is the paid route's step 2 anyway.

## Three things to settle before spending

- **`CREDITS.md` currently promises the opposite.** Its second sentence reads
  "Nothing is scraped, and nothing is AI-generated in the likeness of a real
  person", and the face-decal section makes the same promise again in more
  detail: "no part of a face is generated, repainted or invented". Ten
  AI-generated likenesses would make both sentences false. That is a decision
  about what the project is, not a detail of the pipeline, and it has to be
  taken deliberately and written into `CREDITS.md` before the first generation
  runs — not discovered afterwards by a reader comparing the promise to the
  hall.
- **Likeness on living people.** Image models routinely decline, or quietly
  soften, a recognisable rendering of a living public figure. Einstein, Tesla,
  da Vinci, Chaplin and Monroe are the likely successes; Ronaldo, Messi and
  Jobs are the likely arguments. Generate those three first and look at what
  comes back before committing the other seven.
- **Rights are not the photograph's rights.** The Wikimedia licences in
  `credits.json` cover reproducing the photographs. A 3D likeness of a living
  person is a separate question — publicity and personality rights — and
  `CANDIDATES.md` already takes that seriously for the downloaded models. The
  same care applies here, more so because these would be generated rather than
  found.

Whatever is used, credit it in `src/data/credits.ts` and `CREDITS.md` the way
the portrait photographs are credited.
