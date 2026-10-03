import { type AntiphonState, antiphonVerdict, type World } from "@neon-spore/sim";
import {
  antiphonBox,
  antiphonBudR,
  antiphonOrganCircle,
  antiphonPerch,
  ORGAN_R,
  RAIL_R,
} from "./antiphon-shape.js";
import type { BoltHit, Stopper } from "./bolt-stop.js";
import { type Foot, lowestFoot, roundFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { showsAntiphonOrgan, showsAntiphonRail } from "./view-role-clocks-b.js";

/** How the body is drawn this frame: shaken `shift` across, `fade` of its width, its buds `grow` out. */
export interface AntiphonLook {
  shift: number;
  fade: number;
  grow: number;
  time: number;
}

/**
 * **Where a bolt meets THE ANTIPHON**, for `BoltStops` (`bolt-stop.ts`):
 * the lowest of what this screen draws over the bolt's x — a bud on the
 * rail, the organ under the body's middle, the body's underside — and what
 * the simulation will say of it (`antiphonVerdict`): a burst for the organ's
 * column in its colour, a scuff for a decoy's, and the body for anything
 * else.
 *
 * **The two screens are told different halves** (`view-role-clocks-b.ts`),
 * so each stops a bolt on its own picture. The rail's screen sees each
 * candidate over its column, and a bolt up the organ's column bursts on the
 * organ's candidate there. The organ's screen draws the organ under the
 * body's middle whatever its column, so a bolt up that column bursts on the
 * underside above it, where nothing tells which candidate it was: the burst
 * says it was right, and that is all that seat is shown. The hem's slow
 * swell is left out.
 */
export function antiphonStopper(
  l: Layout,
  world: World,
  s: AntiphonState,
  look: AntiphonLook,
): Stopper {
  const cfg = world.cfg;
  const box = antiphonBox(l, cfg);
  const mid = (box.left + box.right) * 0.5 + look.shift;
  const hw = (box.right - box.left) * 0.5 * look.fade;
  const feet: Foot[] = [(x) => (Math.abs(x - mid) < hw ? box.bottom : null)];
  if (look.grow > 0 && showsAntiphonOrgan(l.role)) {
    const r = antiphonBudR(l, ORGAN_R * look.grow, look.time);
    for (let i = 0; i < s.organs.length; i++) {
      const at = antiphonOrganCircle(l, cfg, i, s.organs.length);
      feet.push(roundFoot(at.x + look.shift, at.y, r));
    }
  }
  if (look.grow > 0 && showsAntiphonRail(l.role)) {
    const r = antiphonBudR(l, RAIL_R * look.grow, look.time);
    for (const c of s.rail) {
      const at = antiphonPerch(l, c.col);
      feet.push(roundFoot(at.x + look.shift, at.y, r));
    }
  }
  const foot = lowestFoot(feet);
  return (col, x, color) => {
    const y = foot(x);
    if (y === null) return null;
    const v = antiphonVerdict(world, col, color);
    const hit: BoltHit = v === "target" || v === "wrong" ? v : "body";
    return { y, hit };
  };
}
