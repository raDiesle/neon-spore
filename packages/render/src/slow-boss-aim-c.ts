import {
  antiphonBoss,
  batonBoss,
  curtainBody,
  curtainBoss,
  davitBoss,
  gorgeBoss,
  hiveBoss,
  keelBoss,
  leadBoss,
  ledgerBoss,
  ratchetBoss,
  scuttleBoss,
  slingBoss,
  tasterBoss,
  throatBoss,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import { antiphonBox } from "./antiphon-shape.js";
import { socketPoint, socketReach } from "./baton-socket-draw.js";
import { sides } from "./caption-anchor-box.js";
import { curtainSheetSpan } from "./curtain-grip.js";
import { CURTAIN_HEM_DROP, CURTAIN_RAIL_RISE } from "./curtain-sheet.js";
import { davitAngle } from "./davit-pose.js";
import { DAVIT_SAG, davitHook, davitHookRadius, davitMast, davitTip } from "./davit-shape.js";
import { drawnCol } from "./depth.js";
import { gorgeSackBox } from "./gorge-draw.js";
import { hiveBox } from "./hive-shape.js";
import { keelSegs } from "./keel-pose.js";
import { keelPlateHalf } from "./keel-shape.js";
import { type Layout, tileCY } from "./layout.js";
import { leadAlong, leadAskedAngle, leadFoot, leadRidgeY, leadStalkLength } from "./lead-shape.js";
import { ledgerBodyBox, ledgerGap } from "./ledger-shape.js";
import { ratchetLock, ratchetRails } from "./ratchet-shape.js";
import { scuttleFrameBox } from "./scuttle-shape.js";
import { slingArrived, slingGone, slingTension } from "./sling-pose.js";
import { slingCupRadius, slingHandle, slingHome, slingTip } from "./sling-shape.js";
import { capsule, lastBossAim, spreadCapsule } from "./slow-boss-aim-d.js";
import type { Aim } from "./slow-intake-aim.js";
import { tasterFanBox } from "./taster-draw.js";
import { GULLET_PAD, throatGullet } from "./throat-shape.js";
import { undertowEdgeBox } from "./undertow-shape.js";

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
 * Every extent is the one the boss's caption rings (`caption-anchor-box.ts`'s
 * `spread` and `sides`), so the light and the ring cannot disagree on a body.
 * Rows may read the beat, as page two's do. A kind with no row here goes on
 * to page four (`slow-boss-aim-d.ts`).
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
      return spreadCapsule(points, socketReach(l));
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
      return capsule(sides(span.left, span.right, top, bottom));
    }
    // The sack at its fullest breath, so the light clears it all the beat.
    case "gorge": {
      const s = gorgeBoss(world);
      return s === null ? null : capsule(gorgeSackBox(l, cfg, s, 1));
    }
    case "hive": {
      const b = hiveBox(l, cfg);
      return hiveBoss(world) === null ? null : capsule(sides(b.left, b.right, b.top, b.bottom));
    }
    // The spine along the top, every segment where it stands this frame.
    case "keel": {
      const s = keelBoss(world);
      if (s === null) return null;
      const segs = keelSegs(l, cfg, s, beat, beatPhase);
      return spreadCapsule(
        segs.map((seg) => seg.centre),
        keelPlateHalf(l),
      );
    }
    // The stalk from its foot on the ridge to its tip, as thick as the ridge.
    case "lead": {
      const s = leadBoss(world);
      if (s === null) return null;
      const foot = leadFoot(l, cfg, s);
      const tip = leadAlong(foot, leadAskedAngle(s, l.role), leadStalkLength(l, s));
      const ridge = leadRidgeY(l, cfg);
      return { x: tip.x, y: tip.y, r: ridge.bottom - ridge.top, ax: foot.x, ay: foot.y };
    }
    // Both halves and the seam between them, as far open as it is.
    case "ledger": {
      const s = ledgerBoss(world);
      if (s === null) return null;
      return capsule(ledgerBodyBox(l, cfg, s, ledgerGap(l, cfg, s, beat, beatPhase)));
    }
    // The strut down the middle column, from the lock at its top to the foot
    // of its rails: the rack climbs inside it and never out.
    case "ratchet": {
      if (ratchetBoss(world) === null) return null;
      const lock = ratchetLock(l, cfg);
      const rails = ratchetRails(l, cfg);
      return capsule(sides(rails.left, rails.right, lock.y - lock.half, rails.bottom));
    }
    // The frame of sockets, drawn back as far as the wind-up has it.
    case "scuttle": {
      const s = scuttleBoss(world);
      return s === null ? null : capsule(scuttleFrameBox(l, cfg, s, beat, beatPhase));
    }
    case "taster": {
      const s = tasterBoss(world);
      return s === null ? null : capsule(tasterFanBox(l, s));
    }
    // The whole gullet, root to mouth, leaning as far as its rings let it.
    case "throat": {
      const s = throatBoss(world);
      if (s === null) return null;
      return spreadCapsule(throatGullet(l, cfg, s, beat, beatPhase), l.tile * GULLET_PAD);
    }
    // The edge along every breach it is pushing at. None open is no body on
    // the field, and the cannon's column at the hull is the edge it will come at.
    case "undertow": {
      const s = undertowBoss(world);
      const edge = s === null ? null : undertowEdgeBox(l, cfg, s, s.breaches, beat, beatPhase);
      return edge === null ? null : capsule(edge);
    }
    // The body the width of the field: a disc round it would be the whole top
    // of the screen, which is the case the capsule is for.
    case "antiphon": {
      if (antiphonBoss(world) === null) return null;
      const b = antiphonBox(l, cfg);
      return capsule(sides(b.left, b.right, b.top, b.bottom));
    }
    // The yoke: the crotch, both tines as splayed as it has arrived, and both
    // cords as far drawn as their seat has them.
    case "sling": {
      const s = slingBoss(world);
      if (s === null) return null;
      const home = slingHome(l, cfg, slingGone(s, cfg, beat, beatPhase));
      const out = slingArrived(s, cfg, beat, beatPhase);
      const parts = [{ x: 0, y: 0 }];
      for (const side of [0, 1] as const) {
        const tension = slingTension(world, s, side, beat, beatPhase);
        parts.push(slingTip(l, side, out), slingHandle(l, side, tension));
      }
      return spreadCapsule(offset(home, parts), slingCupRadius(l));
    }
    // The boom from the mast's foot to its tip, and the hook on its chain.
    case "davit": {
      const s = davitBoss(world);
      if (s === null) return null;
      const angle = davitAngle(s, cfg, beatPhase);
      const parts = [{ x: 0, y: 0 }, davitTip(l, angle), davitHook(l, angle, DAVIT_SAG)];
      return spreadCapsule(offset(davitMast(l, cfg), parts), davitHookRadius(l));
    }
    default:
      return lastBossAim(world, l, beat, beatPhase);
  }
}

/** Points laid about a body's own origin, stood where the drawer plants it. */
function offset(at: { x: number; y: number }, parts: readonly { x: number; y: number }[]) {
  return parts.map((p) => ({ x: at.x + p.x, y: at.y + p.y }));
}
