import * as wardenLook from "../../../../../packages/render/src/warden-look.js";
import { patch, type Variant } from "../../../variant.js";
import { mantle } from "./paint.js";

/**
 * `creature:warden` / `mantle` — the material is grown in folds, and the
 * hole is the bottom of a throat.
 *
 * **What the shipped side is.** A flat fill with marks on it, and a disc with
 * a hole cut in it however many marks are added: nothing on the surface says
 * whether the hole goes *down*.
 *
 * **What this argues.** That the body should be built the way a grown thing
 * is, in layers, and that layers make depth for free. SOFT LOBE off the shapes
 * page, laid as four rings of overlapping scales from the rim to the lip,
 * every ring's free edge lying over the ring inside it, so the eye reads the
 * hole as the deepest point of a funnel of flesh. Each lobe is a cushion
 * tilted toward the hole and lit by calling `surfaceLit` on that tilt — which
 * puts the light on the lower-right wall and takes it off the upper-left,
 * the opposite of what a dome does and the one cue that says *concave* —
 * with a contact shadow under its free edge and a lit lip where the key
 * reaches it, and each ring in a step darker than the last. Then it moves: a
 * wave runs round the ring and every lobe swells and slackens as it passes,
 * each ring lagging the one outside it, so the surface is seen to be working
 * something inward. The eyelets, the fringe, the two edges and the armour
 * are the shipped passes called as they are.
 *
 * **How it can lose.** *It is a pangolin.* Sixty scales is a pattern, and a
 * pattern at this size may read as armour a second time — a body plated all
 * over, under a ring of plates that is the health bar. If at the pair the
 * folds and the armour are hard to tell apart, the folds have to go softer
 * and fewer, and the rings' own wave is what has to carry the difference.
 */
export const WARDEN_MANTLE: Variant = {
  slot: "creature:warden",
  name: "mantle",
  sentence:
    "the material grown in four rings of overlapping soft lobes, each lit as a cushion tilted into the hole so the ring reads as a throat — with a swell running round the folds",
  dir: "tools/versus/candidates/creature-warden/mantle",
  patches: [
    patch({
      target: wardenLook.WARDEN_LOOK,
      // No accessor: `warden.ts` reads the export itself, once per frame. The
      // module namespace is the whole route there is.
      reached: () => wardenLook.WARDEN_LOOK,
      where: {
        file: "packages/render/src/warden-look.ts",
        symbol: "WARDEN_LOOK",
        type: "WardenLook",
      },
      fields: { surface: mantle },
    }),
  ],
};
