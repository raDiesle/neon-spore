import { BULB, type CreatureSilhouette, SLICK } from "@neon-spore/content";
import { slabs } from "./ghost-glitch.js";

/**
 * THE STRAND's reel: the clock it rolls on, and the bad monitor over it.
 *
 * Cut out of `strand-bead.ts` when the interference took that file past its
 * 250-line limit, along a seam it already had: next door is the two *bodies* a
 * bead can be drawn as — a reel and a raisin — and this is the machinery one
 * of them turns on. It is also the half a candidate look does not touch: a
 * second answer to "what does a body of unknown colour look like" replaces the
 * whole drawing (`tools/versus/candidates/creature-strand/sealed`), so nothing
 * here belongs in the record that gets patched.
 */

/** Swaps a second the reel makes. Fast enough to read as *spinning* rather
 * than as a body that changes its mind, slow enough that the flattened frame
 * in the middle of each swap is actually drawn at sixty frames a second. */
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
 * The two faces of the reel, as a list rather than a ternary.
 *
 * A list because it is one: the reel shows the two bodies a bead can be, in
 * turn, and there is no *rule* here pairing a colour to a shape — which is the
 * thing `livingSilhouette` owns and `copies-table.ts` forbids anyone else from
 * spelling out. Written as `SLICK : BULB` this would read as that pairing and
 * be caught, correctly: a reader would have to check which of the two it was.
 */
const FACES: readonly CreatureSilhouette[] = [SLICK, BULB];

/** Where the reel is in its roll this frame: which of the two bodies it is
 * showing, and how flat it is. Exported so the shape sheet and a candidate can
 * ask the same question rather than each keeping a clock. */
export function reelAt(
  id: number,
  time: number,
): { shape: CreatureSilhouette; flat: number; face: number } {
  const t = time * REEL_HZ + id * 0.37;
  const face = Math.floor(t);
  // 1 at the middle of a face, 0 at the instant of a swap: the body is a line
  // there and the shape changes underneath it, which is what makes the roll
  // read as one object turning rather than two flickering.
  return { shape: FACES[face % FACES.length]!, flat: Math.abs(Math.cos(Math.PI * t)), face };
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
