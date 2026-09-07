import { isoLoops, type Point, resample } from "@neon-spore/content";
import { choirFusePhase } from "@neon-spore/sim";
import type { Body } from "./creature-body.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE CHOIR as it stands before the pilot's gesture: **two rounded bodies in
 * one membrane, inside a single tile**, leaning on each other and drifting.
 *
 * **It is SYMBIOSIS, and this file is on its third draft for getting there.**
 * The first invented a picture — three dots suspended inside a grey membrane.
 * The second read HERALD off the drafts page and made three bodies across
 * three lanes, which the owner rejected in the plainest terms: *I expected
 * shapes like Symbiosis — rounded, 2 shapes, can be in one tile — and when
 * shaking they merge into one, and this one becomes the slick or bulb. Right
 * now you hide with 3 grey blobs what is behind.* So it is **two**, it is
 * **one tile**, and it is **see-through**. `cluster("SYMBIOSIS", "two bodies
 * in one membrane, safe while touching", { bodies: 2, spread: 2.4, floor:
 * 0.12 })` in `tools/shape-sheet/src/drafts/creatures.ts` is the subject, and
 * the two orbit each other there rather than sitting in a row — which is what
 * the angle below is.
 *
 * **It hides nothing behind it.** That was the owner's own complaint about the
 * draft before this one, and it is the reason the skin is a membrane rather
 * than a fill: the grid, the beat flash and anything falling behind read
 * straight through it, and what is solid is the rim. A soap film is what this
 * creature was always described as, and an opaque body was never that.
 *
 * **The grey is the creature, not a placeholder.** Every other body on this
 * field says which trigger answers it the moment it is drawn — that is what
 * `livingKindForColor` and the two ammunition colours are for. This one says
 * nothing, because until the two have drawn together there is no trigger that
 * answers it at all, and a body tinted red would be the field promising player
 * 2 a shot that will bounce. `PALETTE.rock` is the game's own word for
 * *nothing you carry reaches this*.
 *
 * **The outline is the sheet's own trace and not an approximation of it.** Two
 * blob contours drawn over each other read as two bodies with two rims, which
 * is what the draft before this one did and what the owner rejected. A
 * metaball field traced by marching squares is one skin with a waist in it,
 * and it is the same `isoLoops` the shape sheet draws SYMBIOSIS with —
 * `packages/content/src/metaball.ts`, moved there from the tool so that the
 * game and the sheet cannot come to disagree about what this shape is.
 *
 * **No silhouette, and none needed.** Every other living body walks a lobed
 * contour out of `CreatureSilhouette`; this one has no rim of its own at all,
 * because what makes its shape is where two fields add up. A lobed silhouette
 * would also have been a tell — a bulb rim would name cyan before a colour was
 * ever drawn.
 *
 * **Nothing here is drawn after the merge.** The kind changes on the instant
 * and the lane never moves (`sim/choir.ts`), so the thing standing there a
 * frame later is an ordinary slick or bulb in the same column, with an ordinary
 * colour and its own motion, drawn by `drawLiving` like anything else — which
 * is exactly the *one shape like a bulb or a slick* the owner asked for.
 *
 * It takes a `Body` rather than loose arguments because it is a row in
 * `creature-body.ts`'s table and a wrapper for one row is a wrapper that has to
 * be kept in step with the record. The type comes back from that file, which is
 * a type-only cycle and the arrangement `handles.ts` and `touch.ts` stand in.
 */

/** How many bodies are in the membrane. Two, and it is a picture rather than a
 * rule — the simulation has no idea, because what the pair does about this
 * creature is the same whatever is inside it. SYMBIOSIS's own count. */
const VOICES = 2;
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

export function drawChoir(b: Body): void {
  const { ctx, l, world, near } = b;
  const haze = (h: string): string => hazed(world.cfg, h, near);
  // **The closing is read off the world, not off a clock this file keeps.**
  // `choirFuseTick` is on the body and in the fingerprint, so how far shut the
  // film is and whether a shot reaches it are one number on both phones — and
  // a run restarted mid-close cannot leave a stale transient behind, because
  // there is no transient. It is the arrangement `veilArmourPhase` already
  // has, and the reason the merge needs nothing in `Effects` at all.
  const close = choirFusePhase(world, b.c);

  // The light the pair throws, under everything: a body that is there and
  // cannot be reached still has to be seen coming.
  for (let i = 0; i < VOICES; i++) {
    const v = choirVoiceAt(l, b.x, b.y, i, b.time, close);
    halo(ctx, v.x, v.y, v.r * 1.9, haze(PALETTE.rock), 0.18);
  }

  const path = choirMembranePath(l, b.x, b.y, b.time, close);
  ctx.save();
  // **A film and not a fill.** The owner's complaint about an earlier draft was
  // that the body hid what was behind it, and a soap film is what this creature
  // has been called since the first sketch — so the skin is a wash the grid,
  // the beat flash and anything falling behind read straight through, and what
  // is solid is the rim.
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = haze(PALETTE.rock);
  ctx.fill(path);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = haze(PALETTE.rock);
  ctx.lineWidth = Math.max(1.4, l.tile * 0.055);
  ctx.stroke(path);
  ctx.restore();
}
