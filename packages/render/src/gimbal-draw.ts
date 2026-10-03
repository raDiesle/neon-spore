import { LIGHT_HALF } from "@neon-spore/content";
import {
  type GimbalState,
  gimbalAligned,
  gimbalLeaking,
  INNER,
  OUTER,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import { drawGimbalBeam } from "./gimbal-beam.js";
import {
  gimbalCorePath,
  gimbalHoopPath,
  gimbalLeafPath,
  gimbalLeakPoint,
  gimbalOpenPhase,
  gimbalRibPath,
  gimbalSeamPath,
  gimbalSeamPhase,
  gimbalStillPhase,
} from "./gimbal-drum.js";
import type { GimbalFx } from "./gimbal-fx.js";
import { drawGimbalPartnerMark } from "./gimbal-partner.js";
import { drawGimbalRing } from "./gimbal-ring.js";
import { gimbalCentre, gimbalDrumR, type Point } from "./gimbal-shape.js";
import { gimbalHush, gimbalTilt, tiltPlane } from "./gimbal-tilt.js";
import { drawTiltedCradle } from "./gimbal-tilt-draw.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsGimbalInner, showsGimbalOuter } from "./view-role-clocks-c.js";

/**
 * How far each leaf's own light idles off true, in radians, and how long one
 * wobble takes there and back, in wall-clock seconds — the drum's own version
 * of `instar-side-head.ts`'s `CROWN_WOBBLE`: sealed shut, the leaf's pose
 * never changes frame to frame, so a flat fill read as a lid rather than a
 * dome. `litRound` gives it the same five-zone shading a rock or an ore vein
 * already gets (`key-light.ts`), and this idle turn is what keeps the light on
 * it from being a photograph. The two leaves run a turn apart (`side` added
 * straight into the phase) so the shoulders do not slide in lockstep.
 */
const DRUM_WOBBLE = 0.05;
const DRUM_WOBBLE_PERIOD = 6.4;

/**
 * **THE GIMBAL**: a sealed drum hung in a yoke over the middle of the field
 * inside two rings set at right angles — the pilot gripping the outer one,
 * the navigator the inner, and neither ever shown the other's (§11.34, §18).
 *
 * Six poses, in the order the fight runs through them and drawn off the
 * world alone: dark and still; one ring turning while the other waits; both
 * rings glowing at true alignment; the shearing spark with the rim a tooth
 * shorter; both spinning loose with nothing left to grip; the drum split
 * along its seam and swinging open toward the ship. The morph between two of
 * them is always eased and never cut — `smoothstep` over the phase's own
 * beats (`gimbal-drum.ts`).
 *
 * **Its health is the rim.** Three teeth to a ring, one sheared per
 * alignment, and a spent one is drawn as the socket it left rather than
 * removed: a rim with one tooth left is a different silhouette from a rim
 * with three, and nothing anywhere prints the number.
 *
 * **The reflection is not drawn — it is the one thing the picture hides.**
 * Each seat's ring is drawn true on its own face (`gimbalFaceMilli`), and
 * the partner's mark beside it on the same face (`gimbal-partner.ts`), so the
 * pair is never shown that a turn one way is a turn the other way over
 * there. Finding that out is the fight.
 *
 * This file is the half neither seat can touch — the yoke, the drum and the
 * leak. The ring each seat grips is `gimbal-ring.ts`.
 */
export function drawGimbal(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GimbalState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: GimbalFx,
): void {
  const cfg = world.cfg;
  const lit = smoothstep(gimbalStillPhase(s, cfg, beat, beatPhase));
  const open = gimbalOpenPhase(s, cfg, beat, beatPhase);
  const at = gimbalCentre(l, cfg);

  ctx.save();
  // What the reactions do to the whole cradle, and they only ever move *it*:
  // the kick of a tooth coming off drops it in its yoke, the rock of a ring
  // that lost true tips the pair of them together, and the glare of the seam
  // letting go washes the lot. Applied to the context rather than to any
  // path, so the rings, the drum and the marks stay in one rigid body — a
  // mark that shook loose of its own rim would be the boss lying about the
  // one thing it may not lie about (`gimbal-fx.ts`).
  ctx.globalAlpha = Math.min(1, 0.15 + 0.85 * lit + 0.3 * fx.glare);
  ctx.translate(at.x + fx.hurt.shakeX(time, l.tile), at.y + fx.kick * l.tile);
  ctx.rotate(fx.shake * 0.05 * Math.sin(time * 38));
  ctx.translate(-at.x, -at.y);
  // The drift (`gimbal-tilt.ts`): the solid parts through the rig — the yoke,
  // the hoops, the teeth, the pins and the shut drum — then everything flat
  // laid on through the same tilt.
  const tilt = gimbalTilt(time, gimbalHush(s, world, beat, beatPhase));
  ctx.translate(at.x, at.y);
  ctx.rotate(tilt.roll);
  ctx.translate(-at.x, -at.y);
  drawTiltedCradle(ctx, l, s, at, open, time, tilt, fx.hurt.value);
  tiltPlane(ctx, at, tilt);
  if (open > 0) drawDrum(ctx, l, at, open, time, fx.hurt.value);
  if (gimbalLeaking(s)) drawLeak(ctx, l, world, s, at, beat, beatPhase, open);
  fx.see(gimbalAligned(s, beat));
  drawGimbalBeam(ctx, l, s, at, beat, time, fx.locked);
  for (const ring of [OUTER, INNER] as const)
    if (ring === OUTER ? showsGimbalOuter(l.role) : showsGimbalInner(l.role))
      drawGimbalRing(ctx, l, world, s, ring, at, beat, beatPhase, time, fx.marks.verdicts);
  drawGimbalPartnerMark(ctx, l, s, at, beat, time);
  ctx.restore();
}

/**
 * The drum once it opens: two leaves swinging apart on the core — shut, it
 * is a solid part of the rig (`gimbal-tilt-draw.ts`). The whole body tips toward the ship as they
 * swing (`gimbalDrumFlat`), which is the one place on this boss a face the
 * pair has been reading goes away and another comes.
 */
function drawDrum(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  open: number,
  time: number,
  hurt: number,
): void {
  const r = gimbalDrumR(l);
  if (open > 0) {
    const core = gimbalCorePath(at, r, open);
    ctx.fillStyle = rgba(PALETTE.wisp, 0.25 + 0.5 * smoothstep(open));
    ctx.fill(core);
    strokeGlow(ctx, core, PALETTE.wispRim, STROKE.inner, 0.6 + 0.9 * open);
  }
  for (const side of [-1, 1] as const) {
    const leaf = gimbalLeafPath(at, r, side, open);
    ctx.fillStyle = rgba(PALETTE.rockDark, 0.85);
    ctx.fill(leaf);
    ctx.save();
    ctx.clip(leaf);
    const wobble = DRUM_WOBBLE * Math.sin((time * (Math.PI * 2)) / DRUM_WOBBLE_PERIOD + side);
    litRound(ctx, at.x, at.y, r, LIGHT_HALF.rock, wobble);
    ctx.restore();
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.45);
    ctx.stroke(gimbalRibPath(at, r, side, open));
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = PALETTE.rock;
    ctx.stroke(leaf);
    drawHurt(ctx, leaf, hurt);
  }
  if (open < 0.6) {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.5 * (1 - open / 0.6));
    ctx.stroke(gimbalHoopPath(at, r, open));
  }
  if (open < 1) {
    const seam = gimbalSeamPath(at, r, open);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.wispRim, 0.3 + 0.2 * Math.sin(time * 2));
    ctx.stroke(seam);
  }
}

/**
 * The leak, once one tooth is left: the seam lit in the colour it is venting
 * and a bead of it running down the field toward the column it will breach,
 * so the hit is seen coming rather than announced. Red and cyan by turns,
 * because either is the truth about it and neither is a trigger to load.
 */
function drawLeak(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GimbalState,
  at: Point,
  beat: number,
  beatPhase: number,
  open: number,
): void {
  const along = gimbalSeamPhase(s, world.cfg, beat, beatPhase);
  const colour = s.seamCol % 2 === 0 ? PALETTE.red : PALETTE.cyan;
  const seam = gimbalSeamPath(at, gimbalDrumR(l), open);
  strokeGlow(ctx, seam, colour, STROKE.outline, 1 + along);
  const { x, y } = gimbalLeakPoint(l, world.cfg, s, beat, beatPhase);
  const bead = new Path2D();
  bead.ellipse(x, y, l.tile * 0.18, l.tile * 0.26, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(colour, 0.5 + 0.4 * along);
  ctx.fill(bead);
  strokeGlow(ctx, bead, colour, STROKE.inner, 1 + along);
}
