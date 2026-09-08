import type { ViewRole } from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";

/**
 * **Both of THE BALLOON's handles off one mouse**, and only under TEST.
 *
 * The creature's whole gesture is two hands at one instant: the pilot carries
 * the handle on a balloon's left leftward, the navigator carries the one on
 * its right rightward, and the skin only gives while both are taut together
 * (`sim/balloon-pull.ts`). That is exactly right on two phones and impossible
 * at this desk — a stage has one pointer, `pointerSeat` hands it to player 1,
 * and player 1 can only ever reach the left handle. So the one creature in the
 * game built out of two seats was the one creature the editor could not watch
 * work.
 *
 * The answer is the smallest one that does not touch the game: **the desk's
 * one hand speaks for both**. A drag on either handle is sent as itself and
 * again as the other seat's, mirrored — the other handle travels the same
 * distance the opposite way, so the two come apart together and a pull far
 * enough on one side is a rub. Grab, carry and let go are all mirrored, so
 * the second hand arrives and leaves with the first and never stays behind on
 * a body the mouse has left.
 *
 * **TEST only, and that is the whole of the gate.** `p1` and `p2` are the
 * phone, one seat and one hand each; putting a second hand on the field there
 * would be the editor lying about the control scheme it exists to judge. Under
 * `test` both seats are already drawn on the one screen and both handles are
 * already lit as this screen's own (`render/balloon-handles.ts` — `l.role ===
 * "test"` is the same exception, made once already for the picture and now for
 * the finger).
 *
 * It sits in the director rather than in `touch.ts` for that reason: nothing
 * on a phone may learn this, and `packages/render` is what the phone runs.
 */
export function balloonBothHands(
  role: ViewRole,
  player: 1 | 2,
  command: Command,
): { player: 1 | 2; command: Command } | null {
  if (role !== "test" || command.kind !== "drag") return null;
  const other =
    command.target === "balloonLeft"
      ? "balloonRight"
      : command.target === "balloonRight"
        ? "balloonLeft"
        : null;
  if (other === null) return null;
  // The sign is the side: the pilot's handle counts only carried left and the
  // navigator's only carried right (`balloonSideTaut`), so the mirror is a
  // negation and not a copy. `fromYMilli` is left alone — the gesture has no
  // vertical half, and a mirrored one would be inventing a reading.
  // `|| 0` is not a default: negating nought gives negative nought, which is a
  // different value to every reader that compares one, and a grab reports
  // exactly nought (`balloonHeard`).
  return {
    player: player === 1 ? 2 : 1,
    command: { ...command, target: other, fromMilli: -command.fromMilli || 0 },
  };
}
