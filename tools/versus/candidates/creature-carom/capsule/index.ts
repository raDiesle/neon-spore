import * as caromLook from "../../../../../packages/render/src/carom-look.js";
import { wedge } from "../../../../../packages/render/src/carom-look.js";
import { patch, type Variant } from "../../../variant.js";
import { capsule } from "./paint.js";

/**
 * `creature:carom` / `capsule` — FACET taken on as a space rescue capsule.
 *
 * **What the shipped side is.** A seven-sided outline filled with one flat
 * mid-tone and lit by one gradient across the whole of it, rolling as it
 * crosses.
 *
 * **What this argues.** The owner picked FACET on 10 September 2026 and asked
 * for it as a rescue capsule: the cut outline kept, the nose along its
 * heading, seams and rivets, a band of hazard chevrons, a beacon on the beat
 * and a scorched shield on the side it travels toward. All three capsules
 * offered wear all of that; this one's argument is in `paint.ts`.
 *
 * **How it can lose.** In `paint.ts`, beside what it draws.
 */
export const CAROM_CAPSULE: Variant = {
  slot: "creature:carom",
  name: "capsule",
  sentence:
    "FACET's faces with the nose on its heading, the nose and shoulders scorched with an ember lip, the rescue stripe on the outer ring of the four rear faces — dark, white, white, dark — a rivet at every ridge vertex and a small beacon on the tail flashing the body's colour on the beat",
  dir: "tools/versus/candidates/creature-carom/capsule",
  patches: [
    patch({
      target: caromLook.CAROM_LOOK,
      // No accessor: `carom.ts` reads the export itself, twice per body. The
      // module namespace is the whole route there is.
      reached: () => caromLook.CAROM_LOOK,
      where: {
        file: "packages/render/src/carom-look.ts",
        symbol: "CAROM_LOOK",
        type: "CaromLook",
      },
      // The streak is the shipped one: this slot patches both fields because
      // every candidate in it must, and this answer has nothing to say about
      // the travel.
      fields: { shell: capsule, travel: wedge },
    }),
  ],
};
