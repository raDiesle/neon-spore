import { gooPress } from "./goo.js";
import { PIPS, STEPS } from "./looks.js";
import { COUNT, KNOCK, POP } from "./looks-b.js";
import type { PressLook } from "./view.js";

/**
 * **The looks THE PRESS LAB offers**, one drop each — THE HOLD LAB's, popping
 * up rather than sinking (`goo.ts`) — differing only in how they say how many
 * presses a mark asks and how many are done. Five, for the owner to pick one
 * of, as THE HOLD LAB once offered seven and kept SOAK. None is in the game.
 */
export const PRESS_LOOKS: readonly PressLook[] = [PIPS, STEPS, POP, COUNT, KNOCK].map(gooPress);

export const pressLook = (key: string): PressLook =>
  PRESS_LOOKS.find((l) => l.key === key) ?? (PRESS_LOOKS[0] as PressLook);
