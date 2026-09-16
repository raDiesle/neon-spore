import { hitFor } from "../../../../../packages/render/src/body-hit.js";
import { BREAK_LOOK } from "../../../../../packages/render/src/break-look.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:debris` / `drift` — the pieces leave slowly and fade in the air
 * instead of falling onto the ship and lying there.
 *
 * **What the shipped side is.** Nine wedges cut again at half their reach,
 * thrown at a tile and a fifth a second and pulled down at fourteen tiles a
 * second squared, so every piece is on the hull inside half a second and fades
 * where it landed. That was the owner's own answer on 9 September 2026 when he
 * was asked whether a break may leave anything behind.
 *
 * **What this argues.** That `systems.md` 5.6 asked for something else and
 * nobody has seen it: *destroyed creatures leave drifting debris*. The same
 * cut, thrown at two fifths the speed with the pull nearly off, opens the body
 * like a shell rather than bursting it — for the first third of a second the
 * pair can still read the silhouette coming apart, which the shipped throw
 * gives them about four frames of. Nothing lands, so nothing is added to the
 * ship; what is left of the body goes out where it died.
 *
 * **How it can lose, and it is the same objection twice.** Debris that does
 * not fall is debris still in the lane, and a lane is the thing two people are
 * calling to each other about — the shipped throw clears the column in half a
 * second and this one holds it for a second and a half. And a body that opens
 * slowly reads as a body that is still there: a pair that has learned to fire
 * again the instant a lane is clear will fire late at something already dead.
 *
 * The tuning is `SLICK · DRIFTING` on `bun run breaks`, beside `SLICK ·
 * SPALLED`, which is the shipped side on the same sheet.
 */
export const DEBRIS_DRIFT: Variant = {
  slot: "creature:debris",
  name: "drift",
  sentence:
    "the same nine wedges thrown at two fifths the speed with the pull nearly off — the body opens rather than bursts, and the pieces fade in the air instead of falling onto the ship and lying there",
  dir: "tools/versus/candidates/creature-debris/drift",
  patches: [
    patch({
      // Every kind's `pieces` is this one object today (`body-hit.ts`), and
      // the route the drawing code takes to it is the lookup, never the export
      // — `effects-break.ts` asks `hitFor(kind).pieces` on the frame a body is
      // destroyed. A slick is asked for here because a slick is the body the
      // pose kills.
      target: BREAK_LOOK,
      reached: () => hitFor("slick").pieces,
      where: {
        file: "packages/render/src/break-look.ts",
        symbol: "BREAK_LOOK",
        type: "BreakLook",
      },
      fields: { speedTiles: 0.5, spin: 2.5, gravityTiles: 1, life: 1.4, fade: 0.6 },
    }),
  ],
};
