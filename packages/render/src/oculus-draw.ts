import {
  OCULUS_LEAVES,
  type OculusState,
  oculusDone,
  oculusLitStep,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { drawOculusFuse } from "./oculus-fuse.js";
import type { OculusFx } from "./oculus-fx.js";
import { drawOculusLens, type OculusAim } from "./oculus-lens.js";
import { drawOculusLevers } from "./oculus-levers.js";
import { drawOculusFlash } from "./oculus-marks.js";
import { oculusArrived, oculusShatter } from "./oculus-pose.js";
import { oculusCentre, oculusLift, oculusPinAngle, oculusRadius } from "./oculus-shape.js";
import { oculusStopper } from "./oculus-stop.js";
import { oculusLookedCol } from "./oculus-story.js";
import { drawOculusMarkFeedback } from "./oculus-verdicts.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE OCULUS**: a lens of six leaves over the middle column, shut two at a
 * time by both thumbs holding together, and a core in the socket behind them
 * (§11.44, `bosses-choreographed.md` §27).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role` but the marks' feedback: a hold
 * asks both seats at once, and a fire step's colour says which cannon answers,
 * so both have to see all of it.
 *
 * **Mechanism, not flesh**: a grey rim of lapped plates, dull glass leaves,
 * and the only colour on it is what a step asks for — the lit pair in white,
 * the core in its cannon's colour. **Its health is the core**, smaller for
 * every hit it has taken.
 *
 * The glare and the look, the two story steps, are `oculus-story.ts`.
 *
 * What outlives a frame — the thud of a shut pair, a core hit's flash, the
 * shatter's, the blow — is `fx` (`oculus-fx.ts`), told the core's colour here
 * because the event that hits it does not carry one. Over it all, what each
 * mark asks and said back (`oculus-verdicts.ts`).
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
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const arrived = oculusArrived(s, cfg, beat, beatPhase);
  const home = oculusCentre(l, cfg);
  const shatter = oculusShatter(s, cfg, beat, beatPhase);

  const step = oculusLitStep(s);
  if (step?.ask === "fire") fx.tell(stepColour(step.color).rim);
  const y = home.y - oculusLift(l, arrived) + fx.thud * l.tile;
  const lookX = fieldX(l, oculusLookedCol(cfg, s)) - home.x;
  const aim: OculusAim = { toHull: l.hullY - y, lookX };
  ctx.save();
  ctx.globalAlpha = (0.2 + 0.8 * arrived) * (1 - 0.7 * shatter);
  const x = home.x + fx.hurt.shakeX(time, l.tile);
  ctx.translate(x, y);
  if (shatter <= 0) {
    const core = drawOculusLens(ctx, l, world, s, beat, beatPhase, time, fx, aim);
    // From the beat it shatters, as the simulation says (`sim/oculus-shot.ts`).
    if (!oculusDone(s)) stops?.aim(oculusStopper(l, world, { x, y }, core, time));
  } else {
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
      drawOculusLens(ctx, l, world, s, beat, beatPhase, time, fx, aim);
      ctx.restore();
    }
  }
  if (shatter <= 0) drawOculusLevers(ctx, l, cfg, s, l.role, time);
  const hull = { x: aim.lookX, y: aim.toHull };
  drawOculusMarkFeedback(ctx, l, cfg, s, beat, beatPhase, time, hull, fx.marks.verdicts);
  drawOculusFlash(ctx, l, fx.flash, fx.shatter);
  ctx.restore();
  drawOculusFuse(ctx, l, world, s, beat, beatPhase);
}
