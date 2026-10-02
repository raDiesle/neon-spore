import { plumbVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import {
  coreStopper,
  type Foot,
  lowestFoot,
  outlineFoot,
  rodFoot,
  roundFoot,
} from "./core-stop.js";
import type { Circle, Layout } from "./layout.js";
import {
  type Point,
  plumbBar,
  plumbBeamEnd,
  plumbBeamY,
  plumbCoreAt,
  plumbGlass,
  plumbSacMiddle,
  plumbSacPoints,
} from "./plumb-shape.js";

/** Where the drawer has hung the bob this frame. */
export interface PlumbHang {
  /** The hook on the field, shaken and lifted as drawn. */
  at: Point;
  skew: number;
  /** How wide the sac is turned to, and its wobble's clock. */
  wide: number;
  time: number;
  /** Each weight's stone as drawn, about the hook. */
  stones: readonly Circle[];
}

/**
 * **Where a bolt meets THE PLUMB**, for `BoltStops` (`bolt-stop.ts`): the
 * core in the sac's belly, lit on a fire step, at its near rim, and
 * otherwise the lowest of the sac, the beam and its stem, each weight's
 * chain and stone, and the two spirit levels under them.
 *
 * The sac hangs face-on with the core in its belly, so a bolt up the middle
 * column to a lit core crosses the sac's face on its way.
 */
export function plumbStopper(l: Layout, world: World, h: PlumbHang): Stopper {
  const c = Math.cos(h.skew);
  const k = Math.sin(h.skew);
  const turned = (p: Point): Point => ({
    x: h.at.x + p.x * c - p.y * k,
    y: h.at.y + p.x * k + p.y * c,
  });
  const off = (p: Point): Point => ({ x: h.at.x + p.x, y: h.at.y + p.y });
  const mid = plumbSacMiddle(l);
  const bar = plumbBar(l);
  const ends = [plumbBeamEnd(l, 0, h.skew), plumbBeamEnd(l, 1, h.skew)] as const;
  const feet: Foot[] = [
    outlineFoot(
      plumbSacPoints(l, h.wide, h.time).map((p) => turned({ x: p.x + mid.x, y: p.y + mid.y })),
    ),
    rodFoot(off(ends[0]), off(ends[1]), bar.beam),
    rodFoot(h.at, turned({ x: 0, y: plumbBeamY(l) }), bar.stem),
  ];
  for (const side of [0, 1] as const) {
    const stone = h.stones[side];
    if (stone === undefined) continue;
    feet.push(rodFoot(off(ends[side]), off(stone), 0.07 * l.tile));
    feet.push(roundFoot(h.at.x + stone.x, h.at.y + stone.y, stone.r));
    const g = plumbGlass(l, side);
    feet.push(rodFoot(off({ x: g.x - g.hw, y: g.y }), off({ x: g.x + g.hw, y: g.y }), g.hh));
  }
  const core = plumbCoreAt(l, h.at, h.skew);
  return coreStopper(world, plumbVerdict, core.y + core.r, lowestFoot(feet));
}
