import type { BlisterFrame } from "./blister-bodies.js";
import { drawBudBody } from "./blister-combo-bud.js";
import { drawCurlBody } from "./blister-combo-curl.js";
import { blisterBodyOf } from "./blister-pick.js";
import type { Body } from "./creature-body-in.js";

/**
 * **THE BLISTER's COMBO body: BUD or CURL, one per blister** (the owner, 15
 * October 2026, on `blister:combo`: *I like this most BUD and CURL, maybe
 * increase size a little bit, keep those both and randomly rotate its
 * visuals*).
 *
 * Which one a blister wears is read off its id, so both screens of the pair
 * draw the same one and it does not change while the blister is up.
 */

/** How much bigger than its control the body is drawn than VERSUS offered it. */
const GROW = 1.15;

const BODIES = [drawBudBody, drawCurlBody] as const;

export function drawComboBody(b: Body, f: BlisterFrame): void {
  BODIES[comboBodyOf(b.c.id)](b, { ...f, r: f.r * GROW });
}

/** 0 for BUD, 1 for CURL (`blister-pick.ts`). */
export function comboBodyOf(id: number): 0 | 1 {
  return blisterBodyOf(id, BODIES.length) as 0 | 1;
}
