import { circleSubpath, type Point } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * What every handle on this field is made of.
 *
 * There are three now — THE MAZE's string, THE WARDEN's rope and THE LID's cord
 * — and the last two were drawing the same four things with the same numbers in
 * two files, because `lid-string.ts` was written by reading `tether.ts` and
 * changing the anchor. That is the shape of thing that drifts: a fix to one
 * handle's read is a fix to one of them, and the pair stop being the same
 * gesture without anybody deciding they should.
 *
 * So the ring, the gauge, the rest mark and the sag curve live here, and each
 * handle passes its own anchor and its own colour. **Nothing about the look
 * changed in the move** — the figures are the ones each file already had, which
 * is why the one that differs (the wave amplitudes) is an argument rather than a
 * number picked between them. The fifth thing a handle has, **the word under
 * it**, is next door in `handle-word.ts`: it is the only part of a handle that
 * is not a shape, and it was cut off here when the ring grew a seat rule of its
 * own.
 *
 * The hit circles stay where they are. Each handle rests somewhere different,
 * `handles.ts` already asks each file for its own, and a control drawn in one
 * place and answered in another is a control that works until somebody moves
 * one of them.
 *
 * THE MAZE's and THE WARDEN's handles take nothing from this file now but a
 * radius and a field point: since 25 September 2026 a handle you pull is drawn
 * as the path it can be pulled (`pull-track.ts`, the owner's rule in
 * `.claude/skills/new-boss/owner.md`), and the ring and its dial stay for the
 * handles `docs/queue.md` has not moved yet.
 */

/**
 * A point the simulation named in thousandths of a tile, in pixels — the same
 * arithmetic as `tileCX`/`tileCY` above with the thousandths left in.
 *
 * It exists because a handle's place is decided by the *rule* and not by the
 * picture: where the hand took it, how far it carried it, and the edge it may
 * not pass are all `sim/handle-pull.ts`, so render is handed a point rather
 * than working one out.
 */
export function fieldPoint(l: Layout, milli: { x: number; y: number }): { x: number; y: number } {
  return {
    x: l.gridLeft + (milli.x * l.tile) / 1000,
    y: l.gridTop + (milli.y * l.tile) / 1000,
  };
}

/**
 * A handle's radius, and where it is decided.
 *
 * `cfg.handleRadiusMilli`, not a constant here, because the *rule* needs it:
 * a pull may not carry a handle off the field and what has to stay on is the
 * whole circle, so the clamp is inset by exactly this
 * (`sim/handle-pull.ts`). A control bounded at one size and drawn at another is
 * a control that leaves the screen anyway.
 */
export function handleRadius(l: Layout, cfg: SimConfig): number {
  return (l.tile * cfg.handleRadiusMilli) / 1000;
}

/**
 * The rope's own shape. Slack it sags off the straight line between its two
 * ends and a slow wave travels down it; taut it straightens out, and the sag
 * goes to nothing exactly as the tension goes to one.
 *
 * **The belly hangs across the line rather than sideways on the screen.** A
 * hand may now carry a handle in any direction at all, so a sag that was always
 * horizontal would lie flat along a rope pulled straight left and bulge out of
 * one pulled straight down. The perpendicular to the line between the two ends
 * is the same picture whichever way the hand went — and for a rope swung aside,
 * which is all this used to have to draw, it is the picture it always was.
 * Of the two perpendiculars, the one with a downward part: a cord run
 * sideways to a handle on the left of its body (THE LID's, since the handle
 * moved beside the eye) bellied *upward* with the other, and a slack line
 * hangs.
 */
