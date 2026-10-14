import type { AntiphonState, World } from "@neon-spore/sim";
import { antiphonMantleFrame } from "./antiphon-glance.js";
import { antiphonBox } from "./antiphon-shape.js";
import type { Stopper } from "./bolt-stop.js";
import { glancedPoint, glanceSqueeze } from "./glance.js";
import type { Layout } from "./layout.js";

/** How the body is drawn this frame: shaken `shift` across, `fade` of its width, turned at `time` unless `still`. */
export interface AntiphonLook {
  shift: number;
  fade: number;
  time: number;
  still: boolean;
}

/**
 * **Where a bolt meets THE ANTIPHON**, for `BoltStops` (`bolt-stop.ts`):
 * the body's underside, and nothing else. Nothing about this fight is shot
 * since 5 October 2026 — the answer is carried down a vein
 * (`sim/antiphon-hand.ts`) — so a bolt out of the top goes into the body
 * and is only spent there, on both screens alike, and the rail and the
 * organ under it stop nothing: a bolt that burst on a candidate would look
 * like an answer. The hem's slow swell is left out.
 */
export function antiphonStopper(
  l: Layout,
  world: World,
  _s: AntiphonState,
  look: AntiphonLook,
): Stopper {
  const box = antiphonBox(l, world.cfg);
  const rest = (box.left + box.right) * 0.5;
  const mid = rest + look.shift;
  const hw = (box.right - box.left) * 0.5 * look.fade;
  // Turned, the underside a bolt meets is the one drawn (`antiphon-glance.ts`).
  const at = { x: rest, y: (box.top + box.bottom) * 0.5, r: Math.max(1, hw) };
  const f = antiphonMantleFrame(at, look.time, look.still);
  return (_col, x) => {
    const along = f === null ? x - mid : (x - mid) / glanceSqueeze(f, x < mid ? -1 : 1);
    if (Math.abs(along) >= hw) return null;
    const y = f === null ? box.bottom : glancedPoint(f, { x: rest + along, y: box.bottom }).y;
    return { y, hit: "body" };
  };
}
