import { blobPoints } from "@neon-spore/content";
import type { MantleState, World } from "@neon-spore/sim";
import { strokeGlowFaded } from "./glow.js";
import type { GripVerdicts } from "./grip-verdict.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawMantleKnobHalo, drawMantleKnobMarks, mantleMine } from "./mantle-marks.js";
import { counted, mantleCoreBeat } from "./mantle-pose.js";
import {
  mantleHandleRest,
  mantleKnobDrop,
  mantleRing,
  mantleStrapPath,
  type Point,
  type Side,
  TRAVEL,
  type ValvePose,
} from "./mantle-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPullArrow } from "./pull-knob.js";
import { PULL_DOWN } from "./pull-line.js";
import { splinePath } from "./spline.js";

/**
 * **THE MANTLE's marks**: the two handles and the one cord between them while
 * the shell is being pried, and the ring round the bared core for the finish.
 * Every mark on this boss is on both screens (`mantle-draw.ts`).
 *
 * **A handle says its gesture.** It hangs on a strap in a groove that runs
 * straight down, with the shared pull arrow inside its knob while it is lit
 * (`pull-knob.ts`, 30 September 2026; fainter once a thumb is on it) — pull
 * this down, on its owner's screen; the partner's has their clock
 * instead (`mantle-marks.ts`) — and two notches in the groove: the floor a thumb must
 * clear before it counts, and half this movement's threshold, which is where
 * both thumbs meet when they pull alike. The half-way notch sinks a little
 * with every movement, which is the threshold "a notch higher" drawn.
 *
 * **The cord is the one gauge, not two.** It hangs from knob to knob and
 * lights inward from each end by that handle's share of the threshold; the
 * two lights meet in the middle exactly when the sum shears a pair. A handle
 * below the floor lights its end grey rather than bright — moving, and
 * counting for nothing — which is the two-hand rule shown rather than said.
 */

/** Samples along the cord. */
const CORD_STEPS = 24;
/** How far the cord sags below the lower knob, in tiles. */
const SAG = 0.6;
/** The knob's radius, in tiles. */
const KNOB_R = 0.3;

export function drawMantleHandles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MantleState,
  at: Point,
  poses: Record<Side, ValvePose>,
  lit: number,
  time: number,
  verdicts: GripVerdicts,
): void {
  const cfg = world.cfg;
  const need = s.thresholds[s.cursor] ?? 0;
  const knobs: Point[] = [];
  for (const side of [-1, 1] as const) {
    const index = side < 0 ? 0 : 1;
    const rest = mantleHandleRest(l, at, side, poses[side]);
    const depth = lit > 0 ? s.depthMilli[index] : 0;
    const knob = { x: rest.x, y: rest.y + mantleKnobDrop(l, depth) };
    knobs.push(knob);
    drawGroove(ctx, l, rest, cfg.mantleFloorMilli, need / 2, lit);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.7);
    ctx.stroke(mantleStrapPath(l, at, side, poses[side], knob));
    drawMantleKnobHalo(ctx, l, cfg, s, index, knob, time);
    drawKnob(ctx, l, knob, counted(s, cfg, index) > 0, lit, time);
    const mine = mantleMine(l.role, index === 0 ? 1 : 2);
    // The way down, inside the knob, on its own seat's screen while it is lit.
    const alpha = lit * (depth === 0 ? 0.95 : 0.6);
    const hex = PALETTE.hullRim;
    if (mine && lit > 0) drawPullArrow(ctx, knob, l.tile * KNOB_R, PULL_DOWN, time, { alpha, hex });
    drawMantleKnobMarks(ctx, l, cfg, s, index, knob, time, verdicts);
  }
  const [left, right] = knobs;
  if (left === undefined || right === undefined || need <= 0) return;
  const share = (index: 0 | 1) => Math.min(1, s.depthMilli[index] / need);
  const counts = (index: 0 | 1) => Math.min(1, counted(s, cfg, index) / need);
  drawCord(ctx, l, left, right, share, counts, lit);
}

