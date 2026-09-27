import {
  batonBoss,
  curtainBody,
  curtainBoss,
  gorgeBoss,
  hiveBoss,
  keelBoss,
  leadBoss,
  ledgerBoss,
  type World,
} from "@neon-spore/sim";
import { socketPoint, socketReach } from "./baton-socket-draw.js";
import { curtainSheetSpan } from "./curtain-grip.js";
import { CURTAIN_HEM_DROP, CURTAIN_RAIL_RISE } from "./curtain-sheet.js";
import { drawnCol } from "./depth.js";
import { gorgeSackBox } from "./gorge-draw.js";
import { hiveBox } from "./hive-shape.js";
import { keelSegs } from "./keel-pose.js";
import { keelPlateHalf } from "./keel-shape.js";
import { type Layout, tileCY } from "./layout.js";
import { leadAlong, leadAskedAngle, leadFoot, leadRidgeY, leadStalkLength } from "./lead-shape.js";
import { ledgerBodyBox, ledgerGap } from "./ledger-shape.js";
import type { Aim } from "./slow-intake-aim.js";

/**
 * **THE SLOW's aim, page three** — the bosses whose body is longer than it is
 * round, so the light stands round a capsule and not a disc.
 *
 * A disc round THE HIVE's mass is the whole top of the screen, since the mass
 * is nearly the width of the field, and a disc round THE LEAD's stalk is a
 * disc round a line. So every row here is a box the boss's own shape file
 * already names, turned into the capsule along its longer side
 * (`capsule`): the axis `Aim` was given for THE INSTAR's chain
 * (`slow-intake-aim.ts`) is the same keep-out, run the long way of a body.
 *
 * Rows may read the beat, as page two's do. A kind none of the three pages
 * has is aimed at the cannon, and the ones left are queued in `docs/queue.md`.
 */
export function longBossAim(world: World, l: Layout, beat: number, beatPhase: number): Aim | null {
  const cfg = world.cfg;
  switch (world.boss?.kind) {
    // The arm, from the base socket to the last one on it: a shed socket is
    // still a husk on the thread (`caption-anchor-boss-c.ts` rings the same).
    case "baton": {
      const s = batonBoss(world);
      if (s === null) return null;
      const points = s.sockets.map((_, i) => socketPoint(l, cfg, s, i));
      return capsule(around(points, socketReach(l)));
    }
    // The part of the sheet on the field, rail to hem.
    case "curtain": {
      const s = curtainBoss(world);
      const body = s === null ? undefined : curtainBody(world, s);
      if (s === null || body === undefined) return null;
      const span = curtainSheetSpan(l, cfg, drawnCol(body, beatPhase));
      if (span === null) return null;
      const row = tileCY(l, cfg.curtainRow);
      const top = row - l.tile * CURTAIN_RAIL_RISE;
      const bottom = row + l.tile * CURTAIN_HEM_DROP;
      return capsule(edges(span.left, span.right, top, bottom));
    }
    // The sack at its fullest breath, so the light clears it all the beat.
    case "gorge": {
      const s = gorgeBoss(world);
      return s === null ? null : capsule(gorgeSackBox(l, cfg, s, 1));
    }
    case "hive": {
      const b = hiveBox(l, cfg);
      return hiveBoss(world) === null ? null : capsule(edges(b.left, b.right, b.top, b.bottom));
    }
    // The spine along the top, every segment where it stands this frame.
    case "keel": {
      const s = keelBoss(world);
      if (s === null) return null;
      const segs = keelSegs(l, cfg, s, beat, beatPhase);
      return capsule(
        around(
          segs.map((seg) => seg.centre),
          keelPlateHalf(l),
        ),
      );
    }
    // The stalk from its foot on the ridge to its tip, as thick as the ridge.
    case "lead": {
      const s = leadBoss(world);
      if (s === null) return null;
      const foot = leadFoot(l, cfg, s);
      const tip = leadAlong(foot, leadAskedAngle(s, l.role), leadStalkLength(l, s));
      const ridge = leadRidgeY(l);
      return { x: tip.x, y: tip.y, r: ridge.bottom - ridge.top, ax: foot.x, ay: foot.y };
    }
    // Both halves and the seam between them, as far open as it is.
    case "ledger": {
      const s = ledgerBoss(world);
      if (s === null) return null;
      return capsule(ledgerBodyBox(l, cfg, s, ledgerGap(l, cfg, s, beat, beatPhase)));
    }
    default:
      return null;
  }
}

/** A body's extent: its middle and its two half-axes. */
export interface Extent {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

/**
 * The capsule round an extent, along its longer side: the shorter half-axis
 * is the radius and the two ends stand that far in from the box's ends, so
 * the capsule holds the whole oval and no more of the field than it must.
 */
export function capsule({ x, y, rx, ry }: Extent): Aim {
  if (rx >= ry) return { x: x - (rx - ry), y, r: ry, ax: x + (rx - ry), ay: y };
  return { x, y: y - (ry - rx), r: rx, ax: x, ay: y + (ry - rx) };
}

function edges(left: number, right: number, top: number, bottom: number): Extent {
  return {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    rx: (right - left) / 2,
    ry: (bottom - top) / 2,
  };
}

/** The extent of a set of points, each `r` round. */
function around(points: readonly { x: number; y: number }[], r: number): Extent {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return edges(Math.min(...xs) - r, Math.max(...xs) + r, Math.min(...ys) - r, Math.max(...ys) + r);
}
