import {
  type ScuttleState,
  scuttlePartCol,
  scuttleSocketCol,
  scuttleVerdict,
  type World,
} from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, type Foot, lowestFoot, outlineFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { outlinePoints, scuttlePlate, scuttleSlab } from "./scuttle-outline.js";
import { PLATE_HALF_H, scuttleShiver, scuttleSocket } from "./scuttle-shape.js";

/** Where the frame stands this frame, as `drawScuttle` lays it. */
export interface ScuttleFrame {
  /** The hurt's shake across, in pixels. */
  shake: number;
  /** How far the frame has drawn back up, in pixels, the throw's jolt in it. */
  rise: number;
  /** How far a loose part has slid down out of its socket, in pixels. */
  hang: number;
  /** How far the frame has wind-up shiver to give (`scuttleWindPhase`), 0 for none. */
  wind: number;
  /** How far it has closed on its way out, 1 whole. */
  fade: number;
}

/**
 * **Where a bolt meets THE SCUTTLE**, for `BoltStops` (`bolt-stop.ts`): the
 * live part where it hangs, at its lower edge, in its own colour as
 * `target` and the other as `wrong` (`scuttleVerdict`); and otherwise the
 * lowest of what is drawn over that x — the slab, and each loose part
 * hanging under its socket where the pilot swung it, the wind-up's shiver
 * in it. Both screens stop a bolt alike: what is drawn in the sockets
 * differs between them, and the sockets are inside the slab.
 *
 * The threads are strokes a bolt passes.
 */
export function scuttleStopper(
  l: Layout,
  world: World,
  s: ScuttleState,
  frame: ScuttleFrame,
  beat: number,
  beatPhase: number,
  time: number,
): Stopper {
  const cfg = world.cfg;
  const slab = outlinePoints(scuttleSlab(l, cfg, frame.rise, frame.fade, time));
  const feet: Foot[] = [outlineFoot(slab, frame.shake)];
  let live: number | null = null;
  for (const i of s.loose) {
    if ((s.parts[i] ?? null) === null) continue;
    const c = scuttleSocket(l, cfg, i, frame.rise);
    if (frame.wind > 0) c.x += scuttleShiver(l, cfg, world, s, beat, beatPhase, time);
    const at = {
      x: c.x + l.tile * (scuttlePartCol(s, cfg, i) - scuttleSocketCol(cfg, i)),
      y: c.y + frame.hang,
    };
    feet.push(
      outlineFoot(outlinePoints(scuttlePlate(l, at, frame.fade, PLATE_HALF_H)), frame.shake),
    );
    if (i === s.live) live = at.y + PLATE_HALF_H * l.tile;
  }
  const foot = lowestFoot(feet);
  // A live part not yet loose is still seated, inside the slab.
  const part = live ?? scuttleSocket(l, cfg, Math.max(0, s.live), frame.rise).y;
  return coreStopper(world, scuttleVerdict, part, foot);
}
