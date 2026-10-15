import type { BlisterFrame } from "./blister-bodies.js";
import { blisterBodyOf } from "./blister-pick.js";
import { drawCradleBody } from "./blister-tap-cradle.js";
import { drawMoleBody } from "./blister-tap-mole.js";
import { drawRiderBody } from "./blister-tap-rider.js";
import type { Body } from "./creature-body-in.js";

/**
 * **THE BLISTER's TAP body: MOLE, RIDER or CRADLE, one per blister** (the
 * owner, 15 October 2026, on `blister:tap`, after LEVER's: *same for
 * "BLISTER:TAP"* — build all into game and remove from versus candidates).
 *
 * Each is built round the yellow press drawn over its middle (`press-drop.ts`)
 * and drawn bigger than it. Which one a blister wears is read off its id, the
 * way RUB's and LEVER's are (`blister-pick.ts`), so both screens of the pair
 * draw the same one and it does not change while the blister is up.
 */

const BODIES = [drawMoleBody, drawRiderBody, drawCradleBody] as const;

export function drawTapBody(b: Body, f: BlisterFrame): void {
  BODIES[tapBodyOf(b.c.id)]?.(b, f);
}

/** 0 for MOLE, 1 for RIDER, 2 for CRADLE. */
export function tapBodyOf(id: number): number {
  return blisterBodyOf(id, BODIES.length);
}
