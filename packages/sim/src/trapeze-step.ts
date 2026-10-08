import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { nextInt } from "./rng.js";
import {
  freshTrapeze,
  type TrapezeSide,
  type TrapezeState,
  type TrapezeStep,
  trapezeBoss,
  trapezeGongAt,
  trapezeLitStep,
  trapezePeriod,
  trapezeSeat,
} from "./trapeze.js";
import type { World } from "./world.js";

/**
 * THE TRAPEZE's clock: the swing moving every tick, dying down every beat,
 * turning at each end — where a gong is kicked and a side's chance to push
 * comes round — the calls of a `call` level, a lock running out, each level
 * lighting and running out, and the swing gone over the top.
 *
 * The swipes and the lock are heard on the tick (`trapeze-hand.ts`) and the
 * shots where a bolt meets the alien (`trapeze-shot.ts`). **No level opens
 * THE SLOW**: the owner, 7 October 2026 — a pair bringing a swing up to
 * speed is reading its rhythm, and a slowed swing is a different rhythm.
 */

export function installTrapeze(world: World, steps: readonly TrapezeStep[]): TrapezeState {
  const s = freshTrapeze(world.cfg, world.beat, steps);
  world.events.push({ type: "trapezeEnter", col: midCol(world.cfg) });
  return s;
}

/** The column the alien is over this tick, for an event to pan to. */
export function trapezeCol(world: World, s: TrapezeState): number {
  return Math.round(trapezeSeat(world.cfg, s).xMilli / 1000);
}

/**
 * One beat of THE TRAPEZE: the swing dies down a little, a lock counts down,
 * and the phases move on — a level lit, a level run out, the alien gone.
 * The swing itself moves on the tick (`trapezeSwung`).
 */
export function stepTrapeze(world: World, s: TrapezeState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.trapezeSpentBeats) {
      world.events.push({ type: "trapezeOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  damp(world, s);
  if (s.phase === "enter" && since >= cfg.trapezeEnterBeats) light(world, s);
  else if (s.phase === "rest" && since >= cfg.trapezeRestBeats) light(world, s);
  else if (s.phase === "level") {
    const step = trapezeLitStep(s);
    if (step !== null && since >= step.beats) miss(world, s);
  }
}

/**
 * **The swing**, once a tick: on to the next tick of its period, and at
 * either end the turn — a new half swing, and the gong kicked if it is on
 * that side and the swing reached it. A `call` level calls a side's pusher
 * as the swing passes the bottom heading there, a quarter swing ahead.
 * Called from the commands' hook (`boss-hands-scripted.ts`), THE FLUE's way,
 * so a bolt meets the alien where it really is.
 */
export function trapezeSwung(world: World): void {
  const s = trapezeBoss(world);
  if (s === null || s.phase === "spent") return;
  const period = trapezePeriod(world.cfg);
  s.swingTick = (s.swingTick + 1) % period;
  const q = period / 4;
  if (s.swingTick === 0) turn(world, s, 1);
  else if (s.swingTick === 2 * q) turn(world, s, -1);
  else if (s.swingTick === q) call(world, s, -1);
  else if (s.swingTick === 3 * q) call(world, s, 1);
}

/** Every beat the swing loses a little, and a lock counts down. */
function damp(world: World, s: TrapezeState): void {
  s.ampMilli = Math.max(0, s.ampMilli - world.cfg.trapezeDampMilli);
  if (s.lockBeats > 0) {
    s.lockBeats -= 1;
    if (s.lockBeats === 0) world.events.push({ type: "trapezeUnlock", col: trapezeCol(world, s) });
  }
}

/** The swing turned at the `side` end: a new half swing, and a gong kicked if it reached it. */
function turn(world: World, s: TrapezeState, side: TrapezeSide): void {
  s.half += 1;
  const step = trapezeLitStep(s);
  if (step === null || step.gongSide !== side || s.ampMilli < step.gongMilli) return;
  s.gongs += 1;
  s.ampMilli = Math.round((s.ampMilli * world.cfg.trapezeKeepMilli) / 1000);
  s.lockBeats = 0;
  const col = Math.round(trapezeGongAt(world.cfg, step).xMilli / 1000);
  world.events.push({ type: "trapezeGong", gongs: s.gongs, col });
  s.cursor += 1;
  s.phaseBeat = world.beat;
  if (s.cursor >= s.steps.length) {
    s.phase = "spent";
    world.events.push({ type: "trapezeSpent", col: midCol(world.cfg) });
    return;
  }
  s.phase = "rest";
}

/** In a `call` level, the seat to push on `zone` next, drawn by chance and said. */
function call(world: World, s: TrapezeState, zone: TrapezeSide): void {
  if (trapezeLitStep(s)?.ask !== "call") return;
  const seat: 0 | 1 = nextInt(world.rng, 2) === 0 ? 0 : 1;
  s.callers[zone < 0 ? 0 : 1] = seat;
  world.events.push({ type: "trapezeCall", seat, zone, col: trapezeCol(world, s) });
}

/** The next level lights. A `push` level gives the left to the pilot and the right to the navigator. */
function light(world: World, s: TrapezeState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "level";
  s.phaseBeat = world.beat;
  s.callers = [0, 1];
  s.lockBeats = 0;
  const col = Math.round(trapezeGongAt(world.cfg, step).xMilli / 1000);
  world.events.push({ type: "trapezeLevel", ask: step.ask, gongSide: step.gongSide, col });
}

/** A level ran out before its gong: the alien jumps at the hull, and the wave is lost. */
function miss(world: World, s: TrapezeState): void {
  const col = trapezeCol(world, s);
  world.events.push({ type: "trapezeMiss", col });
  s.phase = "rest";
  s.phaseBeat = world.beat;
  bossStrikesHull(world, "trapeze", col);
}

/**
 * The swing pushed (`gain`) or slowed: by a swipe or a bolt. Never past
 * `trapezeMaxMilli`, never below nought. A push or a brake by a swipe spends
 * the side's chance for this half swing; a bolt does not.
 */
export function trapezeShove(world: World, s: TrapezeState, gain: boolean, swipe: boolean): void {
  const cfg = world.cfg;
  const by = gain ? cfg.trapezePushMilli : -cfg.trapezeBrakeMilli;
  s.ampMilli = Math.max(0, Math.min(cfg.trapezeMaxMilli, s.ampMilli + by));
  if (swipe) s.pushedHalf = s.half;
}
