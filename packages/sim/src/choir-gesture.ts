import { choirOnField, mergeChoirs, singChoirs } from "./choir.js";
import { ticksPerBeat } from "./config.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The hand on THE CHOIR**, which is the half of that creature nothing else
 * in this game has: a gesture that is not a button.
 *
 * Split out of `choir.ts` at the seam that file names. Next door is what the
 * *body* is — a kind, a colour, a width, and the two things that can happen to
 * it — and that half is finished. This is what the *hand* does, and it is the
 * half that grows: a shake, two arrows today, and whatever a device learns to
 * report next.
 *
 * **The half-made gesture is on the world, not on the body.** A hand belongs
 * to a seat and not to any one membrane, and a wave may have two choirs on the
 * field at once — so an arm stored per creature would let the pilot open one
 * arrow on one body and the second on another. `choirArm` is which arrow is
 * standing out, `choirArmTick` is the tick its window shuts on, and both are
 * in `hashWorld`: two devices that disagreed about either would disagree about
 * whether a body is still one nothing can shoot.
 *
 * **Only player 1 may make it**, the rule THE MAZE's string, THE WARDEN's rope
 * and THE LID's cord are already on and for their reason: player 2's panel
 * carries both colours, so a membrane either seat could open would be a
 * creature one phone could play.
 */

/** Nothing made yet. Read the states through `choirArmed` below, which is what
 * everything outside this file asks. */
export const NO_CHOIR_ARM = 0;

/** The shake, as an arm. It sits beside the two arrows rather than in a field
 * of its own because it is the same half-made gesture: something has been done
 * once and the pair is inside the window for the second (`ChoirArm`). */
export const CHOIR_SHAKEN = 2;

/** Which arrow: the one against the left wall of the field, or the right. A
 * side rather than a `DragTarget`, so the rule never learns the two names
 * render/ answers a finger with (`handles.ts`). */
export type ChoirSide = -1 | 1;

/**
 * **The half-made gesture: one of the two arrows, or the phone once shaken.**
 *
 * The owner asked for the shake to be two moves rather than one — *when shaked
 * two times, they merge together* — which makes both ways in the same shape:
 * do a thing, and then do a *different* thing inside `choirWindowBeats`. So
 * the shake is a third value of the arm the arrows already used, and every
 * question about the gesture is one question about this number.
 */
export type ChoirArm = ChoirSide | typeof CHOIR_SHAKEN;

/** What has been made so far, or `null` while nothing has. */
export function choirArmed(world: World): ChoirArm | null {
  if (world.choirArm === NO_CHOIR_ARM) return null;
  if (world.choirArm === CHOIR_SHAKEN) return CHOIR_SHAKEN;
  return world.choirArm === -1 ? -1 : 1;
}

/** Put the gesture back to nothing. One copy, because all four ways out of a
 * window — merged, sung, lapsed, restarted — end here and a second spelling is
 * how one of them comes to leave an arrow standing out over an empty field. */
export function clearChoirArm(world: World): void {
  world.choirArm = NO_CHOIR_ARM;
  world.choirArmTick = 0;
}

/**
 * A hand carried one of the two arrows, and this is the whole of the gesture.
 *
 * `out` is which way it went, in the same signs as the side: an arrow against
 * the left wall is `-1` and is carried outward by going left, the right one by
 * going right. The **rule** that outward means `side === out` lives here
 * rather than in the hit test, because a device that decided for itself
 * whether a swipe counted would be a device the other one cannot check.
 *
 * Three outcomes, and the pair can reach all of them:
 *
 *  - **Wrong way** — the thing sings. The owner asked for a wrong move to
 *    hurt, and this is the only place in the gesture where the pilot can be
 *    plainly wrong rather than merely late.
 *  - **The first arrow, outward** — the window opens and the field starts to
 *    shake. Which arrow it was is remembered, because the second has to be the
 *    *other*: two pulls on one side is one gesture done twice.
 *  - **The other arrow, outward, inside the window** — every membrane on the
 *    field draws together.
 */
export function choirPulled(world: World, side: ChoirSide, out: -1 | 1): void {
  if (!choirOnField(world.creatures)) return;
  if (out !== side) {
    clearChoirArm(world);
    singChoirs(world);
    return;
  }
  // The **same** arrow twice is one gesture done twice and opens nothing. A
  // shake standing as the first move is answered by either arrow, because the
  // pilot has plainly made two moves — the two ways in are not two separate
  // machines and a pair that starts one way should not be told off for
  // finishing the other.
  if (choirArmed(world) === side) return;
  armOrMerge(world, side);
}

/**
 * The half of both gestures that is the same: arm if nothing is armed, and
 * otherwise finish.
 *
 * One copy, because the shake and the arrows only differ in what counts as a
 * *second* move, and a second spelling of the window is how the two paths come
 * to expire at different times.
 */
function armOrMerge(world: World, arm: ChoirArm): void {
  if (choirArmed(world) !== null) {
    clearChoirArm(world);
    mergeChoirs(world);
    return;
  }
  world.choirArm = arm;
  world.choirArmTick = world.tick + world.cfg.choirWindowBeats * ticksPerBeat(world.cfg);
  world.events.push({ type: "choirArm", side: arm });
}

/**
 * The device was shaken.
 *
 * **Twice, not once**, and that is the owner reversing an earlier answer of
 * his own: *when shaked two times, they merge together*. The first shake arms
 * the gesture and sets the two bodies glowing; the second, inside
 * `choirWindowBeats`, closes them. It makes the two ways in the same shape —
 * do a thing, then do another inside the window — and it makes the shake cost
 * what the arrows cost, where before it was the easier path by a whole move.
 *
 * Shaking a field with nothing to open costs nothing: there is no window it
 * could spend and nothing for it to be wrong about.
 */
export function choirShaken(world: World): void {
  if (!choirOnField(world.creatures)) return;
  armOrMerge(world, CHOIR_SHAKEN);
}

/**
 * The window shutting with only one arrow out — read on the tick, from `step`.
 *
 * The lapse is the pilot's, so it costs what a wrong pull costs. It is checked
 * on the tick rather than on the beat because the window is measured in ticks
 * off `choirWindowBeats`: a lapse answered on the beat would let a second pull
 * land up to a whole beat after the interval the pair was counting.
 */
export function stepChoirWindow(world: World): void {
  if (world.choirArm === NO_CHOIR_ARM) return;
  if (world.tick < world.choirArmTick) return;
  clearChoirArm(world);
  // A membrane that has gone in the meantime — merged by a shake, or off the
  // bottom of the field — leaves nothing to sing. The window simply closes.
  singChoirs(world);
}

/**
 * The pilot's hand on one of the two arrows, off the wire.
 *
 * A drag reports how far the hand has come from where it grabbed, in
 * thousandths of a tile (`touchDown`, render/touch.ts). Only its **sign and
 * magnitude** matter here — the arrow does not travel, it is a switch a hand
 * throws — so what this asks is whether the pull has passed `choirPullMilli`
 * and which way. A lift carries no distance and says nothing: an arrow that
 * was never carried far enough is an arrow nobody moved.
 */
export function choirArrowHeard(world: World, player: 1 | 2, command: Command): void {
  if (player !== 1 || command.kind !== "drag") return;
  if (command.target !== "choirLeft" && command.target !== "choirRight") return;
  if (!command.on) return;
  const side: ChoirSide = command.target === "choirLeft" ? -1 : 1;
  const far = world.cfg.choirPullMilli;
  if (command.fromMilli <= -far) choirPulled(world, side, -1);
  else if (command.fromMilli >= far) choirPulled(world, side, 1);
}
