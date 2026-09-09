import * as join from "../../../../../packages/render/src/band-join.js";
import { patch, type Variant } from "../../../variant.js";
import { welded } from "./paint.js";
import { saggingRoof } from "./tissue.js";

/**
 * `panel:ship-join` / `fused` — BOTH, with the three things the owner said
 * about it answered.
 *
 * He looked at BOTH and liked the idea of it — *the idea to connect the ship
 * visual with the buttons that they belong together* — and named three faults
 * in one breath: the top left is not connected properly, the panel has no
 * gradient where the ship above it has a strong one, and the rounder shapes of
 * ROOF read better than the shipped card's cones. This is that card with all
 * three taken seriously and nothing else changed, so it is the answer to have
 * if what was wrong with BOTH was only that it was wrong.
 *
 * **Welded rather than placed.** Every trunk starts above the highest the
 * membrane can reach and is trimmed by the chamber's own clip, so there is no x
 * at which a top edge can come away from the roof. `tissue.ts` argues that at
 * length; it is the one defect on this card that was a defect rather than a
 * preference.
 *
 * **Round because the curve is round.** A trunk is a width profile sampled down
 * its length and splined, not four bezier segments between placed points, so
 * the shoulder is a curve at every scale instead of a ruled diagonal that
 * happens to end in one.
 *
 * **The ship's ramp keeps going.** The wash carries the belly's own pale down
 * through most of the chamber, which is the owner's second option — *have
 * gradient flowing into control panel more so there is no visual difference
 * when going top to bottom* — taken rather than his first, because a candidate
 * here may paint the panel and may not repaint the ship.
 *
 * **And the roof leans on what hangs from it.** The membrane sags over every
 * control, which is what a sheet of tissue with an organ on it does and what a
 * ceiling with a pipe under it does not.
 *
 * How it can lose: it is still five separate stalks, and five of anything reads
 * as a set of things rather than as one body. CAUL and SAC are the two cards
 * that say so.
 */
export const JOIN_FUSED: Variant = {
  slot: "panel:ship-join",
  name: "fused",
  sentence:
    "BOTH with its faults taken out — every trunk welded into the roof by the chamber's own clip rather than started at a guessed height, round because its outline is a sampled profile, and the ship's own ramp carried down through the panel so there is no step at the join",
  dir: "tools/versus/candidates/panel-join/fused",
  patches: [
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: saggingRoof(3.4, 0.4), attach: welded },
    }),
  ],
};
