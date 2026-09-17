# Character models

Drop a glTF binary here named after the character id and the hall will use it
instead of the procedural figure. Nothing else needs changing.

```
public/models/cristiano-ronaldo.glb
public/models/michael-jackson.glb
public/models/albert-einstein.glb
public/models/leonardo-da-vinci.glb
public/models/steve-jobs.glb
public/models/marilyn-monroe.glb
public/models/muhammad-ali.glb
public/models/lionel-messi.glb
public/models/nikola-tesla.glb
public/models/charlie-chaplin.glb
```

The loader normalises whatever it is given: the model is measured, scaled to the
character's height, recentred horizontally and stood on the ground, so assets
from different sources line up on the plinth without editing. It should face
+Z — the hall turns the figure toward the visitor from there.

Keep files under roughly 5 MB each. Draco and meshopt compression are both
wired up, so a heavy source mesh can be squeezed with either. The Draco
decoder is served from `public/draco` rather than a CDN — the hall works
offline — and is fetched only when a Draco-compressed file actually turns up.

If the file carries animation clips, one is played: the first whose name looks
like an idle, otherwise the first clip in the file. Translation on the root
bone is dropped before it plays, so a model that arrives with a walk as its
only animation stays on its plinth instead of strolling off the front of it.
Clips are skipped entirely on the low quality tier, where skinning ten figures
costs more than it is worth.

A missing file is not an error. The procedural figure is used instead.

## Verifying the pipeline

It has been tested end-to-end with a real rigged character. To repeat the test:

```bash
curl -L -o public/models/nikola-tesla.glb   https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/glTF-Binary/CesiumMan.glb
```

Walk to Tesla's plinth and the sample figure is standing on it, scaled to human
height and facing you. CesiumMan ships a walk cycle and no idle, so it is also
the test for clip playback: the figure moves its arms and legs while staying
centred on the plinth. Delete the file to get the procedural figure back.

## Faces

A supplied model wears the face it was built with. The baked decals in
`public/portraits/face` are **not** applied to it: `faceDecalGeometry` is cut
from the procedural skull's own constants, so it fits that head and no other,
and it is only mounted on the fallback figure. Putting a photograph on a
supplied model means editing the model's own texture, not reusing the decal.

## Four things that bite when dropping models in

All handled by the loader, but worth knowing if you edit it:

- **Rigged models must be cloned with `SkeletonUtils`.** A plain deep clone
  leaves SkinnedMeshes bound to the original skeleton and the copy renders
  collapsed or invisible.
- **The hall is almost lightless.** A model arriving with PBR materials has
  nothing to catch and renders black, so its materials are made self-lit from
  their own texture.
- **A skinned mesh cannot be measured with `Box3.setFromObject`.** It reports
  the undeformed geometry — a human came back as 0.31 m tall. The skeleton's
  bone positions are measured too, and the union is used.
- **Clips live on the glTF, not on the scene graph.** Cloning the scene — which
  is what every figure in the hall does — leaves the copy frozen in its bind
  pose until a mixer is attached to it by hand.

`GENERATING.md` has two recipes for producing these files — one hosted and
paid, one local and free. `CANDIDATES.md` has the third option: downloading
models somebody else already made.
