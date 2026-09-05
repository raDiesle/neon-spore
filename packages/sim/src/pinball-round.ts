import { midCol } from "./config.js";
import { breachHull } from "./hull.js";
import {
  loadBoard,
  openPinball,
  type PinballPhase,
  type PinballRound,
  type PinballState,
  pinballCurrent,
  pinTargetsLeft,
  resetShot,
} from "./pinball.js";
import { pinFieldCol, pinHeightMilli, pinPhysics, pinPower, pinSweep } from "./pinball-board.js";
import { pinballHeard } from "./pinball-controls.js";
import { stepBall } from "./pinball-physics.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * PINBALL's clock: the three phases, the shot loop inside the middle one, and
 * the two ways the hull pays.
 *
 * The third round to be built and it is built the way the first two are: a
 * round that is not the field is a **boss wave**, so a wave names
 * `boss: { kind: "pinball", rounds: [...] }`, `startWave` installs it, and
 * nothing anywhere has an opinion about when a round is reached
 * (`docs/decisions.md` #20). Everything `gauge-round.ts` says about what that
 * buys holds here word for word, so this header says only what is different.
 *
 * **The ball is stepped on the tick, and it is the reason this round exists at
 * all.** Every other boss answers a thumb on the tick and resolves its fight
 * on the beat; this one has a body under an acceleration, and a beat is 75
 * ticks — a ball integrated at that rate would pass through everything on the
 * table. So `step` returns into here and the table runs at 120 Hz, which is
 * also the only rate at which the bounce reads as a bounce.
 *
 * **The clock is a boundary and not a metronome.** `pinballFlightBeats` is the
 * only beat-shaped rule inside a shot, and it exists to end a ball that has
 * come to rest on top of a block rather than to pace anything.
 */

/** Beats the ship spends folding into the bucket. SNAKE's morph, same length. */
export const PINBALL_MORPH_BEATS = 6;

/** Beats the result stands before the wave gives way to the next one. */
export const PINBALL_VERDICT_BEATS = 5;

/** Whether the round has the world — asked once, in `step`, and nowhere else. */
export function pinballHolds(world: World): boolean {
  return world.boss !== null && world.boss.kind === "pinball";
}

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function pinballRound(world: World): PinballState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "pinball" ? boss : null;
}

/** Install it, from the wave's own `boss:` entry. */
export function installPinball(world: World, rounds: readonly PinballRound[]): PinballState {
  return openPinball(world, rounds);
}

/**
 * One tick of the round. Called from `step`'s own early return rather than
 * from `stepBoss`, because the ball moves on the tick.
 */
export function stepPinballRound(world: World): void {
  const state = pinballRound(world);
  if (state === null || world.over) return;
  const since = world.beat - state.phaseBeat;

  if (state.phase === "morph") {
    if (since < PINBALL_MORPH_BEATS) return;
    enterPhase(state, "play", world.beat);
    state.roundBeat = world.beat;
    return;
  }
  // Over, and only being looked at — THE GAUGE's spent phase, same reason.
  if (state.phase === "spent") return;
  if (state.phase === "verdict") {
    if (since >= PINBALL_VERDICT_BEATS) enterPhase(state, "spent", world.beat);
    return;
  }

  slideBucket(world, state);
  if (state.shot === "aim") {
    const swept = pinSweep(world.cfg, state.angleMilli, state.angleDir);
    state.angleMilli = swept.angleMilli;
    state.angleDir = swept.dir;
  } else if (state.shot === "power") {
    const bar = pinPower(world.cfg, state.powerMilli, state.powerDir);
    state.powerMilli = bar.powerMilli;
    state.powerDir = bar.dir;
  } else {
    flyBall(world, state);
  }

  // The clock is read after the ball has moved, so a shot that cleared the
  // last target on the beat the time ran out is a shot that cleared it.
  if (pinTargetsLeft(state) === 0) {
    nextRound(world, state);
    return;
  }
  if (world.beat - state.roundBeat >= pinballCurrent(state).beats) {
    state.passed = false;
    spendHull(world, world.cfg.damagePinball, midCol(world.cfg));
    enterPhase(state, "verdict", world.beat);
  }
}

