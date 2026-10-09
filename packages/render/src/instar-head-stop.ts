import { type Foot, outlineFoot } from "./core-stop.js";
import { frontJaws, LOWER, UPPER } from "./instar-head.js";
import { grown } from "./instar-head-look.js";
import { r2 } from "./instar-head-parts.js";
import type { Point } from "./instar-place.js";
import type { Look } from "./instar-plate.js";
import { headBob } from "./instar-profile-life.js";
import { quarterHeadPoints } from "./instar-quarter-head.js";
import { swimLook } from "./instar-serpent.js";
import { turnedHeadPoint } from "./instar-turn.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE INSTAR's heads** (`instar-stop.ts`): the chin and
 * the skull face-on, through the turn `drawTurnedHead` gives them, and the
 * lower jaw and the skull side-on, grown, swum and bobbing as `drawProfile`
 * lays them. Each answers its outline laid through `lay`, the flight and the
 * shake the stopper lays the tube through.
 *
 * The outlines are the shipped heads' (`INSTAR_HEAD`): a head VERSUS offers in
 * their place is met where the shipped one would be drawn. The horns, the
 * teeth and the drips stand off the plates and are not met.
 */
export function frontHeadFeet(look: Look, lay: (p: Point) => Point): Foot[] {
  const { head, r, f } = look;
  const { up, down } = frontJaws(look);
  const turned = (q: Point) => lay(turnedHeadPoint(head, r, { side: f.side, time: look.time }, q));
  return [
    outlineFoot(LOWER.map(([x, y]) => turned(r2(down, r, x, y)))),
    outlineFoot(UPPER.map(([x, y]) => turned(r2(up, r, x, y)))),
  ];
}

/** The profile head's two plates, laid where `drawProfile` draws them. */
export function sideHeadFeet(l: Layout, look: Look, lay: (p: Point) => Point): Foot[] {
  const swum = swimLook(l, look);
  const { jaw, skull } = quarterHeadPoints(
    grown({ ...swum, head: headBob(swum.head, swum.r, swum.time) }),
  );
  return [outlineFoot(jaw.map(lay)), outlineFoot(skull.map(lay))];
}
