import { gooHold } from "./goo.js";
import { SOAK } from "./soak.js";
import type { HoldLook } from "./view.js";

/**
 * **The look every hold in the director's labs wears**: SOAK, on the PULL
 * LAB's FIZZ drop, so a pull and a hold read as one family (the owner, 11
 * October 2026: *aligned with visuals and behavior if reasonable — which is
 * decided pull lab ("fizz")*). The HOLD LAB once offered seven looks on a
 * picker; the owner, 12 and 13 October 2026: *all should follow "hold look"
 * of "soak" to be consistent - remove alternatives* — in THE COMBO LAB first,
 * then in THE HOLD LAB. None is in the game.
 */
export const SOAK_HOLD: HoldLook = gooHold(SOAK);
