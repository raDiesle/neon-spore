import { type GorgeState, gorgeBoss, gorgeFull } from "./gorge.js";
import { gorgeSlow } from "./gorge-slow.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The two hands on THE GORGE**: player 1's pinch on a full intake and
 * player 2's pry on the mouth, off the wire, on the tick.
 *
 * Cut off `gorge-step.ts` at the seam `diastole-hand.ts` names: next door is
 * what the *sack* does on the beat, and this is what the *thumbs* do, which
 * is the half with the coupling in it. On the tick rather than the beat
 * (`boss-hands.ts`), because a vent is on the beat and a pinch that waited
 * for the beat to land would land on the intake already torching its column.
 *
 * **One name, and whose thumb it is says the gesture.** `gorgeLobe` with
 * `id` the intake, and the seat does the rest:
 *
 * - **Player 1 on a full, unruptured intake that is not the mouth** is a
 *   **pinch**: the intake does not vent while the thumb stays. His, because
 *   the pilot is the seat holding the cannon on the column and watching the
 *   fill go transparent, and the navigator is the seat still loading the
 *   shots that pierce it — the fight before the pinch was a four-beat window
 *   the pair had to beat with a word and a reload, and the pinch is the
 *   pilot saying *I have it, take your time* with his other thumb. When the
 *   thumb lifts, the vent count starts again **from the lift** (`vent()`),
 *   so a pinch is a pause and not a pardon: the intake still torches
 *   `gorgeVentBeats` after the pilot lets go.
 * - **Player 2 on the mouth, once there is one,** is a **pry**: the mouth is
 *   held open for `gorgePryBeats`, and `gorgePryFills` beams in its colour end
 *   the fight *only inside that window* (`gorgeStruck`) — without it the mouth
 *   **clenches** on the beam, which goes in as nothing. Held past the window
 *   the mouth clenches on the thumb instead: the pry is thrown off and a bead
 *   spat (`gorge-pry.ts`), so a pry is a thing to take *late*, with the beam
 *   already filling in the other hand. His, because the mouth is the one
 *   intake the navigator is shown the colour of and the pilot is not
 *   (`gorgeNearestFull`), and the pry is the seat that knows the colour
 *   committing to it under his thumb while the pilot fires.
 *
 * Every other press on the name is dropped without a sound, `queen-hand.ts`'
 * way: the other seat's screen never draws that ring, so there is nothing to
 * refuse. Nothing here charges the hull or the balance: the cost of a pry
 * taken too soon is a bead back on the field and a lift, and the cost of a
 * pinch forgotten is the torch it was holding off.
 */

export const gorgePinchSeat = 1;
export const gorgePrySeat = 2;

export function gorgeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "gorgeLobe") return;
  const g = gorgeBoss(world);
  if (g === null || g.outBeat >= 0) return;
  if (player === gorgePinchSeat) pinch(world, g, command.id ?? -1, command.on);
  else pry(world, g, command.id ?? -1, command.on);
  gorgeSlow(world, g);
}

function pinch(world: World, g: GorgeState, i: number, on: boolean): void {
  if (!on) {
    // The lift restarts the count: the intake is as full as it was, and has
    // `gorgeVentBeats` from here (`vent()` reads `fullBeat`).
    const k = g.intakes[g.pinch];
    if (k !== undefined && gorgeFull(k, world.cfg)) k.fullBeat = world.beat;
    g.pinch = -1;
    return;
  }
  if (g.pinch >= 0 || i === g.mouth) return;
  const k = g.intakes[i];
  if (k === undefined || !gorgeFull(k, world.cfg)) return;
  g.pinch = i;
  world.events.push({ type: "gorgePinch", col: g.col + i });
}

function pry(world: World, g: GorgeState, i: number, on: boolean): void {
  if (!on) {
    g.pry = -1;
    g.pryBeat = -1;
    g.pryFills = 0;
    return;
  }
  if (g.pry >= 0 || g.mouth < 0 || i !== g.mouth) return;
  g.pry = i;
  g.pryBeat = world.beat;
  g.pryFills = 0;
  world.events.push({ type: "gorgePry", col: g.col + i });
}
