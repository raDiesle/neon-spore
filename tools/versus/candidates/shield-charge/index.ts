import * as shieldSpark from "../../../../packages/render/src/shield-spark.js";
import { patch, type Variant } from "../../variant.js";

/**
 * `shield:charge` / `arcs` — the shield throws sparks outward, so you can see
 * it is charged.
 *
 * Asked for by the owner (`docs/queue.md`, in German with a translation
 * beside it): a discharge like a strong pylon, thrown outward from the shield
 * — away from the ship — because a thing that throws sparks is obviously
 * present and obviously energised, which answers both of the owner's
 * complaints (hard to see, does not read as charged) with one gesture.
 *
 * Its own slot, not a third sibling of `shield-ward`'s `heave`/`tick`: those
 * two answer the *moment of deflection* — the catch — and patch `WARD_LOOK`
 * and `DEFLECT_LOOK`. This is about the shield's *ongoing presence* while
 * nothing is being caught at all, and patches a different record entirely
 * (`SHIELD_SPARK_LOOK`, lifted in `shield-spark.ts` for exactly this). A
 * candidate here has to keep working during a peaceful stretch of a wave,
 * which `heave` and `tick` never have to.
 *
 * The values chosen: three independent timers (`SLOTS` in `shield-spark.ts`)
 * each firing roughly every 1.5–3.4 seconds and living 0.16 seconds — sudden,
 * thin, branched, gone, the pylon taken literally rather than a halo or a
 * steady crackle. `frame.test.ts`'s "fires only a few, briefly" test pins the
 * on-screen share of time to under 35%, which is the number this sentence
 * would otherwise only assert in prose.
 *
 * How it can lose. Three tiles of hull rim is a small stage at 26 px, and a
 * one-and-a-half-pixel arc gone in a tenth of a second may simply not survive
 * a phone screen at a glance — the failure `shield-ward/tick` already named
 * for its own hairline rim. And a field with eleven columns of creatures
 * moving on it may bury a spark the instant it appears, which a still
 * screenshot cannot show and only the pair, watching it run, can judge.
 */
export const SHIELD_CHARGE_ARCS: Variant = {
  slot: "shield:charge",
  name: "arcs",
  sentence:
    "a few thin arcs thrown outward from the rim, sudden and gone — the field pushing back rather than leaking",
  dir: "tools/versus/candidates/shield-charge",
  patches: [
    patch({
      target: shieldSpark.SHIELD_SPARK_LOOK,
      // No accessor: `drawShieldSparks` reads the export itself, the same way
      // `drawShieldRim` reads `WARD_LOOK`. The module namespace is the whole
      // route there is.
      reached: () => shieldSpark.SHIELD_SPARK_LOOK,
      where: {
        file: "packages/render/src/shield-spark.ts",
        symbol: "SHIELD_SPARK_LOOK",
        type: "ShieldSparkLook",
      },
      fields: {
        perSecond: 1.4,
        life: 0.16,
        reachMul: 0.9,
        segments: 4,
        jitter: 0.18,
        forkChance: 0.45,
        width: 1.5,
        intensity: 1.1,
      },
    }),
  ],
};
