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
import { closeSlow, openSlow } from "./slow.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CANDLE's clock — the drift, the turn, the last step, the smoking wick
 * and the black frame — and the two moments a shot meets it: struck from
 * below, and eaten at the muzzle.
 *
 * The phases are the glow read against `config-candle.ts`: the boss changes
 * what it does at fixed steps of its own health, so every change is one the
 * pair can hear in the only thing they can see. Everything on the **beat**
 * runs from `stepBoss`; the three things on the **tick** are a shot leaving
 * the top of the field (`candleStruck`, from `bullets.ts` and
 * `lance-burn.ts`), a shot leaving the muzzle (`candleEats`, from
 * `bullets.ts`), and a shot that actually lit the field (`candleFlash`, from
 * `bullets.ts`'s `launch`), because an answer that waited for the next beat
 * would put a queue between the press and the dark.
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
    pinchMilli: 0,
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

/**
 * Into a phase, once. Exported for `candle-hand.ts` alone, which is the one
 * place outside this file a phase changes — the pull is a tick's work and
 * the clock here is the beat's (`stare-step.ts`' `enterStare` is the same
 * door for the same reason).
 */
export function enterCandle(world: World, c: CandleState, phase: CandlePhase): void {
  if (c.phase === phase) return;
  c.phase = phase;
  c.phaseBeat = world.beat;
  // The thumb's carry is left behind wherever the phase goes: it is only
  // read in `last`, and a depth kept across a phase would have the next pull
  // start where the last one stopped.
  if (phase !== "last") c.pinchMilli = 0;
  if (phase === "last") world.events.push({ type: "candleLast", col: c.col });
  if (phase === "smoking") world.events.push({ type: "candleSmoke", col: c.col });
  if (phase === "out") world.events.push({ type: "candleOut" });
}

/**
 * One beat of the glow.
 *
 * The light goes out over `candleDarkBeats` and the glow holds still while
 * it does — the pair has the dark arriving to read before anything moves.
 * Then it drifts one column every `candleMoveBeats` and turns every
 * `candleTurnBeats`, both off the rng, until the last step, when it stops.
 *
 * The one count that is not the pair's is the smoking wick's, which lights
 * again after `candleSmokeBeats` if the beam has not reached it.
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
  // **The wick, and the one clock in this fight that runs against the pair.**
  // Everything else here waits for them; this counts down, and the beam has
  // to be standing in the column before it reaches the bottom. A wick that
  // lights again comes back with a step on it, which puts the boss back to
  // `eating` — drifting and swallowing flashes — so the pull is a gesture
  // with something to lose (`candle.ts`).
  if (c.phase === "smoking") {
    if (world.beat - c.phaseBeat < cfg.candleSmokeBeats) return;
    closeSlow(world);
    c.glow = Math.min(cfg.candleGlowSteps, c.glow + 1);
    world.events.push({ type: "candleLit", col: c.col, left: c.glow });
    enterCandle(world, c, phaseFor(world, c.glow));
    c.moveBeat = world.beat;
    c.turnBeat = world.beat;
    return;
  }
  if (c.phase === "dark") {
    if (world.beat - c.phaseBeat < cfg.candleDarkBeats) return;
    enterCandle(world, c, phaseFor(world, c.glow));
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
 *
 * **Two phases are exceptions, and between them they are the §6.2 lane.** At
 * `last` no shot counts at all, and at `smoking` only the beam does. Both are
 * written beside themselves below.
 */
export function candleStruck(world: World, bullet: Bullet): void {
  const c = candleBoss(world);
  if (c === null || c.phase === "dark" || c.phase === "out") return;
  if (bullet.col !== c.col) return;
  // **The last step is nobody's to shoot.** A flame is put out by a hand, so
  // from here the fight stops being the trigger and becomes the pilot's thumb
  // on the wick and her beam behind it (`candle-hand.ts`). The bolt passes
  // through and the field says so on his band, because a trigger that quietly
  // stopped working is THE LEAD's sentence (`boss-cue-read-m.ts`).
  if (c.phase === "last") return;
  // **And the smoking wick takes the beam and nothing else.** There is no
  // flame left to dim: what is there is a thread of light the lance burns
  // through and a bolt goes past. One hit, whatever the glow says, because
  // the step the pull took off is the one the beam is finishing.
  if (c.phase === "smoking") {
    if (!bullet.lance) return;
    metColor(world);
    closeSlow(world);
    c.glow = 0;
    world.events.push({ type: "candleDim", col: c.col, left: 0 });
    enterCandle(world, c, "out");
    return;
  }
  metColor(world);
  c.glow -= 1;
  world.events.push({ type: "candleDim", col: c.col, left: c.glow });
  enterCandle(world, c, phaseFor(world, c.glow));
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
  enterCandle(world, c, phaseFor(world, c.glow));
  return true;
}

/**
 * **A bolt actually left the muzzle, and lit the field for it.** Called by
 * `launch` in `bullets.ts` once a flash is certain — after `candleEats`
 * above has already had its chance to swallow it — so the two never both
 * fire for the same press.
 *
 * Every flash opens THE SLOW for `candleFlashSlowBeats`, with no exception
 * for a later one over the first: §14 names none, and a flash the pair has
 * already spent a shot to make is worth the same three seconds every time
 * (`docs/queue.md`, *THE CANDLE's flash beat is played at tempo*, answered
 * 19 September 2026).
 */
export function candleFlash(world: World): void {
  const c = candleBoss(world);
  if (c === null || c.phase === "out") return;
  // The smoke's own window is up and runs to its own end: a flash re-opening
  // it would move that end to one beat from now (`openSlow`) and spend the
  // pair's clock on a bolt that does nothing to the wick.
  if (c.phase === "smoking") return;
  openSlow(world, world.cfg.candleFlashSlowBeats);
}
