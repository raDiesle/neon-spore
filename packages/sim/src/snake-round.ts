import { midCol } from "./config.js";
import { breachHull } from "./hull.js";
import type { SnakePhase, SnakeRound, SnakeState } from "./snake.js";
import { snakeHeard } from "./snake-controls.js";
import { stepSnake } from "./snake-move.js";
import { openSnake } from "./snake-open.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * SNAKE's clock: the three phases, the way in and the way out.
 *
 * The second round to be built, and it is built the way the first one is: a
 * round that is not the field is a **boss wave**, so a wave names
 * `boss: { kind: "snake", rounds: [...] }`, `startWave` installs it, and
 * nothing anywhere has an opinion about when a round is reached
 * (`docs/decisions.md` #20). Everything `gauge-round.ts` says about what that
 * buys is true here word for word, so this header says only what is different.
 *
 * **The morph is a phase and not an animation.** The ship shrinks into the
 * snake before the body starts moving — the real ship, drawn by the call the
 * field makes — and the beats it takes are beats the pair spends reading two
 * screens that have just stopped being the field: one of them holding the
 * arena's enemies and points, the other the body. A round that started moving
 * on the first frame would be a round whose first repeat was nobody's fault.
 *
 * **The field is gone, and the hull is not.** `step` returns before a rule of
 * the field runs, so nothing spawns, falls or reaches the ship; `world.beat`
 * keeps going, because the metronome is the game's heartbeat. What the round
 * can still do is break the hull — a repeated attempt, in `snake-move.ts`, and
 * the clock running out, here — so a run can end in this round, and the scars
 * are on the hull when the field comes back.
 */

/**
 * Beats the ship spends becoming the snake. Longer than THE GAUGE's lead,
 * because there is more to read: two screens, four buttons and a body that is
 * about to set off on its own.
 */
export const SNAKE_MORPH_BEATS = 6;

/** Beats the result stands before the wave gives way to the next one. */
export const SNAKE_VERDICT_BEATS = 5;

/** Whether the round has the world — asked once, in `step`, and nowhere else. */
export function snakeHolds(world: World): boolean {
  return world.boss !== null && world.boss.kind === "snake";
}

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function snakeRound(world: World): SnakeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "snake" ? boss : null;
}

/** Install it, from the wave's own `boss:` entry. */
export function installSnake(world: World, rounds: readonly SnakeRound[]): SnakeState {
  return openSnake(world, rounds);
}

/**
 * One tick of the round.
 *
 * Called from `step`'s own early return rather than from `stepBoss`, because
 * the body moves on the tick and `stepBoss` runs on the beat — THE GAUGE's
 * needle is stepped here for the same reason.
 *
 * A run that is already over stops the body where it stands. The hull can go
 * through inside this round, and a snake that kept eating over the end screen
 * would be a game still being played after it was lost.
 */
export function stepSnakeRound(world: World): void {
  const round = snakeRound(world);
  if (round === null || world.over) return;
  const since = world.beat - round.phaseBeat;

  if (round.phase === "morph") {
    if (since < SNAKE_MORPH_BEATS) return;
    enterPhase(round, "play", world.beat);
    // Both clocks start when the body does, never when the picture does: the
    // beats the first round is judged against, and the ticks until its first
    // step. Without the second, the morph's own beats would count as a step
    // interval and the snake's first move would be on the tick it was allowed
    // to move at all — a tile the pair never got to talk about.
    round.roundBeat = world.beat;
    round.stepTick = world.tick;
    return;
  }
  // Over, and only being looked at — THE GAUGE's spent phase, same reason.
  if (round.phase === "spent") return;
  if (round.phase === "verdict") {
    if (since >= SNAKE_VERDICT_BEATS) enterPhase(round, "spent", world.beat);
    return;
  }

  const verdict = stepSnake(world, round);
  if (verdict === null) return;
  round.passed = verdict;
  if (!verdict) spendHull(world);
  enterPhase(round, "verdict", world.beat);
}

/**
 * What running out of time costs, and it is the hull. The middle column,
 * because the round has no columns of its own — `gauge-round.ts` argues it,
 * and a second round is not a second argument.
 */
function spendHull(world: World): void {
  const col = midCol(world.cfg);
  breachHull(world, col, "meteorFastest", 0, world.cfg.damageSnake);
}

/**
 * Take the round off the world outright, picture and all. `closeGauge` says
 * why that is not how a round ends: this is for a run being left.
 */
export function closeSnake(world: World): void {
  if (!snakeHolds(world)) return;
  world.boss = null;
}

/**
 * One control, as the round heard it. Nothing reaches it outside `play`: the
 * morph is for reading two screens and the verdict for looking at one, and a
 * press that counted during either would be a press nobody meant.
 */
export function snakeRoundHeard(world: World, player: 1 | 2, command: Command): void {
  const round = snakeRound(world);
  if (round === null || round.phase !== "play") return;
  snakeHeard(world, round, player, command);
}

export function enterPhase(round: SnakeState, phase: SnakePhase, beat: number): void {
  round.phase = phase;
  round.phaseBeat = beat;
}
