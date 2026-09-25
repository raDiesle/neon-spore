import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";
import type { RepriseFrame } from "./reprise-body.js";
import type { ReprisePhase } from "./reprise-fx.js";

/**
 * **THE REPRISE's eye: a camera lens, because what it does is record and play
 * back.**
 *
 * The owner, 25 September 2026: *when the recording of units is started and
 * the playing of invisible sequence starts also should be graphical and
 * animation visible with something a human being can relate to.* Everyone has
 * held a thing that records and plays back, and everyone knows its two marks:
 * the red dot and the triangle. So the sac has a lens in it — a socket, an
 * iris, six aperture blades round the pupil — and the two moments are the two
 * gestures a camera makes:
 *
 * - **Recording starts** with the shutter: the blades close to a point and
 *   open again, a white ring goes out, and the red dot is lit and blinks on
 *   the beat for as long as the stretch is being taken down.
 * - **Playback starts** with a rewind: scan lines roll down the glass, the
 *   blades open wide, and the triangle stands in the pupil until the last body
 *   of the echo has been sent.
 *
 * The red dot is the one colour this boss wears, and it is a camera's red, not
 * a body's: it says *now being taken down*, which is the moment the pair must
 * be watching, and it never stands over a column. With the script spent the
 * lens is dark and half shut — nothing more is coming — so the silence at the
 * end of the fight reads as rest and not as a fault.
 */

/** Seconds the shutter takes to close and open when recording starts. */
const BLINK = 0.45;

/** Seconds the rewind rolls when playback starts. */
const REWIND = 0.7;

export interface LensState {
  phase: ReprisePhase;
  /** Seconds since the phase last changed. */
  flip: number;
  beatPhase: number;
  time: number;
}

/** The lens's radius for a body frame. */
export const lensRadius = (f: RepriseFrame): number => f.u * 0.55;

export function drawLens(ctx: CanvasRenderingContext2D, f: RepriseFrame, s: LensState): void {
  const R = lensRadius(f);
  const { x, cy } = f;
  // The socket: a dark ring sunk into the skin, rimmed in rock.
  const socket = new Path2D();
  socket.arc(x, cy, R * 1.12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fill(socket);
  strokeGlow(ctx, socket, PALETTE.rock, STROKE.outline, s.phase === null ? 0.45 : 0.9);

  // The glass: an iris that is violet at the edge and deep at the centre.
  const iris = ctx.createRadialGradient(x, cy, R * 0.1, x, cy, R);
  iris.addColorStop(0, PALETTE.background);
  iris.addColorStop(0.6, rgba(PALETTE.sheenDeep, 1));
  iris.addColorStop(1, rgba(PALETTE.rockDark, 1));
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.arc(x, cy, R, 0, Math.PI * 2);
  ctx.fill();

  drawBlades(ctx, x, cy, R, aperture(s), s.time);
  if (s.phase === "rec") drawRec(ctx, f, R, s);
  else if (s.phase === "play") drawPlay(ctx, f, R, s);

  // Glass highlights over everything, so it reads as a lens and not a hole.
  ctx.fillStyle = rgba(PALETTE.text, 0.5);
  ctx.beginPath();
  ctx.ellipse(x - R * 0.42, cy - R * 0.45, R * 0.2, R * 0.11, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.text, 0.22);
  ctx.beginPath();
  ctx.arc(x + R * 0.45, cy + R * 0.42, R * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/** How open the aperture is, 0 shut to 1 wide: the shutter's blink as
 * recording starts, wide while playing, half shut at rest. */
function aperture(s: LensState): number {
  if (s.phase === null) return 0.3;
  if (s.phase === "play") return 0.9;
  const k = s.flip / BLINK;
  if (k >= 1) return 0.62;
  // Shut over the first half, open over the second.
  return 0.62 * Math.abs(1 - 2 * k);
}

/** Six blades round a hexagonal pupil whose size is `open`. */
function drawBlades(
  ctx: CanvasRenderingContext2D,
  x: number,
  cy: number,
  R: number,
  open: number,
  t: number,
): void {
  const inner = R * (0.08 + 0.6 * open);
  const turn = t * 0.15 + open * 0.8;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, cy, R * 0.94, 0, Math.PI * 2);
  ctx.clip();
  for (let i = 0; i < 6; i++) {
    const a0 = turn + (Math.PI * 2 * i) / 6;
    const a1 = a0 + Math.PI / 3;
    const blade = new Path2D();
    blade.moveTo(x + Math.cos(a0) * inner, cy + Math.sin(a0) * inner);
    blade.lineTo(x + Math.cos(a1) * inner, cy + Math.sin(a1) * inner);
    blade.lineTo(x + Math.cos(a1 + 0.5) * R, cy + Math.sin(a1 + 0.5) * R);
    blade.lineTo(x + Math.cos(a0 + 0.3) * R, cy + Math.sin(a0 + 0.3) * R);
    blade.closePath();
    ctx.fillStyle = i % 2 === 0 ? PALETTE.rockDark : PALETTE.throbMiddle;
    ctx.fill(blade);
    ctx.strokeStyle = rgba(PALETTE.rock, 0.35);
    ctx.lineWidth = 0.8;
    ctx.stroke(blade);
  }
  ctx.restore();
}

/** The red dot, blinking on the beat, and the ring the shutter sends out. */
function drawRec(ctx: CanvasRenderingContext2D, f: RepriseFrame, R: number, s: LensState): void {
  const on = s.beatPhase < 0.6;
  const dot = new Path2D();
  dot.arc(f.x, f.cy, R * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = on ? PALETTE.red : rgba(PALETTE.red, 0.35);
  ctx.fill(dot);
  if (on) strokeGlow(ctx, dot, PALETTE.red, STROKE.inner, 1);
  if (s.flip < BLINK * 1.6) {
    const k = s.flip / (BLINK * 1.6);
    const ring = new Path2D();
    ring.arc(f.x, f.cy, R * (1.1 + 2.2 * k), 0, Math.PI * 2);
    ctx.strokeStyle = rgba(PALETTE.text, 0.8 * (1 - k));
    ctx.lineWidth = 3 * (1 - k) + 1;
    ctx.stroke(ring);
  }
}

/** The triangle standing in the pupil, and the rewind rolling over the
 * glass as playback starts. */
function drawPlay(ctx: CanvasRenderingContext2D, f: RepriseFrame, R: number, s: LensState): void {
  const grow = Math.min(1, s.flip / 0.25);
  const h = R * 0.3 * (0.4 + 0.6 * grow);
  const tri = new Path2D();
  tri.moveTo(f.x - h * 0.6, f.cy - h);
  tri.lineTo(f.x + h, f.cy);
  tri.lineTo(f.x - h * 0.6, f.cy + h);
  tri.closePath();
  ctx.fillStyle = PALETTE.text;
  ctx.fill(tri);
  strokeGlow(ctx, tri, PALETTE.rock, STROKE.inner, 0.9);
  if (s.flip >= REWIND) return;
  const k = s.flip / REWIND;
  ctx.save();
  ctx.beginPath();
  ctx.arc(f.x, f.cy, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = rgba(PALETTE.text, 0.35 * (1 - k));
  for (let i = 0; i < 4; i++) {
    const y = f.cy - R + ((k * 3 + i / 4) % 1) * R * 2;
    ctx.fillRect(f.x - R, y, R * 2, Math.max(1, R * 0.07));
  }
  ctx.restore();
}
