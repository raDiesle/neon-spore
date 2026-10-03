import { type GimbalState, gimbalTeeth, gimbalVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import {
  coreStopper,
  type Foot,
  lowestFoot,
  outlineFoot,
  rodFoot,
  roundFoot,
} from "./core-stop.js";
import { GIMBAL_BEAD, gimbalLeakPoint, gimbalSpinMilli } from "./gimbal-drum.js";
import { gimbalPins, gimbalYokeRods, HOOP, ROD } from "./gimbal-rig.js";
import {
  gimbalCentre,
  gimbalDrumR,
  gimbalRingFace,
  gimbalRingR,
  gimbalTeethPoints,
  type Point,
} from "./gimbal-shape.js";
import { type GimbalTilt, tilted } from "./gimbal-tilt.js";
import type { Layout } from "./layout.js";
import { gimbalRingsShown } from "./view-role-clocks-c.js";

/** How many points a hoop or the opened drum is taken at: a pixel off its circle at the outer ring's size. */
const ROUND = 48;

/**
 * **Where a bolt meets THE GIMBAL**, for `BoltStops` (`bolt-stop.ts`): the
 * leaking bead in the seam's column, in either colour (`gimbalVerdict`), and
 * otherwise the lowest of what this screen draws over that x — the yoke and
 * its stub, the drum, and the hoops, teeth and pins of the rings this seat is
 * shown — every part laid where `drawGimbal` lays it: `shift` off the cradle's
 * middle, and through `t`, whose roll carries the shake's sway.
 *
 * The bead runs down from the drum to the hull, so for the first of its run
 * a bolt the simulation says reached it is drawn reaching it up through the
 * outer hoop and the yoke's stub below it. That is a look, and it is not
 * fixed here.
 */
export function gimbalStopper(
  l: Layout,
  world: World,
  s: GimbalState,
  shift: Point,
  t: GimbalTilt,
  open: number,
  beat: number,
  beatPhase: number,
  time: number,
): Stopper {
  const c = gimbalCentre(l, world.cfg);
  const lay = (p: Point): Point => {
    const q = tilted(p.x - c.x, p.y - c.y, t);
    return { x: c.x + shift.x + q.x, y: c.y + shift.y + q.y };
  };
  const circle = (r: number): Foot =>
    outlineFoot(
      Array.from({ length: ROUND }, (_, i) => {
        const a = (i / ROUND) * Math.PI * 2;
        return lay({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
      }),
    );
  const feet: Foot[] = gimbalYokeRods().map(([a, b]) =>
    rodFoot(
      lay({ x: c.x + a.z * l.tile, y: c.y + a.y * l.tile }),
      lay({ x: c.x + b.z * l.tile, y: c.y + b.y * l.tile }),
      ROD * l.tile,
    ),
  );
  // Shut, the drum is the rig's shell, whose outline is its circle however it
  // nods; open, it is drawn flat through the tilt (`gimbal-draw.ts`).
  const mid = lay(c);
  feet.push(open === 0 ? roundFoot(mid.x, mid.y, gimbalDrumR(l)) : circle(gimbalDrumR(l)));
  for (const ring of gimbalRingsShown(l.role)) {
    const r = gimbalRingR(l, ring);
    feet.push(circle(r + HOOP * l.tile));
    const face = gimbalRingFace(l, s, ring) + gimbalSpinMilli(open, time);
    for (const tooth of gimbalTeethPoints(l, c, r, face, gimbalTeeth(s), s.marks.length))
      feet.push(outlineFoot(tooth.map(lay)));
    for (const pin of gimbalPins(ring, l.tile)) {
      if (pin.kind !== "ball") continue;
      const at = lay({ x: c.x + pin.c.z, y: c.y + pin.c.y });
      feet.push(roundFoot(at.x, at.y, pin.r));
    }
  }
  const leak = gimbalLeakPoint(l, world.cfg, s, beat, beatPhase);
  const bead = lay(leak).y + GIMBAL_BEAD.ry * l.tile;
  return coreStopper(world, gimbalVerdict, bead, lowestFoot(feet));
}