export function handleSag(opts: {
  anchor: Point;
  head: Point;
  held: boolean;
  pull: number;
  time: number;
  /** How many points the curve is built from — a longer line wants more. */
  segments: number;
  /** The tremble under a hand, and the slow travelling wave with none. */
  waveHeld: number;
  waveSlack: number;
}): Point[] {
  const { anchor, head, held, pull, time } = opts;
  const pts: Point[] = [];
  const sag = (1 - pull) * (held ? 0.35 : 1);
  const dx = head.x - anchor.x;
  const dy = head.y - anchor.y;
  const len = Math.hypot(dx, dy) || 1;
  const down = dx >= 0 ? 1 : -1;
  const nx = (-dy / len) * down;
  const ny = (dx / len) * down;
  for (let i = 0; i <= opts.segments; i++) {
    const t = i / opts.segments;
    // A half-sine across the length, so both ends stay where they are anchored.
    const belly = Math.sin(t * Math.PI);
    const wave = held
      ? Math.sin(time * 30 + t * 9) * opts.waveHeld * (1 - pull)
      : Math.sin(t * Math.PI * 3 - time * 3) * opts.waveSlack * t;
    // The line bellies *behind* the hand: the straight line is what full
    // tension looks like.
    const off = belly * sag * len * 0.28 + wave;
    pts.push({ x: anchor.x + dx * t + nx * off, y: anchor.y + dy * t + ny * off });
  }
  return pts;
}

/** The column the handle hangs in, while it is not hanging in it — so the swing
 * reads as a distance from somewhere rather than as a handle that happens to be
 * over there. */
export function drawHandleRest(ctx: CanvasRenderingContext2D, rest: Circle, hex: string): void {
  const p = new Path2D(circleSubpath(rest.x, rest.y, rest.r * 0.9));
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(p);
  ctx.restore();
}

/**
 * How far out the dial sweeps, in ring radii.
 *
 * Named because a word standing on a handle has to clear it: THE LEDGER's
 * `ROOT` drops its own frame and stands on the ring instead, and at the ring's
 * own radius its second line lands on the arc (`boss-cue-read-o.ts`).
 */
export const DIAL_RADII = 1.55;

/**
 * The handle, and the gauge closing around it.
 *
 * Empty and breathing it says *take hold of me*; filled it says *somebody has*;
 * and the arc sweeping round its edge is how much of the pull is in, drawn as a
 * continuous quantity rather than as a lamp that comes on at a threshold. The
 * player who is not holding it reads that arc, and it closes into a whole circle
 * at the instant the thing behind it gives.
 *
 * **The disc under it is punched out of the background, and only for the seat
 * whose handle it is.** A ring has to read as a thing to take hold of over
 * whatever the fight has drawn behind it — a lit board, a skin, a lobe — and
 * the opaque fill is what buys that. The seat that may *not* take hold of it
 * was being sold the same hole for a wash at 0.18 alpha it cannot see, so
 * `theirs` came out a flat black disc in the middle of the picture: on
 * PINBALL's table a hole in the board, and on THE UNDERTOW's hull a lobe with a
 * breach in it that nothing had breached (`undertow-grip.ts`, 22 September
 * 2026, where it cost that boss's pin its place on the pilot's screen). So a
 * ring drawn for the other seat fills nothing and is its rim and its wash, over
 * whatever is behind it, which is the picture it was always meant to be.
 */
export function drawHandleRing(
  ctx: CanvasRenderingContext2D,
  opts: {
    x: number;
    y: number;
    r: number;
    hex: string;
    rim: string;
    held: boolean;
    pull: number;
    time: number;
    /** The other seat's, drawn so this one can read it — see above. */
    theirs?: boolean;
  },
): void {
  const { x, y, r, hex, rim, held, pull, time } = opts;
  const breathe = held ? 1 : 1 + 0.08 * Math.sin(time * 4);
  const p = new Path2D(circleSubpath(x, y, r * breathe));
  ctx.save();
  if (opts.theirs !== true) {
    ctx.fillStyle = PALETTE.background;
    ctx.fill(p);
  }
  ctx.fillStyle = hex;
  ctx.globalAlpha = held ? 0.55 + pull * 0.45 : 0.18;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, held ? rim : hex, STROKE.inner, held ? 1.2 : 0.8);

  if (pull <= 0) return;
  ctx.save();
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.lineCap = "butt";
  ctx.beginPath();
  // From the top, clockwise, so it fills the way a dial does.
  ctx.arc(x, y, r * DIAL_RADII, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pull);
  ctx.stroke();
  ctx.restore();
}
