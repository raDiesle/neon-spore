import { midCol } from "./config.js";
import {
  type OculusState,
  oculusBoss,
  oculusBothHeld,
  oculusHolding,
  oculusLitStep,
} from "./oculus.js";
import { rimLapMilli, rimTurnMilli } from "./rim-turn.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two thumbs on THE OCULUS, one leaf each.
 *
 * **Geometry says whose leaf is whose**, THE MANTLE's rule (`mantle-hand.ts`):
 * `oculusLeafLeft` answers only Player 1 and `oculusLeafRight` only Player 2,
 * and the wrong seat's thumb does nothing, silently.
 *
 * A leaf is recorded down or up whenever the lens is present, so a pair that
 * were already holding when a step lights are counted from its first tick.
 * The three levels read the same leaf three ways:
 *
 * - **a hold** is the leaf down; what it is worth is counted on the tick
 *   (`oculus-level.ts`). A thumb lifting while both were down is said — the
 *   mark goes red — and **the count stands**: the owner, 2 October 2026,
 *   *it should keep current position of process, and not start again*;
 * - **a tap** is the leaf going down: each press while a tap is lit is one;
 * - **a turn** is the leaf carried round the rim, the leaf being the lever:
 *   `fromMilli` is how far round from where it was taken, THE MAZE's string
 *   (`maze-controls.ts`), and only the way forward counts, and only while
 *   both levers are taken.
 */
export function oculusHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "oculusLeafLeft" && command.target !== "oculusLeafRight") return;
  const s = oculusBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "oculusLeafLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  const wasBoth = oculusBothHeld(s);
  const wasDown = s.held[side];
  s.held[side] = command.on;
  const step = oculusLitStep(s);
  if (!command.on) {
    if (wasBoth && oculusHolding(s)) {
      world.events.push({ type: "oculusSlip", seat: player, col: midCol(world.cfg) });
    }
    return;
  }
  if (!wasDown) {
    // Taken: the lever's travel is measured from here, and a tap is this press.
    s.leverAt[side] = command.fromMilli;
    s.leverBest[side] = command.fromMilli;
    if (step?.ask === "tap") s.taps[side] += 1;
    return;
  }
  if (step?.ask === "turn") carried(world, s, side, command.fromMilli);
}

/**
 * A lever carried on. The thumb's reading is an angle about the lens, so it
 * comes back round to where it began each lap; the step from the last place
 * is taken as the short way round, and `leverAt` keeps the whole way. The
 * furthest it has come is the ratchet: back and forward again over the same
 * arc turns nothing twice.
 */
function carried(world: World, s: OculusState, side: 0 | 1, from: number): void {
  const radius = world.cfg.oculusLeverRadiusMilli;
  const lap = rimLapMilli(radius);
  let moved = (from - s.leverAt[side]) % lap;
  if (moved > lap / 2) moved -= lap;
  if (moved < -lap / 2) moved += lap;
  s.leverAt[side] += moved;
  const gain = s.leverAt[side] - s.leverBest[side];
  if (gain <= 0) return;
  s.leverBest[side] = s.leverAt[side];
  if (oculusBothHeld(s)) s.turned[side] += rimTurnMilli(gain, radius);
}
