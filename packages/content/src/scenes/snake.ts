import type { GuideScene } from "../scene-types.js";
import { SNAKE_ROUNDS } from "../snake-rounds.js";

/**
 * SNAKE's rehearsal: the ship is the body, and the one who can see it cannot
 * steer it.
 *
 * The ship folds into a snake and never stops. Player 2 has both turns and is
 * shown the body and the meteors and nothing else; player 1 has the trigger
 * and the mouth, cannot steer at all, and is the only one the enemies and the
 * points are drawn for. So a round is read out loud — *two ahead of you, turn
 * right after it* — and the film is one exchange of exactly that.
 *
 * Four pages: what each of them holds, a shot at the enemy standing in the
 * opening lane, a turn, and a shot at the one the turn was for. Nothing in it
 * is staged — the body is stepped by the round's own clock at sixty ticks a
 * tile, the spit carries its authored three tiles, and both enemies are the
 * ones round one is written with.
 *
 * **The turn is late on its page, and that is the lesson.** Every other film
 * puts its press a beat and a half after the words; this one waits nearly four
 * seconds, because the body is already moving and the moment to turn is the
 * moment the other seat says so. A turn taken as the words arrived would be a
 * film about reacting, and there is nothing on either of these two screens to
 * react to.
 */
export const SNAKE: GuideScene = {
  ticks: 990,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "snake", rounds: SNAKE_ROUNDS },
  acts: [
    { tick: 420, control: "snakeFire" },
    // Queued between two steps, so it is applied on the one that takes the
    // head off the opening column and along the row the second enemy is
    // standing in. A turn is relative and queued rather than applied
    // (`SnakeState.turn`), so the tick it is sent on is the tick that decides
    // which corner the body turns.
    { tick: 740, control: "snakeLeft" },
    { tick: 870, control: "snakeFire" },
  ],
  steps: [
    {
      tick: 0,
      seat: 2,
      text: "PLAYER 2 ONLY DRIVES",
      anchor: { at: "control", control: "snakeLeft" },
    },
    {
      tick: 300,
      seat: 1,
      text: "PLAYER 1 SEES THE ENEMY",
      anchor: { at: "control", control: "snakeFire" },
    },
    {
      tick: 520,
      seat: 2,
      text: "PLAYER 2 TURNS IT",
      anchor: { at: "control", control: "snakeLeft" },
    },
    {
      tick: 780,
      seat: 1,
      text: "AND THE NEXT ONE",
      anchor: { at: "control", control: "snakeFire" },
    },
  ],
};
