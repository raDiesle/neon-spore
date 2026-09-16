import type { ControlId } from "../../../../../packages/content/src/controls.js";
import type { SceneAnchor } from "../../../../../packages/content/src/scene-step-types.js";
import type { AnchorPoint } from "../../../../../packages/render/src/caption-anchor.js";
import { creatureHalfAxes } from "../../../../../packages/render/src/creature-axes.js";
import { creatureCenter } from "../../../../../packages/render/src/creature-place.js";
import { glidePhase } from "../../../../../packages/render/src/depth.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import type { Creature } from "../../../../../packages/sim/src/creature-types.js";
import { spanOf } from "../../../../../packages/sim/src/span.js";
import type { World } from "../../../../../packages/sim/src/world.js";

/**
 * The second thing a page is about, ringed and never written on.
 *
 * **The owner's ask, in his words**: *it requires to also highlight without
 * text what is relevant for the next steps e.g. the player 1 moves cannon,
 * because its same position as of the right side slick, so also slick must be
 * highlighted, but no text at the same time.* A page that says PLAYER 1 MOVES
 * CANNON rings the cannon and says nothing about what the cannon is being
 * moved *to*, which is the half of the sentence a pair actually has to act on.
 *
 * **There is no companion in `SceneAnchor`.** A step names one anchor and
 * nothing else, so a second subject is either a new field on `SceneStep` —
 * content, which a look cannot patch — or it is derived here from the world.
 * Derived, because `caption` is handed the `World` and can simply ask it.
 *
 * **The table is deliberately two rows long.** A control that puts something
 * over a column is about whatever is coming down that column, and that is the
 * whole of what is known to be true. Anything else — ringing the cannon on a
 * page about a body, ringing a pod on a page about the shield — is a guess
 * about what the author meant, and a wrong ring is worse than none: it teaches
 * a pair to look at something that does not matter. When there is no answer
 * this returns null and the page draws exactly one ring, which is what every
 * page does today.
 */

/** The controls that stand something over a column, and which column it is. */
const OVER_COLUMN: Partial<Record<ControlId, (w: World) => number>> = {
  cannon: (w) => w.cannonCol,
  shield: (w) => w.shieldCol,
};

/** The second subject of this page, or null when there is honestly not one. */
export function companionPoint(
  l: Layout,
  world: World,
  anchor: SceneAnchor,
  beatPhase: number,
): AnchorPoint | null {
  if (anchor.at !== "control" && anchor.at !== "ship") return null;
  const column = OVER_COLUMN[anchor.control];
  if (!column) return null;
  const body = lowestOver(world, column(world));
  if (!body) return null;
  const glide = glidePhase(world.cfg, world.beat, body, beatPhase);
  const at = creatureCenter(l, world, body, glide);
  // Both half-axes: a body is wider than it is tall, and a silent ring that
  // cuts through the two ends of the thing it is pointing at says the wrong
  // thing louder than the caption beside it (`creature-axes.ts`).
  const axes = creatureHalfAxes(l, world, body, glide);
  return { x: at.x, y: at.y, r: axes.ry + 6, rx: axes.rx + 6, clear: 0 };
}

/**
 * The body standing over a column — the lowest of them, because that is the
 * one the column's next beat is about.
 *
 * A wide body covers more columns than the one it is placed in, so the test is
 * its span rather than `c.col`: a rock two columns across is over the cannon
 * when the cannon is under either of them, and `spanOf` is the one place that
 * width is decided (`packages/sim`).
 */
function lowestOver(world: World, col: number): Creature | null {
  let best: Creature | null = null;
  for (const c of world.creatures) {
    const half = (spanOf(c) - 1) / 2;
    if (col < c.col - half || col > c.col + half) continue;
    if (!best || c.row > best.row) best = c;
  }
  return best;
}
