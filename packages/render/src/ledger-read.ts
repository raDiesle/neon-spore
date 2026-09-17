import { type LedgerBead, type LedgerState, ledgerWalk, type SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { ledgerBeadU, ledgerCordAt, type Point } from "./ledger-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsLedgerBead, showsLedgerSocket } from "./view-role-clocks.js";

/**
 * **What is written about the cord, and which seat is shown it** — *his clock,
 * her column*, which is the design's own sentence for this fight.
 *
 * Its own file beside `ledger-draw.ts` for `taster-read.ts`' reason. The
 * difference between the two bosses is the kind of split: the fan hides
 * nothing and gives each seat a number, and this hides **half of one drawn
 * object** from each of them. The pilot is shown the return coming and how
 * many beats are left of it, and the cord fades out above the plating before
 * it reaches a column he could read (`ledger-cord.ts`). The navigator is shown
 * the socket the cord is rooted in, and the way it walks next, and nothing of
 * where the return has got to.
 *
 * **The last return is on both screens**, and it is the one exception in the
 * file: the design's beat 13 asks for both seats to be shown that bead coming
 * and neither of them asked to stop it, and a payoff one seat cannot see is a
 * payoff the pair cannot talk about.
 */

/** The bead's radius, in tiles, and the last one's. */
const BEAD_R = 0.15;
const LAST_R = 0.23;

/** A bead, and the count of beats left of it written beside it. */
function drawBead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  b: LedgerBead,
  beat: number,
  beatPhase: number,
): void {
  const r = l.tile * (b.last ? LAST_R : BEAD_R);
  const disc = new Path2D();
  disc.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hull, 0.8);
  ctx.fill(disc);
  ctx.restore();
  strokeGlow(ctx, disc, PALETTE.hullRim, STROKE.inner, b.last ? 1 : 0.6);
  // The last return wears a second ring, because it is the one bead in the
  // fight that means the opposite of every other: do nothing.
  if (b.last) {
    const ring = new Path2D();
    ring.arc(at.x, at.y, r * 1.8, 0, Math.PI * 2);
    strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.inner, 0.5);
  }
  const left = Math.max(0, Math.ceil(b.beat - beat - beatPhase));
  const size = Math.max(8, Math.min(13, l.tile * 0.34));
  ctx.save();
  ctx.font = `600 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.hullRim;
  ctx.fillText(String(left), at.x + r * 1.9, at.y);
  ctx.restore();
}

/**
 * **The pilot's read**: every return on the cord, where it has got to, and how
 * many beats are left of it.
 *
 * His because he owns the trigger, and the trigger is the only thing in this
 * fight that answers a return. He is not shown the column: he cannot be, or
 * she has nothing to say — and the beats are the half of it he has to say back
 * to her, because she is the one who has to be somewhere by then.
 */
export function drawLedgerBeads(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  t: LedgerState,
  from: Point,
  to: Point,
  taut: number,
  time: number,
  beat: number,
  beatPhase: number,
): void {
  const mine = showsLedgerBead(l.role);
  for (const b of t.beads) {
    if (!mine && !b.last) continue;
    const at = ledgerCordAt(l, from, to, taut, time, ledgerBeadU(b, beat, beatPhase));
    drawBead(ctx, l, at, b, beat, beatPhase);
  }
}

/**
 * **The navigator's read**: the lock on the column the cord is rooted in, and
 * a chevron for the column it walks to next.
 *
 * Hers because she carries the plate, and the plate has to be in that column
 * on the beat the return lands. White, which is the design's own choice for
 * this mark and the reason the socket itself is violet: the hole is a piece of
 * the boss and the lock is a piece of the interface.
 *
 * The chevron is the one thing on either screen about a beat that has not
 * happened — the root walks with **every** return that reaches the hull, so
 * where it goes next is knowable and saying it early is the whole of her job
 * getting easier (`sim/ledger-step.ts`, `slide`).
 */
export function drawLedgerLock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  t: LedgerState,
  at: Point,
  beatPhase: number,
): void {
  if (!showsLedgerSocket(l.role)) return;
  const d = l.tile * (0.36 + 0.03 * Math.cos(beatPhase * Math.PI * 2));
  const lock = new Path2D();
  for (const side of [-1, 1]) {
    const x = at.x + side * d;
    lock.moveTo(x - side * d * 0.35, at.y - d * 0.5);
    lock.lineTo(x, at.y - d * 0.5);
    lock.lineTo(x, at.y + d * 0.2);
    lock.lineTo(x - side * d * 0.35, at.y + d * 0.2);
  }
  strokeGlow(ctx, lock, PALETTE.text, STROKE.inner, 0.65);
  // And where it goes next, one column along, turned at the wall by the
  // simulation rather than by this arrow (`slide`).
  const next = ledgerWalk(t, cfg);
  const way = next.col >= t.socket ? 1 : -1;
  const tip = at.x + way * d * 1.5;
  const arrow = new Path2D();
  arrow.moveTo(tip - way * d * 0.4, at.y - d * 0.32);
  arrow.lineTo(tip, at.y - d * 0.15);
  arrow.lineTo(tip - way * d * 0.4, at.y + d * 0.02);
  strokeGlow(ctx, arrow, PALETTE.dim, STROKE.inner, 0.5);
}
