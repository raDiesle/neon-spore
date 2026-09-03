import { launchBall, type PinballState } from "./pinball.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * The three verbs of the round, and the two seats they are split between.
 *
 * Player 1 slides the bucket and latches the needle; player 2 fires on the
 * bar. The seat check is a rule of the simulation rather than a coat of paint
 * on the picture, for the reason THE GAUGE's and SNAKE's are: a pilot who
 * could also launch would be playing both halves of a shot whose whole content
 * is that he cannot, and both devices have to agree exactly which presses
 * counted.
 *
 * **Two presses, and each of them does the thing its screen is showing.** SET
 * freezes the needle where it stands and the bar starts; FIRE launches on the
 * bar, that tick, at the strength the bar is at. There is no mode to explain
 * and no press that only unlocks another press — the one that used to, player
 * 2's opening of the sweep, was taken out because the needle was already
 * walking when it arrived (`pinball.ts`).
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
    // The angle is frozen by leaving `aim`: nothing steps `angleMilli` in any
    // other shot, so the needle stops on the tick this arrives.
    if (player !== 1 || state.shot !== "aim") return;
    state.shot = "power";
    return;
  }
  if (command.kind !== "launch" || player !== 2) return;
  // Only on the bar. During the sweep the navigator has nothing to press, and
  // a button that quietly did nothing would be worse than one that is not
  // theirs yet — which is what the picture says instead.
  if (state.shot === "power") launchBall(world, state);
}
