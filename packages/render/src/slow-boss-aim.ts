import { HASP_COUNT, haspBoss, OUTER, type World } from "@neon-spore/sim";
import { gimbalCentre, gimbalRingR } from "./gimbal-shape.js";
import { haspCentre, haspShellRadius } from "./hasp-shape.js";
import type { Layout } from "./layout.js";
import { mantleCentre, mantleReach } from "./mantle-shape.js";
import { oculusCentre, oculusRadius } from "./oculus-shape.js";
import type { Aim } from "./slow-intake-aim.js";
import { valveCentre, valveReach } from "./valve-shape.js";
import { viseCentre, viseRadius } from "./vise-shape.js";

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
 * **No row reads a lift.** THE MANTLE, THE VALVE, THE VISE and THE OCULUS
 * drop into frame, but only while they are still, and no window opens before
 * a boss has left its still phase — its arrival reads 1 from then on
 * (`vise-pose.ts` and its neighbours).
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
    // The lens stands still over the middle column for the whole window.
    case "oculus":
      return still(oculusCentre(l, world.cfg), oculusRadius(l).rim);
    // The cradle hangs in one place, and the outer ring is the widest of it.
    case "gimbal":
      return still(gimbalCentre(l, world.cfg), gimbalRingR(l, OUTER));
    // A door of three clasps: the light stands round the one being worked,
    // the first not yet opened (`hasp-pose.ts`) — the latch the window is on.
    case "hasp": {
      const s = haspBoss(world);
      const at = HASP_COUNT - (s === null ? HASP_COUNT : s.hasps);
      return still(haspCentre(l, world.cfg, at), haspShellRadius(l));
    }
    // Three ovals over the middle column, each measured by its longer axis.
    case "mantle":
      return still(mantleCentre(l, world.cfg), longer(mantleReach(l)));
    case "valve":
      return still(valveCentre(l, world.cfg), longer(valveReach(l)));
    case "vise":
      return still(viseCentre(l, world.cfg), longer(viseRadius(l)));
    default:
      return null;
  }
}

/** A body with nothing hanging off it: its axis is its own centre. */
function still({ x, y }: { x: number; y: number }, r: number): Aim {
  return { x, y, r, ax: x, ay: y };
}

/** An oval's longer half-axis, so the light stops clear of its whole outline. */
function longer({ rx, ry }: { rx: number; ry: number }): number {
  return Math.max(rx, ry);
}
