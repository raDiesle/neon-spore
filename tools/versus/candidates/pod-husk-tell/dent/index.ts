import * as look from "../../../../../packages/render/src/husk-look.js";
import { patch, type Variant } from "../../../variant.js";
import { dentBody } from "./paint.js";

/**
 * DENT — `sag`, and one shoulder fallen in.
 *
 * The shape sheet's HUSK 2: the same sag with a dent cut where an intact body
 * has a crown, off-centre so it reads as damage. The loud answer to `sag`'s
 * quiet one. Far easier to see from across a phone — and that is how it can
 * lose, because a husk legible while it still hangs is one nobody ever has to
 * gamble on, and the gamble is the creature. If this wins, `sag/paint.ts`
 * moves with it: the body is drawn there and this file only sets the crown.
 */
export const HUSK_DENT: Variant = {
  slot: "pod:husk-tell",
  name: "dent",
  sentence:
    "the sag with one shoulder fallen in — the same dead body, and a dent an eye can point at from across the phone",
  dir: "tools/versus/candidates/pod-husk-tell/dent",
  patches: [
    patch({
      target: look.HUSK_LOOK,
      reached: () => look.HUSK_LOOK,
      where: {
        file: "packages/render/src/husk-look.ts",
        symbol: "HUSK_LOOK",
        type: "HuskLook",
      },
      fields: { body: dentBody, marked: false },
    }),
  ],
};
