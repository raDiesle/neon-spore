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
 *
 * Retuned the same day on the owner's *can also be more movement shake of
 * body*: the wave is half as big again and a crest comes every two beats,
 * and a quick small shiver runs down on top of it.
 *
 * Reworked on 2 October 2026, the owner: *looks better. can you make it
 * slower and not so strong path of movement and also have it in all
 * perspective of boss level*. The wave is half that size, a crest takes four
 * beats, the shiver is gone; and it swims on every step at half its flight's
 * size, side-on and face-on, holding still under THE SLOW.
 */
export const INSTAR_FLIGHT_SERPENT: Variant = {
  slot: "instar:flight",
  name: "serpent",
  sentence:
    "serpent — THE INSTAR swims all through the level, side-on and face-on: a slow, gentle wave runs down its body from the neck to the tail, bigger in flight, where the wings beat with it",
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
