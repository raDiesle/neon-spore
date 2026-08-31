import * as shieldFlash from "../../../../packages/render/src/shield-flash.js";
import { patch, type Variant } from "../../variant.js";

/**
 * `shield:flash` / `flash` — a soft patch of light pops above the rim.
 *
 * Its own slot, not a second candidate of `shield:charge`'s `arcs`: the two
 * answer the same question — say the shield is charged, not catching
 * anything — but `arcs` patches `SHIELD_SPARK_LOOK`'s jagged-line fields and
 * `flash` patches a different record entirely (`SHIELD_FLASH_LOOK`, lifted in
 * `shield-flash.ts` for exactly this), so they cannot sit in one slot — every
 * candidate in a slot has to patch the same fields, `variant.ts`'s own rule.
 *
 * `flash` is a soft radial glow that blooms and fades above the rim — not a
 * jagged line — at a random spot, on its own random timer. At most two are
 * ever live at once, each about a quarter of a tile tall, so the shield reads
 * as something that occasionally sparks with light rather than as a
 * line-drawing of electricity.
 *
 * How it can lose. A soft glow has no hard edge the way an arc's stroke does,
 * so at 26 px over a lit field it may simply blend into the rim's own shimmer
 * and never separate out as its own event — the opposite failure from
 * `arcs`, which risks being too thin to survive rather than too soft.
 */
export const SHIELD_CHARGE_FLASH: Variant = {
  slot: "shield:flash",
  name: "flash",
  sentence: "a soft patch of light blooms above the rim — a random spot, a random timer, gone",
  dir: "tools/versus/candidates/shield-flash",
  patches: [
    patch({
      target: shieldFlash.SHIELD_FLASH_LOOK,
      // No accessor: `drawShieldFlashes` reads the export itself, the same
      // way `drawShieldSparks` reads `SHIELD_SPARK_LOOK`.
      reached: () => shieldFlash.SHIELD_FLASH_LOOK,
      where: {
        file: "packages/render/src/shield-flash.ts",
        symbol: "SHIELD_FLASH_LOOK",
        type: "ShieldFlashLook",
      },
      fields: {
        perSecond: 1,
        life: 0.3,
        heightMul: 0.25,
        radiusMul: 0.6,
        intensity: 1,
      },
    }),
  ],
};
