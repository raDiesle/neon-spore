import { FLEET_SHELL_BEATS, type SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **What THE FLEET sounds like**: a salvo leaving the cannon, and the water,
 * the metal or the hull it reaches two beats later.
 *
 * Its own file rather than five more cases in `bind.ts`, which is at its
 * limit, and along a seam this boss already cuts everywhere else — the
 * simulation keeps it in `fleet.ts`, the picture in five `fleet-*.ts` files.
 * It is `bind-volley.ts`'s arrangement next door and it earns it more sharply
 * than any of them: these five carry more of the fight than any other row in
 * the catalogue.
 *
 * **The ear is doing the navigator's seeing.** They hold the sights and are
 * shown nothing but water, so every one of these is panned to its column and
 * pitched to its row — the only place in the game where that pairing is
 * load-bearing rather than decoration (`fleet-hulls.ts`).
 *
 * **The launch sounds where the press is; everything else sounds where it
 * lands.** The shell is drawn arcing over the chart for `FLEET_SHELL_BEATS`
 * (`fleet-shell.ts`), so the four that report an arrival are held back by
 * exactly that and the one that reports a trigger is not. Without the split
 * the pilot would pull a trigger into silence and hear the water close over a
 * shell that was still climbing.
 */
export function fleetCue(
  e: Extract<
    SimEvent,
    { type: "fleetSalvo" | "fleetSplash" | "fleetHit" | "fleetSunk" | "fleetDown" }
  >,
  cols: number,
  rows: number,
): Cue {
  const pan = panForCol(e.col, cols);
  if (e.type === "fleetSalvo") return { id: "boss.fleetLaunch", pan };
  if (e.type === "fleetSplash") {
    return {
      id: "boss.fleetSplash",
      pan,
      pitch: pitchForRow(e.row, rows),
      delayBeats: FLEET_SHELL_BEATS,
    };
  }
  if (e.type === "fleetHit") {
    return {
      id: "boss.fleetHit",
      pan,
      pitch: pitchForRow(e.row, rows),
      delayBeats: FLEET_SHELL_BEATS,
    };
  }
  // A hull going down, and the chart going clear. Neither is pitched: they are
  // about a ship and about the fight, not about a square, and a pitch would be
  // heard as one more coordinate at the moment nobody needs another.
  const id = e.type === "fleetSunk" ? "boss.fleetSunk" : "boss.fleetDown";
  return { id, pan, delayBeats: FLEET_SHELL_BEATS };
}
