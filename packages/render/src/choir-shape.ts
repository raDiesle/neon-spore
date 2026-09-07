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
 * These run from **3.0 to 3.4 radii apart, which is two separate balls**, and
 * the floor is arithmetic rather than taste: with an `r² / d²` field at a
 * threshold of 1, the point halfway between two bodies falls outside the skin
 * at exactly `2√2 ≈ 2.83` radii. Under that they are one shape with a waist;
 * over it the trace returns two rings and the pair is two bodies.
 *
 * **Two, and never joined, until the gesture.** The owner asked for
 * SYMBIOSIS's *last* state — the parted one — and three drafts of this file
 * shipped a joined pair or an oval because the number was guessed rather than
 * worked out. What closes them is `close`, and only that: *two become one, not
 * one becomes two*, so an idle body that drifted shut on its own would be
 * doing the pair's work for them and then undoing it.
 */
const ORBIT = 0.34;
const FLOOR = 0.88;
/** A body's radius, as a share of a tile. Two of these at `ORBIT` reach a
 * tile across at their widest, which is the lane they stand in. */
const VOICE = 0.2;
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
    // Flattened, the way a cluster's own field is: the pair reads as leaning
    // rather than as one body stacked on another.
    y: y + Math.sin(a) * apart * 0.7,
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
export function choirMembranePath(
  l: Layout,
  x: number,
  y: number,
  time: number,
  close = 0,
): Path2D {
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
  const path = new Path2D();
  for (const loop of isoLoops(field, box, 1, RES)) {
    path.addPath(splinePath(resample(loop, 40) as Point[], true));
  }
  return path;
}
