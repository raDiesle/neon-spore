import * as look from "../../../../../packages/render/src/handover-look.js";
import { patch, type Variant } from "../../../variant.js";
import { tradedHull } from "./paint.js";

/**
 * `handover:notice` / `hull` — the ship announces the trade as well as the plate.
 *
 * **What the shipped side is.** THE HANDOVER is told by a plate on the lip of
 * the band: `PANELS TRADE IN 2`, `1`, then `THEIR PANEL — BACK IN 8` counting
 * down while the panels are away, in the fault's arc-blue, flashing on the
 * beat. Under it the band has already come up in the other seat's colours
 * with the other seat's buttons, and the hull has changed colour with it
 * (`handover-look.ts`, `handover.ts`).
 *
 * **What this argues.** That an exchange is a thing the ship can *do* rather
 * than a thing a plate can only say. The shape-sheet drew `HULL · TRADED` for
 * the idea before it was built — two lobes on the hull handing one height back
 * and forth, a moment each turn when they are equal and nobody owns anything —
 * and this is that motion on the real hull, in the seat's own skin, for the
 * length of the window: rising over the two warning beats, turning while the
 * panels are away, gone over the hold's last beat. The plate stays; the pair
 * is judging the two together.
 *
 * **How it can lose.** *One signal too many.* By the trade beat the band has
 * changed colour, the buttons have changed, the plate is flashing and the
 * beam is on the panel — a fifth thing moving may be noise, not news. And a
 * raised lobe already means *the shield* on this hull: two more, a column and
 * a half either side of the middle, may read as shields in the wrong columns
 * rather than as the ship trading anything.
 */
export const HANDOVER_HULL: Variant = {
  slot: "handover:notice",
  name: "hull",
  sentence:
    "the shipped plate, and under it two lobes on the hull handing one height back and forth for the length of the window — the shape-sheet's HULL · TRADED on the real ship",
  dir: "tools/versus/candidates/handover-notice/hull",
  patches: [
    patch({
      target: look.HANDOVER_LOOK,
      reached: () => look.HANDOVER_LOOK,
      where: { file: "packages/render/src/handover-look.ts", symbol: "HANDOVER_LOOK" },
      fields: { announce: tradedHull },
    }),
  ],
};