/** The groove a knob runs down, and its two notches. */
function drawGroove(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  rest: Point,
  floorMilli: number,
  halfMilli: number,
  lit: number,
): void {
  const groove = new Path2D();
  groove.moveTo(rest.x, rest.y);
  groove.lineTo(rest.x, rest.y + TRAVEL * l.tile);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.18 + 0.2 * lit);
  ctx.stroke(groove);
  const notch = (milli: number) => {
    const y = rest.y + mantleKnobDrop(l, milli);
    const p = new Path2D();
    p.moveTo(rest.x - l.tile * 0.16, y);
    p.lineTo(rest.x + l.tile * 0.16, y);
    return p;
  };
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.2 + 0.45 * lit);
  ctx.stroke(notch(floorMilli));
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.15 + 0.6 * lit);
  ctx.stroke(notch(halfMilli));
}

/** The knob a thumb takes hold of: a small lobed bead, bright once its pull counts. */
function drawKnob(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  knob: Point,
  counting: boolean,
  lit: number,
  time: number,
): void {
  const r = l.tile * KNOB_R;
  const body = splinePath(blobPoints(knob.x, knob.y, r, r, 3, 0.1, 0.04, time * 1.2, 7, 18), true);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(body);
  if (counting) strokeGlowFaded(ctx, body, PALETTE.hullRim, STROKE.outline, 0.6 + 0.8 * lit);
  else {
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.45 + 0.5 * lit);
    ctx.stroke(body);
  }
}

/** A stretch of the cord, `from` to `to` in shares of its length. */
function cordPart(a: Point, b: Point, sagY: number, from: number, to: number): Path2D {
  const p = new Path2D();
  const cx = (a.x + b.x) / 2;
  const n = Math.max(1, Math.round(CORD_STEPS * (to - from)));
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n;
    const u = 1 - t;
    const x = u * u * a.x + 2 * u * t * cx + t * t * b.x;
    const y = u * u * a.y + 2 * u * t * sagY + t * t * b.y;
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  return p;
}

function drawCord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  left: Point,
  right: Point,
  share: (index: 0 | 1) => number,
  counts: (index: 0 | 1) => number,
  lit: number,
): void {
  const sagY = Math.max(left.y, right.y) + SAG * l.tile;
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.25 + 0.25 * lit);
  ctx.stroke(cordPart(left, right, sagY, 0, 1));
  const a = counts(0);
  const b = counts(1);
  if (a + b >= 1) {
    strokeGlowFaded(ctx, cordPart(left, right, sagY, 0, 1), PALETTE.hullRim, STROKE.outline, 1.4);
    return;
  }
  // A thumb below the floor moves its end of the cord, in grey: it is
  // pulling, and it is counting for nothing.
  ctx.strokeStyle = rgba(PALETTE.rock, 0.75);
  if (a === 0 && share(0) > 0) ctx.stroke(cordPart(left, right, sagY, 0, share(0)));
  if (b === 0 && share(1) > 0) ctx.stroke(cordPart(left, right, sagY, 1 - share(1), 1));
  if (a > 0)
    strokeGlowFaded(ctx, cordPart(left, right, sagY, 0, a), PALETTE.hullRim, STROKE.outline, 0.9);
  if (b > 0)
    strokeGlowFaded(
      ctx,
      cordPart(left, right, sagY, 1 - b, 1),
      PALETTE.hullRim,
      STROKE.outline,
      0.9,
    );
}

/**
 * The finish's ring round the bared core (rows 9–11): the left half is
 * Player 1's and the right half Player 2's, by the same geometry as the
 * handles, and whichever half the core is waiting on beats with it. The
 * other stays grey — a tap from that side does nothing (`sim/mantle-hand.ts`).
 */
export function drawMantleRing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: MantleState,
  at: Point,
  beatPhase: number,
): void {
  const ring = mantleRing(l, at);
  const gap = 0.14;
  const pulse = mantleCoreBeat(beatPhase);
  for (const index of [0, 1] as const) {
    const from = index === 0 ? Math.PI / 2 + gap : -Math.PI / 2 + gap;
    const arc = new Path2D();
    arc.ellipse(ring.x, ring.y, ring.r, ring.r, 0, from, from + Math.PI - 2 * gap);
    if (index === s.heartbeatNext)
      strokeGlowFaded(ctx, arc, PALETTE.hullRim, STROKE.outline * 1.5, 0.8 + pulse);
    else {
      ctx.lineWidth = STROKE.outline;
      ctx.strokeStyle = rgba(PALETTE.rock, 0.3);
      ctx.stroke(arc);
    }
  }
}
