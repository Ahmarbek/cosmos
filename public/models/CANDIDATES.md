# Download candidates

Every model below was checked against the Sketchfab API on 2026-09-11 and has
**`isDownloadable: true`** plus a **CC Attribution** licence (commercial use and
derivatives permitted, credit required). The heavy "showcase" models — the ones
that look best in the embedded viewer — are almost always `isDownloadable: false`
and cannot be obtained by anyone, at any price, through the site.

## How to use this list

1. Open the link, sign in to Sketchfab, press **Download 3D Model**, pick **glTF (.glb)**.
2. Save it in this folder under the exact filename in the *Save as* column.
3. That is all. `src/world/CharacterModel.tsx` discovers it, normalises scale and
   orientation, lights it, and places it on the right plinth.

If a `.glb` option is not offered, take the `.fbx` or `.blend` and say so — it
converts in one step.

| Person | Save as | Faces | Model |
|---|---|---|---|
| Michael Jackson | `michael-jackson.glb` | 51k | https://sketchfab.com/3d-models/3363cd62badd4336ac82980b9f1f4d91 |
| Cristiano Ronaldo | `cristiano-ronaldo.glb` | 50k | https://sketchfab.com/3d-models/94b54aedd12b4cfb90cd972277997025 |
| Albert Einstein | `albert-einstein.glb` | 77k | https://sketchfab.com/3d-models/95e114bcf7a847648bc5a48b0443baa8 |
| Leonardo da Vinci | `leonardo-da-vinci.glb` | 132k | https://sketchfab.com/3d-models/a5e73281c04c42dda5fd3d35f313c593 |
| Marilyn Monroe | `marilyn-monroe.glb` | 127k | https://sketchfab.com/3d-models/80ea75a5c52b467089760a7cc6e9f592 |
| Muhammad Ali | `muhammad-ali.glb` | 16k | https://sketchfab.com/3d-models/594a3c2d0d8b44d5a0562a28f383688e |
| Lionel Messi | `lionel-messi.glb` | 110k | https://sketchfab.com/3d-models/e4ed855d53d64d0d9f460a4d160726db |
| Nikola Tesla | `nikola-tesla.glb` | 41k | https://sketchfab.com/3d-models/e9b23d9420ad48b1b55012f8d085eafc |
| Charlie Chaplin | `charlie-chaplin.glb` | 150k | https://sketchfab.com/3d-models/673607a0692647b9a8943f4cfc25b53b |

**Steve Jobs** has no downloadable, commercially licensed model on Sketchfab —
the searchable hits are all Apple hardware, not the man. He keeps the procedural
figure until something better turns up.

## Caveats worth knowing before you spend time on these

- The **Einstein** entry is a *bust*, not a full body. On a plinth in a dark hall
  that reads as a museum piece rather than a mistake, but it is not a standing
  figure. Same for several of the Marilyn Monroe hits, which are photogrammetry
  scans of public statues.
- **Da Vinci** and **Messi** ship with animation tracks. Harmless — nothing plays
  them — but they inflate the file.
- Likeness quality varies enormously at these poly counts. Some are good; some
  are recognisable-at-a-distance at best. Download two for the same person if you
  are unsure and I will compare them side by side in the hall.
- A CC Attribution tag set by an uploader is not proof they had the right to set
  it. Several football models circulating on Sketchfab are extracted from FIFA or
  eFootball. If a model arrives looking like a retail game asset, I will say so.

## Attribution

Every model used must be credited. Send me the author name shown on the model
page along with the file and I will add the entry to `src/data/credits.ts` and
`CREDITS.md`, the same way the portrait photographs are credited.
