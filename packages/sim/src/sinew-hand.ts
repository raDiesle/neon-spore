import { type SinewState, sinewBoss, sinewCatching, sinewHeld, sinewSwinging } from "./sinew.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The two hands on THE SINEW**, off the wire, on the tick.
 *
 * Cut off `sinew-step.ts` at the seam `balloon-pull.ts` names: next door is
 * what the *tendon* does on the beat — the hold, the part, the snap — and
 * this is what the *hands* do, which is the half with the coupling in it.
 * On the tick rather than the beat (`step.ts`), because a pull that waited
 * for the beat to register would be a thumb the other seat's readout lagged
 * behind.
 *
 * **A side per seat, fixed, and never negotiated**, for the balloon's
 * reason: `sinewLeft` is player 1's and `sinewRight` player 2's, so the only
 * thing left to say out loud is *how hard*, which is the question this boss
 * exists to make the pair ask.
 */

/** The column the ear pans a hand's events on: its handle's side of the mass. */
function handCol(world: World, s: SinewState, player: 1 | 2): number {
  const col = s.massCol + (player === 1 ? -1 : 1);
  return Math.max(0, Math.min(world.cfg.cols - 1, col));
}

/** One hand off its handle, however it happened — lifted, or thrown off by a
 * snap (`sinew-step.ts`). Both off resets the slack: the re-grip is the verb. */
export function releaseSinew(world: World, s: SinewState, player: 1 | 2): void {
  if (!sinewHeld(s, player)) return;
  if (player === 1) {
    s.pullP1Milli = -1;
    s.swayP1Milli = 0;
  } else {
    s.pullP2Milli = -1;
    s.swayP2Milli = 0;
  }
  if (!sinewHeld(s, 1) && !sinewHeld(s, 2)) s.slackMilli = 0;
  world.events.push({ type: "sinewRelease", player, col: handCol(world, s, player) });
}

/**
 * One seat's hand on one of the two handles, off the wire.
 *
 * Which target belongs to which seat is checked here rather than at the hit
 * test, for `balloonHeard`'s reason: a device that decided for itself whose
 * gesture a message was would be a device the other one cannot check.
 * `fromYMilli` is how far *down* the hand has come from where it grabbed
 * and `fromMilli` how far sideways, both cut to `sinewReachMilli`; a pull
 * upward is no pull.
 *
 * **A swinging handle is taken hold of sideways only.** A hand may land on one
 * while the snap-back is still whipping it, but its pull is pinned to nought
 * for as long as that lasts: nobody hauls on a rope that is not there yet.
 * What the sway is for in those beats is `catchSinew` below.
 */
export function sinewHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const side = command.target === "sinewLeft" ? 1 : command.target === "sinewRight" ? 2 : null;
  if (side === null || side !== player) return;
  const s = sinewBoss(world);
  if (s === null) return;
  if (!command.on) {
    releaseSinew(world, s, player);
    return;
  }
  if (s.outBeat >= 0) return;
  const reach = world.cfg.sinewReachMilli;
  const whipped = sinewSwinging(s, world);
  const pull = whipped ? 0 : Math.max(0, Math.min(reach, Math.round(command.fromYMilli ?? 0)));
  const sway = Math.max(-reach, Math.min(reach, Math.round(command.fromMilli)));
  if (!sinewHeld(s, player))
    world.events.push({ type: "sinewGrip", player, col: handCol(world, s, player) });
  if (player === 1) {
    s.pullP1Milli = pull;
    s.swayP1Milli = sway;
  } else {
    s.pullP2Milli = pull;
    s.swayP2Milli = sway;
  }
}

/**
 * **The catch**, on the beat, while the handles are swinging
 * (`sinew-step.ts`).
 *
 * Both hands on and carried outward past `sinewCatchMilli` and the snap-back
 * is over on this beat rather than on its last: the swing's clock is thrown
 * away, the slack goes with it, and the pair pulls again from here. Uncaught,
 * the swing runs exactly the beats it always did, so the gesture only ever
 * buys time and never costs any — which is what lets it be asked for in the
 * one state where neither player has anything else to do.
 *
 * The slack is the second half of the reward and the honest one: it is what
 * both hands letting go would have cleared, and a pair that caught the tendon
 * never let go.
 */
export function catchSinew(world: World, s: SinewState): void {
  if (!sinewCatching(s, world.cfg)) return;
  s.snapBeat = -1;
  s.catchBeat = world.beat;
  s.slackMilli = 0;
  world.events.push({ type: "sinewCatch", col: s.massCol });
}
