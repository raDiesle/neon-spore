import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE LIMPET and THE LEECH**: two bodies that take hold of a control and are
 * answered by that control being kept moving. The limpet goes to the shield's
 * plate, the leech to the cannon.
 *
 * **What is left here is the holding, and only the holding.** Until 15
 * September 2026 this file was the whole creature: a body that fell down one
 * lane, landed, clamped on, counted a fuse in whole beats while the control
 * stood still, went off at the end of it, and could be shaken off by moving
 * enough times. The owner ruled that day that these two *exist only as a
 * brush* — a pencil placed on the map, which fires the body at the control from
 * the lantern at the top of the field and reels it home when the placement runs
 * out (`harpoon.ts`) — so every one of those things went. They are written up
 * on `docs/spec/ideas.md`, with the sha that holds them, because a body that
 * leaves when its owner calls it back is a different creature from one the pair
 * shook off and the second may be worth building again.
 *
 * So there is no arrival here, no fuse, no shake, and no stepper: `harpoon.ts`
 * installs the body and watches the control every *tick*. What this file still
 * owns is the pair of questions that are about the creature rather than about
 * the fault — which kind it is, which control it takes, and whether it has
 * hold — and `render/cling.ts` beside it draws a body that has.
 */

export type ClingKind = "limpet" | "leech";

/** Whether this kind is one of the two clingers. */
export function isClingKind(kind: CreatureKind): kind is ClingKind {
  return kind === "limpet" || kind === "leech";
}

/** Whether this body has hold of its control. Absent is not stuck, which is
 * what a body still on its way there is (`harpoon.ts` installs it stuck). */
export function clingIsStuck(c: Creature): boolean {
  return isClingKind(c.kind) && c.clingStuck === true;
}

/** The column of the control this kind takes: the plate's or the cannon's. */
export function clingControlCol(world: World, kind: ClingKind): number {
  return kind === "limpet" ? world.shieldCol : world.cannonCol;
}
