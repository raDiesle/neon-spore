import { type GaugeState, type SimConfig, ticksPerBeat } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import type { Dial } from "./gauge.js";
import { rimPoint } from "./gauge-alien.js";
import { aimAt, type CannonPose, muzzleReach } from "./gauge-cannon.js";
import { gaugeShotLoad, loadedLook } from "./gauge-load.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * What a call looks like: the cannon fires, the bolt crosses the mouth, and
 * it lands **in the wound or on the armour**. The owner, 20 September 2026,
 * about the claw this replaced: *a very clear visual whether the claw was
 * successful … or whether it was not within the open area* — and the two
 * answers are still two pictures, not one with its colour swapped.
 *
 * A hit is a burst: the bolt goes into the flesh, the wound spits its own
 * colour, a green ring goes out from it, the alien's arms throw out, and the
 * wound closes to a scar while a fresh one tears open elsewhere in the next
 * colour (a mark spends its band, `sim/gauge.ts`). A miss is a clang: the bolt
 * flattens on a plate, grey sparks come back off it, and the cannon rattles —
 * the valve it turns on has just jammed (`gauge-hand.ts`), and the rattle is
 * that, on the one thing the pilot is looking at.
 *
 * **Both screens.** The pilot never sees the wound, but the burst is where
 * *he* stopped, and what it tells him is the one thing he could not
 * otherwise learn — that his stop was right.
 *
 * Read off the state alone — `calledTick`, `calledMilli`, `calledGood` — and
 * the tick, so nothing is kept between frames and a restart cannot carry a
 * bolt into the next run. It is all over inside `gaugeCallRestBeats` (two).
 */

/** Beats after the call: the bolt is at the rim. */
const FLY = 0.3;
/** The miss rattles until here; the fresh wound starts to open here. */
const BACK = 1.2;
const DONE = 1.8;
/** How far the barrel swings either way while it rattles, in thousandths. */
const RATTLE = 14;

const between = (age: number, from: number, to: number): number =>
  smoothstep((age - from) / (to - from));

/**
 * Beats since the last call, or infinity when there has not been one. Counted
 * from the call's tick and not its beat: a call made late in a beat has the
 * whole of its flight still to go.
 */
export function callAge(cfg: SimConfig, gauge: GaugeState, tick: number): number {
  if (gauge.calledMilli < 0) return Number.POSITIVE_INFINITY;
  const age = (tick - gauge.calledTick) / ticksPerBeat(cfg);
  return age < 0 ? Number.POSITIVE_INFINITY : age;
}

/** Whether a shot is still in the air, or its answer still on the rim. */
export function gaugeShotOut(cfg: SimConfig, gauge: GaugeState, tick: number): boolean {
  return callAge(cfg, gauge, tick) < DONE;
}

/** Where the cannon points `age` beats after a call, and how far it has kicked. */
export function cannonPose(gauge: GaugeState, age: number): CannonPose {
  if (age >= DONE) return { aimMilli: gauge.needleMilli, recoil: 0 };
  const recoil = age < FLY ? 1 - age / FLY : 0;
  let aimMilli = gauge.needleMilli;
  if (!gauge.calledGood && age > FLY && age < BACK) {
    aimMilli += Math.sin(age * 40) * RATTLE * (1 - (age - FLY) / (BACK - FLY));
  }
  return { aimMilli, recoil };
}

/** How much of the aim line is showing: faded while the bolt is on it. */
export function gaugeAimShown(age: number): number {
  return age < FLY ? 0.35 : 0.35 + 0.65 * between(age, FLY, FLY + 0.4);
}

/** How far the navigator's wound has torn open: a hit spent the old one. */
export function gaugeWoundGrown(gauge: GaugeState, age: number): number {
  return gauge.calledGood ? between(age, BACK, DONE) : 1;
}

/** How hard the alien is recoiling from a hit, 0..1. */
export function gaugeFlinch(gauge: GaugeState, age: number): number {
  if (!gauge.calledGood || age < FLY || age > FLY + 0.8) return 0;
  return Math.sin(((age - FLY) / 0.8) * Math.PI);
}

/** How much of the old wound's scar is left, 1 at the hit and 0 once healed. */
export function gaugeScarLeft(gauge: GaugeState, age: number): number {
  return gauge.calledGood && age >= FLY ? 1 - between(age, FLY, DONE) : 0;
}

/**
 * The bolt in flight, and the answer on the rim. Drawn over the cannon's line
 * and under the cannon itself.
 */
export function drawGaugeShot(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  gauge: GaugeState,
  age: number,
): void {
  if (age >= DONE) return;
  const look = loadedLook(gaugeShotLoad(gauge));
  const land = rimPoint(dial, gauge.calledMilli, gauge.calledGood ? 0 : -dial.r * 0.07);
  const far = Math.hypot(land.x - dial.cx, land.y - dial.cy);
  if (age < FLY) {
    const from = muzzleReach(dial);
    const at = from + (far - from) * (age / FLY);
    ctx.save();
    aimAt(ctx, dial, gauge.calledMilli);
    halo(ctx, 0, -at, 16, look.hex, 0.9);
    ctx.strokeStyle = rgba(look.hex, 0.6);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -Math.max(from, at - 26));
    ctx.lineTo(0, -at);
    ctx.stroke();
    ctx.fillStyle = look.rim;
    ctx.beginPath();
    ctx.ellipse(0, -at, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const t = (age - FLY) / (DONE - FLY);
  if (gauge.calledGood) drawBurst(ctx, dial, gauge, land, t, look.hex);
  else drawClang(ctx, dial, gauge, land, t);
}

/** The hit: a flash, a green ring, and the wound spitting its colour back. */
function drawBurst(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  gauge: GaugeState,
  at: { x: number; y: number },
  t: number,
  hex: string,
): void {
  halo(ctx, at.x, at.y, 30 + 50 * t, hex, 0.9 * (1 - t));
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.good, 1 - t);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(at.x, at.y, 10 + 46 * t, 0, Math.PI * 2);
  ctx.stroke();
  // Droplets thrown back towards the cannon, fanned about the line it came in on.
  ctx.fillStyle = rgba(hex, 1 - t);
  for (let i = 0; i < 9; i++) {
    const m = gauge.calledMilli + (i - 4) * 9;
    const p = rimPoint(dial, m, -dial.r * (0.05 + 0.3 * t * (1 - Math.abs(i - 4) / 6)));
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.2 * (1 - t) + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** The miss: the bolt flat on a plate and grey sparks coming back off it. */
function drawClang(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  gauge: GaugeState,
  at: { x: number; y: number },
  t: number,
): void {
  if (t > 0.45) return;
  const k = t / 0.45;
  halo(ctx, at.x, at.y, 18, PALETTE.sparkDim, 0.7 * (1 - k));
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sparkDim, 1 - k);
  for (let i = 0; i < 7; i++) {
    const m = gauge.calledMilli + (i - 3) * 16 * (0.4 + k);
    const p = rimPoint(dial, m, -dial.r * (0.02 + 0.16 * k));
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.4 * (1 - k) + 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
