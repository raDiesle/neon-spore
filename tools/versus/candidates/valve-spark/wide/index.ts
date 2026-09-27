import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { Point } from "../../../../../packages/render/src/valve-shape.js";
import * as look from "../../../../../packages/render/src/valve-spark.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * WIDE — offered 27 September 2026, from the queue's "§25 THE VALVE — the
 * second spark's severity, offered on VERSUS". The spec's row 11 asks the
 * second spark read at a *different severity* from the first; the game draws
 * them as one bead. The first is left as it is, and the second is half as
 * wide again, hotter, trailing three hiss streaks up the way it came and
 * glowing twice as hard — a thing that has got worse since the last one.
 */
const shipped = look.VALVE_SPARK.paint;

/** The second bead's half-width and half-height, in tiles: the first's 0.16 and 0.24, widened. */
const WIDE_RX = 0.26;
const WIDE_RY = 0.32;
/** The hiss streaks trailing it, their spread and length in tiles. */
const STREAKS = [-0.18, 0, 0.18];
const STREAK_LEN = 0.7;

function paint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  along: number,
  which: number,
): void {
  if (which < 2) {
    shipped(ctx, l, at, along, which);
    return;
  }
  const { x, y } = at;
  const hiss = new Path2D();
  for (const dx of STREAKS) {
    hiss.moveTo(x + dx * l.tile, y - WIDE_RY * 0.6 * l.tile);
    hiss.lineTo(x + dx * 1.6 * l.tile, y - (WIDE_RY + STREAK_LEN) * l.tile);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.emberRim, 0.5 + 0.3 * along);
  ctx.stroke(hiss);
  const bead = new Path2D();
  bead.ellipse(x, y, l.tile * WIDE_RX, l.tile * WIDE_RY, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.ember, 0.75 + 0.25 * along);
  ctx.fill(bead);
  strokeGlow(ctx, bead, PALETTE.emberRim, STROKE.outline, 2 + 2 * along);
}

export const VALVE_SPARK_WIDE: Variant = {
  slot: "valve:spark",
  name: "wide",
  sentence:
    "wide — THE VALVE's second spark falls half as wide again as the first, hotter, glowing harder and trailing three hiss streaks, so it reads as worse",
  dir: "tools/versus/candidates/valve-spark/wide",
  patches: [
    patch({
      target: look.VALVE_SPARK,
      reached: () => look.VALVE_SPARK,
      where: {
        file: "packages/render/src/valve-spark.ts",
        symbol: "VALVE_SPARK",
        type: "{ paint: (ctx: CanvasRenderingContext2D, l: Layout, at: Point, along: number, which: number) => void }",
      },
      fields: { paint },
    }),
  ],
};
