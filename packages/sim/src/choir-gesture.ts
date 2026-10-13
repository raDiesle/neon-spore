import { choirOnField, mergeChoirs, singChoirs } from "./choir.js";
import { ticksPerBeat } from "./config.js";
import type { World } from "./world.js";

/**
 * **The hand on THE CHOIR**, which is the half of that creature nothing else
 * in this game has: a gesture that is not a button.
 *
 * Split out of `choir.ts` at the seam that file names. Next door is what the
 * *body* is — a kind, a colour, a width, and the two things that can happen to
 * it — and that half is finished. This is what the *hand* does, and it is the
 * half that grows: a shake, and the rub both seats make together in the
 * middle of the field (`choir-rub.ts`), which took the place of the two arrows
 * against its walls on 13 October 2026 — the owner: *instead of the left and
 * right side shake alternative controls on pc, we will reuse the "rub"
 * control, which is somewhere in the center of the screen and related player
 * ( or both) needs to use it at the same time*.
 *
 * **The half-made gesture is on the world, not on the body.** A hand belongs
 * to a seat and not to any one membrane, and a wave may have two choirs on the
 * field at once — so an arm stored per creature would let a pair start a rub
 * over one body and finish it over another. `choirArm` is what is under way,
 * `choirArmTick` is the tick its window shuts on, and both are in
 * `hashWorld`: two devices that disagreed about either would disagree about
 * whether a body is still one nothing can shoot.
 *
 * **The shake is player 1's; the rub is both seats'.** Player 2's panel
 * carries both colours, so a membrane either seat could open alone would be a
 * creature one phone could play — the shake is the pilot's for that reason,
 * and the rub counts nothing unless the other seat is rubbing with it.
 */

/** Nothing made yet. Read the states through `choirArmed` below, which is what
 * everything outside this file asks. */
export const NO_CHOIR_ARM = 0;

/** The shake, as an arm: the phone shaken once, and the pair inside the window
 * for the second (`ChoirArm`). */
export const CHOIR_SHAKEN = 2;

/** The rub, as an arm: both seats have turned together at least once, and the
 * window stays open while they keep on (`choir-rub.ts`). */
export const CHOIR_RUBBED = 3;

/**
 * **The half-made gesture: the phone once shaken, or a rub under way.**
 *
 * The owner asked for the shake to be two moves rather than one — *when shaked
 * two times, they merge together* — and the rub is a run of turns made
 * together. Either is something begun inside `choirWindowBeats`, so every
 * question about the gesture is one question about this number.
 */
export type ChoirArm = typeof CHOIR_SHAKEN | typeof CHOIR_RUBBED;

/** What has been made so far, or `null` while nothing has. */
export function choirArmed(world: World): ChoirArm | null {
  if (world.choirArm === NO_CHOIR_ARM) return null;
  return world.choirArm === CHOIR_SHAKEN ? CHOIR_SHAKEN : CHOIR_RUBBED;
}

/** Put the gesture back to nothing. One copy, because all four ways out of a
 * window — merged, sung, lapsed, restarted — end here and a second spelling is
 * how one of them comes to leave a rub half-counted over an empty field. */
export function clearChoirArm(world: World): void {
  world.choirArm = NO_CHOIR_ARM;
  world.choirArmTick = 0;
  world.choirRubbed = 0;
}

/**
 * The shake's two moves: arm if nothing is armed, and otherwise finish.
 *
 * A shake landing on a rub under way finishes it too — the pair has plainly
 * made two moves, and a pair that starts one way should not be told off for
 * finishing the other.
 */
function armOrMerge(world: World, arm: ChoirArm): void {
  if (choirArmed(world) !== null) {
    clearChoirArm(world);
    mergeChoirs(world);
    return;
  }
  armChoir(world, arm);
}

/** Open the window on `arm`. */
export function armChoir(world: World, arm: ChoirArm): void {
  world.choirArm = arm;
  keepChoirWindow(world);
  world.events.push({ type: "choirArm", arm });
}

/** The window shuts `choirWindowBeats` from now: a rub keeps it open turn by turn. */
export function keepChoirWindow(world: World): void {
  world.choirArmTick = world.tick + world.cfg.choirWindowBeats * ticksPerBeat(world.cfg);
}

/**
 * The device was shaken.
 *
 * **Twice, not once**, and that is the owner reversing an earlier answer of
 * his own: *when shaked two times, they merge together*. The first shake arms
 * the gesture and sets the two bodies glowing; the second, inside
 * `choirWindowBeats`, closes them. It makes the two ways in the same shape —
 * do a thing, then do another inside the window.
 *
 * Shaking a field with nothing to open costs nothing: there is no window it
 * could spend and nothing for it to be wrong about.
 */
export function choirShaken(world: World): void {
  if (!choirOnField(world.creatures)) return;
  armOrMerge(world, CHOIR_SHAKEN);
}

/**
 * The window shutting with the gesture half made — one shake, or a rub the
 * pair stopped making together — read on the tick, from `step`.
 *
 * The lapse is the pair's, so it costs: the thing sings. It is checked on the
 * tick rather than on the beat because the window is measured in ticks off
 * `choirWindowBeats`: a lapse answered on the beat would let a second move
 * land up to a whole beat after the interval the pair was counting.
 */
export function stepChoirWindow(world: World): void {
  if (world.choirArm === NO_CHOIR_ARM) return;
  if (world.tick < world.choirArmTick) return;
  clearChoirArm(world);
  // A membrane that has gone in the meantime — merged, or off the bottom of
  // the field — leaves nothing to sing. The window simply closes.
  singChoirs(world);
}
