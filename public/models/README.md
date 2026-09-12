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

Keep files under roughly 5 MB each. Use Draco or Meshopt compression if the
source mesh is heavy; the loader handles plain glTF out of the box, and adding
a Draco decoder is a two-line change in `src/world/CharacterModel.tsx`.

A missing file is not an error. The procedural figure is used instead.

## Verifying the pipeline

It has been tested end-to-end with a real rigged character. To repeat the test:

```bash
curl -L -o public/models/nikola-tesla.glb   https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/glTF-Binary/CesiumMan.glb
```

Walk to Tesla's plinth and the sample figure is standing on it, scaled to human
height and facing you. Delete the file to get the procedural figure back.

## Three things that bite when dropping models in

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