/** The bucket, moved by whichever slab is being held. */
function slideBucket(world: World, state: PinballState): void {
  if (state.slideDir === 0) return;
  const half = world.cfg.pinballBucketMilli;
  const width = world.cfg.pinballCols * 1000;
  const next = state.bucketMilli + state.slideDir * world.cfg.pinballSlideMilli;
  state.bucketMilli = Math.max(half, Math.min(width - half, next));
}

/**
 * One tick of a ball in the air: step it, light what it touched, and see
 * whether it is still on the table.
 */
function flyBall(world: World, state: PinballState): void {
  const struck = stepBall(state.ball, state.pieces, state.alive, pinPhysics(world.cfg));
  for (const i of struck) {
    if (!state.lit.includes(i)) state.lit.push(i);
  }
  const floor = pinHeightMilli(world.cfg);
  const stuck = world.beat - state.flightBeat >= world.cfg.pinballFlightBeats;
  if (state.ball.yMilli <= floor && !stuck) return;

  // The shot is over. What it lit goes now, which is what let the cluster
  // cascade while the ball was still in it (`PinballState.lit`).
  for (const i of state.lit) state.alive[i] = false;
  // A ball timed out on top of a block is not a ball anybody dropped, so it
  // costs nothing: the pair is given it back and the round's own clock is the
  // only thing that was spent.
  if (!stuck) {
    const half = world.cfg.pinballBucketMilli;
    const caught = Math.abs(state.ball.xMilli - state.bucketMilli) <= half;
    if (caught) state.catchBeat = world.beat;
    else {
      state.drops += 1;
      state.dropBeat = world.beat;
      spendHull(world, world.cfg.damagePinballDrop, pinFieldCol(world.cfg, state.ball.xMilli));
    }
  }
  resetShot(state);
}

/** The next board, or the round passed. */
function nextRound(world: World, state: PinballState): void {
  if (state.round + 1 >= state.rounds.length) {
    state.passed = true;
    enterPhase(state, "verdict", world.beat);
    return;
  }
  pinballOpenRound(world, state, state.round + 1);
}

/**
 * Open a numbered round, board and ball together.
 *
 * The one way in, so the fight's own `nextRound` and a caller jumping to a
 * board cannot disagree about what a round is: the board is copied out of
 * `rounds` and the ball is put back on the latch.
 */
export function pinballOpenRound(world: World, state: PinballState, round: number): void {
  state.round = Math.max(0, Math.min(state.rounds.length - 1, round));
  state.roundBeat = world.beat;
  loadBoard(state);
  resetShot(state);
}

/**
 * What the hull pays. The column is the one the ball fell past — the table is
 * the field's own width, so a drop on the left leaves its scar on the left,
 * and the pair sees where it went when the field comes back. The clock running
 * out has no such place and takes the middle, which is what THE GAUGE, SNAKE
 * and THE FLEET all do.
 */
function spendHull(world: World, amount: number, col: number): void {
  breachHull(world, col, "meteorFastest", 0, amount);
}

/**
 * Take the round off the world outright, picture and all. `closeGauge` says
 * why that is not how a round ends: this is for a run being left.
 */
export function closePinball(world: World): void {
  if (!pinballHolds(world)) return;
  world.boss = null;
}

/**
 * One control, as the round heard it. Nothing reaches it outside `play`: the
 * morph is for reading a screen that has just stopped being the field and the
 * verdict for looking at one.
 */
export function pinballRoundHeard(world: World, player: 1 | 2, command: Command): void {
  const state = pinballRound(world);
  if (state === null || state.phase !== "play") return;
  pinballHeard(world, state, player, command);
}

export function enterPhase(state: PinballState, phase: PinballPhase, beat: number): void {
  state.phase = phase;
  state.phaseBeat = beat;
}
