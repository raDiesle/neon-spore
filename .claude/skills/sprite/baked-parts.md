# THE INSTAR's baked parts, before and after

Every sprite baked for THE INSTAR so far. The spit, the eye, the nest, the
hide and the moult were taken into the game on 27 September 2026; the heart and
the wing are still offered in VERSUS; the seam was dropped the same day and
deleted (`tools/versus/DECIDED.md`). The figures are from `bun run sprite` on
27 September 2026. Rerun it to refresh them.

- **Code** is what the baked drawing adds to the bundle, gzipped. It is
  weighed beside the shipped drawing, so each row includes the shared baker
  (`sprite-bake.ts`).
- **Calls** are exact canvas calls for one draw, shipped against baked.
- **µs** comes from headless Chromium's software canvas. Read the ratio, not
  the number.

| Part | VERSUS slot | Code, gzipped | Calls, shipped → baked | µs, shipped → baked | Bake once |
|---|---|---|---|---|---|
| Egg | `instar:nest`, in the game | +1.0 kB | 34 → 18 | 7.3 → 3.5 | 1.9 ms |
| Nest (the whole brood) | `instar:nest`, in the game | +0.8 kB | 559 → 299 | 107.5 → 74.3 | 0.7 ms |
| Eye iris | `instar:eye`, in the game | +1.4 kB | 4 → 5 | 1.5 → 1.7 | 0.6 ms |
| Fire glob with its trail | `instar:spit`, in the game | +1.2 kB | 19 → 6 | 4.0 → 3.0 | 0.5 ms |
| Heart | `instar:heart` | +1.1 kB | 9 → 1 | 2.3 → 0.5 | 0.3 ms |
| Hide scales | `instar:hide`, in the game | +0.6 kB | 162 → 20 | 10.5 → 5.5 | 1.0 ms |
| Moult (the wound) | `instar:moult`, in the game | +2.6 kB | 19 → 19 | 13.0 → 10.5 | 1.2 ms |
| ~~Body ring seam~~ | `instar:seam`, dropped and deleted | — | — | — | — |
| Ember | `instar:spit`, in the game | +0.9 kB | 6 → 1 | 1.0 → 0.8 | 0.2 ms |
| Wing membrane | `instar:wing` | +1.3 kB | 42 → 6 | 3.3 → 2.3 | 0.8 ms |
| **All nine together** | | **+4.9 kB** (15.6 kB minified) | | | **7.2 ms** |

The rows add up to 10.9 kB. The real total is 4.9 kB, because the rows count
the shared baker nine times and together it is counted once. Nothing here ships
a picture: each part is painted by our own code at load. `bun run sprite`
prints what each sprite would weigh as PNG and WebP.

**What it says.** Baking pays off most where the shipped drawing strokes many
small marks: the hide goes from 162 calls to 20, the wing from 42 to 6, and the
nest from 559 to 299. It pays off least where the shipped drawing is already
one gradient fill. There the baked version costs the same or a few calls more,
as with the eye and the moult, and what it buys is detail rather than
speed.

Checked in the five third-act poses (crouch, perch, roar, sprawl, twist) and
the five fourth-act poses (hover, bow, arch, rise, loom) on 26 September 2026.
Every baked part draws there without clipping or popping. The fire, the heart
and the pale body only show in their own states, which none of those poses
puts on screen, so they were checked in their own slots' poses.

## THE GOVERNOR's face

Two sprites laid on the flywheel's face (`governor-face-baked.ts`), in the game
since the owner asked for them by name on 7 October 2026. Weighed beside the
hub drawn over them, and drawn on the bench flat at the dial's diameter
against the bare brass and face. Figures from `bun run sprite` on 8 October
2026.

| Part | Code, gzipped | Calls, shipped → baked | µs, shipped → baked | Bake once | As a picture, WebP |
|---|---|---|---|---|---|
| Alloy (iris, bezel, glyphs, rim, gloss) | +1.8 kB | 6 → 11 | 0.5 → 1.5 | 1.6 ms | 245 kB |
| Veins | +1.4 kB | 6 → 11 | 0.5 → 1.5 | 4.8 ms | 25 kB |

Here the shipped column is only the flat face, so baking buys detail, not
speed: five calls for a face that would be hundreds of strokes drawn live, and
an alloy that would cost a quarter of a megabyte shipped as a picture.
