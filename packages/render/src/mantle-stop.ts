import { type MantleState, mantleVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, lowestFoot, outlineFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { MANTLE_SPARK, mantleCoreLife, mantleCorePoints, mantleSparkNow } from "./mantle-pose.js";
import { mantleRimPoints, type Point, type Side, type ValvePose } from "./mantle-shape.js";

/**
 * **Where a bolt meets THE MANTLE**, for `BoltStops` (`bolt-stop.ts`): the
 * leaking spark in its column, in either colour (`mantleVerdict`), at the
 * bead's lower end; and otherwise the lowest of what is drawn over that x —
 * each valve inside its rim, plates and the gaps the shed ones left alike,
 * and the core while it has any life to show — all `shift` off where they
 * stand, as the shudder, the kick and the drop-in lay them.
 *
 * The handles, their straps and the cord hang outboard of the shell as
 * strokes and a knob a thumb drags, and they are not met here.
 */
export function mantleStopper(
  l: Layout,
  world: World,
  s: MantleState,
  at: Point,
  poses: Record<Side, ValvePose>,
  shift: Point,
  beat: number,
  beatPhase: number,
): Stopper {
  const cfg = world.cfg;
  const feet: Foot[] = ([-1, 1] as const).map((side) =>
    outlineFoot(mantleRimPoints(l, at, side, poses[side]), shift.x, shift.y),
  );
  if (mantleCoreLife(s, cfg, beat, beatPhase) > 0)
    feet.push(outlineFoot(mantleCorePoints(l, cfg, s, at, beat, beatPhase), shift.x, shift.y));
  const spark = mantleSparkNow(l, cfg, s, beat, beatPhase).y + MANTLE_SPARK.ry * l.tile + shift.y;
  return coreStopper(world, mantleVerdict, spark, lowestFoot(feet));
}
