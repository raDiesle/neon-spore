import { crystalPath, METEOR } from "@neon-spore/content";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE TORCH's flame, such as it is left: a faint ring just outside the stone.
 *
 * Cut out of `torch.ts` when the flame went through a record, and the seam is
 * the one `magnet-look.ts` names: `torch-look.ts` needs the paint and
 * `torch.ts` needs the record, so a record sitting beside the paint would make
 * two files import each other. The paint moved and nothing about it did — the
 * ring below is the same arithmetic, the same alpha and the same stroke it was
 * inside `torch.ts`.
 */

/** The torch's flame, kept only as a faint ring just outside the rock's own
 * outline — a trace of it, not the flame itself. Exported for the bounce
 * (`deflect.ts`): a torch the shield turns away is still a torch, and the ring
 * is the one mark that says so once the tail is gone. */
export function drawEmberRing(ctx: CanvasRenderingContext2D, r: number, time: number): void {
  const ringD = crystalPath(
    0,
    0,
    r * 1.14,
    r * 1.14,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  // Multiplied into whatever alpha the caller already had, and restored
  // rather than set back to 1: a bounced rock is drawn fading out
  // (`deflect.ts`), and a ring that reset the alpha would take the fade with
  // it and leave the stone at full strength for the whole of its flight.
  ctx.save();
  ctx.globalAlpha *= 0.4;
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(new Path2D(ringD));
  ctx.restore();
}
