import { SIDE } from "../../../../../packages/content/src/solid.js";
import * as look from "../../../../../packages/render/src/instar-head-look.js";
import type { Look } from "../../../../../packages/render/src/instar-plate.js";
import { drawRigSideHead } from "../../../../../packages/render/src/instar-rig-head-draw.js";
import { VIPER_HEAD } from "../../../../../packages/render/src/instar-rig-head-shapes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * VIPER — offered 1 October 2026, the owner: the side-on rig head *looks very
 * geometrical … not natural shape of a living head*, and the face-on pose
 * *looks good*. So face-on is the shipped head, and side-on and turned (the
 * idle drift's turn) is one skull and one jaw as splines of rings
 * (`instar-rig-head-organic.ts`): a flat wedge with wide jowls behind the eyes, a pointed snout, one long fang a side and a crest of spikes.
 */
const side = (ctx: CanvasRenderingContext2D, l: Look) => drawRigSideHead(ctx, l, SIDE, VIPER_HEAD);
const turned = (ctx: CanvasRenderingContext2D, l: Look, yaw: number) =>
  drawRigSideHead(ctx, l, yaw, VIPER_HEAD);

export const INSTAR_HEAD_VIPER: Variant = {
  slot: "instar:head",
  name: "viper",
  sentence:
    "viper — THE INSTAR side-on is one living skull, a flat fanged wedge with a spiked crest, instead of a ball with tubes for a muzzle and jaw",
  dir: "tools/versus/candidates/instar-head/viper",
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
