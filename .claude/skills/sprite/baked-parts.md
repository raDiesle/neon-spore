# THE INSTAR's baked parts, before and after

Every sprite baked for THE INSTAR so far. Each one is offered in VERSUS, and
the game still draws the shipped drawing. The figures are from `bun run sprite`
on 26 September 2026. Rerun it to refresh them.

- **Code** is what the baked drawing adds to the bundle, gzipped. It is
  weighed beside the shipped drawing, so each row includes the shared baker
  (`sprite-bake.ts`).
- **Calls** are exact canvas calls for one draw, shipped against baked.
- **µs** comes from headless Chromium's software canvas. Read the ratio, not
  the number.

| Part | VERSUS slot | Code, gzipped | Calls, shipped → baked | µs, shipped → baked | Bake once |
|---|---|---|---|---|---|
| Egg | `instar:nest` | +2.2 kB | 34 → 18 | 7.0 → 3.2 | 1.6 ms |
| Nest (the whole brood) | `instar:nest` | +2.6 kB | 559 → 299 | 106.7 → 70.0 | 0.6 ms |
| Eye iris | `instar:eye` | +1.4 kB | 4 → 5 | 1.8 → 1.5 | 0.6 ms |
| Fire glob with its trail | `instar:spit` | +1.2 kB | 19 → 6 | 3.5 → 3.8 | 0.5 ms |
| Heart | `instar:heart` | +1.1 kB | 9 → 1 | 3.0 → 0.7 | 0.3 ms |
| Hide scales | `instar:hide` | +1.4 kB | 162 → 20 | 11.3 → 6.0 | 0.9 ms |
| Moult (the pale body) | `instar:moult` | +1.6 kB | 3 → 10 | 3.8 → 4.2 | 1.1 ms |
| Body ring seam | `instar:seam` | +1.0 kB | 6 → 6 | 2.3 → 2.0 | 0.8 ms |
| Ember | `instar:spit` | +0.9 kB | 6 → 1 | 0.8 → 0.5 | 0.2 ms |
| Wing membrane | `instar:wing` | +1.3 kB | 42 → 6 | 4.3 → 2.3 | 1.2 ms |
| **All ten together** | | **+6.8 kB** (22.2 kB minified) | | | **7.8 ms** |

The rows add up to 14.9 kB. The real total is 6.8 kB, because the rows count
the shared baker ten times and together it is counted once. Nothing here ships
a picture: each part is painted by our own code at load. `bun run sprite`
prints what each sprite would weigh as PNG and WebP.

**What it says.** Baking pays off most where the shipped drawing strokes many
small marks: the hide goes from 162 calls to 20, the wing from 42 to 6, and the
nest from 559 to 299. It pays off least where the shipped drawing is already
one gradient fill. There the baked version costs the same or a few calls more,
as with the eye, the moult and the seam, and what it buys is detail rather than
speed.

Checked in all five third-act poses (crouch, perch, roar, sprawl, twist) on
26 September 2026. Every baked part draws there without clipping or popping.
