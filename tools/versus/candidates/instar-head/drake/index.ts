import { drawDrakeSideHead } from "../../../../../packages/render/src/instar-drake-side-head.js";
import * as look from "../../../../../packages/render/src/instar-head-look.js";
import type { Look } from "../../../../../packages/render/src/instar-plate.js";
import { drawRigSideHead } from "../../../../../packages/render/src/instar-rig-head-draw.js";
import { DRAKE_HEAD } from "../../../../../packages/render/src/instar-rig-head-shapes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRAKE — offered 1 October 2026, the owner: the side-on rig head *looks very
 * geometrical … not natural shape of a living head*, and the face-on pose
 * *looks good*. So face-on is the shipped head. Side-on is a drake drawn in
 * the shipped profile's skin (`instar-drake-side-head.ts`) — the owner again,
 * the same day, of the rig drake: *the best and looks most natural*, but
 * smaller, *apply the previous graphic skin*, the mouth smaller and opened
 * less, the venom and teeth kept, the brows smaller and off the horns. Turned
 * (the idle drift's turn) is the rig drake (`instar-rig-head-organic.ts`),
 * cut to the same proportions.
 */
const turned = (ctx: CanvasRenderingContext2D, l: Look, yaw: number) =>
  drawRigSideHead(ctx, l, yaw, DRAKE_HEAD);

export const INSTAR_HEAD_DRAKE: Variant = {
  slot: "instar:head",
  name: "drake",
  sentence:
    "drake — THE INSTAR side-on is a drake's skull in the same plated skin, swept horns and a small brow, its jaw tapering under the snout and barely open, instead of a ball with a jaw hung wide",
  dir: "tools/versus/candidates/instar-head/drake",
  patches: [
    patch({
      target: look.INSTAR_HEAD,
      reached: () => look.INSTAR_HEAD,
      where: {
        file: "packages/render/src/instar-head-look.ts",
        symbol: "INSTAR_HEAD",
        type: "{ front: (ctx: CanvasRenderingContext2D, look: Look) => void; side: (ctx: CanvasRenderingContext2D, look: Look) => void; turned: (ctx: CanvasRenderingContext2D, look: Look, yaw: number) => void }",
      },
      fields: { front: look.drawInstarFront, side: drawDrakeSideHead, turned },
    }),
  ],
};
