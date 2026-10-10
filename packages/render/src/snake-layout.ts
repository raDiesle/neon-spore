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
 *
 * **And the four buttons are big on it**, the owner, 10 October 2026: *make
 * the buttons bigger and more understandable what each does.* A band at half
 * height gave a lobe half its radius — fifteen pixels on a phone, under a
 * thumb. The round has no strips, so its buttons take the band's whole
 * height: they stand in its middle and fill most of it (`BIG`).
 */
export function snakeLayout(l: Layout, world: World): Layout {
  const boss = world.boss;
  if (boss === null || boss.kind !== "snake") return l;
  const scale = world.cfg.snakeHullPct / 100;
  if (scale === l.hullScale) return l;
  const vp = { width: l.width, height: l.height, dpr: l.dpr };
  return bigLobes(computeLayout(vp, world.cfg, l.role, scale));
}

/**
 * A button's radius as a share of the band's height, and its cap as a share
 * of the width — one seat's screen, then the test screen, where four stand in
 * one row and `hitReach` answers a ring wider than the one drawn.
 */
const BIG = {
  solo: { band: 0.42, width: 0.09 },
  test: { band: 0.3, width: 0.06 },
} as const;

/** Where the buttons stand down the band: its middle. */
const BIG_ROW = 0.5;

function bigLobes(l: Layout): Layout {
  const share = l.role === "test" ? BIG.test : BIG.solo;
  return {
    ...l,
    lobeY: l.bandTop + l.bandHeight * BIG_ROW,
    lobeR: Math.min(l.bandHeight * share.band, l.width * share.width),
  };
}
