import {
  GOVERNOR_DOWN_MILLI,
  type GovernorState,
  governorTicksToTip,
  governorVerdict,
  type World,
} from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, roundFoot } from "./core-stop.js";
import { type Dial, dialAt, GAP_MILLI, rimDepth, TRACK_OUT } from "./governor-shape.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE GOVERNOR**, for `BoltStops` (`bolt-stop.ts`): up
 * the middle column, through the gap cut in the bottom of the rim, to the
 * track inside it — the lit tip if it is there, the face if it is not — and
 * over any other x the flywheel's near edge, the brass rim showing under the
 * face, which is the lowest of it.
 *
 * **A bolt is asked about by when it will meet the tip**: the tip takes a
 * bolt that finds it in the gap (`sim/governor-shot.ts`), so the verdict is
 * asked with the ticks this bolt still has to climb — the needle then, not
 * the needle now.
 */
export function governorStopper(l: Layout, world: World, _s: GovernorState, d: Dial): Stopper {
  const gap = governorGapAt(d);
  const wheel = roundFoot(d.cx, d.cy + rimDepth(l, d), d.r, d.r * d.tilt);
  const half = gap.half;
  const foot: Foot = (x) => (Math.abs(x - d.cx) < half ? gap.y : wheel(x));
  return (col, x, color, bullet) => {
    const ahead = bullet === undefined ? undefined : governorTicksToTip(world.cfg, bullet);
    const verdict = (w: World, c: number, k: typeof color) => governorVerdict(w, c, k, ahead);
    return coreStopper(world, verdict, gap.y, foot)(col, x, color);
  };
}

/** The gap at the bottom of the rim: the y of the track's edge inside it, and its half-width in pixels. */
export function governorGapAt(d: Dial): { y: number; half: number } {
  const back = dialAt(d, GOVERNOR_DOWN_MILLI, TRACK_OUT);
  const side = dialAt(d, GOVERNOR_DOWN_MILLI - GAP_MILLI, 1);
  return { y: back.y, half: side.x - d.cx };
}
