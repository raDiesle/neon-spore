import { smoothstep } from "./ease.js";
import { signedHash, sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Wound } from "./lost-wound.js";
import { PALETTE } from "./palette.js";

/**
 * What bleeds out of the wound: the collar of blood standing inside its rim,
 * and the tongues that come over the edge and run down the plate.
 *
 * Its own file for the reason the violet rivulets had one before it, deleted
 * the same day as this was written: what the hole *is* — a torn circle
 * with a reticle round it — and what comes out of it are two arguments, and
 * `lost-wound.ts` holds as much of one as a file is allowed to hold.
 *
 * **The collar is what keeps it bleeding.** A tongue runs, thins and goes, and
 * a hole with only tongues on it empties between them; a band of red standing
 * inside the rim the whole time, swelling on a slow breath, is the screen
 * saying that more is coming up behind — which is what the owner asked for on
 * 22 September 2026 in the same sentence as the tongues.
 *
 * **It is a function of `age` and nothing else.** No state, no `Effects` entry,
 * nothing that outlives a frame (`restart.test.ts`'s rule): every tongue's
 * length comes from its index and the clock each time, so the screen can be
 * drawn twice on one tick and look the same both times, and two phones bleed
 * the same way.
 */

/** How many tongues run at once. */
const DRIPS = 6;
/** Seconds the shortest tongue takes to run its length, before its variation. */
const CREEP = 13;
/** How far a tongue runs, in hole radii. */
const REACH = 3.1;
/** A tongue's widest, as a share of the hole's radius. */
const WIDE = 0.3;
/**
 * The arc the blood hangs off, as a share of a turn clockwise from the right —
 * which on a canvas, where y grows downward, is the **lower** half of the
 * circle. Just short of the two sides, so nothing wells out horizontally.
 */
const HANGS_FROM = 0.06;
const HANGS_TO = 0.44;

/** The band of red standing inside the lower rim, breathing. */
export function collar(ctx: CanvasRenderingContext2D, w: Wound, age: number): void {
  const swell = 0.26 + 0.07 * Math.sin(age * 0.5);
  ctx.beginPath();
  ctx.arc(w.cx, w.cy, w.r * (1 - swell / 2), Math.PI * 2 * HANGS_FROM, Math.PI * 2 * HANGS_TO);
  ctx.lineWidth = w.r * swell;
  ctx.strokeStyle = rgba(PALETTE.red, 0.55);
  ctx.stroke();
}

/** All six, at `age`. */
export function tongues(ctx: CanvasRenderingContext2D, w: Wound, age: number): void {
  for (let i = 0; i < DRIPS; i++) bleed(ctx, one(i, w, age), i, w);
}

/** One tongue at `age`, from its index alone. */
function one(i: number, w: Wound, age: number) {
  const period = CREEP * (1 + sinHash(i, 11) * 0.9);
  const t = ((age + sinHash(i, 12) * period) % period) / period;
  const turn = HANGS_FROM + ((HANGS_TO - HANGS_FROM) * (i + 0.5)) / DRIPS;
  const a = (turn + signedHash(i, 13) * 0.05) * Math.PI * 2;
  // Anchored inside the rim, so a tongue is seen to come *out* of the hole
  // rather than to start on the plate beside it.
  return {
    x: w.cx + Math.cos(a) * w.r * 0.9,
    y: w.cy + Math.sin(a) * w.r * 0.9,
    len: w.r * REACH * smoothstep(t) * (0.6 + sinHash(i, 14) * 0.7),
    half: (w.r * WIDE * (0.5 + sinHash(i, 15) * 0.7)) / 2,
    // In over the first breath, out over the last quarter: a tongue that
    // vanished on a frame would be the one sharp movement on a screen that
    // was asked to hold still.
    fade: Math.min(1, t / 0.1) * (1 - Math.max(0, (t - 0.75) / 0.25)),
  };
}

/** How far a tongue has wandered sideways, a share of the way down it. */
function wander(i: number, t: number, r: number): number {
  return Math.sin(t * 3.1 + i * 2.3) * r * 0.16 * t;
}

/**
 * One tongue, over the plate: a ribbon from inside the rim down to its head,
 * thin where it started and full where it is going, with the bead that is
 * actually moving at the end of it.
 *
 * Walked as two sides rather than stroked as a line, for the reason the
 * rivulets were before it: a stroke is one width all the way, and a thing
 * running out of a hole is not.
 */
function bleed(
  ctx: CanvasRenderingContext2D,
  d: ReturnType<typeof one>,
  i: number,
  w: Wound,
): void {
  if (d.len <= 1 || d.fade <= 0) return;
  const steps = 8;
  ctx.beginPath();
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const half = d.half * (0.35 + 0.65 * t * t);
    ctx.lineTo(d.x + wander(i, t, w.r) - half, d.y + d.len * t);
  }
  for (let s = steps; s >= 0; s--) {
    const t = s / steps;
    const half = d.half * (0.35 + 0.65 * t * t);
    ctx.lineTo(d.x + wander(i, t, w.r) + half, d.y + d.len * t);
  }
  ctx.closePath();
  ctx.fillStyle = rgba(PALETTE.red, 0.5 * d.fade);
  ctx.fill();

  const hx = d.x + wander(i, 1, w.r);
  const hy = d.y + d.len;
  ctx.fillStyle = rgba(PALETTE.red, 0.78 * d.fade);
  ctx.beginPath();
  ctx.ellipse(hx, hy, d.half * 0.95, d.half * 1.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.45 * d.fade);
  ctx.lineWidth = 1;
  ctx.stroke();
}
