import type { CairnState, Creature, World } from "@neon-spore/sim";
import { CAIRN_LOOK } from "./cairn-look.js";
import type { Layout } from "./layout.js";

/**
 * THE CAIRN, drawn: seven of the field's own rocks stacked four, two and one,
 * held in one outline.
 *
 * Three files since 13 September 2026, where this was one. Where the stones
 * stand is `cairn-units.ts`; what the pile looks like is `CAIRN_LOOK.pile`
 * (`cairn-look.ts`), which the game fills with `cairn-pile.ts`'s seven live
 * fires under one clip and which a VERSUS candidate may fill with something
 * else for the length of one frame. This file is the call the renderer makes
 * and the question it asks first.
 *
 * Nothing here decides anything. How many units are stacked is `CairnState`,
 * which lane the pile is about to drop one into is `cairn-settle.ts` on the
 * one screen that may see it, and both are read rather than derived.
 */

export { type CairnUnit, cairnUnits } from "./cairn-units.js";

/** The pile. `units` is the simulation's count and nothing here may change it. */
export function drawCairn(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  body: Creature,
  boss: CairnState,
  time: number,
): void {
  CAIRN_LOOK.pile(ctx, l, body, boss, time);
}

/** Whether this world has a pile standing in it, and which. The renderer asks
 * rather than testing the tag itself — three passes want the answer. */
export function cairnBody(world: World, boss: CairnState): Creature | undefined {
  return world.creatures.find((c) => c.id === boss.creatureId);
}
