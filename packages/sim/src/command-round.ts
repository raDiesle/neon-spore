import type { PulseLane } from "./pulse.js";

/**
 * **The rounds' own verbs**, as their half of the `Command` union.
 *
 * Split out of `command-types.ts` when THE PULSE took that file past its
 * 250-line limit, along the seam `content/src/controls-round.ts` already cut
 * for exactly the same growth: next door is the **ship**, whose presses are
 * the same on every wave, and this is whichever round has taken the panel
 * away. Nine more rounds are designed and each one wants a verb or three, so
 * the half that grows lives on its own.
 *
 * Every name is re-exported from `command-types.ts` and from `types.ts` after
 * it, so nothing that already reached for a `Command` through either had to
 * move.
 */
export type RoundCommand =
  /**
   * THE GAUGE's own controls, and the reason they are here rather than
   * reusing the ship's: a round that is not the field has its own verbs, and a
   * pair told to "fire" at a dial would be learning that the words mean
   * whatever the screen currently needs (`docs/spec/interludes.md`).
   *
   * `valve` is player 1's, held rather than pressed — `dir` is which way it
   * pushes and `on` ends it, the same contract `prime` has. `call` is player
   * 2's, and it is the only thing in THE GAUGE that can be wrong. Which seat
   * may send which is checked in `gauge.ts`, not here: the command is what was
   * pressed, and whose press counts is the round's rule.
   */
  | { kind: "valve"; on: boolean; dir: -1 | 1 }
  | { kind: "call" }
  /**
   * THE FLEET's two verbs, and the same argument `valve` and `call` make one
   * more time: a round that is not the ordinary field has its own words, and a
   * pair told to "fire" at a chart would be learning that the words mean
   * whatever the screen currently needs.
   *
   * `aim` is player 2's, one square a press — a *step* and not a place, which
   * is the whole of why the fight is a conversation. An absolute control names
   * a square, and a seat that could name one would not need to be told which
   * one; a step can only be counted, and counting is a thing two people do out
   * loud. `dcol` and `drow` are each -1, 0 or 1, and no button on the panel
   * sends both at once.
   *
   * `salvo` is player 1's, and it is the only thing in the round that can be
   * wrong. Which seat may send which is checked in `fleet.ts`, not here: the
   * command is what was pressed, and whose press counts is the round's rule.
   */
  | { kind: "aim"; dcol: -1 | 0 | 1; drow: -1 | 0 | 1 }
  | { kind: "salvo" }
  /**
   * SNAKE's own three, and the same argument one round along: a round that is
   * not the field has its own verbs.
   *
   * `snakeTurn` is player 2's and it is **relative** — a quarter turn from
   * wherever the body is already pointing, which is the one thing that can be
   * said out loud without either of them naming a place. `snakeFire` and
   * `snakeMaw` are player 1's: a shot straight out of the head, and the mouth
   * open for a moment. Which seat may send which is checked in
   * `snake-controls.ts`, not here.
   */
  | { kind: "snakeTurn"; dir: SnakeTurn }
  | { kind: "snakeFire" }
  | { kind: "snakeMaw" }
  /**
   * PINBALL's three, and the same argument one round further on: a round that
   * is not the field has its own verbs.
   *
   * `slide` is player 1's bucket, held rather than pressed — `valve`'s exact
   * contract, because it is `valve`'s exact gesture: a thing that has to be
   * *placed* under a falling ball cannot be stepped, and a pair counting
   * presses at a ball in the air would be two people doing arithmetic instead
   * of talking. `latch` is player 1's too and stops the sweeping needle.
   *
   * `launch` is player 2's, and it fires on the power bar. It used to mean a
   * second thing before that — opening the sweep — and did not survive being
   * looked at: the needle was already walking when it arrived
   * (`pinball-controls.ts`).
   */
  | { kind: "slide"; on: boolean; dir: -1 | 1 }
  | { kind: "latch" }
  | { kind: "launch" }
  /**
   * THE PULSE's one verb, and the first in the game that **both seats send**.
   *
   * Every round before it split its verbs between the two panels; this one
   * gives each of them the same four arrows and splits what their screens can
   * *read* instead (`pulse-controls.ts`). So there is no seat named here and
   * no seat check behind it — the only thing a press carries is which lane the
   * thumb landed in, and the round decides nothing about whose it was.
   *
   * A lane and not a column: the four lanes are a fixed list with a fixed
   * order, and a number would be that order written down a second time
   * (`PULSE_LANES`).
   */
  | { kind: "pulseStep"; lane: PulseLane };

/**
 * The two ways SNAKE's body can be turned, and they are quarter turns rather
 * than headings: "left" means a quarter turn anticlockwise from wherever it is
 * already going. A closed list of words, so a frame on the wire says what was
 * pressed (`snake-controls.ts` is where a press becomes a heading).
 */
export const SNAKE_TURNS = ["left", "right"] as const;
export type SnakeTurn = (typeof SNAKE_TURNS)[number];
