import { mawOpen } from "./pod-intake.js";
import { reachesShip } from "./ship-verbs.js";
import type { TimedCommand } from "./types.js";
import {
  type UndertowBreach,
  type UndertowState,
  undertowBoss,
  undertowLobeAt,
  undertowPinned,
  undertowUnseated,
} from "./undertow.js";
import { undertowSlow } from "./undertow-slow.js";
import type { World } from "./world.js";

/**
 * THE UNDERTOW's presses: the maw, the beam and the unseat.
 *
 * All three happen on the **tick**, from wherever the press arrives —
 * `commands.ts` for the maw, `lance-burn.ts` for the beam — because an answer
 * that waited for the next beat would put a queue between *now* and the
 * taking. The clock that sets the questions is `undertow-step.ts`.
 */

/**
 * The maw over a lobe, or the beam through one. Called from the beat as well
 * as the tick — a maw already open when the lobe stands takes it that beat —
 * so the rule is written once.
 *
 * **The plate covers the breach.** A shield standing on the column stops it
 * widening and, for the same reason, keeps the maw out of it: the pair has to
 * decide which seat has the column, which is the whole of part two. **Her
 * thumb is the same plate** (`undertowPinned`, `undertow-hand.ts`) — which is
 * what makes the pin a sentence rather than a free win, because the column she
 * is holding shut is a column he cannot take until she says so. A tall lobe is
 * the beam's alone.
 *
 * The last lobe is not taken, it is *held*: `undertow-step.ts` counts the
 * beats the maw is open under it.
 */
export function undertowTake(
  world: World,
  u: UndertowState,
  b: UndertowBreach,
  beam: boolean,
): boolean {
  if (u.phase === "last") return false;
  if (!beam) {
    if (b.tall || world.shieldCol === b.col || undertowPinned(u, b.col)) return false;
    if (world.cannonCol !== b.col || !mawOpen(world)) return false;
  }
  const i = u.breaches.indexOf(b);
  if (i >= 0) u.breaches.splice(i, 1);
  u.taken += 1;
  world.events.push({ type: "undertowTaken", col: b.col });
  undertowSlow(world, u);
  return true;
}

/**
 * **Player 1's maw**, from `commands.ts` on the `intake` press, after
 * `intakeTick` is set so `mawOpen` reads true. A no-op unless THE UNDERTOW is
 * installed and a lobe stands under the cannon.
 */
export function undertowIntake(world: World): void {
  const u = undertowBoss(world);
  if (u === null) return;
  const b = undertowLobeAt(u, world.cannonCol);
  if (b !== null) undertowTake(world, u, b, false);
}

/**
 * **The beam**, from `releaseLance` after the column burnt: a beam standing
 * in a column burns the floor of it too, which is the only thing in the game
 * that reaches a tall lobe. The plate does not keep the beam out — it is
 * light, not a mouth.
 */
export function undertowBurned(world: World, col: number): void {
  const u = undertowBoss(world);
  if (u === null) return;
  const b = undertowLobeAt(u, col);
  if (b !== null) undertowTake(world, u, b, true);
}

/**
 * **The floor follows the cannon**, on the beat, while it bows under it: a
 * slide short of `undertowUnseatSlides` bows it again under the column the
 * carriage stopped in, inside the same window, and says so with the bow's own
 * event. The last slide is answered where it always was — the cannon off the
 * bow when it parts (`undertow-step.ts`, `through`).
 */
export function undertowFollow(world: World, u: UndertowState, b: UndertowBreach): void {
  if (world.cannonCol === b.col || u.slid + 1 >= world.cfg.undertowUnseatSlides) return;
  u.slid += 1;
  b.col = world.cannonCol;
  world.events.push({ type: "undertowBow", col: b.col });
}

/**
 * **The unseat**, asked in `applyCommand` above the switch beside
 * `batonLocks`. The floor came up under the cannon and player 1 did not slide
 * off it: his seat is dead for `undertowUnseatedBeats`, every verb that
 * reaches the ship swallowed, silently — he was shown the bow and stayed.
 * Player 2 is untouched. The rehearsal's `restart` is not a verb of the ship
 * and gets through, as it does under every other lock.
 */
export function undertowUnseats(world: World, timed: TimedCommand): boolean {
  const u = undertowBoss(world);
  if (u === null || timed.player !== 1) return false;
  if (!undertowUnseated(u, world.beat)) return false;
  return reachesShip(timed.command);
}
