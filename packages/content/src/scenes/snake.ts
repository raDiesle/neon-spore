import type { GuideScene } from "../scene-types.js";
import { SNAKE_ROUNDS } from "../snake-rounds.js";

/**
 * SNAKE's rehearsal: the ship is the body, and the one who shoots it cannot
 * steer it.
 *
 * The ship folds into a snake and never stops. Player 2 has both turns;
 * player 1 has the trigger and the mouth and cannot steer at all. Both see the
 * whole arena (the owner, 25 September 2026), so a round is two people agreeing
 * out loud — *two ahead of you, turn right after it* — and the film is one
 * exchange of exactly that.
 *
 * Four pages: what each of them holds, a shot at the enemy standing in the
 * opening column, a turn, and a shot at the one the turn was for. Nothing in
 * it is staged — the body is stepped by the round's own clock at forty-five
 * ticks a small tile, the spit carries its authored ten, and both enemies are
 * the ones round one is written with.
 *
 * **Four pages still, and the last one changed on 18 September 2026.** The
 * field writes `PRESS` / `FIRE` on an enemy a shot would actually reach and
 * `PRESS` / `OPEN` on a point the head is one step from, on player 1's screen
 * and nowhere else (`decisions.md` #34, `render/boss-cue-read-g.ts`) — so the
 * page that was the second shot says the rule behind both of them instead:
 * the steering lines the shot up. It could not simply come out, because that
 * shot is the film's last act and a page is what puts his screen in front of
 * the reader (`docs/spec/briefings.md`). On the finer grid (25 September
 * 2026) the turn is onto the second enemy's own row and the shot goes the
 * length of it.
 *
 * **The turn is late on its page, and that is the lesson.** Every other film
 * puts its press a beat and a half after the words; this one waits nearly four
 * seconds, because the body is already moving and the moment to turn is the
 * moment the other seat says so. A turn taken as the words arrived would be a
 * film about reacting, and there is nothing on either of these two screens to
 * react to.
 */
export const SNAKE: GuideScene = {
  ticks: 1080,
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
    { tick: 870, control: "snakeLeft" },
    { tick: 950, control: "snakeFire" },
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
      text: "PLAYER 1 SHOOTS IT",
      anchor: { at: "control", control: "snakeFire" },
    },
    {
      tick: 520,
      seat: 2,
      text: "PLAYER 2 TURNS IT",
      anchor: { at: "control", control: "snakeLeft" },
    },
    {
      tick: 880,
      seat: 1,
      text: "LINE IT UP, THEN SHOOT",
      anchor: { at: "control", control: "snakeFire" },
    },
  ],
};
