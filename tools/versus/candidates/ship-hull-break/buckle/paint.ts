import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { signedHash } from "../../../../../packages/render/src/hash.js";
import type { HullBreakPaint } from "../../../../../packages/render/src/hull-break-look.js";

/**
 * No new material at all: the ship's own membrane pressed in at the column it
 * was hit, and stress lines running out of the dent along the skin both ways.
 *
 * **What it argues** is that the other two answers in this slot add things to
 * a picture that is already dense — flaps, cavities, ribs, vents — and that
 * the cheapest way to say a ship is hurt is to bend it. The dent rides
 * `skinY`, so it is the ship's own outline deformed rather than a shape laid
 * over it, and nothing here is drawn outside the silhouette.
 */

/** How far the break reaches past the hole, in tiles. */
export const OPEN = 2.2;

/** How deep the membrane is pressed, as a share of the reach. */
const DEPTH = 0.3;

/** Steps along the dent. */
const STEPS = 16;

/** Stress lines each way out of the dent. */
const LINES = 3;

export function buckle(ctx: CanvasRenderingContext2D, b: HullBreakPaint): void {
  const reach = b.tile * OPEN;
  const deep = reach * DEPTH;

  // The dent: the skin line from one side of the reach to the other, pushed
  // down hardest at the hole and back to where it was at both ends.
  const dent = new Path2D();
  for (let k = 0; k <= STEPS; k++) {
    const u = k / STEPS;
    const x = b.x - reach + reach * 2 * u;
    const press = Math.sin(u * Math.PI) ** 2;
    const y = b.skinY(x) + deep * press;
    if (k === 0) dent.moveTo(x, y);
    else dent.lineTo(x, y);
  }
  strokeGlow(ctx, dent, b.rim, Math.max(1.2, b.tile * 0.045), 0.9);

  // And what the bending cost: short lines across the dent, standing where the
  // membrane had to fold. They kink off the column and the angle the rock came
  // to rest at, so two dents in one hull are not the same picture.
  for (const side of [-1, 1] as const) {
    for (let i = 1; i <= LINES; i++) {
      const u = i / (LINES + 1);
      const x = b.x + side * reach * u;
      const press = Math.sin((0.5 + side * u * 0.5) * Math.PI) ** 2;
      const top = b.skinY(x) + deep * press;
      const wander = signedHash(b.seed, i, side) * b.tile * 0.12;
      const line = new Path2D();
      line.moveTo(x, top);
      line.lineTo(x + wander, top + b.tile * 0.34 * (1 - u * 0.5));
      strokeGlow(ctx, line, b.rim, Math.max(1, b.tile * 0.025), 0.45);
    }
  }
}
