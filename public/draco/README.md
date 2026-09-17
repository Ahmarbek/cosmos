# Draco decoder

The glTF-targeted build of Google's Draco decoder, copied verbatim from
`three/examples/jsm/libs/draco/gltf` at three r169. Apache License 2.0 —
https://github.com/google/draco.

`DRACOLoader` is pointed here by `src/world/CharacterModel.tsx` so that a
Draco-compressed character model works with the site served from anywhere,
including offline, rather than depending on a CDN staying up. Nothing fetches
these files until a compressed `.glb` is actually loaded.

Replace them from the same folder in `node_modules` if three is upgraded.
