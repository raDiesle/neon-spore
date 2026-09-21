import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { shutPlates } from "../../../../../packages/render/src/lost-shut.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * One rivulet instead of thirteen, four times as wide and ten times as slow,
 * and it comes down the column the ship was broken in.
 *
 * The owner, 19 September 2026, on the shipped `bleed`: much slower, fewer
 * elements. Two of the four answers in this slot take that as *a different
 * substance in a different colour*; this one takes it as arithmetic on the
 * thing already there, and keeps everything else about it — the ship's own
 * violet, a run from the top edge, a column that wanders as it falls. So the
 * sheet has one answer that isolates the count and the speed and changes
 * nothing else, and a vote against it is a vote about the substance rather
 * than about how much of it there is.
 *
 * **It falls where the hull was hit.** `breachX` is the one fact this screen
 * hands a paint that the field's own picture agrees with, and a single
 * rivulet has somewhere to be that thirteen never did: thirteen must be
 * scattered, one can be aimed. It arrives at the break twelve seconds in and
 * keeps going, so the pair who look up late find it already past. On a wave
 * that scars nothing it comes down the middle, which is the case `breachX` is
 * null for.
 *
 * **It is wide enough to be a body and no wider.** A rivulet a third of a
 * tile across is a scratch; at a tile it has a lit edge on each side, a head
 * with a weight to it and a width that wavers, which are the three things that
 * make a falling column read as fluid rather than as a bar being extended. At
 * two and a half — where this stood for one shot — it is a pillar with the
 * words behind it.
 *
 * **How it can lose.** It is the least of the four: on a screen the pair have
 * seen six times it is the shipped picture with twelve of its thirteen parts
 * removed, and *one slow thing* is exactly what a loss screen risks nobody
 * noticing. It also runs straight down the middle of the words' own stack on
 * every wave whose breach is near the middle, which is most of them.
 */

/** Seconds from the screen coming up to the head reaching the hull. */
const FALL = 12;

/** How wide the column is, in tiles. The first shot of this stood at two and
 * a half and took a quarter of the phone's width — not a rivulet, a pillar,
 * and the words were behind it. */
const WIDE = 1.1;

/** How far the column wanders off its own line, as a share of its width. */
const WANDER = 1.1;

/** The body at its heaviest, which is where it is thickest. */
const DEEP = 0.62;

/** And along its edges, where it is thinning. */
const THIN = 0.28;

const HUE = PALETTE.hull;
const RIM = PALETTE.hullRim;

/** How far off its own line the column stands at this height: two slow waves
 * out of step, so the wander never repeats inside one screen's height. */
function wander(y: number, tile: number): number {
  return (
    (Math.sin(y / (tile * 4.1)) * 0.7 + Math.sin(y / (tile * 1.7) + 2.1) * 0.3) * tile * WANDER
  );
}

/** And how wide it is there: thickest a third of the way down, the way a run
 * of anything heavy gathers behind its own head. */
function half(y: number, head: number, tile: number): number {
  const along = head <= 0 ? 0 : Math.min(1, y / head);
  return tile * WIDE * 0.5 * (0.72 + 0.4 * Math.sin(along * Math.PI * 0.9));
}

export const oneRun = (ctx: CanvasRenderingContext2D, p: LostPaint): void => {
  shutPlates(ctx, p);
  const { tile } = p.l;
  const x0 = p.breachX ?? p.l.width / 2;
  // Eased in and out: it leaves the top edge slowly and slows again at the
  // break, which is the one place on the screen it is meant to be looked at.
  const head = smoothstep(Math.min(1, p.age / FALL)) * (p.l.hullY + tile * 3);
  if (head <= tile * 0.2) return;
  const step = tile * 0.5;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0 + wander(0, tile) - half(0, head, tile), 0);
  for (let y = step; y < head; y += step) {
    ctx.lineTo(x0 + wander(y, tile) - half(y, head, tile), y);
  }
  // The head: a lobe hanging off the end, not a cut across it.
  const nose = x0 + wander(head, tile);
  const hw = half(head, head, tile);
  ctx.quadraticCurveTo(nose - hw, head + hw * 1.5, nose, head + hw * 1.5);
  ctx.quadraticCurveTo(nose + hw, head + hw * 1.5, nose + hw, head);
  for (let y = head - step; y > 0; y -= step) {
    ctx.lineTo(x0 + wander(y, tile) + half(y, head, tile), y);
  }
  ctx.lineTo(x0 + wander(0, tile) + half(0, head, tile), 0);
  ctx.closePath();
  // Across the column and not down it: the edges are where it is thinning
  // into the dark, and a rivulet lit evenly across its width is a ribbon.
  const across = ctx.createLinearGradient(x0 - tile * WIDE * 0.5, 0, x0 + tile * WIDE * 0.5, 0);
  across.addColorStop(0, rgba(HUE, THIN));
  across.addColorStop(0.45, rgba(HUE, DEEP));
  across.addColorStop(1, rgba(HUE, THIN));
  ctx.fillStyle = across;
  ctx.fill();
  ctx.strokeStyle = rgba(RIM, 0.45);
  ctx.lineWidth = Math.max(1, tile * 0.05);
  ctx.stroke();
  ctx.restore();
};
