import { LIGHT_HALF } from "@neon-spore/content";
import {
  type BurgeeState,
  burgeeAims,
  burgeeCatching,
  burgeeFreezes,
  burgeeFrozen,
  burgeeLitStep,
  type World,
} from "@neon-spore/sim";
import type { BurgeeFx } from "./burgee-fx.js";
import { drawBurgeeRing, drawBurgeeStuds, drawBurgeeTrack } from "./burgee-marks.js";
import {
  burgeeArrived,
  burgeeAsked,
  burgeeCaught,
  burgeeLay,
  burgeeLeft,
  burgeeSpent,
  burgeeSpindleGlow,
} from "./burgee-pose.js";
import {
  burgeeColumnPx,
  burgeeFlagPath,
  burgeePivot,
  burgeeSpindleAt,
  burgeeSpindlePath,
  burgeeSpindleTall,
  burgeeTip,
  type Point,
} from "./burgee-shape.js";
import { coreHurt } from "./core-hurt.js";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";
import { showsBurgeeHand } from "./view-role-clocks-c.js";

/** How far below the boom's tip the draw's track runs, in tiles: under a flag hanging limp. */
const TRACK_BELOW = 1.75;
/** How far above its place the whole fixture starts as it swings in, in tiles. */
const ARRIVE = 3;
/** Each seat, and its index into the state's per-seat pairs. */
const SEATS = [
  { seat: 1, side: 0 },
  { seat: 2, side: 1 },
] as const;

/**
 * **THE BURGEE**: a canvas pennant on a steel boom hanging from a turned
 * spindle over the middle column, swinging across the middle three columns
 * on its own, tapped still by one seat and caught by the other's swipe, and
 * then the spindle shot in the colour it lights (§11.56,
 * `bosses-choreographed.md` §39).
 *
 * **Both screens are drawn the same body.** The boom, the flag and the
 * spindle are on both, because the tap is timed off the flag and the swipe
 * aimed at it; only the marks differ, the freeze ring full for the step's
 * freezer and the track for the seat that draws (`showsBurgeeHand`).
 *
 * **The flag is drawn where `fx` has eased it to** (`burgee-fx.ts`), told
 * here each frame where the simulation's place is, so a freeze landing mid-
 * beat slows the flag to a stop and never snaps it; how fast it is going is
 * what streams it out. **Its health is read off the body** — no bar: the
 * canvas brightens with each catch, and the spindle loses a stud and a
 * little of its girth to every shot.
 */
export function drawBurgee(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BurgeeState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: BurgeeFx,
): void {
  const cfg = world.cfg;
  fx.aim(burgeeAsked(s, cfg, beatPhase));
  const tip = burgeeTip(l, cfg, fx.swing);
  const pivot = burgeePivot(l, cfg);

  ctx.save();
  ctx.globalAlpha = 1 - 0.5 * burgeeSpent(s, cfg, beat, beatPhase);
  ctx.translate(0, -(1 - burgeeArrived(s, cfg, beat, beatPhase)) * ARRIVE * l.tile);
  if (burgeeCatching(s)) drawHands(ctx, l, world, s, beat, beatPhase, pivot);

  const boom = new Path2D();
  boom.moveTo(pivot.x, pivot.y);
  boom.lineTo(tip.x, tip.y);
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline * 2.6;
  ctx.strokeStyle = PALETTE.burgeeSteelDark;
  ctx.stroke(boom);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.burgeeSteel;
  ctx.stroke(boom);

  const flag = burgeeFlagPath(l, tip, burgeeLay(fx, burgeeColumnPx(l, cfg), time));
  ctx.fillStyle = mixHex(PALETTE.burgeeCanvas, PALETTE.burgeeCanvasCaught, burgeeCaught(s));
  ctx.fill(flag);
  ctx.save();
  ctx.clip(flag);
  litRound(ctx, tip.x - 0.3 * l.tile, tip.y, 1.1 * l.tile, LIGHT_HALF.creature);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.burgeeCanvasDark, 0.95);
  ctx.stroke(flag);
  drawKnob(ctx, l, tip, 0.1);

  drawSpindle(ctx, l, world, s, beat, beatPhase, time);
  drawKnob(ctx, l, pivot, 0.13);
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
  s: BurgeeState,
  beat: number,
  beatPhase: number,
  pivot: Point,
): void {
  const step = burgeeLitStep(s);
  if (step === null) return;
  const cfg = world.cfg;
  const mark = burgeeTip(l, cfg, step.offset * 1000);
  const freezer = SEATS.some((k) => burgeeFreezes(s, k.side) && showsBurgeeHand(l.role, k.seat));
  const aimers = SEATS.filter((k) => burgeeAims(s, k.side) && showsBurgeeHand(l.role, k.seat));
  const left = burgeeLeft(s, beat, beatPhase);
  drawBurgeeRing(ctx, l, mark, left, burgeeFrozen(s), freezer, beatPhase);
  const y = mark.y + TRACK_BELOW * l.tile;
  const drawn = Math.max(
    0,
    ...aimers.map((k) =>
      s.holding[k.side] ? Math.min(1, s.drawnBeats[k.side] / Math.max(1, cfg.burgeeDrawBeats)) : 0,
    ),
  );
  const to = { x: mark.x, y };
  drawBurgeeTrack(ctx, l, { x: pivot.x, y }, to, drawn, aimers.length > 0);
}

/** REVERB on end over the middle column, its studs, and its glow while lit. */
function drawSpindle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BurgeeState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const at = burgeeSpindleAt(l, world.cfg);
  const step = burgeeLitStep(s);
  const glow = burgeeSpindleGlow(s);
  const hurt = coreHurt(s.hits);
  const lit =
    step?.ask === "fire" && s.spindleLit
      ? { color: step.color, left: burgeeLeft(s, beat, beatPhase) }
      : null;
  ctx.save();
  ctx.translate(at.x, at.y);
  const body = burgeeSpindlePath(l, time, hurt.size);
  ctx.fillStyle = PALETTE.burgeeSteel;
  ctx.fill(body);
  ctx.save();
  ctx.clip(body);
  litRound(ctx, -0.12 * l.tile, -0.3 * l.tile, 0.8 * l.tile, LIGHT_HALF.creature);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.burgeeSteelDark, 0.95);
  ctx.stroke(body);
  if (lit !== null) strokeGlow(ctx, body, stepColour(lit.color).rim, STROKE.inner, hurt.bright);
  else if (glow > 0) strokeGlow(ctx, body, PALETTE.hullRim, STROKE.inner, 0.5 * glow);
  drawBurgeeStuds(ctx, l, burgeeSpindleTall(l), s.hits, glow, lit, beatPhase);
  ctx.restore();
}

/** A steel knob `r` tiles round: the boom's pin at the spindle's foot, the flag's at its tip. */
function drawKnob(ctx: CanvasRenderingContext2D, l: Layout, at: Point, r: number): void {
  const knob = new Path2D();
  knob.arc(at.x, at.y, r * l.tile, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.burgeeSteel;
  ctx.fill(knob);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.burgeeSteelDark;
  ctx.stroke(knob);
}
