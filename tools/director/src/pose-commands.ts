import type { DragTarget, TimedCommand } from "@neon-spore/sim";

/**
 * **The commands a pose presses, spelled short.** A pose is mostly a list of
 * these, and the list of builders gains one for every verb a new pose has to
 * press — which is why they are a file of their own and not the tail of
 * `pose-kit.ts`: that file is the apparatus, a world put into one named
 * state, and it had one line left. The kit re-exports every one of these,
 * so a pose still imports from the kit alone.
 */

/** Commands, spelled short — a pose is mostly a list of these. `prime` is player 2's thumb on a colour: down fills the cannon lobe, up is the ordinary shot (`sim/lance.ts`). */
export const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
export const ward = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});
export const guard = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "guard" },
});
export const suck = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "intake" },
});
export const prime = (tick: number, on: boolean, color: "red" | "cyan" = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "prime", on, color },
});
export const shoot = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
/**
 * The pilot's thumb on a hanging cord, dragged `milli` thousandths of a tile
 * **down the field** from where it grabbed.
 *
 * One of these is a hand that stays down: the pull is kept on the body until it
 * is let go, so a pose sends it once and the thing it opened stays open for the
 * length of the replay (`sim/lid.ts`).
 *
 * Downward and not sideways, and that is the whole reason this is a helper
 * rather than a literal at each pose. `clampPull` bounds the handle to the
 * field, so a sideways pull is cut by whichever wall it reaches first: THE
 * LID's cord is taut at seven tiles and the field is eleven wide, so a straight
 * pull from the middle column comes back at 5200 of 7000 and the eye simply
 * does not open. Below a body there is always room, because a cord hangs under
 * one — which is also where a thumb actually goes.
 */
export const pullCord = (
  tick: number,
  id: number,
  milli: number,
  target: DragTarget = "lidString",
): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: milli, id },
});
export const hold = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});
