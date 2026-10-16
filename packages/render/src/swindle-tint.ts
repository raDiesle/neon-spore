import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * THE SWINDLE's colours: a slime of the organ's green, so the amber of the
 * pods under her hoods stands out of her, and nothing of her is red, cyan,
 * the ship's violet or THE MATRON's blue — the boss before her on the same
 * pods.
 */

/** Her skin's light, lit from above, and her hoods'. */
export const SWINDLE_FLESH = PALETTE.organ;
/** Her body's depth, toward the belly. */
export const SWINDLE_CORE = mixHex(PALETTE.organ, PALETTE.background, 0.62);
/** Her rim, and what flies off her. */
export const SWINDLE_RIM = PALETTE.organRim;
