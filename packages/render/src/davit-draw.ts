import { type DavitState, davitLitStep, type World } from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import {
  drawDavitAsk,
  drawDavitBoom,
  drawDavitChain,
  drawDavitHook,
  drawDavitMast,
} from "./davit-marks.js";
import { davitAngle, davitPivotGlow, davitStood, davitWindowLeft } from "./davit-pose.js";
import { DAVIT_SAG, davitMast } from "./davit-shape.js";
import { davitStopper } from "./davit-stop.js";
import { type DavitVerdicts, drawDavitMarkFeedback } from "./davit-verdicts.js";
import type { Layout } from "./layout.js";

/**
 * **THE DAVIT** (§35): a crane boom on a mast over the middle column, swung
 * by whichever seat's lean is steering it, let go by a loose off each seat's
 * own thumb, a hook on the end of its slack chain both cannons are asked to
 * hit. Both screens are drawn the same — the other seat has to see which
 * half the lean is steering and how far the lit step's window has run
 * (`view-role-clocks-c.ts`). Its marks answer a touch over it
 * (`davit-verdicts.ts`).
 */
export function drawDavit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: DavitState,
  beat: number,
  beatPhase: number,
  time: number,
  marks: DavitVerdicts,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const mast = davitMast(l, cfg);
  const stood = davitStood(s, beat, beatPhase, cfg.davitStillBeats);
  const angle = davitAngle(s, cfg, beatPhase);
  const sag = DAVIT_SAG;
  stops?.aim(davitStopper(l, world, angle, stood));

  ctx.save();
  ctx.globalAlpha = stood;
  ctx.translate(mast.x, mast.y);

  drawDavitMast(ctx, l);
  drawDavitBoom(ctx, l, angle, stood, time);

  const step = davitLitStep(s);
  if (step !== null && step.ask !== "fire" && step.ask !== "reland") {
    drawDavitAsk(ctx, l, angle, beatPhase);
  }

  drawDavitChain(ctx, l, angle, sag);

  const firing = step !== null && step.ask === "fire";
  const lit = firing
    ? { color: step.color, left: davitWindowLeft(world, s, beat, beatPhase) }
    : null;
  drawDavitHook(ctx, l, angle, sag, davitPivotGlow(s), lit, beatPhase);

  drawDavitMarkFeedback(ctx, l, s, angle, time, marks.verdicts);
  ctx.restore();
}
