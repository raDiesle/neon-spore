import type { Point } from "@neon-spore/content";
import { type CapstanState, capstanVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import {
  capstanBodyPoints,
  capstanCoreR,
  capstanCradleOutline,
  capstanPivot,
  capstanRoll,
  capstanSqueeze,
} from "./capstan-shape.js";
import { coreHurt } from "./core-hurt.js";
import { coreStopper, lowestFoot, outlineFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";

/** Where the drawer has put the drum this frame: its place, the lift, the thud and the rattle. */
export interface CapstanPlace {
  /** The drum's place on the field, shaken by the blow it took. */
  at: Point;
  /** Pixels the spent drum has lifted off its cradle, and dropped onto it by a thud. */
  lift: number;
  thud: number;
  turn: number;
  shake: { x: number; y: number; roll: number };
}

/**
 * **Where a bolt meets THE CAPSTAN**, for `BoltStops` (`bolt-stop.ts`): the
 * core in the drum's middle, bared on a fire step, at its near rim, and
 * otherwise the lowest of the drum and its cradle over x — each carried
 * through the roll and the rattle the drawer gives it.
 *
 * The drum lies on its side with the core on the face turned to the eye, so
 * a bolt up the middle column to it crosses the cradle's post and saddle on
 * its way and stops on the core. That the post stands in the way is a look,
 * and it is not fixed here.
 */
export function capstanStopper(l: Layout, world: World, s: CapstanState, p: CapstanPlace): Stopper {
  const pivot = capstanPivot(l);
  const cradle = turned(p.at.x, p.at.y + pivot - p.lift, capstanRoll(p.turn), 0, -pivot + p.thud);
  const drum = (q: Point): Point => {
    const c = Math.cos(p.shake.roll);
    const k = Math.sin(p.shake.roll);
    return cradle({ x: p.shake.x + c * q.x - k * q.y, y: p.shake.y + k * q.x + c * q.y });
  };
  const feet = capstanCradleOutline(l).map((piece) => outlineFoot(piece.map(cradle)));
  feet.push(outlineFoot(capstanBodyPoints(l, capstanSqueeze(p.turn)).map(drum)));
  const core = drum({ x: 0, y: 0 }).y + capstanCoreR(l) * coreHurt(s.hits).size;
  return coreStopper(world, capstanVerdict, core, lowestFoot(feet));
}

/** A point in a frame moved by (`ox`, `oy`), turned `a`, then moved (`dx`, `dy`) within it. */
function turned(ox: number, oy: number, a: number, dx: number, dy: number) {
  const c = Math.cos(a);
  const k = Math.sin(a);
  return (q: Point): Point => {
    const x = q.x + dx;
    const y = q.y + dy;
    return { x: ox + c * x - k * y, y: oy + k * x + c * y };
  };
}
