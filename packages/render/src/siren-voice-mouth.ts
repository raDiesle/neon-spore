import { drawEarGlyph } from "./comms-glyphs.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **A mouth that talks and an ear that hears it.** The talker's mark is a
 * pair of lips opening and shutting on syllables — the fastest thing a face
 * does, and the one an eye catches first. Adopted from VERSUS `siren:voice`
 * (the owner, 19 October 2026, over bars, typing and waves).
 *
 * The listener's is the ear **hearing**, asked for the same day so the seat
 * that has to listen reads as busy rather than idle: each syllable the mouth
 * opens on is sent as a wave that travels in to the ear, and when it lands
 * the ear leans in and lights. The two marks run on one clock (`mouthOpen`),
 * so the listener's ear catches what the talker's mouth just said.
 */

/** The block's own cream: what is knocked out of the talker's dark ink. */
const BLOCK = PALETTE.text;
/** What the hearing ear lights up in, over its dim outline. */
const LIT = PALETTE.text;
const TAU = Math.PI * 2;

export function mouthSpeak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  const open = mouthOpen(time);
  const w = 6;
  const top = y - 3.4;
  // An open mouth seen from the front: a flat upper lip and a jaw that drops
  // with every syllable — a D on its back. Not a lens: a lens with something
  // in it is the eye the strip already marks its blip with.
  ctx.save();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(x - w, top);
  ctx.quadraticCurveTo(x, top + 1.2, x + w, top);
  // A quadratic reaches half its control's depth: 1.5 shut, 8.5 wide open.
  ctx.quadraticCurveTo(x, top + 3 + 14 * open, x - w, top);
  ctx.fill();
  // The tongue, in the block's own cream, once the jaw is down far enough.
  if (open > 0.35) {
    ctx.fillStyle = BLOCK;
    ctx.beginPath();
    ctx.ellipse(x, top + 1 + 5.4 * open, 2.8, 1.6 * open, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** How long, in seconds, a syllable takes to reach the ear from the outermost
 * wave: short enough that the ear still answers the mouth it can see. */
const TRAVEL = 0.24;
/** The waves in flight, outermost first: how far out each one is. All three
 * stay inside the chip's glyph room (`GLYPH_ROOM` in `siren-seats.ts`), so a
 * long name's last letter is never under one. */
const WAVE_R = [8, 6.6, 5.2] as const;

export function mouthListen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  const heard = hearing(time);
  const ex = x + 2;
  // One save for the whole mark: the siren is in nearly every frame the
  // op-count budgets draw, so the waves share it rather than taking one each.
  ctx.save();
  ctx.strokeStyle = LIT;
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  // The syllables on their way in: each wave is the mouth's opening at the
  // moment it set off, so a loud syllable is seen to travel inward and land.
  WAVE_R.forEach((r, k) => {
    const sent = mouthOpen(time - (TRAVEL * k) / (WAVE_R.length - 1));
    ctx.globalAlpha = 0.12 + 0.78 * sent * sent;
    ctx.beginPath();
    ctx.arc(ex, y, r, Math.PI - 0.85, Math.PI + 0.85);
    ctx.stroke();
  });
  // The ear leans towards what it hears, the moment it lands, and lights:
  // its dim ink goes to cream as strong as the syllable.
  ctx.translate(ex, y + 4);
  ctx.rotate(-0.24 * heard);
  ctx.translate(-ex, -(y + 4));
  drawEarGlyph(ctx, ex, y, 4.6, mixHex(ink, LIT, 0.85 * heard), 0.95);
  ctx.restore();
}

/**
 * How hard the listener is hearing right now, 0 to 1: the syllable that has
 * just reached the ear. The chip's own outline reads it too (`siren-seats.ts`),
 * so the whole listener's chip answers each word and not the glyph alone.
 */
export function hearing(time: number): number {
  return mouthOpen(time - TRAVEL);
}

/** How far the mouth is open, 0 to 1: syllables on a slower phrase. */
function mouthOpen(time: number): number {
  return 0.15 + 0.85 * Math.abs(Math.sin(time * 9)) * (0.55 + 0.45 * Math.sin(time * 2.3) ** 2);
}
