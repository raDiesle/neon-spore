import * as serpent from "../../../../../packages/render/src/instar-serpent.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SERPENT — offered 1 October 2026, from `docs/spec/living-bosses.md` §1:
 * THE INSTAR should swim through the air on its flights rather than be
 * carried stiff. While the body flies in, passes or crosses, a wave runs down
 * the spine from the neck to the engines, one and a half crests along it,
 * small at the head and whipping at the rear; a crest toward the players
 * swells the body as it goes by; and the wings beat once a crest on the wave
 * at the shoulders. It grows out of the body at rest and dies back into it
 * before the landing, so nothing snaps.
 */
export const INSTAR_FLIGHT_SERPENT: Variant = {
  slot: "instar:flight",
  name: "serpent",
  sentence:
    "serpent — on its flights THE INSTAR swims: a wave runs down its body from the neck to the tail, growing toward the rear, and the wings beat with it",
  dir: "tools/versus/candidates/instar-flight/serpent",
  patches: [
    patch({
      target: serpent.INSTAR_SERPENT,
      reached: () => serpent.INSTAR_SERPENT,
      where: {
        file: "packages/render/src/instar-serpent.ts",
        symbol: "INSTAR_SERPENT",
        type: "{ amount: number }",
      },
      fields: { amount: 1 },
    }),
  ],
};
