import { type GaugeState, type SimConfig, ticksPerBeat } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import type { Dial } from "./gauge.js";
import { aimAt, type ClawPose, clawAtRest, clawHand } from "./gauge-claw.js";
import { drawPodBody, POD_REACH } from "./gauge-pod.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * What a call looks like: the claw goes out along its own line, closes, and
 * comes back — **holding the pod, or holding nothing**. The owner, 20
 * September 2026: *a very clear visual whether the claw was successful to
 * catch the pod or whether it was not within the open area.*
 *
 * The two answers are two pictures, not one with its colour swapped. A catch
 * is a body: a pod stands where the claw was called, the hand shuts around it
 * with a green ring, carries it home and the ship swallows it with a green
 * glow at the crown. A miss is an absence: the hand shuts on the empty dark
 * with a puff of grey, and comes back closed and rattling — the valve it hangs
 * on has just jammed (`gauge-hand.ts`), and the rattle is that, on the one
 * thing the pilot is looking at.
 *
 * **Both screens, the pod too.** The pilot never sees the band, but the pod in
 * the hand is where *he* stopped, which he already knows; what it tells him is
 * the one thing he could not otherwise learn — that his stop was right. The
 * navigator's own pod has already moved by then (a mark spends its band,
 * `sim/gauge.ts`), so on her screen the new one swells in where it stands
 * while the old one is on its way home.
 *
 * Read off the state alone — `calledTick`, `calledMilli`, `calledGood` — and
 * the tick, so nothing is kept between frames and a restart cannot carry a
 * hand halfway out into the next run. It is all over inside
 * `gaugeCallRestBeats` (two), so the claw is home and open before the next
 * call can be made.
 */

/** Beats after the call: the fingers reach the pod, then shut on it. */
const OUT = 0.35;
const SHUT = 0.5;
/** The hand is home, and then open again with the pod swallowed. */
const BACK = 1.3;
const DONE = 1.8;
/** How far the arm swings either way while it rattles, in thousandths. */
const RATTLE = 14;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
/** How far `age` is from `from` to `to`, eased, 0 before and 1 after. */
const between = (age: number, from: number, to: number): number =>
  smoothstep((age - from) / (to - from));

/**
 * Beats since the last call, or infinity when there has not been one. Counted
 * from the call's tick and not its beat: a call made late in a beat has the
 * whole of its reach still to go.
 */
export function callAge(cfg: SimConfig, gauge: GaugeState, tick: number): number {
  if (gauge.calledMilli < 0) return Number.POSITIVE_INFINITY;
  const age = (tick - gauge.calledTick) / ticksPerBeat(cfg);
  return age < 0 ? Number.POSITIVE_INFINITY : age;
}

/** How far out either finger stands around a pod it is holding. */
function heldOut(dial: Dial): number {
  return clawHand(dial).half * 1.9;
}

/** The pod in the hand, as wide as a hand shut on it holds rather than as its
 * band was: what it says is *caught*, and a hand is one size. */
function heldPod(dial: Dial): number {
  return clawHand(dial).half * 1.5;
}

/** Where the claw is `age` beats after a call, and how its hand stands. */
export function clawPose(dial: Dial, gauge: GaugeState, age: number): ClawPose {
  const rest = clawAtRest(dial, gauge.needleMilli);
  if (age >= DONE) return rest;
  const { rise, half, reach } = clawHand(dial);
  const grab = dial.r * POD_REACH - reach * 0.5;
  const home = between(age, SHUT, BACK);
  const length = rise + (grab - rise) * between(age, 0, OUT) * (1 - home);
  const wide = Math.max(rest.out, heldOut(dial) * 1.4);
  const closed = gauge.calledGood ? heldOut(dial) : half * 0.4;
  const shut = wide + (closed - wide) * between(age, OUT, SHUT);
  const out = shut + (rest.out - shut) * between(age, BACK, DONE);
  // The needle is free again after a catch and he may already be turning it;
  // the arm comes home onto where it points now, not where it was called.
  let aimMilli = gauge.calledMilli + (gauge.needleMilli - gauge.calledMilli) * home;
  if (!gauge.calledGood && age > SHUT && age < BACK) {
    aimMilli += Math.sin(age * 40) * RATTLE * (1 - (age - SHUT) / (BACK - SHUT));
  }
  return { aimMilli, length, out };
}

/** How much of the dotted line is showing: none while the arm is out along it. */
export function gaugeLineShown(age: number): number {
  return between(age, BACK, DONE);
}

/** How far into being the navigator's pod is: a catch spent the old one. */
export function gaugePodGrown(gauge: GaugeState, age: number): number {
  return gauge.calledGood ? between(age, BACK, DONE) : 1;
}

/**
 * Everything a call puts on screen besides the claw itself, drawn under it so
 * the fingers close *over* what they hold: the pod on its way home and the
 * ring it was caught with, or the grey puff of a hand that shut on nothing.
 */
export function drawGaugeCatch(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  gauge: GaugeState,
  age: number,
): void {
  if (age >= DONE) return;
  const pose = clawPose(dial, gauge, age);
  const { rise, reach } = clawHand(dial);
  ctx.save();
  aimAt(ctx, dial, pose.aimMilli);
  if (gauge.calledGood) drawCaught(ctx, dial, pose, age, rise, reach);
  else drawEmpty(ctx, pose, age, reach);
  ctx.restore();
}

function drawCaught(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  pose: ClawPose,
  age: number,
  rise: number,
  reach: number,
): void {
  const w = heldPod(dial);
  // Waiting where it was called until the hand arrives, then in the hand, then
  // down through the crown into the ship, smaller as it goes.
  const inHand = age < OUT ? dial.r * POD_REACH : pose.length + reach * 0.5;
  const sink = between(age, BACK, DONE);
  const at = inHand * (1 - sink);
  if (age < SHUT + 0.5) {
    const t = clamp01((age - SHUT) / 0.5);
    ctx.strokeStyle = rgba(PALETTE.good, age < SHUT ? 0 : 1 - t);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -at, w * (1.3 + 1.2 * t), 0, Math.PI * 2);
    ctx.stroke();
  }
  if (sink > 0) {
    halo(ctx, 0, 0, rise * 1.6, PALETTE.good, 0.55 * Math.sin(Math.PI * sink));
  }
  ctx.translate(0, -at);
  ctx.scale(1 - sink, 1 - sink);
  if (sink < 1) drawPodBody(ctx, w, 1);
}

function drawEmpty(
  ctx: CanvasRenderingContext2D,
  pose: ClawPose,
  age: number,
  reach: number,
): void {
  if (age < SHUT || age > SHUT + 0.6) return;
  const t = (age - SHUT) / 0.6;
  const y = -(pose.length + reach * 0.7);
  ctx.fillStyle = rgba(PALETTE.sparkDim, 1 - t);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.4;
    const d = reach * (0.3 + 0.9 * t);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, y + Math.sin(a) * d, 2.4 * (1 - t) + 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}
