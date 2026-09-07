import { isoLoops, type Point, resample } from "@neon-spore/content";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE CHOIR's two bodies stand, and the skin over them** — the shape
 * half of this creature, with nothing in it about light or colour.
 *
 * Split off `choir.ts` when the glow arrived and that file went over its
 * 250-line limit, along a seam that is real rather than convenient: this is
 * geometry, argued in radii and thresholds, and next door is a *picture*,
 * argued in what the pair is doing. Two things now ask for the geometry and
 * neither wants the picture — the body draw, and the scan frame that has to
 * sit around whatever the body currently is.
 */

/** How many bodies are in the membrane. Two, and it is a picture rather than a
 * rule — the simulation has no idea, because what the pair does about this
 * creature is the same whatever is inside it. SYMBIOSIS's own count. */
export const VOICES = 2;

/**
 * How far each body sits from the tile's centre, as a share of a tile, and how
 * much of that distance is left at their closest.
 *
 * **It stands in one lane**, which is the owner's instruction, and the numbers
 * are what makes the pair legible inside it. What matters is the separation as
 * a multiple of a body's own radius, not as a share of a tile: SYMBIOSIS runs
 * from 0.3 to 2.4 radii, and above about 2.2 a metaball genuinely parts.
 *
 * These run from **3.5 to 4.0 radii apart, which is two separate balls with
 * clear space between them**, and the floor is arithmetic rather than taste:
 * with an `r² / d²` field at a threshold of 1, the point halfway between two
 * bodies falls outside the skin at exactly `2√2 ≈ 2.83` radii. Under that they
 * are one shape with a waist; over it the trace returns two rings.
 *
 * **The margin is the whole point of the number.** A draft of this file ran
 * 2.85 to 3.58 — a floor barely half a percent clear of the threshold — and
 * the owner watched the two join before he had shaken anything. Half a percent
 * is nothing against the 5% breath in a body's own radius below, and nothing
 * at all against a grid that walks 22 cells: marching squares bridges a gap
 * thinner than a cell whether the field parted or not. At 3.5 the field
 * halfway between them reads 0.66, which is a gap an eye can see and no
 * rounding can close.
 *
 * **Two, and never joined, until the gesture.** The owner asked for
 * SYMBIOSIS's *last* state — the parted one — four times, and every draft that
 * missed it missed by guessing this number instead of working it out. What
 * closes them is `close`, and only that.
 */
const ORBIT = 0.36;
const FLOOR = 0.87;
/** A body's radius, as a share of a tile. Two of these at `ORBIT` reach a
 * little over a tile across at their widest, which is the lane they stand in. */
const VOICE = 0.18;
/** Seconds for one breathe-wide-and-back, and for one turn of the pair about
 * its own centre. Slow, and prime against each other so the picture never
 * repeats on a count an eye can follow. */
const DRIFT = 5;
const TURN = 23;
/** Grid cells a side the membrane is traced on. See `membranePath`. */
const RES = 22;

/**
 * Where one body of a membrane stands, and how big it is this instant.
 *
 * Exported because two things ask — this file draws them and `choir-prompt.ts`
 * hangs the scan frame around them — and two spellings of a drift is a frame
 * that follows a body that is not there.
 */
