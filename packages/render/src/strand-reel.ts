import { type CreatureSilhouette, livingSilhouette } from "@neon-spore/content";
import { type Color, livingKindForColor } from "@neon-spore/sim";
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

/**
 * Swaps a second the reel makes.
 *
 * **It was six, and six was too fast to be read.** At that rate a face is up
 * for a twelfth of a second — long enough to see *that* the bead is changing
 * and not long enough to see *what into*, so a thread of five read as a strip
 * of noise rather than as five things each of which is one of two. The owner
 * asked for slower, and slower is what makes the picture an argument: at 2.2 a
 * face stands for most of half a second, which is time to recognise a red
 * slick, and then a cyan bulb, and to understand that the bead is offering
 * both rather than hiding.
 *
 * It cannot go much below this. The navigator has to be able to say a bead's
 * *place* under a beat, and a body that holds one face for a second starts to
 * look like a body that has settled — which is the one thing this picture must
 * never say.
 */
const REEL_HZ = 2.2;

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

/** One face of the reel: a whole body, colour and all. */
export interface Face {
  color: Color;
  shape: CreatureSilhouette;
}

/**
 * The two faces, **derived from the two colours** rather than typed out.
 *
 * The reel shows the two bodies a bead can be, in turn, and a body is a colour
 * *and* a shape — so a face has to carry both, and the pairing between them is
 * a rule this file may not spell. `livingKindForColor` owns it, and
 * `copies-table.ts` fails on anyone choosing between the two contours by hand
 * in a ternary; reading it out through `livingSilhouette` is the same move
 * `entry-fields.ts` makes in the director, and it means a roster that ever
 * gained a third colour would gain a third face here for nothing.
 *
 * **The colour is the half the owner asked for, and it is not a leak.** A reel
 * that rolled through the shapes in one neutral violet said *this is a body of
 * unknown kind*; one that rolls through a red slick and a cyan bulb says the
 * true and much sharper thing — *it is one of these two, and which is not
 * yours to know*. Nothing about the face depends on the bead's real colour:
 * the clock below is the wall clock and the body's own id, and that is all.
 */
const FACES: readonly Face[] = (["red", "cyan"] as const).map((color) => ({
  color,
  shape: livingSilhouette(livingKindForColor(color)),
}));

/** Where the reel is in its roll this frame: which of the two bodies it is
 * showing, and how flat it is. Exported so the shape sheet and a candidate can
 * ask the same question rather than each keeping a clock. */
export function reelAt(
  id: number,
  time: number,
): { shape: CreatureSilhouette; color: Color; flat: number; face: number } {
  const t = time * REEL_HZ + id * 0.37;
  const face = Math.floor(t);
  const showing = FACES[face % FACES.length]!;
  // 1 at the middle of a face, 0 at the instant of a swap: the body is a line
  // there and the shape changes underneath it, which is what makes the roll
  // read as one object turning rather than two flickering.
  return {
    shape: showing.shape,
    color: showing.color,
    flat: Math.abs(Math.cos(Math.PI * t)),
    face,
  };
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
