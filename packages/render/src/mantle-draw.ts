import { blobPoints, LIGHT_HALF } from "@neon-spore/content";
import { type MantleState, mantleFinale, mantleLeaking, type World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { drawMantleHandles, drawMantleRing } from "./mantle-handle.js";
import {
  mantleArrived,
  mantleCoreBeat,
  mantleCoreLife,
  mantleHandlesLit,
  mantleOpen,
  mantleShed,
  mantleValvePose,
} from "./mantle-pose.js";
import {
  mantleCentre,
  mantlePlatePath,
  mantleReach,
  mantleRimPath,
  PLATE_BOUNDS,
  type Point,
  type Side,
  type ValvePose,
} from "./mantle-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * The core's colour: red, the one warm thing on the body. §23 lets a run
 * choose red or cyan and says the choice means nothing — nobody fires at the
 * core — and nothing in the world a drawer may read is a run's own, so the
 * choice is made once, here.
 */
const CORE = PALETTE.red;
const PLATES = PLATE_BOUNDS.length - 1;

/**
 * **THE MANTLE**: a hinged carapace shell hung over the middle of the field,
 * closed over a soft core, pried open a plate-pair at a time by two thumbs
 * pulling **together** (§11.40, `bosses-choreographed.md` §23).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: the whole
 * point of the boss is one number both seats can see, so each is shown both
 * valves, both handles and the one cord between them.
 *
 * **Its health is the plates.** Four to a valve, laid in laps, shed one off
 * each valve together, tail first — and a shed one leaves the core's light
 * showing through the gap it left rather than a number anywhere. With every
 * plate gone the rims split down the seam, swing out on their hinge and turn
 * edge-on, and the bare core beats inside them until the alternating finish
 * dims it out.
 *
 * **The pull is drawn as the shell swelling**, off the summed depth
 * (`mantle-pose.ts`): both flanks bow outward as the thumbs pull, and each
 * valve's tail drops under its own handle. The handles, the cord and the
 * finish's ring are `mantle-handle.ts`.
 */
export function drawMantle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MantleState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const arrived = mantleArrived(s, cfg, beat, beatPhase);
  const at = mantleCentre(l, cfg);
  const poses: Record<Side, ValvePose> = {
    [-1]: mantleValvePose(s, cfg, -1, beat, beatPhase),
    1: mantleValvePose(s, cfg, 1, beat, beatPhase),
  };

  ctx.save();
  ctx.globalAlpha = 0.2 + 0.8 * arrived;
  ctx.translate(0, -(1 - arrived) * 3 * l.tile);
  drawCore(ctx, l, world, s, at, beat, beatPhase);
  for (const side of [-1, 1] as const)
    drawValve(ctx, l, s, at, side, poses[side], beat, beatPhase, time);
  const lit = mantleHandlesLit(s, beat, beatPhase);
  if (mantleFinale(s)) drawMantleRing(ctx, l, s, at, beatPhase);
  else if (s.phase !== "dark") drawMantleHandles(ctx, l, world, s, at, poses, lit, time);
  if (mantleLeaking(s)) drawSpark(ctx, l, world, s, at, beat, beatPhase);
  ctx.restore();
}

/**
 * The soft core under the shell. While shut it is only seen where plates have
 * gone — the gap under a sheared pair leaks its light (row 3) — and once the
 * shell splits it is the whole middle of the picture, beating twice a beat.
 */
function drawCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MantleState,
  at: Point,
  beat: number,
  beatPhase: number,
): void {
  const { rx, ry } = mantleReach(l);
  const open = mantleOpen(s, beat, beatPhase);
  const life = mantleCoreLife(s, world.cfg, beat, beatPhase);
  const pulse = mantleFinale(s) ? mantleCoreBeat(beatPhase) : 0;
  const grow = 1 + 0.08 * pulse * open;
  const core = splinePath(
    blobPoints(
      at.x,
      at.y + ry * 0.12,
      rx * 0.66 * grow,
      ry * 0.74 * grow,
      5,
      0.08,
      0.04,
      beat + beatPhase,
      23,
      30,
    ),
    true,
  );
  const warm = life * (0.35 + 0.1 * s.cursor + 0.45 * open);
  ctx.fillStyle = rgba(life > 0.35 ? CORE : PALETTE.rockDark, Math.min(0.9, warm));
  ctx.fill(core);
  if (life > 0.35) strokeGlow(ctx, core, CORE, STROKE.inner, 0.4 + 0.8 * open + 0.6 * pulse * open);
}

/**
 * One valve: its plates from the tail up, so each laps over the one beneath,
 * then the rim they are laid in. The newest sheared plate is drawn falling
 * clear — down and fading — for the beat after it goes.
 */
function drawValve(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: MantleState,
  at: Point,
  side: Side,
  pose: ValvePose,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const { rx, ry } = mantleReach(l);
  const shed = mantleShed(s, beat, beatPhase);
  for (let k = PLATES - 1; k >= 0; k--) {
    // Pair `i` is the i-th sheared, and the tail's pair goes first.
    const pair = PLATES - 1 - k;
    const falling = pair === s.cursor - 1 && shed < 1;
    if (pair < s.cursor && !falling) continue;
    const plate = mantlePlatePath(l, at, side, pose, k);
    ctx.save();
    if (falling) {
      ctx.globalAlpha *= 1 - shed;
      ctx.translate(side * shed * 0.5 * l.tile, smoothstep(shed) * 1.4 * l.tile);
    }
    ctx.fillStyle = rgba(PALETTE.rockDark, 0.94);
    ctx.fill(plate);
    ctx.save();
    ctx.clip(plate);
    litRound(
      ctx,
      at.x + side * rx * 0.5,
      at.y,
      ry,
      LIGHT_HALF.rock,
      0.04 * Math.sin(time * 0.9 + side),
    );
    ctx.restore();
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = PALETTE.rock;
    ctx.stroke(plate);
    ctx.restore();
  }
  const rim = mantleRimPath(l, at, side, pose);
  ctx.lineWidth = STROKE.outline * (1 + 0.4 * pose.open);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.85);
  ctx.stroke(rim);
}

/**
 * The spark leaking from the open gap (row 5): the seam's tail lit in the
 * core's colour and a bead of it running down the middle column toward the
 * hull over its fuse, so the hit is seen coming. Any shot in the column puts
 * it out (`sim/mantle-shot.ts`).
 */
function drawSpark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MantleState,
  at: Point,
  beat: number,
  beatPhase: number,
): void {
  const { ry } = mantleReach(l);
  const along = smoothstep(
    (beat - s.sparkBeat + beatPhase) / Math.max(1, world.cfg.mantleSparkBeats),
  );
  const x = fieldX(l, s.sparkCol);
  const from = at.y + ry;
  const y = from + (l.hullY - from) * along;
  const bead = new Path2D();
  bead.ellipse(x, y, l.tile * 0.18, l.tile * 0.26, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(CORE, 0.55 + 0.4 * along);
  ctx.fill(bead);
  strokeGlow(ctx, bead, CORE, STROKE.inner, 1 + along);
}
