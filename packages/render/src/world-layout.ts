import type { World } from "@neon-spore/sim";
import { flippedLayout } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { snakeLayout } from "./snake-layout.js";
import { rolledLayout } from "./well-roll.js";

/**
 * **The three things a world does to a layout, in one order, for both
 * callers.** The frame (`frameLayout`) and the finger
 * (`apps/game/src/field-input.ts`) are handed the layout this returns, so a
 * button is never drawn in one place and answered in another.
 *
 * - `snakeLayout` goes first, because it is the one that moves things: SNAKE's
 *   short band is a layout computed again from the viewport.
 * - `flippedLayout` is THE FLIP: the turned seat's field comes back mirrored.
 * - `rolledLayout` is THE WELL's face, turned.
 *
 * The last two only mark the layout, so they come after anything that
 * computes one.
 */
export function worldLayout(l: Layout, world: World): Layout {
  return rolledLayout(flippedLayout(snakeLayout(l, world), world), world);
}
