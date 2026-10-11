import { drawGripDial } from "../../../../packages/render/src/grip-rings.js";
import { drawHoldMark } from "../../../../packages/render/src/hold-mark.js";
import { gooHold } from "./goo.js";
import { BLOOM, DOTS, FILL } from "./looks.js";
import { PRINT, SINK } from "./print.js";
import { SOAK } from "./soak.js";
import type { HoldLook } from "./view.js";

/**
 * **The HOLD LAB's looks** — what every hold in the game draws today, then the
 * GOO holds, built on the PULL LAB's FIZZ so a pull and a hold read as one
 * family (the owner, 11 October 2026: *aligned with visuals and behavior if
 * reasonable — which is decided pull lab ("fizz")*). They live with the lab,
 * as the GOO pulls do; none is in the game.
 */

/** The game's hold today: the red circle with a thumbprint (`hold-mark.ts`), and the
 * dial of the beats left running round it while it is held (`grip-rings.ts`), at the
 * sizes THE BLISTER draws the two together. Gone when counted, back when the next is asked. */
export const AS_SHIPPED: HoldLook = {
  name: "as shipped",
  sentence:
    "what every hold draws today: a red circle breathing with a thumbprint in it, and while held a white dial of the beats left emptying round it from the top",
  paint(v) {
    if (!v.mark) return;
    drawHoldMark(v.ctx, v.at.x, v.at.y, v.r, v.time);
    if (v.held) drawGripDial(v.ctx, v.at.x, v.at.y, v.r * DIAL, 1 - v.fill);
  },
};

/** THE BLISTER's dial radius over its mark's (`blister-help.ts`: 0.92 over 0.7). */
const DIAL = 0.92 / 0.7;

export const GOO_HOLDS: readonly HoldLook[] = [FILL, DOTS, BLOOM, PRINT, SINK, SOAK].map(gooHold);

/** Every look on the LOOK picker and the sheet, the shipped one first. */
export const HOLD_LOOKS: readonly HoldLook[] = [AS_SHIPPED, ...GOO_HOLDS];
