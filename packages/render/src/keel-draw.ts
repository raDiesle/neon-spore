import { blobPoints, LIGHT_HALF } from "@neon-spore/content";
import { type KeelState, keelLit, NO_JOINT, type World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { KeelFx } from "./keel-fx.js";
import { drawKeelRing, drawKeelSocket } from "./keel-marks.js";
import {
  keelArrived,
  keelBright,
  keelOpen,
  keelPulse,
  keelRockAlong,
  keelSegs,
} from "./keel-pose.js";
import {
  keelPlatePath,
  keelRibsPath,
  keelRockPoint,
  keelSeamPath,
  keelSegEnd,
  type Point,
  type Seg,
} from "./keel-shape.js";
import { drawKeelEnds, drawKeelMarrow } from "./keel-story.js";
import { keelHeat } from "./keel-story-pose.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE KEEL**: an exoskeletal spine of six segments arched along the top of
 * the field like a stripped ribcage, locked rigid one joint at a time
 * (§11.41, `bosses-choreographed.md` §24).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: whose
 * thumb a joint wants is where it sits, left half or right, and both players
 * have to see where that is to say it.
 *
 * **Iron grey throughout.** A locked segment carries a thin white seam and is
 * lit iron; a loose one is duller, sags and sways on its own count. No
 * segment is ever an ownership colour. The one colour on the body is the
 * socket, which flashes the wave's own while the midpoint is split, because
 * that cannon is the one that answers it.
 *
 * **Its health is the segments**, and so is the tension: the arch tightens as
 * more of it locks (`keel-pose.ts`). The lit joint is a white ring round its
 * plate with the window closing round it — the mark that says *tap here, now*
 * — and the rock the tail throws falls down its column to the hull.
 *
 * What outlives a frame — the jolt of a lock, the snap on its seam, the blow —
 * is `fx` (`keel-fx.ts`), told the socket's colour here because the event
 * that shuts it does not carry one.
 */
export function drawKeel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: KeelState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: KeelFx,
): void {
  const cfg = world.cfg;
  const n = s.locked.length;
  const arrived = keelArrived(s, cfg, beat, beatPhase);
  const segs = keelSegs(l, cfg, s, beat, beatPhase);

  fx.tell(PALETTE[s.socket]);
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), -fx.jolt * l.tile);
  ctx.globalAlpha = 0.2 + 0.8 * arrived;
  drawTendons(ctx, l, segs);
  segs.forEach((g, k) => {
    const inward = (n - 1) / 2 - k > 0 ? 1 : -1;
    const lag = s.locked[k]
      ? 0
      : 0.25 * Math.sin((beat + beatPhase) * Math.PI * 0.5 + k * 1.7 - 0.8);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.3 + 0.4 * keelBright(s, k, beat, beatPhase));
    ctx.stroke(keelRibsPath(l, g.centre, g.slope, g.pose, inward, lag));
  });
  const open = keelOpen(s, cfg, beat, beatPhase);
  if (open > 0) drawKeelSocket(ctx, l, s, segs, open, beatPhase);
  segs.forEach((g, k) => {
    const heat = keelHeat(s, cfg, k, beat, beatPhase);
    drawSegment(ctx, l, s, k, g, heat, beat, beatPhase, time, fx);
  });
  drawKeelMarrow(ctx, l, s, segs, beatPhase);
  drawKeelEnds(ctx, l, s, cfg, segs, beatPhase);
  if (keelLit(s) && s.joint !== NO_JOINT) {
    const g = segs[s.joint];
    if (g !== undefined) drawKeelRing(ctx, l, s, cfg, g.centre, beat, beatPhase);
  }
  const along = keelRockAlong(s, cfg, beat, beatPhase);
  const tail = segs[n - 1];
  if (along >= 0 && tail !== undefined) {
    const from = keelSegEnd(l, tail.centre, tail.slope, tail.pose, 1);
    drawRock(ctx, l, keelRockPoint(l, from, s.rockCol, along), beat + beatPhase);
  }
  ctx.restore();
}

/** The tendons between neighbouring segments: one line from each end to the next one's start, which a loose pair stretches. */
function drawTendons(ctx: CanvasRenderingContext2D, l: Layout, segs: Seg[]): void {
  const p = new Path2D();
  for (let k = 0; k + 1 < segs.length; k++) {
    const a = segs[k];
    const b = segs[k + 1];
    if (a === undefined || b === undefined) continue;
    const from = keelSegEnd(l, a.centre, a.slope, a.pose, 1);
    const to = keelSegEnd(l, b.centre, b.slope, b.pose, -1);
    p.moveTo(from.x, from.y);
    p.lineTo(to.x, to.y);
  }
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.5);
  ctx.stroke(p);
}

/**
 * One segment: the iron plate, lit by the one key light, its outline as
 * bright as the pose says, the blow over it, and a seam if locked — flaring
 * as it snaps, and white-hot while the cooldown has it hot.
 */
function drawSegment(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: KeelState,
  k: number,
  g: Seg,
  heat: number,
  beat: number,
  beatPhase: number,
  time: number,
  fx: KeelFx,
): void {
  const bright = keelBright(s, k, beat, beatPhase);
  const plate = keelPlatePath(l, g.centre, g.slope, g.pose);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(plate);
  ctx.save();
  ctx.clip(plate);
  ctx.globalAlpha *= 0.4 + 0.6 * bright;
  litRound(
    ctx,
    g.centre.x,
    g.centre.y,
    l.tile * 0.8,
    LIGHT_HALF.rock,
    0.03 * Math.sin(time * 0.8 + k),
  );
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.35 + 0.6 * bright);
  ctx.stroke(plate);
  if (heat > 0) {
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85 * heat);
    ctx.stroke(plate);
  }
  drawHurt(ctx, plate, fx.hurt.value);
  if (!s.locked[k]) return;
  const seam = keelSeamPath(l, g.centre, g.slope, g.pose);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.4 + 0.5 * bright);
  ctx.stroke(seam);
  const glow = Math.max(0.6 * keelPulse(s, k, beatPhase), 1.4 * fx.snap(k), 1.8 * heat);
  if (glow > 0) strokeGlow(ctx, seam, PALETTE.hullRim, STROKE.inner, glow);
}

/** The tail's rock, a lump of the same iron, falling. */
function drawRock(ctx: CanvasRenderingContext2D, l: Layout, at: Point, t: number): void {
  const rock = splinePath(
    blobPoints(at.x, at.y, l.tile * 0.34, l.tile * 0.3, 5, 0.14, 0.02, t, 41, 20),
    true,
  );
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(rock);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.rock;
  ctx.stroke(rock);
}
