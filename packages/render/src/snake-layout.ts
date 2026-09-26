import type { World } from "@neon-spore/sim";
import { computeLayout, type Layout } from "./layout.js";

/**
 * **SNAKE's short hull and band.** While a snake round holds the world, the
 * hull and the band stand at `snakeHullPct` of their usual height, and the
 * field above them grows into the room they give up.
 *
 * The owner, 25 September 2026: *have hull ship height around half of regular
 * one, as we have smaller controls.* The round has four buttons and no
 * strips, so a full band is mostly empty plate, and the arena is what the pair
 * are looking at.
 *
 * A layout rather than a branch in the drawing, for THE FLIP's reason: the
 * band is where a thumb lands, so the frame and the finger are handed the same
 * layout (`frameLayout`, `apps/game/src/field-input.ts`). It is the one step
 * of the three that moves things rather than marking the layout, so it is
 * computed again from the viewport and goes first.
 */
export function snakeLayout(l: Layout, world: World): Layout {
  const boss = world.boss;
  if (boss === null || boss.kind !== "snake") return l;
  const scale = world.cfg.snakeHullPct / 100;
  if (scale === l.hullScale) return l;
  const vp = { width: l.width, height: l.height, dpr: l.dpr };
  return computeLayout(vp, world.cfg, l.role, scale);
}
