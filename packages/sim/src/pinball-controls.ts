import { launchBall, type PinballState } from "./pinball.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * The three verbs of the round, and the two seats they are split between.
 *
 * Player 1 slides the bucket and latches the needle; player 2 opens the sweep
 * and launches on the bar. The seat check is a rule of the simulation rather
 * than a coat of paint on the picture, for the reason THE GAUGE's and SNAKE's
 * are: a pilot who could also launch would be playing both halves of a shot
 * whose whole content is that he cannot, and both devices have to agree
 * exactly which presses counted.
 *
 * **One button, two meanings, and the phase decides which.** `launch` opens
 * the sweep while the shot is at `aim` and fires it at `power` — one wide slab
 * on player 2's screen and no mode to explain, because the thing it is about
 * to do is the thing their screen is currently showing. A second button would
 * be a second thing to be pressed at the wrong moment.
 *
 * **Nothing either of them can press reaches a ball already in the air.** That
 * is the round's one piece of held breath: an aim is argued over for as long
 * as the pair likes and then it is out of their hands, and the only thing left
 * to do about it is get the bucket underneath. It is also why the bucket's
 * slabs are the one control that answers during flight.
 */

export function pinballHeard(
  world: World,
  state: PinballState,
  player: 1 | 2,
  command: Command,
): void {
  if (command.kind === "slide") {
    // The pilot's, because the bucket is the ship — it is the hull and the
    // cannon folded together, and it stays in the hand that held both.
    if (player !== 1) return;
    state.slideDir = command.on ? command.dir : 0;
    return;
  }
  if (command.kind === "latch") {
    // The pilot's too, and the pairing is the point: the seat that chose
    // *where from* also chooses *which way*, so one player's half of an aim is
    // a place and a direction and the other's is a moment and a strength.
    if (player !== 1 || state.shot !== "aim" || !state.armed) return;
    state.shot = "power";
    return;
  }
  if (command.kind !== "launch" || player !== 2) return;
  if (state.shot === "aim") {
    // The needle is already walking — it does that from the moment the shot
    // resets, so both screens show the same arc before anybody has pressed
    // anything. What this press does is hand the latch to player 1
    // (`PinballState.armed`).
    state.armed = true;
    return;
  }
  if (state.shot === "power") launchBall(world, state);
}
