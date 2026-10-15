import type { BlisterBodyLook, BlisterFrame } from "./blister-bodies.js";
import { drawBellBody, drawBellCord } from "./blister-lever-bell.js";
import { drawRootBody, drawRootDown } from "./blister-lever-root.js";
import { drawTaffyBody, drawTaffyNose } from "./blister-lever-taffy.js";
import { blisterBodyOf } from "./blister-pick.js";
import type { Body } from "./creature-body-in.js";

/**
 * **THE BLISTER's LEVER body: BELL, ROOT or TAFFY, one per blister** (the
 * owner, 15 October 2026, on `blister:lever`: *build all into game and remove
 * from versus candidates*).
 *
 * Which one a blister wears is read off its id, the way RUB's and SWIPE's are
 * (`blister-pick.ts`), so both screens of the pair draw the same one and it
 * does not change while the blister is up. Each puts its own limb out past the
 * pore to the knob: BELL's cord, ROOT's root, TAFFY's nose.
 */

const BODIES: readonly BlisterBodyLook[] = [
  { draw: drawBellBody, beyond: drawBellCord },
  { draw: drawRootBody, beyond: drawRootDown },
  { draw: drawTaffyBody, beyond: drawTaffyNose },
];

export function drawLeverBody(b: Body, f: BlisterFrame): void {
  BODIES[leverBodyOf(b.c.id)]?.draw(b, f);
}

export function drawLeverBeyond(b: Body, f: BlisterFrame): void {
  BODIES[leverBodyOf(b.c.id)]?.beyond(b, f);
}

/** 0 for BELL, 1 for ROOT, 2 for TAFFY. */
export function leverBodyOf(id: number): number {
  return blisterBodyOf(id, BODIES.length);
}
