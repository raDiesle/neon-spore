import { walkedSilhouette } from "./body-form.js";
import { rootedContour } from "./rooted.js";
import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **THE BLISTER is ROOTED CLOVER**: two drafts off the shape sheet, combined
 * and named. BULB · CLOVER's *four deep lobes* (`tools/shape-sheet/src/drafts/
 * offered.ts`) are the body, and SINKER's *round body held to the field by
 * roots* (`drafts/mine.ts`) gives it the roots on its underside.
 *
 * Neither alone would do. CLOVER whole is already on the field, two of them
 * stacked as THE LAMPREY's dung (`render/lamprey-dung.ts`), and SINKER whole is
 * THE TRIVET's hub. Together they say the two halves of the creature: four
 * lobes pushed up through the membrane is the swelling, and the roots running
 * down into the pore are why it never falls — it is *of* the field, and it
 * goes back into it.
 *
 * **One body for every gesture** (`docs/spec/blister.md`): the pair reads
 * which blow it wants from the help drawn round it, never from the contour,
 * so there is exactly one of these.
 *
 * The roots reach half a radius rather than SINKER's whole one, so the reach
 * `walkedSilhouette` takes off them — which the footprint, the tap's reach and
 * the pips round it all read — stays the lobes' and not a thin tendril's.
 *
 * **Drawn larger**, by THE MINE's `sizeMul` for THE MINE's reason: the roots
 * stretch the reach a body is normalised by, so at the plain footprint the
 * lobes came out at THE LEECH's size, and four lobes at one size is one word
 * (`tools/shape-sheet/src/nameability.ts`). 1.15 sets it between the two
 * other fours, the leech under it and the mine over it, apart from each by
 * four pixels; a quarter put it on the mine. It is also the honest number —
 * this is the body a thumb has to find and hit inside two beats.
 */
export const BLISTER: CreatureSilhouette = walkedSilhouette(
  { lobes: 4, depth: 0.34, wobble: 0.045, seed: 1, sizeMul: 1.15 },
  rootedContour({
    rx: 46,
    ry: 44,
    roots: 6,
    reach: 0.5,
    drift: 0.15,
    period: 6,
    body: { lobes: 4, depth: 0.34, wobble: 0.045, seed: 1 },
  }),
);
