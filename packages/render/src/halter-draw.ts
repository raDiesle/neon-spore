import { LIGHT_HALF } from "@neon-spore/content";
import { type HalterState, halterLitStep, type World } from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import { drawHalterCore, drawHalterGrips, drawHalterSeamGlow } from "./halter-marks.js";
import {
  type HalterSegment,
  halterArrived,
  halterLeft,
  halterLitSegment,
  halterOpen,
  halterShake,
  halterSplit,
  halterTremor,
} from "./halter-pose.js";
import {
  halterAt,
  halterBend,
  halterCoreAt,
  halterFleshPath,
  halterGap,
  halterLowerPath,
  halterSeamPath,
  halterSize,
  halterSpan,
  halterUpperPath,
} from "./halter-shape.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

// The tremor's reach at a shake of one, in tiles; how flat the slab tips over spent.
const TREMOR = 0.035;
const EDGE_ON = 0.2;

const SEGMENTS: readonly HalterSegment[] = [0, 1, 2];

/**
 * **THE HALTER**: a plated slab over the middle of the field, hugged shut
 * along one spinal seam of three segments, that parts a segment only while
 * one seat touches nothing and the other holds both grips, and bares a
 * centre to be shot (§11.53, `bosses-choreographed.md` §36).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: which
 * seat rests is the step's, not the seat's, and each has to see the other's
 * grips go down and the plating go still to know the pair is holding.
 *
 * **Its health is read off the seam** — no bar: each segment parted open for
 * good as it cracks, the centre bared between them, and the core smaller and
 * brighter for every shot.
 *
 * **The tell is the tremor's silence** (`halterShake`): the plating never
 * stops chattering until the pair holds, and then it stops dead. Everything
 * here is read off `world` each frame; the events are heard, not drawn.
 */
export function drawHalter(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: HalterState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const arrived = halterArrived(s, cfg, beat, beatPhase);
  const split = halterSplit(s, cfg, beat, beatPhase);
  const at = halterAt(l, cfg, arrived);
  const alpha = (0.2 + 0.8 * arrived) * (1 - 0.8 * split);
  const amp = halterShake(world, s) * TREMOR * l.tile;
  const step = halterLitStep(s);
  const litK = halterLitSegment(s);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(at.x, at.y);
  // Spent, the slab tips over: the plating the pair has been reading turns away.
  ctx.scale(1 + 0.15 * split, 1 - (1 - EDGE_ON) * split);
  for (const k of SEGMENTS) {
    const gap = halterGap(l, halterOpen(world, s, k, beat, beatPhase));
    if (gap > 0.5) drawFlesh(ctx, l, k, gap);
    if (k === 1 && gap > halterGap(l, 0.5)) {
      const hurt = coreHurt(s.hits);
      const shot =
        step?.ask === "fire" ? { color: step.color, left: halterLeft(s, beat, beatPhase) } : null;
      ctx.save();
      const core = halterCoreAt(l);
      ctx.translate(core.x, core.y);
      drawHalterCore(ctx, l, hurt.size, hurt.bright, shot, beatPhase);
      ctx.restore();
    }
    const up = halterTremor(time, k, 0, amp);
    const down = halterTremor(time, k, 1, amp);
    drawPlate(ctx, l, k, halterUpperPath(l, k), up.x, up.y - gap, true);
    drawPlate(ctx, l, k, halterLowerPath(l, k), down.x, down.y + gap, false);
  }

  // The asked segment's seam and its grips, over the plating; a shot's mark is the core itself.
  if (litK !== null && step !== null && step.ask !== "fire") {
    const gap = halterGap(l, halterOpen(world, s, litK, beat, beatPhase));
    if (gap < halterGap(l, 0.9)) drawHalterSeamGlow(ctx, halterSeamPath(l, litK), beatPhase);
    drawHalterGrips(ctx, l, litK, s.grips[0] | s.grips[1], beatPhase);
  }
  ctx.restore();
}

/**
 * One plate of segment `k`, moved `dx, dy` off where it hangs shut: filled,
 * the key light over it if it is over the seam — each plate its own, so the
 * back reads as armour laid in pieces — and outlined.
 */
function drawPlate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: HalterSegment,
  plate: Path2D,
  dx: number,
  dy: number,
  upper: boolean,
): void {
  const { ry } = halterSize(l);
  const { x0, x1 } = halterSpan(l, k);
  const cx = (x0 + x1) / 2;
  ctx.save();
  ctx.translate(dx, dy);
  ctx.fillStyle = PALETTE.halterPlate;
  ctx.fill(plate);
  if (upper) {
    ctx.save();
    ctx.clip(plate);
    litRound(ctx, cx, halterBend(l, cx) - ry * 0.5, (x1 - x0) * 0.62, LIGHT_HALF.rock);
    ctx.restore();
  } else {
    ctx.fillStyle = rgba(PALETTE.halterPlateDark, 0.35);
    ctx.fill(plate);
  }
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.halterPlateDark, 0.95);
  ctx.stroke(plate);
  ctx.restore();
}

/** What a parted segment shows between its plates, `gap` pixels either side of the seam. */
function drawFlesh(ctx: CanvasRenderingContext2D, l: Layout, k: HalterSegment, gap: number): void {
  const flesh = halterFleshPath(l, k, gap);
  ctx.fillStyle = PALETTE.halterFlesh;
  ctx.fill(flesh);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.halterFleshDark, 0.9);
  ctx.stroke(flesh);
}
