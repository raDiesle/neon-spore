import {
  burgeeBoss,
  capstanBoss,
  gallBoss,
  halterBoss,
  lampreyBoss,
  sceneBoss,
  seamBoss,
  type World,
} from "@neon-spore/sim";
import { burgeeAsked } from "./burgee-pose.js";
import { burgeeFlagLong, burgeeSpindleAt, burgeeSpindleTall, burgeeTip } from "./burgee-shape.js";
import { capstanArrived, capstanGone, capstanTurn } from "./capstan-pose.js";
import { capstanAt, capstanOnScreen, capstanPivot, capstanSize } from "./capstan-shape.js";
import { type Box, sides, spread } from "./caption-anchor-box.js";
import { gallSeamY, gallSize } from "./gall-shape.js";
import { halterArrived } from "./halter-pose.js";
import { halterAt, halterBend, halterGap, halterSize } from "./halter-shape.js";
import { instarAt, instarLen } from "./instar-place.js";
import { lampreyPose } from "./lamprey-pose.js";
import type { Layout } from "./layout.js";
import { nettleReach } from "./nettle-body.js";
import { nettleBody } from "./nettle-sway.js";
import { seamArrived } from "./seam-pose.js";
import { seamCentre, seamHalfHeight, seamHalfWidth, seamLift } from "./seam-shape.js";
import type { Aim } from "./slow-intake-aim.js";

/**
 * **THE SLOW's aim, page four** — the five bosses that opened windows that
 * ask and had no row on any page, so their light stood round the cannon and
 * their fuse dropped onto the hull under it (27 September 2026).
 *
 * Each row is page three's kind: a box off the boss's own shape file, run the
 * long way as a capsule, placed where its drawer places it this frame — the
 * drop in, the lift as it goes, the cradle's roll, the flag's swing.
 *
 * THE NETTLE joined once its body was drawn: it shares THE INSTAR's engine
 * but not its body, so it is aimed here off its own bell and arms rather than
 * beside THE INSTAR in `aim()`. THE LAMPREY joined with its hand, since
 * THE SLOW opens at every bite. A kind none of the four pages has is aimed at
 * the cannon.
 */
export function lastBossAim(world: World, l: Layout, beat: number, beatPhase: number): Aim | null {
  const cfg = world.cfg;
  switch (world.boss?.kind) {
    // The ridge stood on end down the middle column, as wide as its top lobe.
    case "seam": {
      const s = seamBoss(world);
      if (s === null) return null;
      const home = seamCentre(l, cfg);
      const y = home.y - seamLift(l, seamArrived(s, cfg, beat, beatPhase));
      const w = seamHalfWidth(l);
      const h = seamHalfHeight(l);
      return capsule(sides(home.x - w, home.x + w, y - h, y + h));
    }
    // The slab across the top, its plates parted as far as they go and the
    // hanging plates under them: the spine hunches up at its middle, and the
    // ends hang lowest.
    case "halter": {
      const s = halterBoss(world);
      if (s === null) return null;
      const at = halterAt(l, cfg, halterArrived(s, cfg, beat, beatPhase));
      const { rx, ry, drop } = halterSize(l);
      const gap = halterGap(l, 1);
      const top = at.y + halterBend(l, 0) - ry - gap;
      return capsule(sides(at.x - rx, at.x + rx, top, at.y + ry + drop + gap));
    }
    // The drum's four corners and the foot of the cradle's post, rolled about
    // that foot as far as the lean has turned it.
    case "capstan": {
      const s = capstanBoss(world);
      if (s === null) return null;
      const at = capstanAt(l, cfg, capstanArrived(s, cfg, beat, beatPhase));
      const gone = capstanGone(s, cfg, beat, beatPhase);
      const turn = capstanTurn(world, s);
      const { rx, ry } = capstanSize(l);
      const parts = [
        { x: -rx, y: -ry },
        { x: rx, y: -ry },
        { x: -rx, y: ry },
        { x: rx, y: ry },
        { x: 0, y: capstanPivot(l) },
      ];
      return spreadCapsule(
        parts.map((p) => capstanOnScreen(l, at, gone, turn, p)),
        0,
      );
    }
    // The seam from one side of the field to the other, as tall as the nodule
    // riding it stands up out of it.
    case "gall": {
      if (gallBoss(world) === null) return null;
      const y = gallSeamY(l);
      const reach = gallSize(l).ry * GALL_STANDS;
      return capsule(sides(l.gridLeft, l.gridLeft + l.cols * l.tile, y - reach, y + reach));
    }
    // The spindle's crown down to the boom's tip where the flag is asked to
    // be, and the flag's length round both: it streams off the tip any way.
    case "burgee": {
      const s = burgeeBoss(world);
      if (s === null) return null;
      const spindle = burgeeSpindleAt(l, cfg);
      const crown = { x: spindle.x, y: spindle.y - burgeeSpindleTall(l) };
      const tip = burgeeTip(l, cfg, burgeeAsked(s, cfg, beatPhase));
      return spreadCapsule([crown, tip], burgeeFlagLong(l));
    }
    // The bell, lobes and all, with the arms' tips and the curtain's foot
    // wherever this frame's figure has them (`nettle-body.ts`).
    case "nettle": {
      const s = sceneBoss(world);
      if (s === null || s.kind !== "nettle") return null;
      const { f } = nettleBody(s, cfg, world, beat, beatPhase);
      const c = instarAt(l, f.bellX, f.bellY);
      return spreadCapsule(nettleReach(c.x, c.y, instarLen(l, f.bellR), f), 0);
    }
    // The mouth where it is this frame, and the jaw's band on the hull under
    // it, as wide as the grip reaches either side: the two things a bite asks.
    case "lamprey": {
      const s = lampreyBoss(world);
      if (s === null) return null;
      const p = lampreyPose(l, cfg, s, beat, beatPhase);
      const reach = Math.max(p.r, (cfg.lampreyGripCols + 0.5) * l.tile);
      const bottom = Math.max(p.y + p.r * p.tilt, l.hullY);
      return capsule(sides(p.x - reach, p.x + reach, p.y - p.r * p.tilt, bottom));
    }
    default:
      return null;
  }
}

/** How far THE GALL's nodule stands above the seam, in its own half-heights:
 * risen a little over half of one, and its crown a whole one above that
 * (`gall-draw.ts`'s `lift`). */
const GALL_STANDS = 1.6;

/**
 * The capsule round a box, along its longer side: the shorter half-axis is
 * the radius and the two ends stand that far in from the box's ends, so the
 * capsule holds the whole oval and no more of the field than it must.
 */
export function capsule({ x, y, rx, ry }: Box): Aim {
  if (rx >= ry) return { x: x - (rx - ry), y, r: ry, ax: x + (rx - ry), ay: y };
  return { x, y: y - (ry - rx), r: rx, ax: x, ay: y + (ry - rx) };
}

/** The capsule round a set of points, each `r` round — the extent a caption rings. */
export function spreadCapsule(points: readonly { x: number; y: number }[], r: number): Aim | null {
  const b = spread(points, r);
  return b === null ? null : capsule(b);
}
