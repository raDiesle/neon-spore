# Graphics

> **Status: mostly built.** The line weights, the glow method, the own-motion
> and the two-screen split are in `packages/render` and
> `legacy/style-guide.html`. The part that is out of date is the fiction: it
> was written for an ocean.

**Organic, graceful, neon.** No pixel art, no retro.

- Line weight 1.2–1.8 px at 26 px object size, interior lines 0.6–0.9 px
- No filled body — a dark fill at 10–20 % opacity
- Glow through a soft aura around the line, not through thick lines
- Object size 20–26 px (at 11 px nothing of a figure survives)
- Two accent colours plus muted neutrals
- **Pre-rendered glow sprites instead of live blurring.** Multi-pass blur costs
  frames per second on mobile GPUs and heats the device up
- Calculate line weight in device pixels; a slider for testing
- Every creature has an **own-motion** independent of its flight path (wing
  waves, pulsing, ringing out)
- Two screens, two moods: the pilot warmer with a halo, the navigator cooler
  with grid lines

**Liveliness at 20–26 px** comes from motion with overshoot, not from detail: a
damped spring with stiffness and damping, volume preserved (wider = shorter), a
short hit-stop, a reaction proportional to its cause.

**SVG is the authoring format, not the drawing path.** Sprites are pre-rendered
from the vector sources at several pixel densities. Polygon outlines belong in
the logic, not in the graphics — they are the data behind destruction.

In the code: `packages/render/src/glow.ts` does the aura with layered strokes
and one pre-rendered additive halo sprite, never `shadowBlur`. The contour
maths lives in `packages/content/src/shapes.ts` so the canvas and the SVG test
sheet (`tools/shape-sheet`) draw from one source. The two-screen split is
designed but not built — one device today.

## The forms

Blobs and slimes: closed contours built from a Catmull-Rom spline through
points whose radius is modulated by a number of **lobes**, plus a wobble term
in time (`blobPath`). The hull is the same construction, with the cannon and
the shield as bumps on one contour (`hullRadiusMul`, `bumpAdd`) rather than as
separate objects sitting on top of it.

Lobe, hull, beat and ward are the fixed vocabulary. Do not invent synonyms —
see `CLAUDE.md`.

## The fiction — out of date

The German original justified the rules from a marine setting:

> Colour is bioluminescence. Matching ammunition makes the light organ shatter
> by resonance. The rock is indestructible because it does not live. You are a
> bubble in an ocean full of animals — not the warriors, but the fragile thing.

**The setting is space now** ([overview](overview.md#the-setting)). The
structure of that argument is worth keeping: colour is a property of the
creature that a matching shot resonates with, the rock is immune because it is
not alive, and you are the fragile thing rather than the warrior. What needs
replacing is the ocean it was hung on. `packages/render/src/field.ts` still
calls its background "deep-water" in a comment.

**The bubble** deformed visibly — stretching under thrust, tipping and
squashing when evading, ringing out afterwards, so player 2 could tell from the
tipping whether their order had arrived. That is gone with free flight. The
hull is fixed and the equivalent feedback now comes from the shield changing
silhouette when armed ([systems](systems.md#58-overall-behaviour-in-the-raster--built)).
