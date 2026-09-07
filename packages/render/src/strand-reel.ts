import { type CreatureSilhouette, livingSilhouette } from "@neon-spore/content";
import { livingKindForColor } from "@neon-spore/sim";
import { slabs } from "./ghost-glitch.js";

/**
 * THE STRAND's reel: the clock it rolls on, and the bad monitor over it.
 *
 * Cut out of `strand-bead.ts` when the interference took that file past its
 * 250-line limit, along a seam it already had: next door is the two *bodies* a
 * bead can be drawn as — a reel and a raisin — and this is the machinery one
 * of them turns on. It is also the half a candidate look does not touch: a
 * second answer to "what does a body of unknown colour look like" replaces the
 * whole drawing, so nothing here belongs in the record that gets patched.
 */

/**
 * Swaps a second the reel makes.
 *
 * **Six, which is where it started.** It spent a while at 2.2, on the argument
 * that a face up for a twelfth of a second is long enough to see *that* the
 * bead is changing and not long enough to see *what into* — five of them read
 * as a strip of noise rather than as five things each of which is one of two.
 * The two rates were then stood side by side on two phones at tempo, which is
 * the only way that question could be settled, and the owner took the fast one
 * (`docs/versus.md`). Six is right because a thread at six does not read as a
 * row of bodies at all: it reads as a row of pictures that will not hold, and
 * that is what a bead of unknown colour is.
 */
const REEL_HZ = 6;

/** How far the picture jumps at a swap, as a share of a tile. Small: a jump an
 * eye can see and a hand cannot mistake for the body having moved lane. */
export const REEL_JUMP = 0.05;

/** How much of the body one roll bar covers, how long it takes to sweep from
 * top to bottom — slower than the reel, so the two faults read as two — and
 * how torn the bands are, which is `slabs`' rage argument at a constant this
 * creature stands at: always moving, never throwing a slab clear of the
 * outline, because a shard outside a bead's contour would be a second body on
 * a field the pair is counting. */
const BAR_HEIGHT = 0.22;
const BAR_SECONDS = 1.7;
const TEAR = 0.5;

/**
 * The two faces: the two bodies a bead can be, **derived from the two colours**
 * rather than typed out.
 *
 * A face is a silhouette and nothing else — the colour it was reached through
 * does not survive into the picture, because the reel is drawn in one violet
 * for both of them (`strand-bead.ts`). But the pairing between a colour and a
 * body is still a rule this file may not spell: `livingKindForColor` owns it,
 * and `copies-table.ts` fails on anyone choosing between the two contours by
 * hand in a ternary. Reading it out through `livingSilhouette` is the same
 * move `entry-fields.ts` makes in the director, and it means a roster that
 * ever gained a third colour would gain a third face here for nothing.
 */
const FACES: readonly CreatureSilhouette[] = (["red", "cyan"] as const).map((color) =>
  livingSilhouette(livingKindForColor(color)),
);

/** Where the reel is in its roll this frame: which of the two bodies it is
 * showing, and how flat it is. Exported so the shape sheet and a candidate can
 * ask the same question rather than each keeping a clock. */
export function reelAt(id: number, time: number): ReelFace {
  return faceAt(time * REEL_HZ + id * 0.37);
}

/** One face of the roll, at a point on the reel's own continuous clock. */
export interface ReelFace {
  shape: CreatureSilhouette;
  flat: number;
  face: number;
}

function faceAt(t: number): ReelFace {
  const face = Math.floor(t);
  const showing = FACES[face % FACES.length]!;
  // 1 at the middle of a face, 0 at the instant of a swap: the body is a line
  // there and the shape changes underneath it, which is what makes the roll
  // read as one object turning rather than two flickering.
  return { shape: showing, flat: Math.abs(Math.cos(Math.PI * t)), face };
}

/**
 * The interference over one reel: torn bands sliding sideways, and a roll bar
 * sweeping down through them.
 *
 * Everything is clipped to the body's own contour, so every edge on the screen
 * is the silhouette's — `wisp-static.ts`'s arrangement, and for its reason: a
 * band that reached outside would be a mark on the field rather than a fault
 * in the picture, and the pair counts marks.
 */
export function drawReelStatic(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  id: number,
  time: number,
  rx: number,
  ry: number,
  x: number,
  y: number,
  hex: string,
): void {
  ctx.save();
  ctx.clip(body);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = hex;
  for (const s of slabs(id, time, TEAR)) {
    ctx.globalAlpha = 0.08 + Math.abs(s.shift) * 0.42;
    ctx.fillRect(x - rx + s.shift * rx, y + s.top * ry, rx * 2, s.height * ry * 0.6);
  }
  // The bar, sweeping from above the body to below it so it is never seen to
  // start or stop — a roll has no ends.
  const at = ((time / BAR_SECONDS + id * 0.19) % 1) * (2 + BAR_HEIGHT * 2) - 1 - BAR_HEIGHT;
  ctx.globalAlpha = 0.22;
  ctx.fillRect(x - rx, y + at * ry, rx * 2, BAR_HEIGHT * ry);
  ctx.restore();
}
