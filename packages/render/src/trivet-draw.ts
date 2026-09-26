import { LIGHT_HALF } from "@neon-spore/content";
import {
  TRIVET_PADS,
  type TrivetState,
  type TrivetStep,
  trivetLitStep,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { coreHurt } from "./core-hurt.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { seamColour } from "./seam-marks.js";
import type { TrivetFx } from "./trivet-fx.js";
import { drawTrivetFace, drawTrivetFlash, drawTrivetSockets } from "./trivet-marks.js";
import {
  trivetArrived,
  trivetAsksFoot,
  trivetBuckle,
  trivetClamp,
  trivetFootLift,
  trivetHubPress,
  trivetLeft,
} from "./trivet-pose.js";
import {
  type Point,
  trivetCentre,
  trivetClampPath,
  trivetDrop,
  trivetFoot,
  trivetHubPath,
  trivetHubR,
  trivetLegPath,
  trivetPlatePath,
  trivetRoot,
} from "./trivet-shape.js";

/** How far the hub sinks as the stand collapses, in tiles. */
const SINK = 1.4;

/**
 * **THE TRIVET**: a three-legged stand splayed wide over the middle of the
 * field, its two outer feet planted by each seat's chord and its hub, once
 * both are down, shot three times (§11.47, `bosses-choreographed.md` §30).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: a chord is
 * one seat's, but the other has to see which foot is lit to say so, and a
 * fire step's colour says which cannon answers.
 *
 * **Dull gunmetal, lit only where it asks** (§30, *Colour*): the sockets a
 * cold blue-white while a chord wants them, the hub in its cannon's colour
 * while a shot is owed. **Its health is the feet and the hub**: a foot swung
 * down as its chord holds and clamped at its ankle on the second plant, and
 * the hub's face smaller and brighter for every hit.
 *
 * What outlives a frame — a plant's thud, a clamp's flare, a hub hit's flash,
 * the collapse's, the blow — is `fx` (`trivet-fx.ts`), told the hub's colour
 * here because the event that hits it does not carry one.
 */
export function drawTrivet(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: TrivetState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: TrivetFx,
): void {
  const cfg = world.cfg;
  const arrived = trivetArrived(s, cfg, beat, beatPhase);
  const buckle = trivetBuckle(s, cfg, beat, beatPhase);
  const home = trivetCentre(l, cfg);
  const alpha = (0.2 + 0.8 * arrived) * (1 - 0.6 * buckle);
  // The collapse lowers the whole stand, feet and all, as its legs splay flat; the press lowers the hub alone.
  const fall = SINK * buckle * buckle * l.tile;
  const sink = trivetHubPress(s) * l.tile + fall;
  const step = trivetLitStep(s);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(
    home.x + fx.hurt.shakeX(time, l.tile),
    home.y - trivetDrop(l, arrived) + fx.thud * l.tile,
  );
  if (step?.ask === "fire") fx.tell(seamColour(step.color).rim);

  // The middle leg first, behind the two a seat answers for; it never lifts.
  drawLeg(ctx, l, trivetRoot(l, 2, sink), lowered(trivetFoot(l, 2, 0, buckle), fall));
  for (const side of [0, 1] as const) {
    const lift = trivetFootLift(world, s, side, beat, beatPhase) * (1 - buckle);
    const foot = lowered(trivetFoot(l, side, lift, buckle), fall);
    drawLeg(ctx, l, trivetRoot(l, side, sink), foot);
    drawPlate(ctx, l, s, step, side, foot, beatPhase, fx.snap(side));
    ctx.globalAlpha = alpha;
  }

  ctx.translate(0, sink);
  drawHub(ctx, l, time, fx.hurt.value);
  const firing = step !== null && step.ask === "fire" && s.hubLit;
  const lit = firing ? { color: step.color, left: trivetLeft(world, s, beat, beatPhase) } : null;
  // A core's hurt, called: a hub's face is smaller and brighter per hit the same way a kernel is.
  const hurt = coreHurt(s.hits);
  drawTrivetFace(ctx, l, hurt.size * (1 - 0.5 * buckle), hurt.bright, s.hubLit, lit, beatPhase);
  drawTrivetFlash(ctx, l, fx.flash, fx.collapse);
  ctx.restore();
}

/** A foot moved `by` pixels further down. */
function lowered<T extends Point>(p: T, by: number): T {
  return { ...p, y: p.y + by };
}

/** One of CALTROP's needles, from the root it leaves the hub at to its foot. */
function drawLeg(ctx: CanvasRenderingContext2D, l: Layout, from: Point, to: Point): void {
  const leg = trivetLegPath(l, from, to);
  ctx.fillStyle = PALETTE.trivetMetal;
  ctx.fill(leg);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.35);
  ctx.stroke(leg);
}

/** An outer foot's plate, turned with its leg: its sockets, and the clamp across its ankle as it locks, flaring as it snaps home. */
function drawPlate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: TrivetState,
  step: TrivetStep | null,
  side: 0 | 1,
  foot: Point & { turn: number },
  beatPhase: number,
  snap: number,
): void {
  ctx.save();
  ctx.translate(foot.x, foot.y);
  ctx.rotate(foot.turn);
  const plate = trivetPlatePath(l);
  ctx.fillStyle = PALETTE.trivetMetal;
  ctx.fill(plate);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.trivetMetalDark, 0.9);
  ctx.stroke(plate);
  const lit = step !== null && trivetAsksFoot(s, side) ? step.pads : 0;
  drawTrivetSockets(ctx, l, side, TRIVET_PADS, lit, s.padsDown[side], beatPhase);
  const shut = trivetClamp(s, side, beatPhase);
  if (shut > 0) {
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.4 + 0.5 * shut);
    ctx.stroke(trivetClampPath(l, shut));
    if (snap > 0)
      strokeGlow(ctx, trivetClampPath(l, shut), PALETTE.trivetSocket, STROKE.inner, snap);
  }
  ctx.restore();
}

/** SINKER's hub in gunmetal, the key light on it, the blow over it and its pale rim. */
function drawHub(ctx: CanvasRenderingContext2D, l: Layout, time: number, hurt: number): void {
  const hub = trivetHubPath(l);
  const r = trivetHubR(l);
  ctx.fillStyle = PALETTE.trivetMetal;
  ctx.fill(hub);
  ctx.save();
  ctx.clip(hub);
  litRound(ctx, 0, -r * 0.15, r * 1.1, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.5));
  ctx.restore();
  drawHurt(ctx, hub, hurt);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.6);
  ctx.stroke(hub);
}
