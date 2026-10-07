import {
  GOVERNOR_DOWN_MILLI,
  type GovernorState,
  governorFiring,
  governorLitStep,
  type SimConfig,
} from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import {
  type Dial,
  dialAt,
  GAP_MILLI,
  rimDepth,
  TIP_IN,
  TIP_OUT,
  TRACK_OUT,
  tipHalfMilli,
  trackBand,
} from "./governor-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { lightCore } from "./lit-core.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What THE GOVERNOR is shot at, and the way a bolt gets to it.** The owner,
 * 7 October 2026: *there must be a visual openness at bottom of boss visual,
 * otherwise its not logical that shot can hit the rotating target with
 * cannon. and the cannon should hit the needle, not the center. i suggest we
 * add something visual at the end of needle which in some step needs to be
 * shot at.*
 *
 * - **The gap**: a slot cut through the brass rim and the flywheel's edge at
 *   the bottom, straight over the cannon's column, the dark face showing
 *   through it, its cheeks lit — brightest while a shot is owed.
 * - **The tip**: a plate on the needle's end, riding the track — brass, and
 *   lit from inside in the step's colour, beating like a heart, while a shot
 *   is owed (`lit-core.ts`). As wide as the shot's window less half a column
 *   (`tipHalfMilli`), so a bolt up the middle column is taken exactly while
 *   it overlaps the gap (`sim/governor-shot.ts`).
 */

/** The slot through the rim and the edge under it, at the bottom. */
function gapPath(l: Layout, d: Dial): Path2D {
  const drop = rimDepth(l, d);
  const from = GOVERNOR_DOWN_MILLI - GAP_MILLI;
  const to = GOVERNOR_DOWN_MILLI + GAP_MILLI;
  const p = new Path2D();
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const at = dialAt(d, from + ((to - from) * i) / n, 1);
    if (i === 0) p.moveTo(at.x, at.y + drop + 1);
    else p.lineTo(at.x, at.y + drop + 1);
  }
  for (let i = n; i >= 0; i--) {
    const at = dialAt(d, from + ((to - from) * i) / n, TRACK_OUT);
    p.lineTo(at.x, at.y);
  }
  p.closePath();
  return p;
}

/** The gap's two cheeks, where the rim is cut: from the track's edge down through the rim's edge. */
function cheeks(l: Layout, d: Dial): Path2D {
  const drop = rimDepth(l, d);
  const p = new Path2D();
  for (const milli of [GOVERNOR_DOWN_MILLI - GAP_MILLI, GOVERNOR_DOWN_MILLI + GAP_MILLI]) {
    const inner = dialAt(d, milli, TRACK_OUT);
    const outer = dialAt(d, milli, 1);
    p.moveTo(inner.x, inner.y);
    p.lineTo(outer.x, outer.y + drop);
  }
  return p;
}

/** The gap, drawn over the wheel and under the needle: open, and lit while a shot is owed. */
export function drawGovernorGap(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  s: GovernorState,
): void {
  ctx.fillStyle = PALETTE.governorFace;
  ctx.fill(gapPath(l, d));
  const sides = cheeks(l, d);
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(sides);
  strokeGlowFaded(ctx, sides, PALETTE.hullRim, STROKE.inner, governorFiring(s) ? 1 : 0.35, 1);
}

/** The plate on the needle's end at `milli`: brass, or lit in the step's colour while a shot is owed. */
export function drawGovernorTip(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  d: Dial,
  s: GovernorState,
  milli: number,
  beatPhase: number,
): void {
  const half = tipHalfMilli(cfg);
  const plate = trackBand(d, milli - half, milli + half, TIP_IN, TIP_OUT);
  const step = governorLitStep(s);
  if (step?.ask === "fire" && governorFiring(s)) {
    ctx.fillStyle = PALETTE.governorFace;
    ctx.fill(plate);
    const at = dialAt(d, milli, (TIP_IN + TIP_OUT) / 2);
    const r = (d.r * TIP_OUT * Math.PI * 2 * half) / 1000;
    lightCore(ctx, plate, step.color, beatPhase, { ...at, r }, coreHurt(s.hits).bright);
  } else {
    ctx.fillStyle = PALETTE.governorHub;
    ctx.fill(plate);
  }
  ctx.lineJoin = "round";
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.governorBrassDark, 0.95);
  ctx.stroke(plate);
}
