import { colSpan } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * How big a rock is on screen, and which way it faces. Four numbers and
 * nothing drawn: the crater a rock leaves, the dent it makes, the bounce off
 * the shield and the pile in THE CAIRN all size themselves from here, and
 * used to load the torch's whole picture (`torch.ts`) to do it. The picture
 * reads these too; nothing reads the picture to get them.
 */

/**
 * How far a **full-width** torch's radius reaches, in tiles.
 *
 * The kind's own width and not a body's, which is the whole of what this is
 * for: it answers for the fixtures — the queen's sockets, the shape sheet, the
 * director's cards — where there is no creature to ask and a torch is the
 * two-tile thing the name has always meant. A torch actually standing in the
 * field is asked `rockRadius(l, spanOf(c))` instead, because its width is
 * authored now (`RockSize`) and a one-tile torch is a thing a wave may write.
 */
export function torchRadius(l: Layout): number {
  return rockRadius(l, colSpan("torch"));
}

/**
 * A rock's own radius, torch or plain tier alike — the one place both
 * `drawMeteor` (creatures.ts) and every impact/crater visual read it from, so
 * a crater is never sized by a copy of the number its own rock draws at.
 *
 * It takes the **span** rather than the kind, and that is the whole of what a
 * rock's size means on screen: a one-tile rock reaches 0.4 of a tile, a
 * two-tile one reaches 0.8 and fills the 2x2 square. The torch used to be the
 * only wide rock and had a number of its own here; it is now simply the rock
 * whose span is two, and the plain tiers reach the same width whenever a wave
 * authors them that way (`RockSize`, sim/kinds.ts).
 */
export function rockRadius(l: Layout, span = 1): number {
  return rockTileRadius(l.tile, span);
}

/**
 * The same rule, asked with a **tile width** rather than a whole layout —
 * for `DeflectFx`, which is handed one number and no layout at all. It is the
 * one place the arithmetic lives: a bounced rock sized by a second copy of
 * `0.4` is how a two-tile rock came to shrink to one the moment the shield
 * turned it, which is exactly the defect this seam repairs.
 */
export function rockTileRadius(tile: number, span = 1): number {
  return tile * 0.4 * span;
}

/**
 * The rock's own facing, from its screen x alone — deterministic and
 * shared between `rock-impact.ts`'s embedded rock and `scars.ts`'s dent in
 * the hull it left, so the two are drawn at the exact same orientation and
 * the dent reads as a hole this exact rock made, not a generic one.
 */
export function torchRotation(x: number): number {
  return (x * 0.37) % (Math.PI * 2);
}
