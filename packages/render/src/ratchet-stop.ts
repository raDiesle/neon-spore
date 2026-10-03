import { RATCHET_TEETH, type RatchetState, ratchetVerdict, type World } from "@neon-spore/sim";
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
import { ratchetCatchBar, ratchetJaws, ratchetPawlArm } from "./ratchet-parts.js";
import { ratchetFoldScale } from "./ratchet-pose.js";
import {
  type Point,
  RATCHET_BOLT,
  ratchetBoltAt,
  ratchetLock,
  ratchetPlatePoints,
} from "./ratchet-shape.js";

/** Where the rack stands this frame, as `drawRatchet` lays it. */
export interface RatchetRack {
  /** The rack's top, in screen pixels before the fold. */
  top: number;
  /** The bind's shake across, in pixels: the plates' alone. */
  shake: number;
  /** How far the strut has tipped away, 0 to 1. */
  fold: number;
  /** The tooth the pawl bears on, and how far it is lifted off it. */
  bears: number;
  lift: number;
}

/**
 * **Where a bolt meets THE RATCHET**, for `BoltStops` (`bolt-stop.ts`): the
 * loose bolt in its own column, in either colour (`ratchetVerdict`), at its
 * lower end; and otherwise the lowest of what this screen draws over that x —
 * the rack's plates, the pawl's arm and hub, the lock's jaws and the catch's
 * bar on a screen shown the catch — each through the jolt, the fold about
 * the lock and, for the plates, the bind's shake.
 *
 * The bolt falls from under the lock down the middle, so for the first of
 * its fall it hangs in front of the rack, and a bolt the simulation says
 * reached it is drawn reaching it up through the plates. That is a look, and
 * it is not fixed here. The spring's coils and the strut's rails are thin
 * strokes a bolt passes.
 */
export function ratchetStopper(
  l: Layout,
  world: World,
  s: RatchetState,
  rack: RatchetRack,
  shift: Point,
  catchShown: boolean,
  beat: number,
  beatPhase: number,
): Stopper {
  const cfg = world.cfg;
  const lock = ratchetLock(l, cfg);
  const k = ratchetFoldScale(rack.fold);
  const lay = (p: Point, dx = 0): Point => ({
    x: lock.x + (p.x + dx - lock.x) * k.x + shift.x,
    y: lock.y + (p.y - lock.y) * k.y + shift.y,
  });
  const box = (b: { x: number; y: number; w: number; h: number }): Foot =>
    outlineFoot(
      [
        { x: b.x, y: b.y },
        { x: b.x + b.w, y: b.y },
        { x: b.x + b.w, y: b.y + b.h },
        { x: b.x, y: b.y + b.h },
      ].map((p) => lay(p)),
    );
  const feet: Foot[] = [];
  for (let i = 0; i < RATCHET_TEETH; i++)
    feet.push(outlineFoot(ratchetPlatePoints(l, cfg, i, rack.top).map((p) => lay(p, rack.shake))));
  const arm = ratchetPawlArm(l, cfg, rack.bears, rack.lift);
  const pivot = lay(arm.pivot);
  feet.push(rodFoot(pivot, lay(arm.tip), arm.half * k.x));
  feet.push(roundFoot(pivot.x, pivot.y, arm.hub * k.x, arm.hub * k.y));
  for (const jaw of ratchetJaws(l, cfg, rack.fold)) feet.push(box(jaw));
  const bar = catchShown ? ratchetCatchBar(l, cfg, s) : null;
  if (bar !== null)
    feet.push(
      box({ x: bar.x - bar.halfW, y: bar.y - bar.thick, w: bar.halfW * 2, h: bar.thick * 2 }),
    );
  // The bolt has left the rack, and is drawn outside its jolt and fold.
  const bolt = ratchetBoltAt(l, cfg, s, beat, beatPhase).y + RATCHET_BOLT.halfH * l.tile;
  return coreStopper(world, ratchetVerdict, bolt, lowestFoot(feet));
}
