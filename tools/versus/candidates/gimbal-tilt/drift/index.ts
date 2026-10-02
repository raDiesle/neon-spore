import * as tilt from "../../../../../packages/render/src/gimbal-tilt.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRIFT — offered 2 October 2026, from `docs/spec/living-bosses.md` §1 and the
 * owner's answer that day that each rig boss is offered the idle drift and
 * judged on its own. THE GIMBAL is drawn through its rig (`gimbal-rig.ts`):
 * the yoke, a shaded drum and solid hoops with their teeth and pins, and the
 * whole cradle wanders — turning a little in its yoke, tipping and rolling,
 * the drum turning inside its rings on its own. It steadies to a third while a
 * ring turns and to a tenth of that under THE SLOW (`gimbal-tilt.ts`).
 */
export const GIMBAL_DRIFT: Variant = {
  slot: "gimbal:tilt",
  name: "drift",
  sentence:
    "drift — THE GIMBAL is solid: a shaded drum, steel hoops and teeth, and the whole cradle slowly turns, tips and rolls in its yoke, steadying while a ring is being turned",
  dir: "tools/versus/candidates/gimbal-tilt/drift",
  patches: [
    patch({
      target: tilt.GIMBAL_TILT,
      reached: () => tilt.GIMBAL_TILT,
      where: {
        file: "packages/render/src/gimbal-tilt.ts",
        symbol: "GIMBAL_TILT",
        type: "{ amount: number }",
      },
      fields: { amount: 1 },
    }),
  ],
};
