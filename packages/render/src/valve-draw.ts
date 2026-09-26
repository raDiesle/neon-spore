import { LIGHT_HALF } from "@neon-spore/content";
import { VALVE_PINS, type ValveState, valveLeaking, type World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawValveMark, drawValveSocket } from "./valve-marks.js";
import {
  pulled,
  valveArrived,
  valveList,
  valveLit,
  valveOpen,
  valvePinOut,
  valvePinReach,
} from "./valve-pose.js";
import {
  type Point,
  valveCentre,
  valveFacePath,
  valveHolePath,
  valveLift,
  valvePinPath,
  valvePointerPath,
  valveReach,
  valveRimPath,
  valveSparkPoint,
  valveSpokesPath,
  valveWheel,
  valveWheelPath,
} from "./valve-shape.js";
import { drawValveStory, valveShake } from "./valve-story.js";

/**
 * **THE VALVE**: a squat iron drum standing over the middle of the field,
 * one wheel in its face, a pin socket beside it and three pins hung under it
 * (§11.42, `bosses-choreographed.md` §25).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: the wheel
 * is the pilot's and the tap the navigator's, but each has to watch the
 * other's half to time their own — the freeze is one thumb stopping what the
 * other is moving.
 *
 * **Iron grey throughout**, the mark and the socket plain white, and nothing
 * colour-gated. **Its health is the pins**, and the list is how it shows: the
 * drum tilts a step further for each one out (`valve-pose.ts`), and a spent
 * pin is a dark slot in the underside.
 */
export function drawValve(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ValveState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const arrived = valveArrived(s, cfg, beat, beatPhase);
  const home = valveCentre(l, cfg);
  const c = { x: home.x, y: home.y - valveLift(l, arrived) };
  const open = valveOpen(s, cfg, beat, beatPhase);
  const shake = valveShake(l, s, cfg, beat, beatPhase);

  ctx.save();
  ctx.globalAlpha = (0.2 + 0.8 * arrived) * (1 - 0.5 * open);
  ctx.translate(c.x + shake.x, c.y + shake.y);
  ctx.rotate(valveList(s, cfg, beat, beatPhase));
  for (let i = 0; i < VALVE_PINS; i++) drawPin(ctx, l, world, s, i, beat, beatPhase);
  if (open <= 0) drawDrum(ctx, l, world, s, beat, beatPhase, time);
  else {
    for (const side of [-1, 1] as const) {
      ctx.save();
      ctx.translate(side * open * 0.8 * l.tile, open * 0.4 * l.tile);
      ctx.rotate(side * open * 0.4);
      const half = new Path2D();
      const w = valveReach(l).rx * 1.5;
      half.rect(side < 0 ? -w : 0, -w, w, w * 2);
      ctx.clip(half);
      drawDrum(ctx, l, world, s, beat, beatPhase, time);
      ctx.restore();
    }
  }
  ctx.restore();
  if (valveLeaking(s)) drawSpark(ctx, l, world, s, c, beat, beatPhase);
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
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.4);
  ctx.stroke(valveFacePath(l));
  for (let i = 0; i < pulled(s); i++) {
    ctx.fillStyle = rgba(PALETTE.rockDark, 1);
    ctx.fill(valveHolePath(l, i, VALVE_PINS));
  }
  drawWheel(ctx, l, s);
  drawValveMark(ctx, l, world, s, valveLit(s));
  drawValveSocket(ctx, l, world, s, beat, beatPhase);
  drawValveStory(ctx, l, s, world.cfg, beat, beatPhase);
}

/**
 * The wheel, drawn at the bearing it stands at this frame: dark while the
 * drum settles, lit iron once a mark lights, its white pointer saying where
 * it is — and glowing steady while frozen, the stillness made visible.
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
  ctx.strokeStyle = rgba(PALETTE.rock, 0.25 + 0.5 * lit);
  ctx.stroke(valveSpokesPath(l, s.wheelMilli));
  const hub = new Path2D();
  hub.arc(at.x, at.y, r * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.rock, 0.4 + 0.5 * lit);
  ctx.fill(hub);
  const pointer = valvePointerPath(l, s.wheelMilli);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.3 + 0.6 * lit);
  ctx.stroke(pointer);
  if (s.phase === "frozen") strokeGlow(ctx, pointer, PALETTE.hullRim, STROKE.outline, 1);
}

/**
 * Pin `i`: hung under the drum while it is in, reaching and edged in white
 * while it is the one to pull, sliding down and fading as it comes free,
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
): void {
  const out = valvePinOut(s, world.cfg, i, beat, beatPhase);
  if (out > 1) return;
  const going = Math.max(0, out);
  const plate = valvePinPath(l, i, VALVE_PINS, valvePinReach(s, i, beatPhase), going);
  ctx.save();
  ctx.globalAlpha *= 1 - going;
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(plate);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.8);
  ctx.stroke(plate);
  if (s.phase === "frozen" && i === pulled(s))
    strokeGlow(ctx, plate, PALETTE.hullRim, STROKE.inner, 1);
  ctx.restore();
}

/** The spark the first pin leaks (row 5): an ember falling from under the drum down its column. */
function drawSpark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ValveState,
  at: Point,
  beat: number,
  beatPhase: number,
): void {
  const along = smoothstep(
    (beat - s.sparkBeat + beatPhase) / Math.max(1, world.cfg.valveSparkBeats),
  );
  const { x, y } = valveSparkPoint(l, at, s.sparkCol, along);
  const bead = new Path2D();
  bead.ellipse(x, y, l.tile * 0.16, l.tile * 0.24, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.ember, 0.55 + 0.4 * along);
  ctx.fill(bead);
  strokeGlow(ctx, bead, PALETTE.emberRim, STROKE.inner, 1 + along);
}
