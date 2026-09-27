import * as look from "../../../../../packages/render/src/grindstone-draw.js";
import { grindstoneBolt } from "../../../../../packages/render/src/grindstone-shape.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * TREMBLE — offered 27 September 2026, from the queue's "THE GRINDSTONE's
 * wheel has no secondary motion of its own". Outside the beat pulses the only
 * clock on this boss is the light's drift, and the wheel cannot be the thing
 * that moves: how far it is ground is read off its cut faces. So the caliper
 * moves instead. Each open jaw trembles a hair at its tip about the crown
 * bolt, the two a fifth of a cycle apart, and goes dead still as it bears on
 * the stone: the tremble is scaled by how far the jaw is still open, so a
 * shut jaw has none.
 *
 * The shipped jaw is drawn under the turn and not copied, so its flare as it
 * bites and its pads are the same.
 */
/** How far an open jaw trembles each way about the bolt, in radians. */
const TREMBLE = 0.025;
/** Its rate in radians a second: a tremble, not a sway, and off the beat. */
const TREMBLE_RATE = 8.3;
/** How far the second jaw's tremble is out of step with the first. */
const APART = (Math.PI * 2) / 5;

const tremblingJaw: look.GrindstoneJawPaint = (
  ctx,
  l,
  side,
  shut,
  lit,
  down,
  beatPhase,
  free,
  flare,
  time,
) => {
  const open = Math.max(0, 1 - shut) * (1 - free);
  const bolt = grindstoneBolt(l, shut);
  ctx.translate(bolt.x, bolt.y);
  ctx.rotate(TREMBLE * open * Math.sin(time * TREMBLE_RATE + side * APART));
  ctx.translate(-bolt.x, -bolt.y);
  look.drawJaw(ctx, l, side, shut, lit, down, beatPhase, free, flare);
};

export const GRINDSTONE_JAW_TREMBLE: Variant = {
  slot: "grindstone:jaw",
  name: "tremble",
  sentence:
    "tremble — THE GRINDSTONE's two caliper jaws tremble a hair at their tips while they stand open, a fifth of a cycle apart, and go dead still as they bite the stone",
  dir: "tools/versus/candidates/grindstone-jaw/tremble",
  patches: [
    patch({
      target: look.GRINDSTONE_JAW,
      reached: () => look.GRINDSTONE_JAW,
      where: {
        file: "packages/render/src/grindstone-draw.ts",
        symbol: "GRINDSTONE_JAW",
        type: "{ paint: GrindstoneJawPaint }",
      },
      fields: { paint: tremblingJaw },
    }),
  ],
};
