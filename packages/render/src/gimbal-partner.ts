import {
  type GimbalState,
  gimbalMarkMilli,
  gimbalRingTrue,
  gimbalTurning,
  INNER,
  NO_BEARING,
  OUTER,
} from "@neon-spore/sim";
import { drawGimbalMark } from "./gimbal-ring.js";
import { gimbalFaceMilli, gimbalRingR, type Point } from "./gimbal-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The partner's mark, on this seat's screen** — the swap that makes THE
 * GIMBAL a thing said out loud (the owner, 3 October 2026: *too easy*).
 *
 * Each seat grips its own ring and is never shown where that ring has to go.
 * What it is shown instead is where the **other** ring has to go: the pilot
 * sees the navigator's mark, she sees his, and each talks the other onto it.
 *
 * **The mark is drawn on this seat's face**, not the partner's. The pilot
 * looks at the wheel from the front, so her mark is drawn at its true
 * bearing; she looks from the back, so his is drawn mirrored — the same
 * `gimbalFaceMilli` her own ring goes through. So *your mark is on the left*
 * is honest on the screen it is said from and wrong on the one it is heard
 * on, which is the mirror the boss was always about, now one the pair cannot
 * step around by each watching their own wedge.
 *
 * It sits at the partner ring's radius, over a faint track where that ring
 * runs, and **fills when the partner's ring is standing on it** — the one
 * thing a seat learns about the other ring, and the word *stop* it waits for.
 * The track carries no teeth and no bearing: where the ring *is* stays the
 * partner's to say.
 */
export function drawGimbalPartnerMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: GimbalState,
  at: Point,
  beat: number,
  time: number,
): void {
  if (l.role === "test" || !gimbalTurning(s)) return;
  const own = l.role === "p1" ? OUTER : INNER;
  const theirs = own === OUTER ? INNER : OUTER;
  const mark = gimbalMarkMilli(s, beat, theirs);
  if (mark === NO_BEARING) return;
  const r = gimbalRingR(l, theirs);
  const track = new Path2D();
  track.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.save();
  ctx.setLineDash([l.tile * 0.12, l.tile * 0.22]);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.18);
  ctx.stroke(track);
  ctx.restore();
  const face = gimbalFaceMilli(l, mark, own);
  drawGimbalMark(ctx, l, at, r, face, gimbalRingTrue(s, beat, theirs), time);
}
