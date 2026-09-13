import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **The bodies a hand answers**, heard: THE WEIGHT giving between two thumbs
 * and THE CAIRN losing a unit either of the two ways it can.
 *
 * Cut out of `bind.ts` when THE CAIRN's two took that file over its length
 * limit, and along the seam three other packages have already drawn for this
 * exact family — `creature-kinds-handed.ts`, `creatures-handed.ts`,
 * `living-look-handed.ts`, `effects-spark-handed.ts`. What holds them together
 * is what does *not* answer them: neither control reaches any of these, so
 * every sound here is the ear's account of a **thumb** rather than of a shot,
 * and that is a different thing to be listening for.
 *
 * **Nothing here is a new sound.** Every cue below was in the catalogue
 * already, which is the claim these two creatures make about themselves: the
 * ordinary grip, the ordinary rock, and the ordinary price of a hand.
 */
export function handedCue(
  e: Extract<SimEvent, { type: "weightCrushed" | "cairnPulled" | "cairnShed" }>,
  cols: number,
  rows: number,
): Cue {
  const place = { pan: panForCol(e.col, cols), pitch: pitchForRow(e.row, rows) };
  // THE WEIGHT giving, and the one sound in the catalogue that was written for
  // this and filed spare: two grabs doubled and briefly in tune
  // (`sounds/grip.ts`). Placed by column and row like any body, because it is
  // also the only confirmation either player gets that the other one's thumb
  // was ever down.
  if (e.type === "weightCrushed") return { id: "ship.gripBoth", ...place };
  // A **pull** is `ship.gripCarry` — the sound a carried body already makes
  // when a hand spends a column on it, which is exactly what just happened:
  // the same gesture, the same price, and the rock is the thing that moved
  // instead of the lane. The grip's own file says why that matters: the other
  // player hears what a thumb is costing without being told.
  if (e.type === "cairnPulled") return { id: "ship.gripCarry", ...place };
  // A **shed** is `boss.torchDrop`, the queen's own sound for a rock let go
  // from a height — the one thing in the catalogue already written for a boss
  // dropping a stone nobody asked it to. Louder than the pull and out of a
  // different family on purpose: the pair has to be able to tell, without
  // looking, that the rock now falling is one neither of them chose
  // (`sim/cairn.ts`).
  return { id: "boss.torchDrop", ...place };
}
