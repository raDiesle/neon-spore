import { LIGHT_HALF } from "@neon-spore/content";
import {
  midCol,
  type TrapezeState,
  trapezeAims,
  trapezeCatching,
  trapezeFreezes,
  trapezeFrozen,
  trapezeLitStep,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import { coreHurt } from "./core-hurt.js";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { stepColour } from "./step-colour.js";
import type { TrapezeFx } from "./trapeze-fx.js";
import {
  drawTrapezeRing,
  drawTrapezeStuds,
  drawTrapezeTrack,
  trapezeMarks,
} from "./trapeze-marks.js";
import {
  trapezeArrived,
  trapezeAsked,
  trapezeCaught,
  trapezeLay,
  trapezeLeft,
  trapezeSpent,
  trapezeSpindleGlow,
} from "./trapeze-pose.js";
import { drawTrapezeCrack, drawTrapezeFlash, drawTrapezeSnap } from "./trapeze-receipts.js";
import {
  type Point,
  trapezeColumnPx,
  trapezeFlagPoints,
  trapezePivot,
  trapezeSpindleAt,
  trapezeSpindlePath,
  trapezeSpindleTall,
  trapezeTip,
} from "./trapeze-shape.js";
import { trapezeStopper } from "./trapeze-stop.js";
import { drawTrapezeMarkFeedback } from "./trapeze-verdicts.js";
import { showsTrapezeHand } from "./view-role-clocks-c.js";

/** How far above its place the whole fixture starts as it swings in, in tiles. */
const ARRIVE = 3;
/** Each seat, and its index into the state's per-seat pairs. */
const SEATS = [
  { seat: 1, side: 0 },
  { seat: 2, side: 1 },
] as const;

/**
 * **THE TRAPEZE**: a canvas pennant on a steel boom hanging from a turned
 * spindle over the middle column, swinging across the middle three columns
 * on its own, tapped still by one seat and caught by the other's swipe, and
 * then the spindle shot in the colour it lights (§11.56,
 * `bosses-choreographed.md` §39).
 *
 * **Both screens are drawn the same body.** The boom, the flag and the
 * spindle are on both, because the tap is timed off the flag and the swipe
 * aimed at it; only the marks differ, the freeze ring full for the step's
 * freezer and the track for the seat that draws (`showsTrapezeHand`).
 *
 * **The flag is drawn where `fx` has eased it to** (`trapeze-fx.ts`), told
 * here each frame where the simulation's place is, so a freeze landing mid-
 * beat slows the flag to a stop and never snaps it; how fast it is going is
 * what streams it out. **Its health is read off the body** — no bar: the
 * canvas brightens with each catch, and the spindle loses a stud and a
 * little of its girth to every shot. What outlives a frame besides — the
 * receipts' snap, crack, light and flash, and the blow the trapeze takes — is
 * `fx` too, told the shot's colour here.
 */
export function drawTrapeze(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: TrapezeState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: TrapezeFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  fx.flag.aim(trapezeAsked(s, cfg, beatPhase));
  const tip = trapezeTip(l, cfg, fx.flag.swing);
  const pivot = trapezePivot(l, cfg);
  const lay = trapezeLay(fx, trapezeColumnPx(l, cfg), time);
  const flagPts = trapezeFlagPoints(l, tip, lay);
  const off = {
    x: fx.hurt.shakeX(time, l.tile),
    y: -(1 - trapezeArrived(s, cfg, beat, beatPhase)) * ARRIVE * l.tile,
  };
  stops?.aim(trapezeStopper(l, world, s, time, tip, flagPts, off));

  ctx.save();
  ctx.globalAlpha = 1 - 0.5 * trapezeSpent(s, cfg, beat, beatPhase);
  ctx.translate(off.x, off.y);
  if (trapezeCatching(s)) drawHands(ctx, l, world, s, beat, beatPhase);
  const snap = fx.snap;
  drawTrapezeSnap(ctx, l, trapezeTip(l, cfg, (snap.col - midCol(cfg)) * 1000), snap.now);

  const boom = new Path2D();
  boom.moveTo(pivot.x, pivot.y);
  boom.lineTo(tip.x, tip.y);
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline * 2.6;
  ctx.strokeStyle = PALETTE.trapezeSteelDark;
  ctx.stroke(boom);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.trapezeSteel;
  ctx.stroke(boom);

  const flag = splinePath(flagPts, true);
  ctx.fillStyle = mixHex(PALETTE.trapezeCanvas, PALETTE.trapezeCanvasCaught, trapezeCaught(s));
  ctx.fill(flag);
  ctx.save();
  ctx.clip(flag);
  litRound(ctx, tip.x - 0.3 * l.tile, tip.y, 1.1 * l.tile, LIGHT_HALF.creature);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.trapezeCanvasDark, 0.95);
  ctx.stroke(flag);
  drawHurt(ctx, flag, fx.hurt.value);
  drawTrapezeCrack(ctx, l, tip, lay.angle, fx.taut);
  drawKnob(ctx, l, tip, 0.1);

  drawSpindle(ctx, l, world, s, beat, beatPhase, time, fx);
  drawKnob(ctx, l, pivot, 0.13);
  const fade = 1 - trapezeSpent(s, cfg, beat, beatPhase);
  drawTrapezeMarkFeedback(ctx, l, cfg, s, time, fade, fx.verdicts);
  ctx.restore();
}

