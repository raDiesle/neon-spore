import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { gutteringBeat } from "./paint.js";

/**
 * GUTTER — the window is beats, so the picture beats.
 *
 * Both edges of the field are struck on every beat of the window and gutter
 * back down before the next one, each flare weaker than the last. It is the
 * only answer in the slot that is *rhythmic*: the other three spend the window
 * as one continuous quantity, and this one spends it the way the pair are
 * counting it out loud.
 *
 * The bet is that two beats counted are easier to answer against than a
 * fraction slid across; the risk, which `paint.ts` sets out, is that twice in
 * two beats is close enough to a flicker to read as a fault.
 */
export const SLOW_GUTTER: Variant = {
  slot: "slow:window",
  name: "gutter",
  sentence:
    "gutter — both edges of the field are struck on every beat of the window and die back before the next, each flare weaker than the last, like a light going out",
  dir: "tools/versus/candidates/slow-window/gutter",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: gutteringBeat },
    }),
  ],
};
