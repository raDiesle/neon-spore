import type { ValveState, World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { type Point, valveSparkPoint } from "./valve-shape.js";

/**
 * **THE VALVE's sparks** (§25 rows 7 and 11): an ember falling from under the
 * drum down its column, leaked as the first pin's jet is capped and again as
 * the second's shudder is braced (`sim/valve-step.ts`'s `valveLeak`).
 *
 * Both are drawn alike, as a threat: a wide hot bead trailing three hiss
 * streaks up the way it came. The spec asked the second read *worse* than the
 * first; the owner, 28 September 2026, turned that down — the hull takes one
 * hit and the wave is played again, so no spark is worse than another — and
 * took VERSUS `valve:spark`'s `wide` for both, as the easier to recognise.
 * A record, so a second answer can stand beside it.
 */
export const VALVE_SPARK: {
  paint: (ctx: CanvasRenderingContext2D, l: Layout, at: Point, along: number) => void;
} = {
  paint: (ctx, l, at, along) => paintSpark(ctx, l, at, along),
};

/** The bead's half-width and half-height, in tiles. */
const BEAD_RX = 0.26;
const BEAD_RY = 0.32;
/** The hiss streaks trailing it, their spread and length in tiles. */
const STREAKS = [-0.18, 0, 0.18];
const STREAK_LEN = 0.7;

function paintSpark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  { x, y }: Point,
  along: number,
): void {
  const hiss = new Path2D();
  for (const dx of STREAKS) {
    hiss.moveTo(x + dx * l.tile, y - BEAD_RY * 0.6 * l.tile);
    hiss.lineTo(x + dx * 1.6 * l.tile, y - (BEAD_RY + STREAK_LEN) * l.tile);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.emberRim, 0.5 + 0.3 * along);
  ctx.stroke(hiss);
  const bead = new Path2D();
  bead.ellipse(x, y, l.tile * BEAD_RX, l.tile * BEAD_RY, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.ember, 0.75 + 0.25 * along);
  ctx.fill(bead);
  strokeGlow(ctx, bead, PALETTE.emberRim, STROKE.outline, 2 + 2 * along);
}

/** The spark loose this frame, `along` the way down its fall from the drum at `at`. */
export function drawValveSpark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ValveState,
  at: Point,
  beat: number,
  beatPhase: number,
): void {
  const along = smoothstep(
    (beat - s.sparkBeat + beatPhase) / Math.max(1, world.cfg.valveSparkBeats),
  );
  VALVE_SPARK.paint(ctx, l, valveSparkPoint(l, at, s.sparkCol, along), along);
}
