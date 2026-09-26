import { LIGHT_HALF } from "@neon-spore/content";
import {
  OCULUS_LEAVES,
  type OculusState,
  oculusLitStep,
  oculusWindowBeats,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import type { OculusFx } from "./oculus-fx.js";
import {
  drawOculusCore,
  drawOculusFlash,
  drawOculusLitPair,
  oculusColour,
} from "./oculus-marks.js";
import {
  oculusArrived,
  oculusLeft,
  oculusLitPair,
  oculusShatter,
  oculusShut,
  oculusSocket,
} from "./oculus-pose.js";
import {
  oculusCentre,
  oculusFacePath,
  oculusLapPath,
  oculusLeafPath,
  oculusLift,
  oculusPinAngle,
  oculusRadius,
  oculusRimPath,
  oculusSocketPath,
} from "./oculus-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE OCULUS**: a lens of six leaves over the middle column, shut two at a
 * time by both thumbs holding together, and a core in the socket behind them
 * (§11.44, `bosses-choreographed.md` §27).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: a hold
 * asks both seats at once, and a fire step's colour says which cannon answers,
 * so both have to see all of it.
 *
 * **Mechanism, not flesh**: a grey rim of lapped plates, dull glass leaves,
 * and the only colour on it is what a step asks for — the lit pair in white,
 * the core in its cannon's colour. **Its health is the core**, smaller for
 * every hit it has taken.
 *
 * What outlives a frame — the thud of a shut pair, a core hit's flash, the
 * shatter's, the blow — is `fx` (`oculus-fx.ts`), told the core's colour here
 * because the event that hits it does not carry one.
 */
export function drawOculus(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: OculusState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: OculusFx,
): void {
  const cfg = world.cfg;
  const arrived = oculusArrived(s, cfg, beat, beatPhase);
  const home = oculusCentre(l, cfg);
  const shatter = oculusShatter(s, cfg, beat, beatPhase);

  const step = oculusLitStep(s);
  if (step?.ask === "fire") fx.tell(oculusColour(step.color).rim);
  ctx.save();
  ctx.globalAlpha = (0.2 + 0.8 * arrived) * (1 - 0.7 * shatter);
  ctx.translate(
    home.x + fx.hurt.shakeX(time, l.tile),
    home.y - oculusLift(l, arrived) + fx.thud * l.tile,
  );
  if (shatter <= 0) drawLens(ctx, l, world, s, beat, beatPhase, time, fx);
  else {
    // The lens falls apart along its plates: six wedges, each thrown out
    // along its own middle and turned a little as it goes.
    const rim = oculusRadius(l).rim * 1.3;
    const seg = (Math.PI * 2) / OCULUS_LEAVES;
    for (let k = 0; k < OCULUS_LEAVES; k++) {
      const a = oculusPinAngle(k) + seg / 2;
      ctx.save();
      ctx.translate(Math.cos(a) * shatter * l.tile, Math.sin(a) * shatter * l.tile);
      ctx.rotate((k % 2 === 0 ? 1 : -1) * shatter * 0.4);
      const wedge = new Path2D();
      wedge.moveTo(0, 0);
      wedge.arc(0, 0, rim, a - seg / 2, a + seg / 2);
      wedge.closePath();
      ctx.clip(wedge);
      drawLens(ctx, l, world, s, beat, beatPhase, time, fx);
      ctx.restore();
    }
  }
  drawOculusFlash(ctx, l, fx.flash, fx.shatter);
  ctx.restore();
}

/** The lens whole: glass face, the leaves across it, the socket and core behind, the rim over their roots, the blow over the rim. */
function drawLens(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: OculusState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: OculusFx,
): void {
  const face = oculusFacePath(l);
  ctx.fillStyle = rgba(PALETTE.background, 0.9);
  ctx.fill(face);

  const shut = oculusShut(s, world.cfg, beat, beatPhase);
  ctx.save();
  ctx.clip(face);
  for (let k = 0; k < OCULUS_LEAVES; k++) {
    const leaf = oculusLeafPath(l, k, shut[k] ?? 0);
    ctx.fillStyle = rgba(PALETTE.dim, 0.85);
    ctx.fill(leaf);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.6);
    ctx.stroke(leaf);
  }
  ctx.restore();

  const step = oculusLitStep(s);
  const open = oculusSocket(s, beat, beatPhase);
  if (open > 0) {
    const socket = oculusSocketPath(l, open);
    ctx.fillStyle = rgba(PALETTE.background, 1);
    ctx.fill(socket);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.6);
    ctx.stroke(socket);
  }
  const firing = step !== null && step.ask === "fire" && s.socketOpen;
  const lit = firing
    ? { color: step.color, left: oculusLeft(s, oculusWindowBeats(world, step), beat, beatPhase) }
    : null;
  drawOculusCore(ctx, l, open, s.hits, lit, beatPhase);

  const { rim } = oculusRadius(l);
  const ring = oculusRimPath(l, time * 0.6);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(ring, "evenodd");
  ctx.save();
  ctx.clip(ring, "evenodd");
  litRound(ctx, 0, -rim * 0.4, rim, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.7));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.9);
  ctx.stroke(ring);
  drawHurt(ctx, ring, fx.hurt.value);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.5);
  ctx.stroke(oculusLapPath(l));

  if (step === null || (step.ask !== "shut" && step.ask !== "reseal")) return;
  const pair = oculusLitPair(s);
  drawOculusLitPair(ctx, l, [pair, pair + OCULUS_LEAVES / 2], shut, beatPhase);
}
