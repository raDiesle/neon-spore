import * as caromLook from "../../../../../packages/render/src/carom-look.js";
import { wedge } from "../../../../../packages/render/src/carom-look.js";
import { patch, type Variant } from "../../../variant.js";
import { pod } from "./paint.js";

/**
 * `creature:carom` / `pod` — FACET taken on as a space rescue capsule.
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
export const CAROM_POD: Variant = {
  slot: "creature:carom",
  name: "pod",
  sentence:
    "bare riveted plate on the outer faces, the rescue stripe as a fourteen-segment hatch ring on the bevel round the glass, the nose scorched with an ember crescent inside its edge, and the beacon on a short mast off the tail past the silhouette",
  dir: "tools/versus/candidates/creature-carom/pod",
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
      fields: { shell: pod, travel: wedge },
    }),
  ],
};
