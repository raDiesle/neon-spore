import {
  type DiastoleState,
  diastoleChamberCol,
  diastoleContracts,
  enterDiastole,
} from "./diastole.js";
import { clearDiastoleClamp, diastoleClamped, diastoleClampSeat } from "./diastole-open.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The one hand on THE DIASTOLE**: the clamp, player 1's thumb on the right
 * chamber while it beats alone, off the wire, on the tick.
 *
 * Cut off `diastole-step.ts` at the seam `stare-hand.ts` names: next door is
 * what the *hearts* do on the beat, and this is what the *thumb* does,
 * which is the half with the coupling in it. On the tick rather than the
 * beat (`boss-hands.ts`), because *now* is said on a tick and a clamp that
 * waited for the beat to land would land on the one after the beat that was
 * said.
 *
 * **Whose thumb is not a side, it is the split.** The right chamber is
 * player 2's — his screen is the one that draws it beating — and that is
 * exactly why the clamp is not his: the seat that can see the beat has to
 * say it, and the seat that cannot has to act on the word, or the boss is
 * one person counting alone with a partner watching. Player 1's screen shows
 * the right chamber grey (`render/diastole-draw.ts`), and the look lane
 * draws the ring over the grey for him only. Player 2's press on the same
 * name is dropped without a sound, `queen-hand.ts`' way: his screen never
 * draws the handle, so there is nothing to refuse.
 *
 * **What the clamp does** (`diastole-open.ts` says why there is one):
 *
 * - **A press on a contraction, or the beat before one**, catches it: the
 *   chamber is held open from that contraction for `diastoleClampBeats`,
 *   and the beam lands under it. A beat early is allowed because *now* is
 *   said a little before it is meant, and a thumb is slower than a word.
 * - **A press on any other beat** is a clamp on a slack chamber, and the
 *   chamber goes into `spasm`: `diastoleSpasmBeats` in which it does not
 *   beat and nothing lands, then `alone` again with its count re-anchored.
 * - **A thumb still down when the window has passed** is the same fault by
 *   another road — a chamber held shut past its beat — and the same spasm.
 *   A thumb lifted inside the window costs nothing: the clamp is simply
 *   gone, and the beam it was holding the beat open for has to have landed.
 * - **A beam landing under the clamp lets it go** (`diastole-step.ts`), so
 *   the thumb still on the chamber is not a hold outliving its window.
 *
 * Nothing here charges the hull: the cost of a wrong clamp is eight beats
 * of a boss that cannot be hurt, which on a fight of counts is the cost
 * that means something.
 */

export function diastoleHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "diastoleChamber") return;
  if (player !== diastoleClampSeat) return;
  const b = world.boss;
  if (b === null || b.kind !== "diastole" || b.phase !== "alone") return;
  if (!command.on) {
    clearDiastoleClamp(b);
    return;
  }
  if (diastoleClamped(b)) return;
  const beat = world.beat;
  const caught = diastoleContracts(b, beat, 1)
    ? beat
    : diastoleContracts(b, beat + 1, 1)
      ? beat + 1
      : -1;
  if (caught === -1) {
    spasm(world, b);
    return;
  }
  b.clampBeat = caught;
  b.clampUntil = caught + world.cfg.diastoleClampBeats;
  world.events.push({ type: "diastoleClamp", col: diastoleChamberCol(world.cfg, 1), player });
}

/**
 * The clamp's own clock, on the beat from `stepDiastole`: a spasm running
 * out, and a clamp held past its window. Nothing in any other phase.
 */
export function stepDiastoleClamp(world: World, b: DiastoleState): void {
  if (b.phase === "spasm") {
    // Back to `alone`, re-anchored: the chamber contracts on this beat, and
    // the count the pair kept through the silence starts again from here.
    if (world.beat - b.phaseBeat >= world.cfg.diastoleSpasmBeats)
      enterDiastole(b, "alone", world.beat);
    return;
  }
  if (b.phase !== "alone") return;
  if (diastoleClamped(b) && world.beat >= b.clampUntil) spasm(world, b);
}

function spasm(world: World, b: DiastoleState): void {
  clearDiastoleClamp(b);
  enterDiastole(b, "spasm", world.beat);
  world.events.push({ type: "diastoleSpasm", col: diastoleChamberCol(world.cfg, 1) });
}
