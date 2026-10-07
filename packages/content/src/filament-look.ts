import type { HaloedOpts } from "./haloed.js";
import type { StuddedOpts } from "./studded.js";

/**
 * **THE FILAMENT as the inside of an alien** — the owner, 25 September 2026:
 * *maybe some alien which needs to be defeated, e.g. its the inner of its
 * body and the vene to travel with some weapon. and the other player needs
 * some other tool or weapon to carry behind. and when both reach … the
 * hearth inside, then both weapons are applied.*
 *
 * So the body over the field is a heart, each filament is a vein into it,
 * and each thumb carries a tool up the vein. The heart is an organ modelled
 * in three dimensions since 7 October 2026 (`packages/render/src/
 * filament-heart-rig.ts`); the two tools are shapes the game had not drawn
 * (`CLAUDE.md`):
 *
 * - **Player 1's rasp** is THE RASP (`tower-defence.ts`): a burr of short
 *   spines that turns as it bores, the thumb that cuts the way.
 * - **Player 2's corona** is THE CORONA (`tower-defence.ts`): a ring of
 *   nodes that turns, with one wide gap — the charge carried behind.
 *
 * The numbers are the cards', moved here when the game took them, which is
 * what `taken` means (`tools/shape-sheet/src/catalogue.ts`).
 */

/** THE RASP's card, at the sheet's size; the drawer scales it to a ring. */
export const FILAMENT_RASP: StuddedOpts = {
  rx: 44,
  ry: 42,
  studs: 20,
  reach: 0.26,
  width: 0.34,
  blunt: 0.0,
  lobes: 3,
  depth: 0.04,
  seed: 6.7,
};

/** THE CORONA's card, at the sheet's size. */
export const FILAMENT_CORONA: HaloedOpts = {
  r: 96,
  // Wide: `ring.test.ts` holds a ring to enclosing its material rather than
  // its opening, and a band this thin is also truer to the source, which is a
  // small core inside a wide circle of satellites.
  hole: 0.56,
  nodes: 11,
  bump: 0.2,
  // A shade under a fifth of a turn per beat, on the card: the gap comes round
  // in about six beats. On a thumb it is turned by the drawer as well.
  spin: 0.19,
  missing: 2,
  seed: 8.3,
};
