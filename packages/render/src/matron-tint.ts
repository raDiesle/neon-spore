import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * THE MATRON's colours: a deep blue slime, so the amber of the pods she
 * carries and the eggs inside her stands out of her, and nothing of her is
 * red, cyan or the ship's violet — the colours a pair already argues over.
 */

/** Her skin's light, lit from above. */
export const MATRON_FLESH = PALETTE.blue;
/** Her body's depth, toward the belly. */
export const MATRON_CORE = mixHex(PALETTE.blue, PALETTE.background, 0.62);
/** Her rim, and what springs off her. */
export const MATRON_RIM = PALETTE.blueRim;
