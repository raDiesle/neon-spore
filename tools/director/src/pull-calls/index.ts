import { GOO_CALL } from "../../../../packages/render/src/goo-call.js";
import { patch, type Variant } from "../../../versus/variant.js";
import { type CallMake, callOver, callUnder } from "./paint.js";

/**
 * **CALL** — the PULL LAB's looks for a drop no hand has taken yet. The owner,
 * 12 October 2026: *introduce initial state of pull button visuals to raise
 * more attention — more yellow colour surrounding maybe coupled with white
 * flashing combined like the path dots. give me variants of it in "pull
 * lab"*. Each is a wider, stronger halo in the drop's own ACID YELLOW and
 * something round it; the ones that FLASH light the drop white as the dots'
 * run sets off (`flashOf`), so the drop is lit first, then the dots one after
 * another, then the place — one run of light down the pull.
 *
 * They live with the lab, on its LOOK picker beside AS SHIPPED and in its
 * EVERY LOOK sheet, and VERSUS never lists them. Each is a `Variant` holding
 * `GOO_CALL` (`packages/render/src/goo-call.ts`) for a frame, as a candidate
 * holds `PULL_KNOB`; the rest of FIZZ is what ships.
 */
const LOOKS: readonly { name: string; sentence: string; make: CallMake }[] = [
  {
    name: "glow · flash",
    sentence: "A wide yellow glow and bolder rings, and the drop flashes white as the dots run.",
    make: {
      reach: 3.3,
      low: 0.45,
      high: 0.8,
      rings: 0.13,
      ringCore: null,
      sparks: false,
      flash: true,
    },
  },
  {
    name: "glow",
    sentence: "A wide yellow glow and bolder rings, never white.",
    make: {
      reach: 3.3,
      low: 0.45,
      high: 0.8,
      rings: 0.13,
      ringCore: null,
      sparks: false,
      flash: false,
    },
  },
  {
    name: "white rings · flash",
    sentence: "White-hot rings in a yellow glow, and the drop flashes white as the dots run.",
    make: {
      reach: 2.5,
      low: 0.26,
      high: 0.5,
      rings: 0.08,
      ringCore: "#FFFFFF",
      sparks: false,
      flash: true,
    },
  },
  {
    name: "spark ring · flash",
    sentence: "A ring of yellow sparks with a white light running round, all white on the flash.",
    make: { reach: 2.5, low: 0.26, high: 0.5, rings: 0, ringCore: null, sparks: true, flash: true },
  },
];

function callLook(l: (typeof LOOKS)[number]): Variant {
  return {
    slot: "pull:call",
    name: l.name,
    sentence: l.sentence,
    dir: "tools/director/src/pull-calls",
    patches: [
      patch({
        target: GOO_CALL,
        reached: () => GOO_CALL,
        where: { file: "packages/render/src/goo-call.ts", symbol: "GOO_CALL" },
        fields: { paint: callUnder(l.make), over: callOver(l.make) },
      }),
    ],
  };
}

export const CALL_LOOKS: readonly Variant[] = LOOKS.map(callLook);
