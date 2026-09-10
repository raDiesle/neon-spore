import * as rindLook from "../../../../../packages/render/src/rind-look.js";
import { patch, type Variant } from "../../../variant.js";
import { facet } from "./paint.js";

/**
 * `rind:body` / `facet` — a rind that is a shell with corners.
 *
 * **What the shipped side is.** A big slick or a big bulb, told from the
 * ordinary one by size alone.
 *
 * **What this argues.** That the one silhouette no living body on the field
 * has is a body with corners, and a rind — a shell around a body — is the
 * creature to give it to. The MOULT card on the shapes page
 * (`drafts/creatures.ts`) is a faceted crystal drawn for exactly this
 * mechanic: a shell under pressure whose only event is splitting. Here it has
 * twelve facets with both layers on and eight with one, cut by the rock's own
 * `crystalRadiusMul`, and the bare body under it is the ordinary blob. The
 * colour is the ammunition colour, so it is never mistaken for a rock; the
 * size is `livingBodyMul`'s; the interior is the body's own, seen through the
 * shell; and the husk the shed throws is this faceted contour.
 *
 * **How it can lose.** *Corners are a rock's word.* THE METEOR is the one
 * faceted thing on the field and it is the one thing a shot cannot answer. A
 * red crystal is red, which should be enough — but if at the pair a faceted
 * rind reads as *do not shoot*, the facets go shallower until it is a blob
 * with a hint of edge, or the whole idea loses to the slick.
 */
export const RIND_BODY_FACET: Variant = {
  slot: "rind:body",
  name: "facet",
  sentence:
    "the rind is a faceted shell in the ammunition colour — twelve flat sides with both layers on, eight with one, the ordinary blob when bare — the shapes page's MOULT card, cut by the rock's own rule",
  dir: "tools/versus/candidates/rind-body/facet",
  patches: [
    patch({
      target: rindLook.RIND_LOOK,
      // No accessor: `creature-body.ts` and `rind-shed.ts` reach the record
      // through `rindWears`, which reads the export itself.
      reached: () => rindLook.RIND_LOOK,
      where: {
        file: "packages/render/src/rind-look.ts",
        symbol: "RIND_LOOK",
        type: "RindLook",
      },
      fields: { body: facet },
    }),
  ],
};
