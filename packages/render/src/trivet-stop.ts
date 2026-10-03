import { trivetVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import {
  coreStopper,
  type Foot,
  lowestFoot,
  outlineFoot,
  rodFoot,
  roundFoot,
} from "./core-stop.js";
import type { Layout } from "./layout.js";
import {
  type Point,
  trivetFaceR,
  trivetHubPoints,
  trivetLegPoints,
  trivetPlateHalf,
} from "./trivet-shape.js";

/**
 * Where the stand is this frame, all in its own frame about (`x`, `y`) on
 * screen: the hub and its tilt, each leg root to foot, each outer foot's
 * plate and its turn, and the face's size.
 */
export interface TrivetStand {
  x: number;
  y: number;
  hub: Point & { tilt: number };
  legs: readonly (readonly [Point, Point])[];
  plates: readonly (Point & { turn: number })[];
  face: number;
}

/**
 * **Where a bolt meets THE TRIVET**, for `BoltStops` (`bolt-stop.ts`): the
 * hub's face, lit on a fire step, or thrown out over its column on a lurch
 * with the foot it leans on held, at its lower rim; and otherwise the lowest
 * of the hub, the three legs and the two outer plates.
 *
 * The middle leg hangs straight down the middle column from the hub, and a
 * bolt up that column to the face is drawn up along it. That is a look, and
 * it is not fixed here; a lurched hub hangs clear of it.
 */
export function trivetStopper(l: Layout, world: World, at: TrivetStand): Stopper {
  const { x, y } = at;
  const c = Math.cos(at.hub.tilt);
  const n = Math.sin(at.hub.tilt);
  const hub = trivetHubPoints(l).map((p) => ({ x: p.x * c - p.y * n, y: p.x * n + p.y * c }));
  const feet: Foot[] = [outlineFoot(hub, x + at.hub.x, y + at.hub.y)];
  for (const [from, to] of at.legs) feet.push(outlineFoot(trivetLegPoints(l, from, to), x, y));
  const { hx, hy } = trivetPlateHalf(l);
  for (const plate of at.plates) {
    const ux = Math.cos(plate.turn) * (hx - hy);
    const uy = Math.sin(plate.turn) * (hx - hy);
    const a = { x: x + plate.x - ux, y: y + plate.y - uy };
    const b = { x: x + plate.x + ux, y: y + plate.y + uy };
    feet.push(rodFoot(a, b, hy), roundFoot(a.x, a.y, hy), roundFoot(b.x, b.y, hy));
  }
  const faceY = y + at.hub.y + trivetFaceR(l) * at.face;
  return coreStopper(world, trivetVerdict, faceY, lowestFoot(feet));
}
