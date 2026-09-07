import { CHOIR, livingPoints, type Point } from "@neon-spore/content";
import type { Body } from "./creature-body.js";
import { contourClock } from "./creature-place.js";
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
 * **The contour is none of the shapes the pair has a word for**, for the same
 * reason the colour is missing: a bulb silhouette would name cyan without a
 * colour being drawn at all. `CHOIR` in `content/silhouettes.ts` is three
 * shallow lobes on a nearly round body.
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
 * are what makes the pair legible inside it. What matters is the distance as a
 * multiple of a body's own radius, not as a share of a tile: SYMBIOSIS runs
 * from 0.3 to 2.4 radii and is unmistakably two, and 2.4 radii here would be a
 * body two tiles wide. These run from 0.4 to 1.1 — close enough at the bottom
 * of the drift to be one mass with a dent in it, far enough at the top to be
 * two rounds joined at a waist, and a hair over a tile at their widest.
 *
 * `FLOOR` is SYMBIOSIS's own idea off `ClusterOpts`: they never quite meet and
 * never quite part, because a body that visibly separated would be promising a
 * window this creature does not have.
 */
const ORBIT = 0.3;
const FLOOR = 0.35;
/** A body's radius, as a share of a tile. Two of these still overlap at the
 * top of the drift, which is what keeps the pair one mass — the owner has
 * corrected a cluster that fell into separate parts once already. */
const VOICE = 0.27;
/** Seconds for one drift-apart-and-back, and for one turn of the pair about
 * its own centre. Slow, and prime against each other so the picture never
 * repeats on a count an eye can follow. SYMBIOSIS's `period` is 9. */
const DRIFT = 9;
const TURN = 23;

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
): { x: number; y: number; r: number } {
  // A raised cosine, which is `cluster`'s own: apart for most of the cycle and
  // close briefly, so the drift is a thing that happens rather than a wobble.
  const phase = (1 - Math.cos((time / DRIFT) * Math.PI * 2)) / 2;
  const apart = l.tile * ORBIT * (FLOOR + (1 - FLOOR) * phase);
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
 * The two bodies as one path.
 *
 * One path rather than two draws, so the **fill** is a single operation over
 * their union: two translucent fills would darken where they overlap and the
 * lens between them would read as a third thing. The **stroke** is the same
 * path and does outline each body in full — which is wanted here and was not
 * in an earlier draft of this file. Two soap bubbles pressed together show two
 * rims and the lens where they meet; that is what this creature is, and the
 * owner asked for two rounded shapes rather than one fused lump.
 */
function voicesPath(l: Layout, b: Body): Path2D {
  const path = new Path2D();
  for (let i = 0; i < VOICES; i++) {
    const v = choirVoiceAt(l, b.x, b.y, i, b.time);
    // The contour wobble is on the wall clock and keyed by the creature's id,
    // the way every living body's is — deterministic on both devices, so two
    // screens shake the same membrane the same way (`contourClock`).
    const t = contourClock(b.c.id + i, b.time);
    const k = v.r / Math.max(CHOIR.rx, CHOIR.ry);
    const pts: Point[] = livingPoints(CHOIR, t, 24).map((p) => ({
      x: v.x + p.x * k,
      y: v.y + p.y * k,
    }));
    path.addPath(splinePath(pts, true));
  }
  return path;
}

export function drawChoir(b: Body): void {
  const { ctx, l, world, near } = b;
  const haze = (h: string): string => hazed(world.cfg, h, near);

  // The light the pair throws, under everything: a body that is there and
  // cannot be reached still has to be seen coming.
  for (let i = 0; i < VOICES; i++) {
    const v = choirVoiceAt(l, b.x, b.y, i, b.time);
    halo(ctx, v.x, v.y, v.r * 1.9, haze(PALETTE.rock), 0.18);
  }

  const path = voicesPath(l, b);
  ctx.save();
  // **A film and not a fill.** The owner's complaint about the version before
  // this one was that the body hid what was behind it, and a soap film is what
  // this creature has been described as since the first sketch — so the skin is
  // a wash the grid, the beat flash and anything falling behind read straight
  // through, and what is solid is the rim.
  ctx.globalAlpha = 0.38;
  ctx.fillStyle = haze(PALETTE.rock);
  ctx.fill(path);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = haze(PALETTE.rock);
  ctx.lineWidth = Math.max(1.4, l.tile * 0.055);
  ctx.stroke(path);
  ctx.restore();
}