export function choirVoiceAt(
  l: Layout,
  x: number,
  y: number,
  i: number,
  time: number,
  close = 0,
): { x: number; y: number; r: number } {
  // A raised cosine, which is `cluster`'s own: apart for most of the cycle and
  // close briefly, so the drift is a thing that happens rather than a wobble.
  const phase = (1 - Math.cos((time / DRIFT) * Math.PI * 2)) / 2;
  // `close` is the gesture landing: 0 while the pair is a pair and 1 once they
  // are one, which is `ChoirMergeFx` driving the orbit to nought over a third
  // of a second (`choir-merge.ts`). It multiplies the separation rather than
  // replacing it, so the drift the two were in the middle of goes on happening
  // while they close and the picture never jumps.
  const apart = l.tile * ORBIT * (FLOOR + (1 - FLOOR) * phase) * (1 - close);
  // On a circle rather than in a row, and the circle turns: SYMBIOSIS places
  // its bodies at `i / bodies` of a turn plus a slow drift, so a pair leans
  // one way and then the other instead of standing to attention.
  const a = (i / VOICES) * Math.PI * 2 + (time / TURN) * Math.PI * 2;
  return {
    x: x + Math.cos(a) * apart,
    // **A circle and not an ellipse**, which is the fix for the last thing the
    // owner caught. `cluster` flattens its own orbit to 0.7 and can afford to:
    // it parts and re-joins on a cycle, so a separation that dips as the pair
    // turns upright changes nothing about what it is showing. Here the pair
    // must be *two* at every angle, and 0.7 of 3.5 radii is 2.45 — under the
    // 2.83 the field joins at. So the two joined on their own every time the
    // turn brought them vertical, which is exactly what he was watching.
    y: y + Math.sin(a) * apart,
    r: l.tile * VOICE * (1 + 0.05 * Math.sin(time * 1.4 + i * 2.3)),
  };
}

/**
 * The membrane's outline: **one traced contour**, or two on the rare frame the
 * pair has come properly apart.
 *
 * The field is the metaball one `cluster` uses — each body contributes
 * `r² / d²` and the skin is where the sum crosses 1 — walked on a grid rather
 * than marched radially from the middle, which is the whole reason the waist
 * between the two is a real shape rather than a dent drawn in.
 *
 * **`RES` is the game's number, not the sheet's.** The sheet traces at 64 cells
 * a side because it is drawing one still picture at a time; this runs every
 * frame for every membrane on the field, so it walks 22 — a cell about a
 * seventh of a body radius. Two round bodies make a smooth field, and the loop
 * is resampled and splined afterwards, so the corners a coarse grid leaves
 * never reach the screen.
 *
 * **It takes a place rather than a `Body`**, which is what lets the merge
 * transient draw the same skin closing over a body whose kind has already
 * changed (`choir-merge.ts`). One copy of what this membrane is, two things
 * that draw it.
 */
export function choirLoops(l: Layout, x: number, y: number, time: number, close = 0): Point[][] {
  const centres: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < VOICES; i++) centres.push(choirVoiceAt(l, x, y, i, time, close));
  const field = (fx: number, fy: number): number => {
    let f = 0;
    for (const c of centres) {
      f += (c.r * c.r) / Math.max((fx - c.x) ** 2 + (fy - c.y) ** 2, 1);
    }
    return f;
  };
  // A body's radius of clearance all round, so the skin never touches the edge
  // of the grid it is traced on — a loop cut off by the box is an open ring,
  // and an open ring fills as a wedge.
  const pad = l.tile * VOICE * 1.7;
  const xs = centres.map((c) => c.x);
  const ys = centres.map((c) => c.y);
  const box = {
    x0: Math.min(...xs) - pad,
    y0: Math.min(...ys) - pad,
    x1: Math.max(...xs) + pad,
    y1: Math.max(...ys) + pad,
  };
  return isoLoops(field, box, 1, RES);
}

/**
 * The same trace as a path, which is what a canvas wants.
 *
 * Split from `choirLoops` above so a test can count the rings without a
 * canvas: **two while the pair is a pair, one once the gesture has closed
 * them**, which is the one thing about this creature that has been got wrong
 * in four separate drafts. `packages/render/test/choir-parted.test.ts` walks a
 * whole drift cycle and fails on a frame where the two have joined on their
 * own — the guard the arithmetic above deserves, since the arithmetic is what
 * kept being guessed.
 */
export function choirMembranePath(
  l: Layout,
  x: number,
  y: number,
  time: number,
  close = 0,
): Path2D {
  const path = new Path2D();
  for (const loop of choirLoops(l, x, y, time, close)) {
    path.addPath(splinePath(resample(loop, 40) as Point[], true));
  }
  return path;
}
