import type { Color } from "./types.js";

/**
 * What a press *is*, as a flat union — so that a replay is a list of these and
 * nothing else.
 *
 * Split out of `types.ts` when THE VEIL took that file past its 250-line
 * limit, along a seam that was already there and had been since the day the
 * file was written. `types.ts` next door is the shapes a **world** is made of:
 * a creature, a bullet, a pod, and what each of them carries. This is the
 * shape of what arrives *at* one from a thumb — the input side, the same
 * distinction `entries.ts` already draws about a wave. `commands.ts` is the
 * third of the trio and the only one that is code: what a press *does*.
 *
 * Every name is re-exported from `types.ts`, so nothing that already reaches
 * for a `Command` through that file had to move.
 */

/** Player commands. One flat list, so a replay is just a list of these. */
export type Command =
  | { kind: "cannonCol"; col: number }
  | { kind: "shieldCol"; col: number }
  | { kind: "fire"; color: Color }
  | { kind: "guard" }
  | { kind: "intake" }
  /**
   * A hand on something falling, or `NO_GRIP` for the hand lifted again.
   * Either player may send it — it is the one command that is not half of the
   * split. The id is safe to name across the wire because ids are dealt out
   * by the simulation, so both devices already agree about which creature is
   * which (see `setGrip` in grip.ts for what happens when it is stale).
   */
  | { kind: "grip"; id: number }
  /**
   * Player 1's thumb on the lance, down (`on`) and up again. The hold is the
   * whole of it: the lobe fills for as long as the thumb stays and the cannon
   * stands still, and nothing in the simulation keeps it filled once the
   * thumb lifts (`lance.ts`).
   */
  | { kind: "prime"; on: boolean }
  /**
   * This seat's thumb on the wave's opening. Both seats have to be done before
   * the wave moves — neither was shown the whole guide (`briefing.ts`).
   * `on` is the hold, the contract `prime` and `valve` have: at the ready gate
   * ending a guide the circle fills while the thumb is down and empties if it
   * lifts early. It is **optional**: a command without it is a plain press —
   * all the introduction needed, and what a caller with no thumbs sends (its
   * timer in `waves.ts`, the director's loop, a replay).
   */
  | { kind: "brief"; on?: boolean }
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
   * `launch` is player 2's, and it is one button that means two things by the
   * phase the shot is in: it opens the sweep, and then it fires on the power
   * bar. One slab and no mode to explain — what it is about to do is what
   * their screen is already showing (`pinball-controls.ts`).
   */
  | { kind: "slide"; on: boolean; dir: -1 | 1 }
  | { kind: "latch" }
  | { kind: "launch" }
  /**
   * A hand that grabbed something and moved: the second gesture, beside the
   * press-and-hold that only slows a fall (`grip.ts`). `on` is the hold, the
   * contract `prime` and `valve` have — true for the grab and every move after
   * it, false for the lift.
   *
   * **An absolute control names a place, a draggable control names a
   * displacement, both in simulation units, never pixels.** `cannonCol` is the
   * first kind: the finger's x is a column and where the press began does not
   * matter. A string is the second: what turns a wheel is how far the hand has
   * come from where it grabbed, so `fromMilli` is that distance in
   * **thousandths of a tile** — two phones of different widths share no pixel
   * and do share a tile. The origin never crosses at all, being resolved on the
   * device whose finger it is (`touchDown`, `packages/render/src/touch.ts`).
   *
   * **Cumulative from the grab, never an increment since the last one.** A move
   * coalesced away or lost has to heal itself, and only a distance from a fixed
   * origin does: the next supersedes it and says the same thing. An increment
   * that never arrived is gone for good and leaves the wheel a step out of true
   * — the same property that makes `cannonCol` send a column and not "one to the
   * left". `target` names the element, and the rounds to come add to that list.
   */
  | { kind: "drag"; target: DragTarget; on: boolean; fromMilli: number }
  | { kind: "restart" };

/** The draggable elements: one name per thing a hand may take hold of. A closed
 * list rather than a creature id, because THE MAZE's string is not a creature —
 * a drag that could only name one could not reach the first thing that wanted
 * it, and THE WARDEN's rope is one that is. */
export type DragTarget = "mazeString" | "wardenTether";

/**
 * The two ways SNAKE's body can be turned, and they are quarter turns rather
 * than headings: "left" means a quarter turn anticlockwise from wherever it is
 * already going. A closed list of words, so a frame on the wire says what was
 * pressed (`snake-controls.ts` is where a press becomes a heading).
 */
export const SNAKE_TURNS = ["left", "right"] as const;
export type SnakeTurn = (typeof SNAKE_TURNS)[number];

export interface TimedCommand {
  /** Simulation tick the command takes effect on. */
  tick: number;
  /** 1 = pilot, 2 = navigator. Kept for validation and statistics. */
  player: 1 | 2;
  command: Command;
}
