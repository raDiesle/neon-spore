import { batonBeadTaken } from "./baton-press.js";
import { matronPodTaken } from "./matron-step.js";
import {
  cargoLost,
  huskRefused,
  huskSwallowed,
  inMawReach,
  mawOpen,
  takeCargo,
} from "./pod-intake.js";
import { swindleHuskRefused, swindlePodTaken } from "./swindle-step.js";
import type { Pod } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **A pod arriving**: what happens on the tick a falling pod reaches the hull,
 * and what a pod that got away is worth.
 *
 * Cut out of `pods.ts` on 17 September 2026, when THE THROAT's hold on a pod
 * (since reworked away) put that file over its limit, along the seam the file
 * already drew in prose: `pods.ts` is the fall — hanging, freed, crossing,
 * sinking, steering — and this is the receipt at the end of it. `pod-intake.ts`
 * next door is the mouth itself (whether it is open, what a cargo is worth
 * either way); this is the one place a pod is read against it.
 */

/**
 * The pod has arrived at the hull. Two conditions, both player 1's: the cannon
 * stands in its column or within `podCatchCols` of it, and the maw was opened recently enough to still be
 * open. Anything else and the pod breaks on the skin, and that is a hit: the
 * wave is lost (`wave-fail.ts`). It used to be simply gone — a missed gift
 * and not a punishment — until taking every pod in became part of passing
 * the wave.
 */
export function podArrived(world: World, pod: Pod): void {
  const col = Math.round(pod.colMilli / MILLI);
  const inColumn = inMawReach(world, col);
  const inTime = mawOpen(world);

  // **A husk is the same two conditions, read the other way up.** Everything
  // about getting it here is a pod's — the column, the moment, the maw — and
  // only the receipt is inverted, which is the point: the pair cannot practise
  // a husk separately from a pod, because up to this tick it *is* one.
  if (pod.kind === "husk") {
    if (inColumn && inTime) huskSwallowed(world, pod);
    else {
      huskRefused(world, pod);
      // And if it was one of THE SWINDLE's, she says so (`swindle-step.ts`).
      swindleHuskRefused(world, pod);
    }
    return;
  }

  if (inColumn && inTime) {
    takeCargo(world, col);
    // And if it was THE BATON's bead, the arm is beaten. A no-op for every
    // pod a wave hung (`baton-press.ts`).
    batonBeadTaken(world, pod.id);
    // And if it was one of THE MATRON's, a lobe goes with it (`matron-step.ts`).
    matronPodTaken(world, pod.id);
    // And if it was one of THE SWINDLE's, she is down one (`swindle-step.ts`).
    swindlePodTaken(world, pod);
    return;
  }
  podLost(world, pod);
}

/** A pod the pair did not take, at the hull or off the side: the wave is lost
 * (`cargoLost`, which is the half of this rule THE MOULT reads too). */
export function podLost(world: World, pod: Pod): void {
  cargoLost(world, Math.round(pod.colMilli / MILLI));
}

/** A pod whose clock ran out before it was taken (`Pod.dueTicks`): the wave
 * is lost, and the event says where it was hanging or falling. */
export function podDue(world: World, pod: Pod): void {
  cargoLost(world, Math.round(pod.colMilli / MILLI), Math.round(pod.rowMilli / MILLI));
}
