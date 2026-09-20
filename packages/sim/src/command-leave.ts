import type { TimedCommand } from "./command-types.js";
import { closeGauge } from "./gauge-round.js";
import { endPrime } from "./lance.js";
import { closePinball } from "./pinball-round.js";
import { endRun, resetRun } from "./run.js";
import { endCharge } from "./shot-charge.js";
import { closeSnake } from "./snake-round.js";
import type { World } from "./world.js";

/**
 * **The two presses that leave a run**, read above every lock a boss or a
 * fault puts on a press: a run nobody can leave is worse than a boss whose
 * grip was escaped, and a pair frozen out of these is a pair who cannot put
 * the phone down.
 *
 * Its own file since 20 September 2026, when QUIT became the second of them
 * and `commands.ts` went over its ceiling. They belong together anyway: what
 * each of them has to put down before it goes is the same argument made
 * twice, and `applyCommand` below is a switch over what a press does to a
 * wave rather than to the run holding it.
 */

/** Whether this press was one of the two, and dealt with. */
export function leaveHeard(world: World, timed: TimedCommand): boolean {
  const c = timed.command;
  if (c.kind === "restart") {
    // The sim clears the run and then asks for a queue. It cannot build one
    // itself: waves live in content/, and content points at sim, not back.
    resetRun(world);
    // A run that is being left takes the lobe with it. Nothing else clears a
    // fill, so one left standing would arm the first shot of the next run.
    endPrime(world);
    // And the shot already pressed and not yet out, for the same reason one
    // step further on: a run being left is not a run that owes anybody a bolt,
    // and the host does not answer `needWave` on the same tick it is asked, so
    // there are ticks in between for a charge to go out into (`shot-charge.ts`).
    endCharge(world);
    // And the column a lance was still burning, for the same reason: a run
    // being left is not a run with a beam standing in it (`lance.ts`).
    world.beam = null;
    // And the three rounds that take the whole picture, for the third time
    // the same argument: a run being left is not a run standing at a dial, in
    // an arena or over a table. Only those three — every other boss goes when
    // `startWave` installs the next wave's, and none of the others holds the
    // whole of `step` in the ticks before it gets there.
    closeGauge(world);
    closeSnake(world);
    closePinball(world);
    world.events.push({ type: "needWave", wave: 0 });
    return true;
  }
  if (c.kind !== "quit") return false;
  // **A seat may leave a wave it has not lost.** QUIT was the lost screen's
  // word and nothing else's until 20 September 2026, so the question the
  // phone's back gesture now asks over a live field — the menu, quit, keep
  // playing (`apps/game/src/back-ask.ts`) — had no way of meaning the middle
  // one on the *other* phone. It is the same command and the same event as
  // the screen's (`wave-fail.ts`), read here because that file only runs
  // while a hit is holding the field.
  //
  // Once only: solo, both seats' presses arrive on the same tick
  // (`apps/game/src/quit.ts`), and the second would otherwise rename who quit.
  if (world.over) return true;
  endRun(world);
  world.events.push({ type: "quit", player: timed.player });
  return true;
}
