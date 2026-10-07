import { type LedgerState, ledgerSeamCol, ledgerVerdict, type World } from "@neon-spore/sim";
import type { BoltHit, Stopper } from "./bolt-stop.js";
import { lowestFoot, outlineFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { ledgerBodyY, ledgerHalfPoints } from "./ledger-shape.js";
import { ledgerLeaned } from "./ledger-sway.js";

/**
 * **Where a bolt meets THE LEDGER**, for `BoltStops` (`bolt-stop.ts`): the
 * underside of the two halves as drawn, `gap` apart about `seamX` and moved
 * `shake` with the blow of a hit, over the three columns the plating covers;
 * and what the simulation will say of it (`ledgerVerdict`).
 *
 * The body reaches down into the field, so a bolt meets it below the top row
 * and is drawn no further. Up the seam's column it meets the seam's mouth at
 * the body's underside — the split the halves stand apart about — a burst in
 * the colour it wants, a scuff in the other, and a scuff while the cord is
 * still rooting. Up a flanking column it meets the plating: a scuff. Past
 * the plating it meets nothing, though a bolt up the cord's column is drawn
 * across the cord on its way: a look, and not fixed here. The plating is
 * met as it leans (`ledger-sway.ts`); the mouth, on the underside, does not.
 */
export function ledgerStopper(
  l: Layout,
  world: World,
  t: LedgerState,
  seamX: number,
  gap: number,
  shake: number,
  time: number,
  lean = 0,
): Stopper {
  const mouth = ledgerBodyY(l).bottom;
  const half = (side: -1 | 1) =>
    ledgerHalfPoints(l, seamX, side, gap, time).map((p) => ledgerLeaned(p, lean, mouth));
  const foot = lowestFoot([outlineFoot(half(-1), shake), outlineFoot(half(1), shake)]);
  const seam = ledgerSeamCol(t, world.cfg);
  return (col, x, color) => {
    const v = ledgerVerdict(world, col, color);
    if (v === null) return null;
    const hit: BoltHit = v === "target" || v === "wrong" ? v : "body";
    return { y: col === seam ? mouth : (foot(x) ?? mouth), hit };
  };
}
