import { halo, strokeGlow } from "./glow.js";
import { stream } from "./hash.js";
import type { HullBreakPaint } from "./hull-break-look.js";

/**
 * The hole shown to have an inside: ribs of the frame standing in the dark
 * where the skin used to be, light venting up out of the mouth, and one cut
 * running a little deeper than the rest.
 *
 * **What it argues** is that the ship should be shown to have an inside. A pit
 * in a membrane says the surface is damaged; structure in the dark says the
 * thing the pair is standing on is broken, which is what a lost wave is.
 *
 * **What the owner changed about it before it shipped**, on 16 September 2026,
 * and it is most of the file: *the crater shape must stay like current in game
 * untouched, so the dark shouldn't go lower than the crater. Only apply the
 * lines with the glowing on the dark area where the meteor shape was before,
 * keep the glowing on top, and just add a little bit of vertical glowing line
 * going further from the dark into the crater area — without extending the
 * dark area or changing the overall crater graphics.*
 *
 * So the cavity is gone. The candidate opened a bezier half an ellipse wide
 * and one and a half radii deep under the mouth and filled it black, which is
 * a second hole drawn under the first and a bigger one: the crater the game
 * has drawn since it had craters (`crater-pit.ts`) was a shape inside that one
 * rather than the thing the pair was looking at. What is left is what the ribs
 * and the vent were always *for* — the ribs stand in the hole's own dark and
 * are clipped to it, so this look physically cannot widen a crater
 * (`HullBreakPaint.dark`).
 *
 * **The one thing that does reach past it is the cut**, and it is the owner's
 * own addition: a single line down out of the hole, a little of the hole's own
 * dark carried with it, and nothing else. It is narrow on purpose — a break
 * that says *it went further in here* rather than *the hole is bigger than it
 * looks*.
 */

/**
 * How far past the hole the break is legible, in tiles — the record's switch.
 *
 * It was 1.4 while the cavity existed, and that number was honest then: the
 * candidate really did draw damage a tile and a half out from the mouth. Now
 * the only things outside the hole are the torn lip and the cut, and both are
 * measured off the hole's own size. A number left at 1.4 would tell the next
 * answer in this slot that a tile and a half is the shipped reach, which would
 * be a lie in the one field the vote is really cast on.
 */
export const OPEN = 0.35;

/** How many ribs cross the dark. Odd, so the middle of the hole has one. */
const RIBS = 5;

/** How far below the hole's floor the cut reaches, in radii. Short: the owner
 * asked for *a little bit*, and a long one is a second crack competing with
 * the real one `scars.ts` already draws out of the rim. */
const CUT_DEEP = 0.85;

/** Half the width of the dark carried down with the cut, in radii. */
const CUT_WIDE = 0.2;

/** The vent's radius, in tiles, and the halo's quantisation (`glow.ts`). */
const VENT_TILES = 0.9;
const VENT_STEP = 6;

export function gape(ctx: CanvasRenderingContext2D, b: HullBreakPaint): void {
  const rnd = stream(b.seed + 3);
  const half = Math.max(b.r, (b.right - b.left) / 2);

  // Where the cut goes, drawn first so the dark it carries is under the ribs
  // and under the vent rather than over them. Off the hole's middle by a
  // little, because a break that always opened at the exact centre of its own
  // hole would read as a drawn symbol rather than as damage.
  const cutX = b.x + (rnd() - 0.5) * half * 0.5;
  const cutTo = b.floor + b.r * CUT_DEEP;
  const wide = b.r * CUT_WIDE;
  const tongue = new Path2D();
  // From inside the hole, so there is no seam where it leaves the dark: above
  // `floor` this is the same colour as what is already there.
  tongue.moveTo(cutX - wide, b.y);
  tongue.quadraticCurveTo(cutX - wide * 0.6, cutTo, cutX, cutTo);
  tongue.quadraticCurveTo(cutX + wide * 0.6, cutTo, cutX + wide, b.y);
  tongue.closePath();
  ctx.fillStyle = b.pit;
  ctx.fill(tongue);

  // The frame, where the skin came off it — inside the hole's own outline and
  // nowhere else. The clip is the whole of the owner's rule: a rib runs from
  // the skin line to well below the crater and only the part of it that is
  // inside the crater is ever drawn.
  ctx.save();
  ctx.clip(b.dark);
  for (let i = 0; i < RIBS; i++) {
    const u = (i + 0.5) / RIBS;
    const x = b.left + (b.right - b.left) * u;
    const lean = (rnd() - 0.5) * half * 0.3;
    const rib = new Path2D();
    rib.moveTo(x, b.y);
    rib.lineTo(x + lean, b.floor + b.r);
    strokeGlow(ctx, rib, b.rim, Math.max(1, b.tile * 0.03), 0.35 + 0.35 * Math.sin(u * Math.PI));
  }
  ctx.restore();

  // The cut itself, the one line allowed out of the hole. Not clipped: this is
  // the thing the owner asked to go further than the dark.
  const cut = new Path2D();
  cut.moveTo(cutX, b.y);
  cut.lineTo(cutX, cutTo);
  strokeGlow(ctx, cut, b.rim, Math.max(1, b.tile * 0.035), 0.75);

  // And what is getting out: a vent standing in the mouth, breathing.
  const lit = 0.55 + 0.25 * Math.sin(b.time * 3.1 + b.seed);
  const r = b.tile * VENT_TILES;
  halo(ctx, b.x, b.y, Math.max(VENT_STEP, Math.round(r / VENT_STEP) * VENT_STEP), "#FF7A2F", lit);

  // The torn lip, so the hole has an edge rather than fading into the skin.
  const lip = new Path2D();
  lip.moveTo(b.left - half * 0.25, b.skinY(b.left - half * 0.25));
  lip.lineTo(b.left, b.y);
  lip.moveTo(b.right, b.y);
  lip.lineTo(b.right + half * 0.25, b.skinY(b.right + half * 0.25));
  strokeGlow(ctx, lip, b.rim, Math.max(1, b.tile * 0.04), 0.8);
}
