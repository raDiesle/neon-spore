import { SIDE } from "../../../../../packages/content/src/solid.js";
import * as look from "../../../../../packages/render/src/instar-head-look.js";
import type { Look } from "../../../../../packages/render/src/instar-plate.js";
import { drawRigSideHead } from "../../../../../packages/render/src/instar-rig-head-draw.js";
import { DRAKE_HEAD } from "../../../../../packages/render/src/instar-rig-head-shapes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRAKE — offered 1 October 2026, the owner: the side-on rig head *looks very
 * geometrical … not natural shape of a living head*, and the face-on pose
 * *looks good*. So face-on is the shipped head, and side-on and turned (the
 * idle drift's turn) is one skull and one jaw as splines of rings
 * (`instar-rig-head-organic.ts`): a long head with a high brow, a bridge falling to a narrow snout, a deep jaw angle and swept horns.
 */
const side = (ctx: CanvasRenderingContext2D, l: Look) => drawRigSideHead(ctx, l, SIDE, DRAKE_HEAD);
const turned = (ctx: CanvasRenderingContext2D, l: Look, yaw: number) =>
  drawRigSideHead(ctx, l, yaw, DRAKE_HEAD);

export const INSTAR_HEAD_DRAKE: Variant = {
  slot: "instar:head",
  name: "drake",
  sentence:
    "drake — THE INSTAR side-on is one living skull, long and swept-horned, its jaw tapering to a chin, instead of a ball with tubes for a muzzle and jaw",
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
      fields: { front: look.drawInstarFront, side, turned },
    }),
  ],
};
