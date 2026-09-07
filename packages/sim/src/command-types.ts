import type { RoundCommand } from "./command-round.js";
import type { Color } from "./types.js";

export { SNAKE_TURNS, type SnakeTurn } from "./command-round.js";

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
   * Player 1's arm, on the `claw` panel: one press sends it up the column the
   * strip is standing in and nothing recalls it (`reach.ts`).
   *
   * It carries nothing at all — not even the column. The arm goes up
   * `world.cannonCol`, which is where the strip already put it, and a command
   * that named a column would be a second copy of something the world knows
   * arriving from a device that could be wrong about it. It is a press and
   * never a hold, because what it costs is the travel rather than the thumb.
   */
  | { kind: "reach" }
  /**
   * A hand on something falling, or `NO_GRIP` for the hand lifted again.
   * Either player may send it — it is the one command that is not half of the
   * split. The id is safe to name across the wire because ids are dealt out
   * by the simulation, so both devices already agree about which creature is
   * which (see `setGrip` in grip.ts for what happens when it is stale).
   */
  | { kind: "grip"; id: number }
  /**
   * **Player 2's thumb on a colour**, down (`on`) and up again — which is the
   * whole of the trigger since the lance lost its own button.
   *
   * The press says nothing but *held*; the lift is the ordinary shot, in this
   * colour. Held long enough and the lobe fills and fires a lance by itself,
   * and then the lift owes nothing (`lance.ts`).
   *
   * `color` rides on both halves. It is on the way down because the fill has
   * to know what it will fire without asking a button that is a long way away
   * by then, and on the way up because a lift is a shot and a shot has a
   * colour — the same value twice, from the one thumb that knows it.
   */
  | { kind: "prime"; on: boolean; color: Color }
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
   * One seat turning a page of a stepped guide — forwards, or `back`. Each seat
   * has its own cursor and reads at its own speed; the gate at the end is what
   * they arrive at together (`guide-steps.ts`). A seat that has already said
   * READY does not move, so this is silently dropped there rather than
   * un-readying a partner who is already waiting.
   */
  | { kind: "guideStep"; back?: boolean }
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
   *
   * **`id` names *which* one, for a target that is a creature.** A rope hung by
   * a boss is the only one of its kind on the field, so its target name is
   * address enough; THE LID is an ordinary arrival and a wave may send three
   * down at once, so the grab has to say which cord the hand landed on and
   * every move after it has to keep saying so. Absent for a target that is a
   * fixture — an id there would be a second, weaker way of naming a thing that
   * already has exactly one name.
   *
   * **`fromMilli` is the x of it and `fromYMilli` the y**, and the two names do
   * not match because the wire has a history: a pull was one signed number
   * along x for as long as the only handle in the game hung under a rim and was
   * swung *aside*. The owner asked for the whole circle, so a hand may now
   * carry a handle in any direction — and an absent `fromYMilli` means nought,
   * which is exactly what every drag sent before today was. Renaming the first
   * one would have said the same thing at the cost of every recorded replay.
   */
  | {
      kind: "drag";
      target: DragTarget;
      on: boolean;
      fromMilli: number;
      fromYMilli?: number;
      id?: number;
    }
  /**
   * THE CHOIR's shake, and the only command in this game that is not a thumb
   * on anything: the *device* was picked up and shaken, and the membrane draws
   * together (`choir-gesture.ts`).
   *
   * It carries nothing at all, for `reach`'s reason and one more of its own.
   * There is no column — a shake has no place to be — and no strength either:
   * whether a phone moved enough to count is decided where the accelerometer
   * is read, because that is the only side of the wire that has the numbers,
   * and a threshold crossed on one device is a fact the other must simply be
   * told rather than re-derive from a reading it never saw.
   *
   * The two arrows that stand in for it where no device reports a shake are
   * **not** this command: they are `drag`s at `choirLeft` and `choirRight`,
   * because they are a hand carrying something and not a press.
   */
  | { kind: "shake" }
  | { kind: "restart" }
  // And the rounds' own, next door — see `command-round.ts`.
  | RoundCommand;

/** The draggable elements: one name per thing a hand may take hold of. A closed
 * list rather than a creature id, because THE MAZE's string is not a creature —
 * a drag that could only name one could not reach the first thing that wanted
 * it, and THE WARDEN's rope is one that is. THE LID's cord is the third, and
 * the first that is *many*: the target says what kind of handle this is and
 * `id` above says which body it hangs off. */
export type DragTarget =
  | "mazeString"
  | "wardenTether"
  | "lidString"
  | "gripBody"
  | "choirLeft"
  | "choirRight"
  | "balloonLeft"
  | "balloonRight";

/**
 * `choirLeft` and `choirRight` are the fifth and sixth, and the first pair
 * that is one gesture in two places: the two arrows standing against the walls
 * of the field while a membrane is up (`choir-gesture.ts`). Two names rather
 * than one target and a side, for the reason `id` is absent on `mazeString` —
 * there is exactly one of each, so each has exactly one name, and a side
 * carried beside a shared name would be a second, weaker way of saying which
 * arrow the hand is on.
 */

/**
 * `balloonLeft` and `balloonRight` are the seventh and eighth, and the first
 * pair that is one gesture in two **seats**. THE CHOIR's two arrows are one
 * hand making one gesture twice; these are two hands making one gesture once,
 * and which seat may send which is the whole of the coupling — the pilot has
 * the left of every balloon and the navigator the right, always
 * (`balloonHeard`). They carry `id` for THE LID's reason with more riding on
 * it: a wave puts several on the field at once on purpose, and *which one*
 * is the sentence this creature exists to make the pair say.
 */

/**
 * `gripBody` is the fourth and the first that is not a handle at all: it is
 * **the body the grip is already holding**, carried sideways. The hold that
 * sends it is a `grip` rather than a `drag` (`render/touch-hold.ts`) — one
 * hold, two gestures, exactly as a press on the cannon that slides it and a
 * lift that opens the maw are one hold and two controls. `id` says which body,
 * for THE LID's reason: a wave may have several on the field and either seat
 * may have a hand on a different one.
 */

export interface TimedCommand {
  /** Simulation tick the command takes effect on. */
  tick: number;
  /** 1 = pilot, 2 = navigator. Kept for validation and statistics. */
  player: 1 | 2;
  command: Command;
}
