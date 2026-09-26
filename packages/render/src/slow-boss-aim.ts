import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { oculusCentre, oculusRadius } from "./oculus-shape.js";
import type { Aim } from "./slow-intake-aim.js";

/**
 * **Where a boss that opens THE SLOW stands, by kind** — the table
 * `slow-intake-aim.ts` asks before it falls back to a held body or the cannon.
 *
 * PRISM's promise is *the room splits into its colours, and the boss does
 * not*: a point's fringe is as wide as it is far from the aim. A boss with no
 * row here is aimed at the cannon's column at the hull, so one hung at the
 * top of the field is the thing split widest. Each row is the point the
 * boss's own shape file already names, called rather than re-derived, and a
 * radius that is the body's own extent, not a thumb's — the light stands
 * around the full boss (`slow-intake-aim.ts`).
 *
 * THE INSTAR is not a row: its head moves and turns, and `aim()` asks it
 * first with the far end of its chain. Every row here is a body with nothing
 * hanging off it, so its axis is a point. The rest of the bosses that open a
 * window are queued (*THE SLOW's prism aims at the cannon for every boss but
 * THE INSTAR*, `docs/queue.md`).
 */
export function bossAim(world: World, l: Layout): Aim | null {
  const boss = world.boss;
  if (boss === null) return null;
  switch (boss.kind) {
    // The lens stands still over the middle column for the whole window: a
    // window opens only on a lit step, long after it has arrived.
    case "oculus": {
      const { x, y } = oculusCentre(l, world.cfg);
      return { x, y, r: oculusRadius(l).rim, ax: x, ay: y };
    }
    default:
      return null;
  }
}
