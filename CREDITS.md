# Credits

Every asset in this project is public domain or Creative Commons. Nothing is
scraped. Where AI generation is used it is disclosed, in *AI-generated figures*
below.

## Earth textures — NASA, public domain

From NASA Visible Earth (`eoimages.gsfc.nasa.gov`), in `public/textures`:

| File | Source |
|---|---|
| `earth_day.jpg` | Blue Marble — land surface, shallow water and topography |
| `earth_clouds.jpg` | Blue Marble — cloud composite |
| `earth_night.jpg` | Earth's City Lights |

NASA imagery is generally not copyrighted and may be used for any purpose.

## Portraits — Wikimedia Commons

In `public/portraits`. Attribution is also rendered on each profile page, which
is a condition of the CC BY-SA licences rather than a courtesy.

| Person | Photographer / author | Licence |
|---|---|---|
| Michael Jackson | Anurekhac7 | CC BY-SA 4.0 |
| Cristiano Ronaldo | Анна Нэсси | CC BY-SA 3.0 |
| Albert Einstein | Ferdinand Schmutzer, restored by Adam Cuerden | Public domain |
| Leonardo da Vinci | Leonardo da Vinci — presumed self-portrait, c. 1512 | Public domain |
| Steve Jobs | Matthew Yohe | CC BY-SA 3.0 |
| Marilyn Monroe | Screen capture, *Gentlemen Prefer Blondes* trailer (1953) | Public domain |
| Muhammad Ali | Ira Rosenberg, New York World-Telegram & Sun | Public domain |
| Lionel Messi | Кирилл Венедиктов | CC BY-SA 3.0 |
| Nikola Tesla | Unknown photographer, c. 1890 | Public domain |
| Charlie Chaplin | P. D. Jankens | Public domain |

Machine-readable copies of the above live in `public/portraits/credits.json` and
`src/data/credits.ts`.

### Face decals — derived from the portraits above

`public/portraits/face/*.webp` are the same photographs, cropped to the face,
masked to a feathered oval and tinted toward each figure's skin tone. They are
projected onto the front of the figures' heads in the Hall of Icons, which is
what makes a figure read as a particular person. Rebuild them with:

    python tools/bake_faces.py

These decals are derivative works, not new images: no part of a face is
generated, repainted or invented. The four portraits under CC BY-SA (Jackson, Ronaldo,
Jobs, Messi) carry that licence forward to the decals derived from them, so the
share-alike condition applies to those files as much as to the originals; the
other six sources are public domain. Attribution is rendered in the hall and on
each profile page either way.

## AI-generated figures

The humanoid figures standing in the Hall of Icons are procedural geometry
built at runtime: proportions, palettes and props, with no scanned or sculpted
mesh and no likeness data behind them. What makes one read as a particular
person is the photographic face decal described above.

That is being replaced. `public/models/GENERATING.md` sets out an image-to-3D
pipeline which produces a rigged mesh per figure from a full-body reference
image, and that reference image is itself AI-generated from the licensed
Wikimedia portrait credited above. Figures produced this way are AI-generated
likenesses of real people, and are credited here individually as they land,
naming the portrait each derives from. The photograph's licence carries
forward to its reference image and mesh, share-alike included.

Two things the photographs' licences do not cover, and which are tracked
separately: publicity and personality rights in a living person's likeness are
a distinct question from the right to reproduce a photograph of them, and a
generated likeness is a new image rather than a derivative crop.

All ten figures in the hall are now generated this way, each derived from the
Wikimedia portrait of the same name credited above. They carry a projected
texture taken from that reference image, and a generated skeleton with a
looping idle, so they are clothed and breathing rather than pale and still.

The likenesses are not uniform, and the difference is worth stating plainly.
The historical figures -- Einstein, Chaplin, Tesla, da Vinci, Jackson, Monroe,
Ali -- are recognisably themselves. The living ones are not: Ronaldo, Messi and
Jobs came back as plausible people in the right clothes rather than as those
men, because the image model used here softens recognisable likenesses of
living public figures. They stand under their own names regardless, and a
visitor should read them as representations rather than portraits.
`public/models/RUN-REPORT.md` records which is which.

## Typefaces

Instrument Serif and Inter, both open licence, served from Google Fonts.

## Everything else

Generated at runtime: all planet surfaces, the black hole, the star field,
nebulae and galaxies, the fallback Earth maps, the generative portrait fields,
the humanoid figures in the hall, the labels on them, and the ambient audio.
