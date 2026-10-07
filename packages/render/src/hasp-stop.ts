import { HASP_COUNT, type HaspState, haspVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import { HASP_BOLT, haspBoltAt } from "./hasp-bolt.js";
import { haspLatchBar } from "./hasp-parts.js";
import { haspCentre, haspHubRadius, haspShellHalves, type Point } from "./hasp-shape.js";
import type { Layout } from "./layout.js";

/** How a clasp is drawn this frame: its gape, and how far it swings on its pin (`hasp-sway.ts`). */
export interface HaspSwung {
  gape: number;
  swing: number;
}

/**
 * **Where a bolt meets THE HASP**, for `BoltStops` (`bolt-stop.ts`): the
 * loose bolt in its own column, in either colour (`haspVerdict`), at its
 * lower end; and otherwise the lowest of what this screen draws over that x
 * — each clasp's two half-shells at the gape and the swing they are drawn at
 * (`swung`), the hub, wheel or cap, over each, and the latch's bar on a
 * screen shown the latch — all `shift` off where they stand, as the jolt lays
 * them.
 *
 * The loose bolt falls from the second clasp's hub, so for the first of its
 * fall it hangs inside that spent clasp and above the first one's nose, and a
 * bolt the simulation says reached it is drawn reaching it up through them.
 * That is a look, and it is not fixed here.
 */
export function haspStopper(
  l: Layout,
  world: World,
  s: HaspState,
  swung: readonly HaspSwung[],
  shift: Point,
  wheel: boolean,
  latch: boolean,
  beat: number,
  beatPhase: number,
): Stopper {
  const cfg = world.cfg;
  const hub = haspHubRadius(l) * (wheel ? 1 : CAP);
  const feet: Foot[] = [];
  for (let i = 0; i < HASP_COUNT; i++) {
    const at = swung[i] ?? { gape: 0, swing: 0 };
    for (const half of haspShellHalves(l, cfg, i, at.gape, at.swing))
      feet.push(outlineFoot(half, shift.x, shift.y));
    const hubAt = haspCentre(l, cfg, i);
    feet.push(roundFoot(hubAt.x + shift.x, hubAt.y + shift.y, hub));
  }
  const bar = latch ? haspLatchBar(l, cfg, s) : null;
  if (bar !== null) {
    const x0 = bar.x - bar.halfW;
    const x1 = bar.x + bar.halfW;
    const y0 = bar.y - bar.thick;
    const y1 = bar.y + bar.thick;
    const plate = [
      { x: x0, y: y0 },
      { x: x1, y: y0 },
      { x: x1, y: y1 },
      { x: x0, y: y1 },
    ];
    feet.push(outlineFoot(plate, shift.x, shift.y));
  }
  const bolt = haspBoltAt(l, cfg, s, beat, beatPhase).y + HASP_BOLT.halfH * l.tile + shift.y;
  return coreStopper(world, haspVerdict, bolt, lowestFoot(feet));
}

/** The cap's share of the hub, on a screen shown no wheel (`hasp-parts.ts`'s `drawHaspCap`). */
const CAP = 0.8;
