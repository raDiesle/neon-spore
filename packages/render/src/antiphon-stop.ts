import type { AntiphonState, World } from "@neon-spore/sim";
import { antiphonBox } from "./antiphon-shape.js";
import type { Stopper } from "./bolt-stop.js";
import type { Layout } from "./layout.js";

/** How the body is drawn this frame: shaken `shift` across and `fade` of its width. */
export interface AntiphonLook {
  shift: number;
  fade: number;
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
  const mid = (box.left + box.right) * 0.5 + look.shift;
  const hw = (box.right - box.left) * 0.5 * look.fade;
  return (_col, x) => (Math.abs(x - mid) < hw ? { y: box.bottom, hit: "body" } : null);
}
