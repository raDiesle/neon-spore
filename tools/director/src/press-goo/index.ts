import { gooPress } from "./goo.js";
import { STEPS } from "./steps.js";
import type { PressLook } from "./view.js";

/**
 * **The look every press in the director's labs wears**: STEPS, on THE HOLD
 * LAB's drop popping up rather than sinking (`goo.ts`) — SOAK's water cut
 * into the presses. THE PRESS LAB once offered five looks on a picker; the
 * owner, 13 October 2026: *for "press lab" apply and remove variants for
 * "look" which is preferred "steps"*, as THE HOLD LAB kept SOAK. PIPS, POP,
 * COUNT and KNOCK are gone. None is in the game.
 */
export const STEPS_PRESS: PressLook = gooPress(STEPS);
