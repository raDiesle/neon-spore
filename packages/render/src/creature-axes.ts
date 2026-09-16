import { hasOwnBody, livingSilhouette } from "@neon-spore/content";
import { type Creature, isMeteorKind, type World, wornKind } from "@neon-spore/sim";
import { creatureRadius, livingScale } from "./creature-place.js";
import type { Layout } from "./layout.js";

/**
 * **How wide and how tall a body is actually drawn** — the other half of
 * `creatureRadius`, which is one number because most of what asks it wants a
 * scale rather than an extent.
 *
 * A living body is a lobed blob and every one of them is wider than it is
 * tall (`silhouettes.ts` gives each an `rx` and an `ry`). So a ring placed at
 * one radius cuts through the two ends of a slick: the shape pokes out either
 * side of the circle that is supposed to be containing it, which is what the
 * tutorial's ring did to every body it ever pointed at, on the field and on
 * every candidate in `guide:chrome`.
 *
 * **The half-width is not re-derived here and must not be re-derived at a
 * ring.** `livingScale` is the one place a silhouette's units become pixels,
 * and it is asked the same question `drawLiving` asks it: a body's extent
 * along an axis is its contour's half-axis times that scale. Anything else is
 * a second copy of how big a body is, and the day a contour is retuned it is
 * the ring that quietly stops fitting.
 *
 * Its own file rather than a function under `creatureRadius`: `creature-place.ts`
 * stands at 226 of its 250 lines, and a rule this long in prose is exactly the
 * kind of thing that goes in as four lines and takes a file over
 * (`docs/queue.md` has watched that happen).
 */
export interface HalfAxes {
  /** Half the drawn width. */
  rx: number;
  /** Half the drawn height — what `creatureRadius` answers for a round body. */
  ry: number;
}

/**
 * A body's drawn half-axes, on the picture this screen is drawing.
 *
 * Round for everything without a contour of its own: a rock, which is drawn
 * from `rockRadius` and is as wide as it is tall, and any body whose look is
 * something else entirely — a crystal, a boss with its own draw path, the
 * tether. `wornKind` first, so a lure answers as the body it is wearing, which
 * is the same line `drawLiving` opens with and for the same reason.
 */
export function creatureHalfAxes(l: Layout, world: World, c: Creature, beatPhase = 0): HalfAxes {
  const r = creatureRadius(l, world, c, beatPhase);
  const look = wornKind(c);
  if (isMeteorKind(c.kind) || !hasOwnBody(look)) return { rx: r, ry: r };
  const shape = livingSilhouette(look);
  const scale = livingScale(shape, r);
  return { rx: shape.rx * scale, ry: shape.ry * scale };
}