/**
 * The freeze ring over the lit column and the draw's track toward it, each
 * full if a seat whose hand it is looks at this screen.
 */
function drawHands(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: TrapezeState,
  beat: number,
  beatPhase: number,
): void {
  const step = trapezeLitStep(s);
  if (step === null) return;
  const cfg = world.cfg;
  const marks = trapezeMarks(l, cfg, step);
  const freezer = SEATS.some((k) => trapezeFreezes(s, k.side) && showsTrapezeHand(l.role, k.seat));
  const aimers = SEATS.filter((k) => trapezeAims(s, k.side) && showsTrapezeHand(l.role, k.seat));
  const left = trapezeLeft(s, beat, beatPhase);
  drawTrapezeRing(ctx, marks.ring, left, trapezeFrozen(s), freezer, beatPhase);
  const drawn = Math.max(
    0,
    ...aimers.map((k) =>
      s.holding[k.side] ? Math.min(1, s.drawnBeats[k.side] / Math.max(1, cfg.trapezeDrawBeats)) : 0,
    ),
  );
  drawTrapezeTrack(ctx, l, marks.from, marks.to, drawn, aimers.length > 0);
}

/** REVERB on end over the middle column, its studs, its glow while lit, and its receipts. */
function drawSpindle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: TrapezeState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: TrapezeFx,
): void {
  const at = trapezeSpindleAt(l, world.cfg);
  const step = trapezeLitStep(s);
  const glow = trapezeSpindleGlow(s);
  const hurt = coreHurt(s.hits);
  const lit =
    step?.ask === "fire" && s.spindleLit
      ? { color: step.color, left: trapezeLeft(s, beat, beatPhase) }
      : null;
  if (step?.ask === "fire") fx.tell(stepColour(step.color).rim);
  ctx.save();
  ctx.translate(at.x, at.y);
  const body = trapezeSpindlePath(l, time, hurt.size);
  ctx.fillStyle = PALETTE.trapezeSteel;
  ctx.fill(body);
  ctx.save();
  ctx.clip(body);
  litRound(ctx, -0.12 * l.tile, -0.3 * l.tile, 0.8 * l.tile, LIGHT_HALF.creature);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.trapezeSteelDark, 0.95);
  ctx.stroke(body);
  if (lit !== null) strokeGlow(ctx, body, stepColour(lit.color).rim, STROKE.inner, hurt.bright);
  else if (glow > 0) strokeGlow(ctx, body, PALETTE.hullRim, STROKE.inner, 0.5 * glow);
  // Both catches in: the spindle lights with a flare that settles to its glow.
  if (fx.light > 0) strokeGlow(ctx, body, PALETTE.hullRim, STROKE.outline, fx.light);
  drawHurt(ctx, body, fx.hurt.value);
  const tall = trapezeSpindleTall(l);
  drawTrapezeStuds(ctx, l, tall, s.hits, glow, lit, beatPhase);
  drawTrapezeFlash(ctx, body, tall, fx.flash);
  ctx.restore();
}

/** A steel knob `r` tiles round: the boom's pin at the spindle's foot, the flag's at its tip. */
function drawKnob(ctx: CanvasRenderingContext2D, l: Layout, at: Point, r: number): void {
  const knob = new Path2D();
  knob.arc(at.x, at.y, r * l.tile, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.trapezeSteel;
  ctx.fill(knob);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.trapezeSteelDark;
  ctx.stroke(knob);
}
