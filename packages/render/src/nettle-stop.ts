import { type NettleState, nettleVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { type Foot, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import type { Sway } from "./instar-sway.js";
import type { Layout } from "./layout.js";
import { nettleBellPoints, nettleSac } from "./nettle-body.js";
import type { Figure } from "./nettle-figure.js";
import { sceneStopper } from "./scene-stop.js";

/** Where the bell is laid this frame, as `drawNettle` lays it: its middle, shake and jolt in it, and its radius. */
export interface NettleBell {
  x: number;
  y: number;
  r: number;
}

/**
 * **Where a bolt meets THE NETTLE**, for `BoltStops` (`bolt-stop.ts`): a
 * SHOOT mark over its column (`scene-stop.ts`, `nettleVerdict`), and
 * otherwise the lowest of the bell and, while its crown is turned to the
 * pair, the brood sac under it.
 *
 * The marks are planted on the bell — its eyespots, its core — well above
 * its lower edge, so a bolt the simulation says reached one is drawn
 * reaching it up through the bell. That is a look, and it is not fixed
 * here. The stinging arms and the oral-arm curtain are strokes a bolt
 * passes; the globs and spores sit inside the bell.
 */
export function nettleStopper(
  l: Layout,
  world: World,
  s: NettleState,
  sway: Sway,
  bell: NettleBell,
  f: Figure,
  fade: number,
  beat: number,
  beatPhase: number,
  time: number,
): Stopper {
  const feet: Foot[] = [outlineFoot(nettleBellPoints(bell.x, bell.y, bell.r, time))];
  if (f.sac > 0 && fade * (1 - f.side) > 0.01) {
    const sac = nettleSac(bell.x, bell.y, bell.r, f);
    feet.push(roundFoot(sac.x, sac.y, sac.r));
  }
  return sceneStopper(l, world, s, sway, beat, beatPhase, nettleVerdict, lowestFoot(feet));
}
