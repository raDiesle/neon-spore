import { blobPoints, LIGHT_HALF } from "@neon-spore/content";
import { type KeelState, keelLit, NO_JOINT, type World } from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import type { KeelFx } from "./keel-fx.js";
import { drawKeelFaces, drawKeelRing, drawKeelSocket } from "./keel-marks.js";
import {
  keelArrived,
  keelBright,
  keelOpen,
  keelPulse,
  keelRockNow,
  keelSegs,
  keelSway,
  keelTendons,
} from "./keel-pose.js";
import { KEEL_ROCK } from "./keel-rock.js";
import { KEEL_SEAM } from "./keel-seam-look.js";
import { keelPlatePath, keelRibsPath, keelSeamPath, type Point, type Seg } from "./keel-shape.js";
import { keelStopper } from "./keel-stop.js";
import { drawKeelEnds, drawKeelMarrow } from "./keel-story.js";
import { keelHeat } from "./keel-story-pose.js";
import { drawKeelHalos, drawKeelHeld, drawKeelVerdicts } from "./keel-verdicts.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE KEEL**: an exoskeletal spine of six segments arched along the top of
 * the field like a stripped ribcage, locked rigid one joint at a time
 * (§11.41, `bosses-choreographed.md` §24).
 *
 * **Both screens are drawn alike.** Whose thumb a joint wants is where it
 * sits, left half or right, and both players have to see where that is to
 * say it; `l.role` decides only whose mark wears the halo and whose the
 * partner's clock (`keel-verdicts.ts`).
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
 * that shuts it does not carry one. A bolt stops on what it meets of the
 * spine (`keel-stop.ts`), told to `stops`.
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
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const n = s.locked.length;
  const arrived = keelArrived(s, cfg, beat, beatPhase);
  const segs = keelSegs(l, cfg, s, beat, beatPhase, world);

  fx.tell(PALETTE[s.socket]);
  ctx.save();
  const shift = { x: fx.hurt.shakeX(time, l.tile), y: -fx.jolt * l.tile };
  ctx.translate(shift.x, shift.y);
  ctx.globalAlpha = 0.2 + 0.8 * arrived;
  drawTendons(ctx, l, segs);
  segs.forEach((g, k) => {
    const inward = (n - 1) / 2 - k > 0 ? 1 : -1;
    const lag = s.locked[k] ? 0 : 0.25 * keelSway(k, beat, beatPhase, 0.8);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.3 + 0.4 * keelBright(s, cfg, k, beat, beatPhase));
    ctx.stroke(keelRibsPath(l, g.centre, g.slope, g.pose, inward, lag));
  });
  const open = keelOpen(s, cfg, beat, beatPhase);
  const socket = open > 0 ? drawKeelFaces(ctx, l, s, segs, open) : null;
  if (socket !== null && s.phase === "socket") drawKeelSocket(ctx, l, s, socket, beatPhase);
  segs.forEach((g, k) => {
    const heat = keelHeat(s, cfg, k, beat, beatPhase);
    const bright = keelBright(s, cfg, k, beat, beatPhase);
    drawSegment(ctx, l, s, k, g, heat, bright, beatPhase, time, fx);
  });
  drawKeelMarrow(ctx, l, s, segs, beatPhase);
  drawKeelHalos(ctx, l, cfg, s, segs, time);
  drawKeelEnds(ctx, l, s, cfg, segs, beatPhase);
  if (keelLit(s) && s.joint !== NO_JOINT) {
    const g = segs[s.joint];
    if (g !== undefined) drawKeelRing(ctx, l, s, cfg, g.centre, beat, beatPhase);
  }
  drawKeelHeld(ctx, l, cfg, s, segs, time);
  drawKeelVerdicts(ctx, l, cfg, s, segs, time, fx.marks.verdicts);
  const rock = keelRockNow(l, cfg, s, segs, beat, beatPhase);
  if (rock !== null) drawRock(ctx, l, rock, beat + beatPhase);
  ctx.restore();
  stops?.aim(keelStopper(l, world, s, segs, rock, shift));
}

/** The tendons between neighbouring segments: one line from each end to the next one's start, which a loose pair stretches. */
function drawTendons(ctx: CanvasRenderingContext2D, l: Layout, segs: Seg[]): void {
  const p = new Path2D();
  for (const [from, to] of keelTendons(l, segs)) {
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
 * as it snaps, and white-hot while the cooldown has it hot
 * (`keel-seam-look.ts`).
 */
function drawSegment(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: KeelState,
  k: number,
  g: Seg,
  heat: number,
  bright: number,
  beatPhase: number,
  time: number,
  fx: KeelFx,
): void {
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
  const pulse = keelPulse(s, k, beatPhase);
  KEEL_SEAM.paint(ctx, seam, { s, k, bright, pulse, snap: fx.snap(k), heat, beatPhase });
}

/** The tail's rock, a lump of the same iron, falling. */
function drawRock(ctx: CanvasRenderingContext2D, l: Layout, at: Point, t: number): void {
  const rock = splinePath(
    blobPoints(at.x, at.y, l.tile * KEEL_ROCK.rx, l.tile * KEEL_ROCK.ry, 5, 0.14, 0.02, t, 41, 20),
    true,
  );
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(rock);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.rock;
  ctx.stroke(rock);
}
