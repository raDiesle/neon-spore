import { antiphonBoss, antiphonDown, antiphonHeld } from "./antiphon.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **A thumb resting on THE ANTIPHON's organ**, off the wire, on the tick.
 *
 * The design's one gesture, and the one place on that page where a hand on
 * the boss is an aid rather than an action: while either seat rests a thumb
 * on the organ it **turns slowly in place**, a whole turn in
 * `antiphonTurnBeats`, and it stops where it is the moment the thumb lifts
 * (`docs/spec/bosses-choreographed.md` §12, *neither, and it is the one
 * concept that wants no time effect at all*). What the pair buys is a
 * second viewing angle — a shape being described can be looked at from
 * more than one — and nothing about the fight changes for it: no event, no
 * sound, no window shortened. The pilot's screen is where the organ is,
 * so his is the thumb that reaches it (`render/antiphon-grip.ts`); the
 * command carries `player` and the simulation keeps both, for THE SURGE's
 * reason — which seat sent it is the wire's fact, not the glass's.
 *
 * On the tick and not the beat, because the turn is a rotation a finger is
 * watching, and one that advanced a beat at a time would be a shape
 * snapping between eight orientations rather than turning.
 */

/** One seat's thumb on or off the organ. A hand is kept through the rest between cycles: the next organ turns under it from nought. */
export function antiphonHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "antiphonOrgan") return;
  const s = antiphonBoss(world);
  if (s === null || antiphonDown(s)) return;
  if (player === 1) s.heldP1 = command.on;
  else s.heldP2 = command.on;
}

/** The turn, a tick at a time, while a thumb rests and an organ stands to be turned. */
export function stepAntiphonTurn(world: World): void {
  const s = antiphonBoss(world);
  if (s === null || s.organs.length === 0) return;
  if (antiphonHeld(s, 1) || antiphonHeld(s, 2)) s.turnTicks += 1;
}
