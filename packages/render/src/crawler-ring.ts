import { CRAWLER, CRAWLER_PULSE, crawlerPoints } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import { splinePath } from "./spline.js";

/**
 * **One ring of a maggot, as a shape** — the three sets of proportions the
 * parts of a worm are drawn at, and the contour they make, baked.
 *
 * Cut out of `crawler.ts` for the seam that file already had cut once, when
 * the light went next door into `crawler-skin.ts`: what is left over there is
 * *the run* — which ring is which material, where each one stands, what order
 * they are painted in — and a set of radii is none of that. It moved when the
 * bake below took the file past its 250 lines, which is exactly the moment
 * `CLAUDE.md` says to split rather than grow.
 */

/** How big a ring draws, as a share of the tile. `CRAWLER`'s figures are in
 * hundredths of a tile, so this is the whole conversion. */
export const UNIT = 0.01;

/**
 * The head: **shorter and taller** than a ring, not simply bigger.
 *
 * A maggot's head is a rounded cap, and scaling a ring up gave a long
 * teardrop with a snout on it — the taper that reads as *this way round* on a
 * body ring reads as a beak on the one at the front. So the head keeps its own
 * proportions and almost none of the taper, and what says which way it faces
 * is the face.
 */
const HEAD = { rx: 0.66, ry: 1.34, taper: 0.05 };
/** And the tail, which is the same ring drawn smaller and tucked. */
const TAIL = { rx: 0.86, ry: 0.78, taper: 1 };
/** Everything between the two, which is the ring's own figures unaltered. */
const BODY = { rx: 1, ry: 1, taper: 1 };

/** Which of the three shapes a ring wears, as one character — the part of a
 * baked contour's key that says head, tail or body. */
export type PartKey = "h" | "t" | "b";

/** The proportions a part is drawn at. One function rather than a ternary in
 * each caller: the contour is baked here and the slime and the face are drawn
 * next door off the same radii, and two spellings of the same choice is the
 * kind of second copy that drifts. */
export function ringPart(part: PartKey): { rx: number; ry: number; taper: number } {
  return part === "h" ? HEAD : part === "t" ? TAIL : BODY;
}

const RINGS = bakedCache<string, Path2D>();

/**
 * One ring's contour, **at the origin and baked**.
 *
 * Every argument is a constant of the ring: the tile it is drawn at, which of
 * the three parts it is, which way the animal faces, and which of
 * `PULSE_STEPS` positions the contraction stands in. That last one is the
 * whole reason this cache exists and the whole reason the wave is stepped —
 * the squeeze used to be a continuous sine of the shared clock, a value no two
 * frames agree about, so a nine-ring worm rebuilt nine contours a frame for as
 * long as it was on the field (`crawler-shape.ts`, `PULSE_STEPS`).
 *
 * At the origin rather than at the ring's own centre, which is what makes it
 * cacheable at all: a path baked around `x, y` is a path for one column on one
 * frame. `controls.ts`' `FIRE_BLOBS` is the same trade — the position moves
 * into the transform, and the shape stays a constant.
 *
 * Three parts by two headings by sixteen steps is 96 paths for a given tile,
 * and a tile changes when the phone is turned.
 */
export function ringPath(tile: number, part: PartKey, dir: 1 | -1, step: number): Path2D {
  const key = `${tile}|${part}|${dir}|${step}`;
  const held = RINGS.get(key);
  if (held !== undefined) return held;
  const p = ringPart(part);
  const made = splinePath(
    crawlerPoints(
      0,
      0,
      tile * CRAWLER.rx * UNIT * p.rx,
      tile * CRAWLER.ry * UNIT * p.ry,
      CRAWLER.taper * p.taper,
      CRAWLER.pulse,
      CRAWLER_PULSE.squeezeOf(step),
      dir,
    ),
    true,
  );
  RINGS.set(key, made);
  return made;
}
