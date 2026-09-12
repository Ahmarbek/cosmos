# COSMOS

A single continuous camera flight from the scale of the universe down to a
walkable room: **universe → black holes → solar system → Earth → icons →
world**. One WebGL scene carries the first five movements; the sixth is a
separate, explorable environment.

```bash
npm install
npm run dev        # http://localhost:5180
npm run build && npm run preview
```

---

## The idea

Every section is a region of the same space rather than a separate page. There
is one camera, one flight path, and one number — normalised scroll progress —
that everything reads from. Sections do not fade in and out; the camera travels,
and the copy is timed to where it arrives.

The journey narrows deliberately: cosmic scale, then planetary, then human, then
something you can walk around in. The final world is the payoff for the trip.

## Architecture

```
src/
  three/        the journey scene — one canvas, one camera, one flight
    cameraPath.ts   the whole choreography as a pure function of progress
    Rig.tsx         damped camera; blends the scripted path with manual orbit
    BlackHole.tsx   screen-space geodesic integrator
    SolarSystem.tsx planets, rings, moons, orbit traces
    Earth3D.tsx     day / night / cloud / ocean shading
    Fallback2D.tsx  the same film on a 2D canvas when WebGL is unavailable
  world/        the final environment — its own canvas, camera and input
  shaders/      GLSL, kept out of the components that use it
  sections/     the HTML overlay, timed to the flight
  components/ui the design system: cues, cursor, navigation, portraits
  data/         every fact on the site, in one place
  lib/ai/       the character chat abstraction
server/         /api/chat, mounted on the dev and preview servers
```

### The black hole is actually traced

`shaders/blackhole.ts` fires a photon backwards from the camera through every
pixel and integrates its path in the curved space around a Schwarzschild black
hole. The shadow, the photon ring, the far side of the disk lifted over the top,
the Einstein ring of lensed stars — none of those are drawn. They fall out of
the integration.

Two things make it affordable in real time:

- **Analytic capture.** Whether a photon is swallowed is decided by its impact
  parameter against the exact threshold, 3√3/2 Schwarzschild radii, rather than
  by integrating until it crosses the horizon. The shadow edge is therefore
  perfectly smooth and doomed rays stop early.
- **Analytic rejection.** A ray whose closest approach is far outside the disk
  cannot reach it, so it never enters the integrator at all.

It is an approximation, and the interface says so on screen rather than in a
footnote.

### Imagery, and where it comes from

Earth is textured with NASA's public-domain maps — Blue Marble land and
bathymetry, the cloud composite, and the city-lights map — in
`public/textures`. The ocean mask is derived from the day map at load time by
reading it back out of a canvas, since a photograph does not come with one.

The ten portraits in `public/portraits` are public domain or Creative Commons
from Wikimedia Commons. Attribution is recorded in `src/data/credits.ts` and
shown on each profile page, because the CC BY-SA files require it. They are held
at low saturation until a card becomes active, which is what lets ten images
from ten sources across a century read as one set.

Everything else is generated: planet surfaces in the fragment shader, the
fallback Earth maps from coarse coastlines and real city coordinates when the
NASA files are absent, the figures in the hall, and the labels on them. The site
degrades to fully procedural if `public/` is emptied.

### The figures, and how to replace them

The ten characters in the hall are human-shaped — head, shoulders, arms, hands,
torso, legs, feet, eyes — built from primitives, painted per body part with a
vertex colour and merged into one geometry each. Ten figures, ten draw calls.
They turn to face whoever walks up to them.

Identity is carried by proportion, hair, and above all by clothing: a red
Portugal shirt and a ball at the feet; a black stage suit, a fedora and one
white glove; a bowler, a cane and baggy trousers; a black turtleneck. That is
what makes someone recognisable across a room.

**They are not likenesses, and cannot be.** An exact model of a real person
comes from a photogrammetry scan or days of character-artist sculpting; no
amount of code produces a recognisable face. So rather than pretend otherwise,
the loader makes real models trivial to drop in:

```
public/models/cristiano-ronaldo.glb
```

Any `.glb` named after a character id is used in place of the procedural
figure. The model is measured on load, scaled to that character's height,
recentred and stood on the plinth, so assets from different sources line up
without editing. A missing file is not an error — the procedural figure is used
instead. See `public/models/README.md`.

### Scale is honest about being dishonest

Planet sizes and orbital distances are compressed — at true scale the rocky
planets are invisible and Neptune is a thousand screens away. Ordering, relative
periods, axial tilts and rotation directions follow the real bodies, and the
compression is stated in the interface.

## The AI characters

The ten figures in the final world are **simulations**, and every surface of the
interface says so. They are built from the same documented public record that
drives the profile pages. No invented quotations, no private life, no opinions
attributed to the real person.

`POST /api/chat` takes `{ character, message, history }` and returns
`{ response, character, source }`.

- With `ANTHROPIC_API_KEY` set, it calls the Messages API with the character's
  system prompt and knowledge base. Copy `.env.example` to `.env` to enable it.
- Without a key it answers from a local retrieval engine that scores the
  character's knowledge base against the question. Answers stay inside
  documented fact; when nothing matches it says so.
- With no server at all, the browser falls back to the same engine in-process,
  so a static build still works.

`source` is reported back to the interface, which labels which one answered.
Swapping providers means replacing `callModel` in `server/chat.ts`; nothing else
in the project knows how an answer was produced.

## Performance

Quality is probed once (`hooks/useCapabilities.ts`) from GPU renderer string,
core count, memory and pointer type, then trimmed further at runtime if frames
slip. The tier drives star count, sphere tessellation, the geodesic step budget,
pixel ratio and whether the world's floor does a real planar reflection.

The world is a dynamic import, so its cost is only paid by visitors who reach
the threshold. `prefers-reduced-motion` shortens the camera damping and stills
the grain. Without WebGL, `Fallback2D` runs the same journey on a 2D canvas.

## Controls

| Where | |
|---|---|
| Journey | scroll; the chapter rail on the right jumps between movements |
| Black hole / solar system | **Inspect** or **Explore** hands you the camera — drag to orbit, wheel to zoom, Escape to give it back |
| World | **W A S D** move, mouse look, **Shift** run, **Space** jump, **E** interact, **Escape** release |
| Touch | one stick to move, drag to look, tap to interact |

Sound is off until asked for, and is synthesised rather than shipped — no audio
files, and nothing plays before a user gesture.

## Development notes

In dev builds only, the app exposes a small inspection harness on `window`
(`__seek`, `__hold`, `__step`, `__tp`, `__cosmos`) and a `/api/__shot` endpoint
that writes a frame to `.shots/`. A backgrounded tab issues no animation frames,
which otherwise makes a scroll-driven WebGL scene impossible to inspect from an
automated browser. None of it is present in a production build.

## Credits

Asset sources and licences are listed in [CREDITS.md](CREDITS.md).
