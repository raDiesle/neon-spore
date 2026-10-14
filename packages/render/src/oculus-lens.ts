import { LIGHT_HALF } from "@neon-spore/content";
import {
  OCULUS_LEAVES,
  type OculusState,
  oculusIsPair,
  oculusLitStep,
  oculusWindowBeats,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Circle, Layout } from "./layout.js";
import type { OculusFx } from "./oculus-fx.js";
import { drawOculusGlanced, oculusGlancedPoint } from "./oculus-glance.js";
import { drawOculusCore, drawOculusLitPair, oculusCoreRadius } from "./oculus-marks.js";
import { oculusHung, oculusLeft, oculusLitPair, oculusShut, oculusSocket } from "./oculus-pose.js";
import {
  oculusFacePath,
  oculusLapPath,
  oculusLeafPath,
  oculusRadius,
  oculusRimPath,
  oculusSocketPath,
} from "./oculus-shape.js";
import {
  drawOculusGlare,
  drawOculusSight,
  oculusCorePose,
  oculusGaze,
  oculusGlare,
} from "./oculus-story.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/** Where the hull and the look's column are from the lens's centre — the story steps' aim. */
export interface OculusAim {
  toHull: number;
  lookX: number;
}

/**
 * The lens whole: glass face, the leaves across it, the socket and core
 * behind, the rim over their roots, the blow over the rim — turned as
 * `oculus-glance.ts` says — then the glare and the sight, which aim at the
 * hull and do not turn, then the lit pair's marks on the turned leaves. Hands
 * back the core as drawn, about the lens's middle.
 */
export function drawOculusLens(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: OculusState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: OculusFx,
  aim: OculusAim,
): Circle {
  const shut = oculusShut(s, world.cfg, beat, beatPhase).map((v, k) => oculusHung(v, k, time));
  const step = oculusLitStep(s);
  const open = oculusSocket(s, beat, beatPhase);
  const gaze = oculusGaze(s, world.cfg, beat, beatPhase);
  const glare = oculusGlare(s, world.cfg, beat, beatPhase);
  const core = oculusCorePose(l, gaze, glare);
  // The core is lit while a step asks the eye itself: a fire, a look in
  // its colour, a glare in white.
  const eyed =
    step !== null && (step.ask === "fire" || step.ask === "look" || step.ask === "glare");
  const lit =
    eyed && s.socketOpen
      ? { color: step.color, left: oculusLeft(s, oculusWindowBeats(world, step), beat, beatPhase) }
      : null;

  drawOculusGlanced(ctx, l, time, (g) => {
    const face = oculusFacePath(l);
    g.fillStyle = rgba(PALETTE.background, 0.9);
    g.fill(face);
    g.save();
    g.clip(face);
    for (let k = 0; k < OCULUS_LEAVES; k++) {
      const leaf = oculusLeafPath(l, k, shut[k] ?? 0);
      g.fillStyle = rgba(PALETTE.dim, 0.85);
      g.fill(leaf);
      g.lineWidth = STROKE.inner;
      g.strokeStyle = rgba(PALETTE.rock, 0.6);
      g.stroke(leaf);
    }
    g.restore();
    if (open > 0) {
      const socket = oculusSocketPath(l, open);
      g.fillStyle = rgba(PALETTE.background, 1);
      g.fill(socket);
      g.lineWidth = STROKE.inner;
      g.strokeStyle = rgba(PALETTE.rock, 0.6);
      g.stroke(socket);
    }
    g.save();
    g.translate(core.x, core.y);
    drawOculusCore(g, l, open, s.hits, lit, beatPhase, core.scale);
    g.restore();

    const { rim } = oculusRadius(l);
    const ring = oculusRimPath(l, time * 0.6);
    g.fillStyle = rgba(PALETTE.rockDark, 0.95);
    g.fill(ring, "evenodd");
    g.save();
    g.clip(ring, "evenodd");
    litRound(g, 0, -rim * 0.4, rim, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.7));
    g.restore();
    g.lineWidth = STROKE.outline;
    g.strokeStyle = rgba(PALETTE.rock, 0.9);
    g.stroke(ring);
    drawHurt(g, ring, fx.hurt.value);
    g.lineWidth = STROKE.inner;
    g.strokeStyle = rgba(PALETTE.rock, 0.5);
    g.stroke(oculusLapPath(l));
    // The ring's face is cut the other way round, so the two cover the lens once.
    return [ring, face];
  });
  const eye = { x: core.x, y: core.y, r: oculusCoreRadius(l, open, s.hits, core.scale) };

  drawOculusGlare(ctx, l, glare, aim.toHull, beatPhase);
  const colour = stepColour(step?.ask === "look" ? step.color : "either");
  const from = oculusGlancedPoint(l, time, core);
  drawOculusSight(ctx, l, from, { x: aim.lookX, y: aim.toHull }, colour, gaze);

  if (step !== null && oculusIsPair(step)) {
    const pair = oculusLitPair(s);
    drawOculusGlanced(ctx, l, time, (g) => {
      drawOculusLitPair(g, l, [pair, pair + OCULUS_LEAVES / 2], shut, beatPhase);
      return [];
    });
  }
  return eye;
}
