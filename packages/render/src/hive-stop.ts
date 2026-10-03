import { type HiveState, hiveVerdict, type World } from "@neon-spore/sim";
import type { BoltHit, Stopper } from "./bolt-stop.js";
import { type Foot, lowestFoot, roundFoot } from "./core-stop.js";
import { hiveBox, hiveSite, SITE_R } from "./hive-shape.js";
import type { Layout } from "./layout.js";

/** How a site's lobe hangs as drawn: `drop` below the underside, `open` of its width. */
export interface HiveHang {
  drop: number;
  open: number;
}

/**
 * **Where a bolt meets THE HIVE**, for `BoltStops` (`bolt-stop.ts`): the
 * lowest of the underside and the lobe hanging at each site, moved `shift`
 * as drawn, and what the simulation will say of it (`hiveVerdict`) — a burst
 * on an open breach in its colour, a scuff on one in the other, and the skin
 * anywhere else, which spans the field. `hangs` holds a swelling site's
 * lobe; every other hangs `open` wide and no lower.
 *
 * A lobe is taken as half an ellipse from its shoulders to its tip, which is
 * where `hiveSitePath`'s curves run within a few pixels.
 */
export function hiveStopper(
  l: Layout,
  world: World,
  s: HiveState,
  shift: { x: number; y: number },
  open: number,
  hangs: readonly (HiveHang | undefined)[],
): Stopper {
  const box = hiveBox(l, world.cfg);
  const mid = (box.left + box.right) * 0.5 + shift.x;
  const hw = (box.right - box.left) * 0.5 * open;
  const under = box.bottom + shift.y;
  const feet: Foot[] = [(x) => (Math.abs(x - mid) < hw ? under : null)];
  for (let i = 0; i < s.cols.length; i++) {
    const c = hiveSite(l, s, i);
    const hang = hangs[i] ?? { drop: 0, open };
    const r = l.tile * SITE_R * hang.open;
    if (r > 0) feet.push(roundFoot(c.x + shift.x, c.y + shift.y - r * 0.3, r, r * 1.3 + hang.drop));
  }
  const foot = lowestFoot(feet);
  return (col, x, color) => {
    const y = foot(x);
    if (y === null) return null;
    const v = hiveVerdict(world, col, color);
    const hit: BoltHit = v === "target" || v === "wrong" ? v : "body";
    return { y, hit };
  };
}
