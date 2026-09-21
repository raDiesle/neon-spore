import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { actionFocus } from "./paint.js";

/**
 * FOCUS — the light goes out everywhere the pair are not acting, and closes.
 *
 * The other four answers are pictures of the field: a frame round it, a veil
 * over its far half, a light down its edges, a bar above the hull. This is the
 * one whose picture is not in the layout at all — it is wherever the thumbs
 * are. A boss mark somebody owes a gesture to, a body somebody has a hand on
 * and the cannon's own column stay at full brightness; everything else sinks,
 * and the lit spots tighten onto them as the beats run out.
 *
 * It is the owner's ask of 21 September 2026: the slow should be drawn on the
 * target where the player's actions are, in the moment they are shown.
 *
 * Against `wash` it is the same ink spent the other way up — the wash dims the
 * marks the pair have to read at the worst moment, and this dims everything
 * except them. Against `frame` and `gutter` it is the only answer whose
 * picture moves with the pair rather than standing where the layout put it.
 * What it risks is the reverse of the same property: it is the heaviest of the
 * five, and on a frame with no hand down it darkens a whole field to light one
 * spot at the muzzle.
 */
export const SLOW_FOCUS: Variant = {
  slot: "slow:window",
  name: "focus",
  sentence:
    "focus — the field goes dark except where the pair are acting, and the lit spots on the boss's marks, on a held body and at the cannon's column tighten as the window runs down",
  dir: "tools/versus/candidates/slow-window/focus",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: actionFocus },
    }),
  ],
};
