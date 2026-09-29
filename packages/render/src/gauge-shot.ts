import { type GaugeState, gaugeWoundOpen, type SimConfig, ticksPerBeat } from "@neon-spore/sim";
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
 * The bolt flies for `gaugeShotTicks`, and the call is judged **where it
 * lands**, not where it left (`sim/gauge-call.ts`; the owner, 29 September
 * 2026: *first shot must reach the coloured area, and then destroyed if
 * correct colour*). So nothing here knows the answer until the bolt is at the
 * rim — `calledGood` is only true once it has landed.
 *
 * A hit is a burst: the wound spits its own colour, a green ring goes out from
 * it, the alien's arms throw out, and the wound caves in and is gone. The rim
 * stands bare for `gaugeRegrowBeats`, and the next one tears open elsewhere
 * from the beat the simulation opened it on (`woundBeat`). A miss is a clang:
 * the bolt flattens on a plate, grey sparks come back off it, and the cannon
 * rattles — the valve it turns on has just jammed (`gauge-hand.ts`).
 *
 * **Both screens.** The pilot never sees the wound, but the burst is where
 * *he* stopped, and what it tells him is the one thing he could not
 * otherwise learn — that his stop was right.
 *
 * Read off the state alone and the clock, so nothing is kept between frames
 * and a restart cannot carry a bolt into the next run.
 */

/** Beats the cannon kicks back for when it fires. */
const KICK = 0.3;
/** Beats after landing the answer — burst or clang — stands on the rim. */
const ANSWER = 1.2;
/** Beats after landing a miss rattles the cannon for. */
const RATTLE_FOR = 0.9;
/** Beats after landing a shot-out wound takes to cave in. */
const CAVE = 0.5;
/** Beats a fresh wound takes to tear open. */
const TEAR = 0.6;
/** How far the barrel swings either way while it rattles, in thousandths. */
const RATTLE = 14;

const between = (age: number, from: number, to: number): number =>
  smoothstep((age - from) / (to - from));

/** Every clock the shot's picture is drawn at, read once per frame. */
export interface ShotClock {
  /** Beats since the last call, or infinity when there has not been one. */
  age: number;
  /** Beats the bolt is in the air for. */
  fly: number;
  /** Whether the bolt is still on its way. */
  flying: boolean;
  /** Beats since the bolt landed, or infinity while none has. */
  landed: number;
  /** Beats since the wound now on the rim opened. */
  sinceWound: number;
}

/**
 * The shot's clocks. The call's age is counted from its tick, not its beat —
 * a call made late in a beat has the whole of its flight still to go — and
 * the wound's from the beat it opened, plus how far into this one we are.
 */
export function shotClock(
  cfg: SimConfig,
  gauge: GaugeState,
  tick: number,
  beat: number,
  beatPhase: number,
): ShotClock {
  const fly = cfg.gaugeShotTicks / ticksPerBeat(cfg);
  const raw = (tick - gauge.calledTick) / ticksPerBeat(cfg);
  const age = gauge.calledMilli < 0 || raw < 0 ? Number.POSITIVE_INFINITY : raw;
  const flying = gauge.shotTick !== -1;
  const landed = flying ? Number.POSITIVE_INFINITY : Math.max(0, age - fly);
  return { age, fly, flying, landed, sinceWound: beat - gauge.woundBeat + beatPhase };
}

/** Whether a shot is still in the air, or its answer still on the rim. */
export function gaugeShotOut(c: ShotClock): boolean {
  return c.flying || c.landed < ANSWER;
}

/** Where the cannon points, and how far it has kicked. */
export function cannonPose(gauge: GaugeState, c: ShotClock): CannonPose {
  const recoil = c.age < KICK ? 1 - c.age / KICK : 0;
  let aimMilli = gauge.needleMilli;
  if (!gauge.calledGood && c.landed < RATTLE_FOR) {
    aimMilli += Math.sin(c.landed * 40) * RATTLE * (1 - c.landed / RATTLE_FOR);
  }
  return { aimMilli, recoil };
}

/** How much of the aim line is showing: faded while the bolt is on it. */
export function gaugeAimShown(c: ShotClock): number {
  return c.flying ? 0.35 : 0.35 + 0.65 * between(c.landed, 0, 0.4);
}

/**
 * How far the navigator's wound is open, 0..1: tearing open from the beat it
 * opened on, and caving in once a hit has shot it out.
 */
export function gaugeWoundGrown(gauge: GaugeState, c: ShotClock): number {
  if (!gaugeWoundOpen(gauge)) return 1 - between(c.landed, 0, CAVE);
  return between(c.sinceWound, 0, TEAR);
}

/** How hard the alien is recoiling from a hit, 0..1. */
export function gaugeFlinch(gauge: GaugeState, c: ShotClock): number {
  if (!gauge.calledGood || c.landed > 0.8) return 0;
  return Math.sin((c.landed / 0.8) * Math.PI);
}

/** How much of the hit's scar is left, 1 at the hit and 0 once healed. */
export function gaugeScarLeft(gauge: GaugeState, c: ShotClock): number {
  return gauge.calledGood ? 1 - between(c.landed, 0, ANSWER) : 0;
}

/**
 * The bolt in flight, and the answer on the rim. Drawn over the cannon's line
 * and under the cannon itself.
 */
export function drawGaugeShot(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  gauge: GaugeState,
  c: ShotClock,
): void {
  if (!gaugeShotOut(c)) return;
  const look = loadedLook(gaugeShotLoad(gauge));
  if (c.flying) {
    const land = rimPoint(dial, gauge.calledMilli);
    const far = Math.hypot(land.x - dial.cx, land.y - dial.cy);
    const from = muzzleReach(dial);
    const at = from + (far - from) * Math.min(1, c.age / c.fly);
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
  const t = c.landed / ANSWER;
  if (gauge.calledGood) drawBurst(ctx, dial, gauge, rimPoint(dial, gauge.calledMilli), t, look.hex);
  else drawClang(ctx, dial, gauge, rimPoint(dial, gauge.calledMilli, -dial.r * 0.07), t);
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
