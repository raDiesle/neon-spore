import type { LightHalf } from "@neon-spore/content";
import { litBox } from "./key-light.js";

/**
 * WHO LIGHTS THE SHIP, AS A RECORD.
 *
 * `drawHull` called `litBox` directly, which meant the one pass that decides
 * whether the hull reads as a solid had nowhere for a second answer to sit —
 * the same gap `living-skin.ts` was written to close for a creature's material.
 * This is that seam and nothing else: the shipped light is `litBox`, unchanged,
 * and it is reached through a record so `tools/versus/` can hold another
 * against it at tempo instead of in a branch.
 *
 * **The argument the seam exists for.** `litBox` runs the key ramp along a
 * straight line across a rectangle. That is right for a flat panel and it is
 * what the hull is not: a membrane bulging toward the viewer takes its light by
 * its own normal, so the falloff across the field should be a cosine of where
 * the surface is pointing rather than a linear walk across a box.
 * `docs/style-guide.md`'s depth section is the direction, and
 * `packages/content/src/surface.ts` is the arithmetic either answer reads.
 */

/**
 * What a light is given. More than `litBox` uses, and deliberately: a light on
 * a membrane needs the membrane, and every field here is something `drawHull`
 * already holds by the time it asks for one. A candidate that follows the
 * contour would otherwise have to guess where the surface is, and guessing it
 * is the defect — the straight lower edge `sheen.ts`'s header describes.
 */
export interface HullLit {
  /** The filled body, contour down to the hull's own bottom: what to paint. */
  readonly region: Path2D;
  /** The membrane's outline alone, for a pass that has to follow it. */
  readonly body: Path2D;
  /** The box the ship is drawn in — the columns, not the window. */
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** Value alone, or value and hue. The hull takes both (`LIGHT_HALF`). */
  readonly half: LightHalf;
}

export interface HullLight {
  lit(ctx: CanvasRenderingContext2D, s: HullLit): void;
}

/** The shipped light: the key ramp along its axis across the hull's box. */
export const HULL_LIGHT: HullLight = {
  lit(ctx, s) {
    litBox(ctx, s.region, s.x, s.y, s.w, s.h, s.half);
  },
};
