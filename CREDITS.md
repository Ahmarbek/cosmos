# Credits

Every asset in this project is public domain or Creative Commons. Nothing is
scraped, and nothing is AI-generated in the likeness of a real person.

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

These are derivative works, not new images: no part of a face is generated,
repainted or invented. The four portraits under CC BY-SA (Jackson, Ronaldo,
Jobs, Messi) carry that licence forward to the decals derived from them, so the
share-alike condition applies to those files as much as to the originals; the
other six sources are public domain. Attribution is rendered in the hall and on
each profile page either way.

## Typefaces

Instrument Serif and Inter, both open licence, served from Google Fonts.

## Everything else

Generated at runtime: all planet surfaces, the black hole, the star field,
nebulae and galaxies, the fallback Earth maps, the generative portrait fields,
the humanoid figures in the hall, the labels on them, and the ambient audio.
