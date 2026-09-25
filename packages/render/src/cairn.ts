import type { CairnState, Creature, World } from "@neon-spore/sim";
import { type BossHurt, drawHurt } from "./boss-hurt.js";
import { drawPileHand } from "./cairn-hand.js";
import { CAIRN_LOOK } from "./cairn-look.js";
import { drawCairnSettle, showsCairnSettle } from "./cairn-settle.js";
import { cairnUnits, pilePath } from "./cairn-units.js";
import type { Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";

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
 *
 * **The blow of a pulled unit** (`boss-blows.ts`) shakes the pile, the hand
 * on it and the lane mark as one, and lays its red over the pile's outline
 * after the look has painted it — the outline is `cairn-units.ts`' and not
 * the look's, so a candidate pile goes red the same way.
 */

export { type CairnUnit, cairnUnits } from "./cairn-units.js";

/** The pile. `units` is the simulation's count and nothing here may change it. */
export function drawCairn(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: CairnState,
  hurt: BossHurt,
): void {
  const { world, time } = view;
  const body = cairnBody(world, boss);
  if (!body) return; // The last unit came away; there is no pile left.
  ctx.save();
  ctx.translate(hurt.shakeX(time, l.tile), 0);
  const alpha = ctx.globalAlpha;
  CAIRN_LOOK.pile(ctx, l, body, boss, time);
  if (hurt.value > 0) drawHurt(ctx, pilePath(cairnUnits(l, body, boss.units, time)), hurt.value);
  ctx.globalAlpha = alpha;
  // A hand on it, over the stack rather than under it — the field's grip
  // pass runs before the boss is drawn, and a ring behind seven rocks was
  // no ring at all (`cairn-hand.ts`).
  drawPileHand(ctx, l, world, body, boss.units, time, view.names);
  // And, on one screen of the two, the lane the pile is about to drop one
  // into. After the pile, because it stands on the stone that is going and
  // has to be read over it (`cairn-settle.ts`).
  if (showsCairnSettle(l)) drawCairnSettle(ctx, l, world, boss, body, view.beatPhase, time);
  ctx.restore();
}

/** Whether this world has a pile standing in it, and which. The renderer asks
 * rather than testing the tag itself — three passes want the answer. */
export function cairnBody(world: World, boss: CairnState): Creature | undefined {
  return world.creatures.find((c) => c.id === boss.creatureId);
}
