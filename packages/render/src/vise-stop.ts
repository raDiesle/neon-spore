import { midCol, VISE_SEED_MILLI, viseVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import { type Circle, type Layout, tileCY } from "./layout.js";
import { viseGlancedPoint } from "./vise-glance.js";
import { viseLobeOutline } from "./vise-lobe.js";
import { VISE_KERNEL_NARROW, viseKernel } from "./vise-shape.js";

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
  /** The clock the case's turn reads (`vise-glance.ts`). */
  time: number;
}

/**
 * **Where a bolt meets THE VISE**, for `BoltStops` (`bolt-stop.ts`): the
 * kernel, bared on a fire step, at its lower rim; the seed on a spit step, up
 * the column it hangs over, at its lower rim; and otherwise the lowest of the
 * two lobes, each swung, pinched and turned as drawn, the kernel and the seed.
 *
 * The kernel sits in the hollow between the lobes, and while they are not
 * swung wide a bolt up the middle column to it is drawn up through their
 * feet. That is a look, and it is not fixed here. The kernel's slow turn is
 * left out: it is nearly round.
 */
export function viseStopper(l: Layout, world: World, at: ViseStand): Stopper {
  const k = viseKernel(l);
  const r = k.r * at.kernel;
  const feet = ([0, 1] as const).map((side) => {
    const pose = { side, lean: at.leans[side], squeeze: at.squeeze[side], split: 0 };
    const outline = viseLobeOutline(l, pose).map((p) => viseGlancedPoint(l, at.time, p));
    return outlineFoot(outline, at.x, at.y);
  });
  feet.push(roundFoot(at.x + k.x, at.y + k.y, r * VISE_KERNEL_NARROW, r));
  // A seed not yet out is judged where the simulation judges it, on its row.
  let seedY = tileCY(l, VISE_SEED_MILLI / 1000);
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
