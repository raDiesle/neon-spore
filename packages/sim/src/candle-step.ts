import { metColor } from "./balance.js";
import {
  type CandlePhase,
  type CandleState,
  candleBoss,
  candleEating,
  candleMoving,
} from "./candle.js";
import { midCol } from "./config.js";
import { nextInt } from "./rng.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CANDLE's clock — the drift, the turn, the last step and the black
 * frame — and the two moments a shot meets it: struck from below, and eaten
 * at the muzzle.
 *
 * The phases are the glow read against `config-candle.ts`: the boss changes
 * what it does at fixed steps of its own health, so every change is one the
 * pair can hear in the only thing they can see. Everything on the **beat**
 * runs from `stepBoss`; the two things on the **tick** are a shot leaving
 * the top of the field (`candleStruck`, from `bullets.ts` and
 * `lance-burn.ts`) and a shot leaving the muzzle (`candleEats`, from
 * `bullets.ts`), because an answer that waited for the next beat would put a
 * queue between the press and the dark.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installCandle(world: World): CandleState {
  const col = midCol(world.cfg);
  world.events.push({ type: "candleDark" });
  return {
    kind: "candle",
    phase: "dark",
    phaseBeat: world.beat,
    glow: world.cfg.candleGlowSteps,
    col,
    // It faces its own column to begin with: the first column player 2 will
    // be told not to fire from is the one the glow is in, which is the one
    // she most wants to.
    faceCol: col,
    moveBeat: world.beat,
    turnBeat: world.beat,
  };
}

/** Which phase this many steps of glow puts the boss in, the light being out. */
function phaseFor(world: World, glow: number): CandlePhase {
  const cfg = world.cfg;
  if (glow <= 0) return "out";
  if (glow <= cfg.candleLastSteps) return "last";
  if (glow <= cfg.candleEatSteps) return "eating";
  return "full";
}

function enter(world: World, c: CandleState, phase: CandlePhase): void {
  if (c.phase === phase) return;
  c.phase = phase;
  c.phaseBeat = world.beat;
  if (phase === "last") world.events.push({ type: "candleLast", col: c.col });
  if (phase === "out") world.events.push({ type: "candleOut" });
}

/**
 * One beat of the glow.
 *
 * The light goes out over `candleDarkBeats` and the glow holds still while
 * it does — the pair has the dark arriving to read before anything moves.
 * Then it drifts one column every `candleMoveBeats` and turns every
 * `candleTurnBeats`, both off the rng, until the last step, when it stops.
 */
export function stepCandle(world: World, c: CandleState): void {
  const cfg = world.cfg;
  if (c.phase === "out") {
    // Nulled here rather than at the last hit, so the frame has its two
    // black beats before the wave is allowed to end under it
    // (`bossHoldsWave`).
    if (world.beat - c.phaseBeat >= cfg.candleOutBeats) world.boss = null;
    return;
  }
  if (c.phase === "dark") {
    if (world.beat - c.phaseBeat < cfg.candleDarkBeats) return;
    enter(world, c, phaseFor(world, c.glow));
    c.moveBeat = world.beat;
    c.turnBeat = world.beat;
    return;
  }
  if (!candleMoving(c)) return;
  if (world.beat - c.moveBeat >= cfg.candleMoveBeats) {
    c.moveBeat = world.beat;
    // One column either way, and at the edges the one way there is. The
    // draw is made either way so the stream does not depend on where it is.
    const dir = nextInt(world.rng, 2) === 0 ? -1 : 1;
    const to = c.col + dir;
    c.col = to < 0 || to >= cfg.cols ? c.col - dir : to;
    world.events.push({ type: "candleMove", col: c.col });
  }
  if (world.beat - c.turnBeat >= cfg.candleTurnBeats) {
    c.turnBeat = world.beat;
    c.faceCol = nextInt(world.rng, cfg.cols);
    world.events.push({ type: "candleTurn", col: c.faceCol });
  }
}

/**
 * **A shot that nothing on the field stopped, leaving through the top** of
 * the column the glow hangs over. Called by `bullets.ts` and `lance-burn.ts`
 * beside `diastoleStruck`, and a no-op unless THE CANDLE is the boss with a
 * step left.
 *
 * A step off the glow, either colour, bolt or beam. The dark is the boss's
 * whole difficulty and a colour rule on top of it would be charging the pair
 * for what they cannot see; the beam lands because the design makes it the
 * one light the boss cannot eat.
 */
export function candleStruck(world: World, bullet: Bullet): void {
  const c = candleBoss(world);
  if (c === null || c.phase === "dark" || c.phase === "out") return;
  if (bullet.col !== c.col) return;
  metColor(world);
  c.glow -= 1;
  world.events.push({ type: "candleDim", col: c.col, left: c.glow });
  enter(world, c, phaseFor(world, c.glow));
}

/**
 * **Whether a shot about to leave the muzzle in `col` is eaten instead.**
 * Called by `launch` in `bullets.ts` before the bolt is made, so a swallowed
 * flash lays no bullet and fires no `fire` event: the muzzle lit nothing,
 * which is the whole of what the pair sees.
 *
 * Only a bolt, only from the column it faces, only while it is eating. The
 * light it swallowed goes back on its glow, one step, never past full — so
 * a navigator who fires from the column she was told not to has spent a
 * shot to make the fight longer.
 */
export function candleEats(world: World, col: number): boolean {
  const c = candleBoss(world);
  if (c === null || !candleEating(c) || col !== c.faceCol) return false;
  c.glow = Math.min(world.cfg.candleGlowSteps, c.glow + 1);
  world.events.push({ type: "candleFed", col, left: c.glow });
  enter(world, c, phaseFor(world, c.glow));
  return true;
}
