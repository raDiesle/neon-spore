import {
  filamentBoss,
  grindstoneBoss,
  sinewBoss,
  stareBoss,
  surgeBoss,
  type World,
} from "@neon-spore/sim";
import { filamentHeart } from "./filament-heart.js";
import { filamentStrands } from "./filament-shape.js";
import { grindstoneArrived, grindstoneFree, grindstoneShut } from "./grindstone-pose.js";
import { grindstoneAxleAt, grindstoneReach } from "./grindstone-shape.js";
import type { Layout } from "./layout.js";
import { rimeCentre, rimeRadius } from "./rime-shape.js";
import { sinewMassCentre, sinewMassRx, sinewMassRy } from "./sinew-shape.js";
import { longBossAim } from "./slow-boss-aim-c.js";
import type { Aim } from "./slow-intake-aim.js";
import { spoolBarrelHalf, spoolFlangeR, spoolHome } from "./spool-shape.js";
import { stareEye, stareReach, stareSwell, swollenEye } from "./stare-shape.js";
import { surgeBulbCircle } from "./surge-shape.js";

/**
 * **THE SLOW's aim, page two** — the rows `slow-boss-aim.ts` hands on when it
 * has none of its own, cut from it on 26 September 2026 when seventeen more
 * bosses were queued for it and page one was 104 lines.
 *
 * **These rows may read the beat.** Page one's bodies stand still through a
 * window; some here move — THE SINEW's mass falls a row a beat, THE
 * FILAMENT's heart shrinks as each filament is pulled — and the light follows
 * the body as its drawer places it, off the same call with the same beat.
 * A kind with no row here goes on to page three (`slow-boss-aim-c.ts`).
 */
export function lateBossAim(world: World, l: Layout, beat: number, beatPhase: number): Aim | null {
  const boss = world.boss;
  if (boss === null) return null;
  const cfg = world.cfg;
  switch (boss.kind) {
    // The lens stands still over the middle column, as THE VISE's case does.
    case "rime":
      return still(rimeCentre(l, cfg), longer(rimeRadius(l)));
    // The bulb, as wide as the circle a thumb is answered in.
    case "surge": {
      const s = surgeBoss(world);
      if (s === null) return null;
      const c = surgeBulbCircle(l, cfg, s);
      return still(c, c.r);
    }
    // The mass, where it hangs on its tendon this frame; the tendon above it
    // is the thing the light is allowed to split.
    case "sinew": {
      const s = sinewBoss(world);
      if (s === null) return null;
      const at = sinewMassCentre(l, cfg, s, beat, beatPhase);
      return still(at, longer({ rx: sinewMassRx(l, cfg), ry: sinewMassRy(l) }));
    }
    // The heart, as big as the filaments left in it make it.
    case "filament": {
      const s = filamentBoss(world);
      if (s === null) return null;
      const heart = filamentHeart(l, cfg, filamentStrands(s, cfg, beat, beatPhase));
      return still(heart, longer(heart));
    }
    // The spool slung side on across the top: as wide as its barrel's half
    // at its widest, or its flange where that is the larger.
    case "spool":
      return still(spoolHome(l, cfg), Math.max(spoolBarrelHalf(l, 0), spoolFlangeR(l)));
    // The wheel where it has dropped in or fallen to, as wide as the caliper
    // round it stands this frame.
    case "grindstone": {
      const s = grindstoneBoss(world);
      if (s === null) return null;
      const arrived = grindstoneArrived(s, cfg, beat, beatPhase);
      const axle = grindstoneAxleAt(l, cfg, arrived, grindstoneFree(s, cfg, beat, beatPhase));
      return still(axle, grindstoneReach(l, grindstoneShut(world, s, beat, beatPhase)));
    }
    // The eye in its cowl, swollen as far as the charge has come: the charge
    // is when the lid's window opens, and a light aimed at the cannon split
    // the eye itself into three (29 September 2026).
    case "stare": {
      const s = stareBoss(world);
      if (s === null) return null;
      const e = swollenEye(stareEye(l, cfg), stareSwell(s, cfg, beat, beatPhase));
      return still({ x: e.cx, y: e.cy }, stareReach(e));
    }
    default:
      return longBossAim(world, l, beat, beatPhase);
  }
}

/** A body with nothing hanging off it: its axis is its own centre. */
export function still({ x, y }: { x: number; y: number }, r: number): Aim {
  return { x, y, r, ax: x, ay: y };
}

/** An oval's longer half-axis, so the light stops clear of its whole outline. */
export function longer({ rx, ry }: { rx: number; ry: number }): number {
  return Math.max(rx, ry);
}
