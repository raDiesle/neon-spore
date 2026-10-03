import { midCol, viseVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import type { Circle, Layout } from "./layout.js";
import {
  type Point,
  VISE_KERNEL_NARROW,
  VISE_PINCH_NARROW,
  viseHinge,
  viseKernel,
  viseLobePoints,
} from "./vise-shape.js";

/**
 * Where the case stands this frame: its middle on screen, each lobe's lean
 * and pinch, the kernel's size, and the spat seed as drawn about the middle,
 * if one hangs.
 */
export interface ViseStand {
  x: number;
  y: number;
  leans: readonly [number, number];
  squeeze: readonly [number, number];
  kernel: number;
  seed: Circle | null;
}

/**
 * **Where a bolt meets THE VISE**, for `BoltStops` (`bolt-stop.ts`): the
 * kernel, bared on a fire step, at its lower rim; the seed on a spit step, up
 * the column it hangs over, at its lower rim; and otherwise the lowest of the
 * two lobes, each swung and pinched as drawn, the kernel and the seed.
 *
 * The kernel sits in the hollow between the lobes, and while they are not
 * swung wide a bolt up the middle column to it is drawn up through their
 * feet. That is a look, and it is not fixed here. The kernel's slow turn is
 * left out: it is nearly round.
 */
export function viseStopper(l: Layout, world: World, at: ViseStand): Stopper {
  const k = viseKernel(l);
  const r = k.r * at.kernel;
  const feet = [0, 1].map((side) =>
    outlineFoot(lobe(l, side as 0 | 1, at.leans, at.squeeze), at.x, at.y),
  );
  feet.push(roundFoot(at.x + k.x, at.y + k.y, r * VISE_KERNEL_NARROW, r));
  // A seed not yet out is judged where the simulation judges it, at row 0.
  let seedY = l.gridTop;
  if (at.seed !== null) {
    const { x, y, r } = at.seed;
    feet.push(roundFoot(at.x + x, at.y + y, r * VISE_KERNEL_NARROW, r));
    seedY = at.y + y + r;
  }
  const kernelY = at.y + k.y + r;
  const mid = midCol(world.cfg);
  return coreStopper(
    world,
    viseVerdict,
    (col) => (col === mid ? kernelY : seedY),
    lowestFoot(feet),
  );
}

/** Lobe `side`'s outline in the case's frame, narrowed by its pinch and swung about the hinge (`vise-draw.ts`'s `lobeFrame`). */
function lobe(
  l: Layout,
  side: 0 | 1,
  leans: readonly [number, number],
  squeeze: readonly [number, number],
): Point[] {
  const hinge = viseHinge(l);
  const turn = -(side === 0 ? -1 : 1) * leans[side];
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const narrow = 1 - VISE_PINCH_NARROW * squeeze[side];
  return viseLobePoints(l, side).map((p) => {
    const x = p.x * narrow - hinge.x;
    const y = p.y - hinge.y;
    return { x: hinge.x + x * cos - y * sin, y: hinge.y + x * sin + y * cos };
  });
}
