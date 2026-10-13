import { gooRub } from "./goo.js";
import { WIPE, ZIGZAG } from "./looks.js";
import { COUNT, HEAT } from "./looks-b.js";
import type { RubLook } from "./view.js";

/**
 * **The looks THE RUB LAB offers**, one drop each — THE HOLD LAB's, smeared
 * after the thumb rather than sinking or popping (`goo.ts`) — differing only
 * in how they say how many turns a mark asks and how many are done. Four, for
 * the owner to pick one of. None is in the game.
 */
export const RUB_LOOKS: readonly RubLook[] = [ZIGZAG, WIPE, HEAT, COUNT].map(gooRub);

export const rubLook = (key: string): RubLook =>
  RUB_LOOKS.find((l) => l.key === key) ?? (RUB_LOOKS[0] as RubLook);
