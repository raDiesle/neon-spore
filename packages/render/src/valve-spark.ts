import { VALVE_PINS, type ValveState, type World } from "@neon-spore/sim";
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
 * `which` says which spark it is, 1 or 2, counted off the pins already out.
 * The simulation does not tell them apart; the spec asks they read at
 * different severity, the second wider and louder, and that is offered on
 * VERSUS `valve:spark` rather than drawn here — so both are the one bead
 * today. A record, so a second answer can stand beside it.
 */
export const VALVE_SPARK: {
  paint: (
    ctx: CanvasRenderingContext2D,
    l: Layout,
    at: Point,
    along: number,
    which: number,
  ) => void;
} = {
  paint: (ctx, l, { x, y }, along) => {
    const bead = new Path2D();
    bead.ellipse(x, y, l.tile * 0.16, l.tile * 0.24, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.ember, 0.55 + 0.4 * along);
    ctx.fill(bead);
    strokeGlow(ctx, bead, PALETTE.emberRim, STROKE.inner, 1 + along);
  },
};

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
  const which = Math.max(1, Math.min(2, VALVE_PINS - s.pins));
  VALVE_SPARK.paint(ctx, l, valveSparkPoint(l, at, s.sparkCol, along), along, which);
}
