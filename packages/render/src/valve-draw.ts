import { LIGHT_HALF } from "@neon-spore/content";
import {
  VALVE_PINS,
  type ValveState,
  valveFrozen,
  valveLeaking,
  valveTurning,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPullArrow } from "./pull-knob.js";
import { PULL_DOWN } from "./pull-line.js";
import { drawValveFx, type ValveFx } from "./valve-fx.js";
import { drawValveMark, drawValveSocket } from "./valve-marks.js";
import {
  VALVE_PIN,
  valveHolePath,
  valvePinCentre,
  valvePinPath,
  valvePinTop,
} from "./valve-pins.js";
import {
  pulled,
  valveArrived,
  valveHalfSwing,
  valveList,
  valveLit,
  valveOpen,
  valvePinOut,
  valvePinReach,
  valveSocketGlow,
} from "./valve-pose.js";
import {
  valveFacePath,
  valvePointerHeadPath,
  valvePointerPath,
  valveReach,
  valveRimPath,
  valveSpokesPath,
  valveWheel,
  valveWheelPath,
} from "./valve-shape.js";
import { drawValveSpark, valveDrumAt } from "./valve-spark.js";
import { valveStopper } from "./valve-stop.js";
import { drawValveStory, valveShake } from "./valve-story.js";
import { drawValveHalos, drawValvePinHalo, drawValveVerdicts } from "./valve-verdicts.js";

/**
 * **THE VALVE**: a squat iron drum standing over the middle of the field,
 * one wheel in its face, a pin socket beside it and three pins hung under it
 * (§11.42, `bosses-choreographed.md` §25).
 *
 * **Both screens are drawn alike.** The wheel is the pilot's and the tap the
 * navigator's, but each has to watch the other's half to time their own —
 * the freeze is one thumb stopping what the other is moving; `l.role` decides
 * only whose mark wears the halo and whose the partner's clock
 * (`valve-verdicts.ts`).
 *
 * **Iron grey throughout**, the mark and the socket plain white, and nothing
 * colour-gated. **Its health is the pins**, and the list is how it shows: the
 * drum tilts a step further for each one out (`valve-pose.ts`), and a spent
 * pin is a dark slot in the underside. What outlives a frame — the clamp, a
 * pulled pin's slot, the kick, the blow a landed step deals — is `fx`. A
 * bolt stops on what it meets of the drum (`valve-stop.ts`), told to `stops`.
 */
export function drawValve(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ValveState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: ValveFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const arrived = valveArrived(s, cfg, beat, beatPhase);
  const c = valveDrumAt(l, cfg, s, beat, beatPhase);
  const open = valveOpen(s, cfg, beat, beatPhase);
  const shake = valveShake(l, s, cfg, beat, beatPhase, world);

  ctx.save();
  ctx.globalAlpha = (0.2 + 0.8 * arrived) * (1 - 0.5 * open);
  const frame = {
    x: c.x + shake.x + fx.hurt.shakeX(time, l.tile),
    y: c.y + shake.y,
    turn: valveList(s, cfg, beat, beatPhase) + fx.kick,
  };
  ctx.translate(frame.x, frame.y);
  ctx.rotate(frame.turn);
  drawValvePinHalo(ctx, l, s, beatPhase, time);
  for (let i = 0; i < VALVE_PINS; i++) drawPin(ctx, l, world, s, i, beat, beatPhase, time);
  if (open <= 0) drawDrum(ctx, l, world, s, beat, beatPhase, time, fx);
  else {
    for (const side of [-1, 1] as const) {
      ctx.save();
      const swing = valveHalfSwing(l, open, side);
      ctx.translate(swing.x, swing.y);
      ctx.rotate(swing.turn);
      const half = new Path2D();
      const w = valveReach(l).rx * 1.5;
      half.rect(side < 0 ? -w : 0, -w, w, w * 2);
      ctx.clip(half);
      drawDrum(ctx, l, world, s, beat, beatPhase, time, fx);
      ctx.restore();
    }
  }
  ctx.restore();
  if (valveLeaking(s)) drawValveSpark(ctx, l, world, s, beat, beatPhase);
  stops?.aim(valveStopper(l, world, s, frame, beat, beatPhase, time));
}

