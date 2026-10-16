import { type BroodState, broodBudIn, type World } from "@neon-spore/sim";
import { markAt } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { broodBudCircle } from "./brood-bud.js";
import { broodBudX, broodRimOver, broodRipe, broodSacAt } from "./brood-place.js";
import type { Layout } from "./layout.js";

/**
 * **What THE BROOD is asking for**, on a page of its own among the readings.
 *
 * The fight is *which bud first, and in what colour*, and both are already on
 * both screens: the buds hang in their colours over their columns, and which
 * is nearest to dropping is read off how swollen it is (`brood-bud.ts`). So
 * **the pilot is told nothing**: which bud to slide under is the one choice
 * he has to make and say, and the owner, 5 October 2026 on THE GORGE: *we do
 * not need to show helper to "move" for cannon to shoot*.
 *
 * **The navigator is told only what the cannon's own column can answer**,
 * THE GORGE's pairing: `FIRE` over the bud hanging in the cannon's column,
 * aimed at the bud as it is drawn, and nothing while the cannon is under the
 * hide. *Which colour* is never written; the bud is that colour on her screen,
 * so the button of it is the one lit with the mark (`shows`).
 *
 * Nothing while it comes down, rests or is beaten: nothing hangs to shoot.
 */
export function broodCues(
  l: Layout,
  world: World,
  s: BroodState,
  beatPhase = 0,
): readonly BossCue[] {
  const bud = broodBudIn(world, s, world.cannonCol);
  if (bud === undefined) return [];
  const sac = broodSacAt(l, world.cfg, s, world.beat, beatPhase);
  const x = broodBudX(l, bud);
  const ripe = broodRipe(s, bud, world.beat, beatPhase);
  const aim = broodBudCircle(broodRimOver(sac, x), x, ripe, l.tile);
  const cue = markAt(2, "PRESS", "FIRE", aim.x, aim.y, l, 49);
  return [{ ...cue, aim, shows: bud.color, why: "BEFORE IT DROPS" }];
}
