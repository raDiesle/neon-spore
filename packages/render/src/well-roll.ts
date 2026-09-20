import { type World, wellBoss } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * THE WELL's roll, as a screen sees it: **the whole clock face has turned, and
 * the seam is no longer at twelve.**
 *
 * The simulation authors how far (`sim/well.ts`: the seam slips a quarter of a
 * sector a beat, a thumb holds it, a thumb turns it home) and hashes it. What
 * is here is the one number that carries the angle into the picture, and the
 * rule about where it may be read.
 *
 * **It reaches the projection and only through its two doors.** The face is
 * drawn from `wellAngle`, which turns a column into an angle, and answered by
 * `wellSectorUnder`, which turns an angle back into a column (`well.ts`,
 * `touch-well.ts`). Add the offset in those two and everything downstream —
 * the numerals, the bodies falling down their lanes, the cannon on its rim,
 * the shield's arc, the sparks, the bowl and the spokes — turns with it for
 * nothing, because all of them already ask one of the two where a column is.
 * Sixty call sites and no sixty-way edit.
 *
 * **The layout carries it, for `flippedLayout`'s reason exactly.** A hit test
 * is handed a layout and never a world, and the rule `layout.ts` keeps is that
 * a thing is never drawn in one place and answered in another. A face that had
 * turned in the frame and not under the thumb would hand back the column that
 * used to be at four o'clock, on a picture whose entire content is that it
 * agrees with the hand. So the angle is a field of the layout, set by the two
 * callers that have a world (`canvas2d.ts` draws with it,
 * `apps/game/src/field-input.ts` answers with it).
 */
export function rolledLayout(l: Layout, world: World): Layout {
  const b = wellBoss(world);
  return b !== null && b.offsetMilli !== 0 ? { ...l, wellRoll: b.offsetMilli } : l;
}