/** The drum itself: THE CODEX's notched rim in iron, the face, the spent pins' slots, the wheel and the marks on it. */
function drawDrum(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ValveState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: ValveFx,
): void {
  const rim = valveRimPath(l, s.wheelMilli, time * 0.4);
  const { rx } = valveReach(l);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(rim);
  ctx.save();
  ctx.clip(rim);
  litRound(ctx, 0, 0, rx, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.7));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.9);
  ctx.stroke(rim);
  drawHurt(ctx, rim, fx.hurt.value);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.4);
  ctx.stroke(valveFacePath(l));
  for (let i = 0; i < pulled(s); i++) {
    ctx.fillStyle = rgba(PALETTE.rockDark, 1);
    ctx.fill(valveHolePath(l, i, VALVE_PINS));
  }
  drawValveHalos(ctx, l, s, beatPhase, time);
  drawWheel(ctx, l, s);
  drawValveFx(ctx, l, fx);
  if (valveTurning(s) || valveFrozen(s)) drawValveMark(ctx, l, world, s);
  drawValveSocket(ctx, l, world, s, valveSocketGlow(s, beatPhase), beat, beatPhase);
  drawValveStory(ctx, l, s, world.cfg, beat, beatPhase, fx.rub);
  drawValveVerdicts(ctx, l, s, beatPhase, time, fx.marks.verdicts);
}

/**
 * The wheel, drawn at the bearing it stands at this frame: dark while the
 * drum settles, lit iron once a mark lights, its white pointer saying where
 * it is — and glowing steady while frozen, the stillness made visible. The
 * pointer is the one spoke of four that matters, so it is drawn apart from
 * the rest: white where they are grey, twice as thick, reaching the rim where
 * they stop short, and headed with an arrow that meets the mark's notch.
 */
function drawWheel(ctx: CanvasRenderingContext2D, l: Layout, s: ValveState): void {
  const lit = valveLit(s);
  const wheel = valveWheelPath(l, s.wheelMilli);
  const { at, r } = valveWheel(l);
  ctx.fillStyle = rgba(PALETTE.rockDark, 1);
  ctx.fill(wheel);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.3 + 0.65 * lit);
  ctx.stroke(wheel);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.2 + 0.35 * lit);
  ctx.stroke(valveSpokesPath(l, s.wheelMilli));
  const hub = new Path2D();
  hub.arc(at.x, at.y, r * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.rock, 0.4 + 0.5 * lit);
  ctx.fill(hub);
  const pointer = valvePointerPath(l, s.wheelMilli);
  const head = valvePointerHeadPath(l, s.wheelMilli);
  const white = rgba(PALETTE.hullRim, 0.5 + 0.5 * lit);
  ctx.lineWidth = STROKE.outline * 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = white;
  ctx.stroke(pointer);
  ctx.lineCap = "butt";
  ctx.fillStyle = white;
  ctx.fill(head);
  if (s.phase === "frozen") {
    strokeGlow(ctx, pointer, PALETTE.hullRim, STROKE.outline * 2, 1);
    strokeGlow(ctx, head, PALETTE.hullRim, STROKE.inner, 1);
  }
}

/**
 * Pin `i`: hung under the drum while it is in, reaching and edged in white
 * while it is the one to pull, with the shared pull arrow down its middle
 * (`pull-knob.ts`, 30 September 2026), sliding down and fading as it comes free,
 * and gone — a slot in the drum — after.
 */
function drawPin(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ValveState,
  i: number,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const out = valvePinOut(s, world.cfg, i, beat, beatPhase);
  if (out > 1) return;
  const going = Math.max(0, out);
  const plate = valvePinPath(l, i, VALVE_PINS, valvePinReach(s, i, beatPhase), going);
  ctx.save();
  const sway = VALVE_PIN.sway(i, going, time);
  if (sway !== 0) {
    const top = valvePinTop(l, i, VALVE_PINS, going);
    ctx.translate(top.x, top.y);
    ctx.rotate(sway);
    ctx.translate(-top.x, -top.y);
  }
  ctx.globalAlpha *= 1 - going;
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(plate);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.8);
  ctx.stroke(plate);
  if (s.phase === "frozen" && i === pulled(s)) {
    strokeGlow(ctx, plate, PALETTE.hullRim, STROKE.inner, 1);
    // Either thumb draws it out, so the way down is on both screens (`valve-hand.ts`).
    const pin = valvePinCentre(l, i, VALVE_PINS, valvePinReach(s, i, beatPhase));
    drawPullArrow(ctx, pin, pin.r * 0.8, PULL_DOWN, time, { alpha: 0.9 });
  }
  ctx.restore();
}
