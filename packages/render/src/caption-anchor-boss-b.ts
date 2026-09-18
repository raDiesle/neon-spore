import type { BossPart } from "@neon-spore/content";
import {
  type AntiphonState,
  antiphonBoss,
  type LeadState,
  leadBoss,
  ORRERY_RINGS,
  type ScoutState,
  type ScuttleState,
  type SimConfig,
  scoutHome,
  scoutRound,
  scuttleBoss,
  type World,
} from "@neon-spore/sim";
import {
  antiphonBox,
  antiphonOrganCircle,
  antiphonPerch,
  ORGAN_R,
  RAIL_R,
} from "./antiphon-shape.js";
import type { AnchorPoint } from "./caption-anchor.js";
import type { Layout } from "./layout.js";
import { leadAlong, leadAskedAngle, leadFoot, leadStalkLength } from "./lead-shape.js";
import { orreryCorePoint, orreryOrganR, orreryRx, orreryRy } from "./orrery-shape.js";
import { scoutAt } from "./scout-draw.js";
import {
  scuttleBox,
  scuttleHangDrop,
  scuttleHangPhase,
  scuttleSocket,
  scuttleWindPhase,
  scuttleWindRise,
} from "./scuttle-shape.js";
import { showsScoutArena } from "./view-role.js";
import { showsOrreryRing } from "./view-role-clocks.js";
import { showsAntiphonOrgan, showsAntiphonRail, showsScuttleLive } from "./view-role-clocks-b.js";

/**
 * **Where the fixtures of THE LEAD, THE SCUTTLE, THE ANTIPHON, THE ORRERY
 * and THE SCOUT are** — the second half of `caption-anchor-boss.ts`, split
 * off it on line count, and read the same way: each line asks the boss's
 * own shape file, and a part a screen does not draw is no ring at all.
 */

const CLEAR = 16;

interface Box {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

function box(b: Box): AnchorPoint {
  return { x: b.x, y: b.y, r: b.ry + 6, rx: b.rx + 6, clear: CLEAR };
}

/** A box round a set of points, each with radius `r`; null with no points. */
function around(points: readonly { x: number; y: number }[], r: number): AnchorPoint | null {
  if (points.length === 0) return null;
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const p of points) {
    left = Math.min(left, p.x - r);
    right = Math.max(right, p.x + r);
    top = Math.min(top, p.y - r);
    bottom = Math.max(bottom, p.y + r);
  }
  return box({
    x: (left + right) * 0.5,
    y: (top + bottom) * 0.5,
    rx: (right - left) * 0.5,
    ry: (bottom - top) * 0.5,
  });
}

export function bossAnchorB(
  l: Layout,
  world: World,
  part: BossPart | undefined,
  beatPhase: number,
): AnchorPoint | null {
  const cfg = world.cfg;
  const lead = leadBoss(world);
  if (lead !== null) return leadStalk(l, cfg, lead);
  const scuttle = scuttleBoss(world);
  if (scuttle !== null) return scuttlePart(l, cfg, scuttle, part, world.beat, beatPhase);
  const antiphon = antiphonBoss(world);
  if (antiphon !== null) return antiphonPart(l, cfg, antiphon, part);
  if (world.boss?.kind === "orrery") return orreryPart(l, cfg, part);
  const scout = scoutRound(world);
  if (scout !== null) return scoutPart(l, cfg, scout, part);
  return null;
}

/**
 * THE LEAD: the stalk from its foot to its tip, at the angle it is asked to
 * stand at — the body at its column on the navigator's screen, the readout
 * in the middle on the pilot's (`lead-shape.ts`). The spring the drawn stalk
 * rides is `effects.boss.lead`, and a caption does not chase it.
 */
function leadStalk(l: Layout, cfg: SimConfig, s: LeadState): AnchorPoint {
  const foot = leadFoot(l, cfg, s);
  const tip = leadAlong(foot, leadAskedAngle(s, l.role), leadStalkLength(l, s));
  const pad = l.tile * 0.3;
  return box({
    x: (foot.x + tip.x) * 0.5,
    y: (foot.y + tip.y) * 0.5,
    rx: Math.abs(foot.x - tip.x) * 0.5 + pad,
    ry: Math.abs(foot.y - tip.y) * 0.5 + pad,
  });
}

/** THE SCUTTLE: the frame of sockets; `live`, the live part hanging under its socket, on the screen shown which is live. */
function scuttlePart(
  l: Layout,
  cfg: SimConfig,
  s: ScuttleState,
  part: BossPart | undefined,
  beat: number,
  beatPhase: number,
): AnchorPoint | null {
  const rise = scuttleWindRise(l, scuttleWindPhase(s, cfg, beat, beatPhase));
  if (part === "live") {
    if (!showsScuttleLive(l.role) || s.live < 0) return null;
    const c = scuttleSocket(l, cfg, s.live, rise);
    const at = { x: c.x, y: c.y + scuttleHangDrop(l, scuttleHangPhase(s, cfg, beat, beatPhase)) };
    return around([at], l.tile * 0.4);
  }
  const b = scuttleBox(l, cfg);
  return box({
    x: (b.left + b.right) * 0.5,
    y: (b.top + b.bottom) * 0.5 - rise,
    rx: (b.right - b.left) * 0.5,
    ry: (b.bottom - b.top) * 0.5,
  });
}

/**
 * THE ANTIPHON: the body with its pits; `organ`, what it has grown under the
 * middle — the perch it grows from while nothing stands — on the pilot's
 * screen; `rail`, every candidate hanging along the underside on the
 * navigator's, and the whole underside while the rail is empty.
 */
function antiphonPart(
  l: Layout,
  cfg: SimConfig,
  s: AntiphonState,
  part: BossPart | undefined,
): AnchorPoint | null {
  if (part === "organ") {
    if (!showsAntiphonOrgan(l.role)) return null;
    const n = Math.max(1, s.organs.length);
    const circles = Array.from({ length: n }, (_, i) => antiphonOrganCircle(l, cfg, i, n));
    return around(circles, ORGAN_R * l.tile);
  }
  if (part === "rail") {
    if (!showsAntiphonRail(l.role)) return null;
    const cols = s.rail.length > 0 ? s.rail.map((c) => c.col) : [0, cfg.cols - 1];
    return around(
      cols.map((col) => antiphonPerch(l, col)),
      RAIL_R * l.tile,
    );
  }
  const b = antiphonBox(l, cfg);
  return box({
    x: (b.left + b.right) * 0.5,
    y: (b.top + b.bottom) * 0.5,
    rx: (b.right - b.left) * 0.5,
    ry: (b.bottom - b.top) * 0.5,
  });
}

/**
 * THE ORRERY: the core inside every orbit; `core`, the core alone; `ring`,
 * the one orbit this seat is shown true and the other is not — the middle
 * on the pilot's, the inner on the navigator's (`showsOrreryRing`), and the
 * inner where both are.
 */
function orreryPart(l: Layout, cfg: SimConfig, part: BossPart | undefined): AnchorPoint {
  const core = orreryCorePoint(l, cfg);
  if (part === "core") {
    const r = l.tile * 0.53;
    return { x: core.x, y: core.y, r: r + 6, rx: r + 6, clear: CLEAR };
  }
  const inner = ORRERY_RINGS - 1;
  const ring = part === "ring" ? (showsOrreryRing(l.role, inner) ? inner : 1) : 0;
  const organ = orreryOrganR(l);
  return box({
    x: core.x,
    y: core.y,
    rx: orreryRx(cfg, ring) * l.tile + organ,
    ry: orreryRy(cfg, ring) * l.tile + organ,
  });
}

/**
 * THE SCOUT: the little ship where it flies, and the mouth it has yet to
 * leave while the lead holds it; `hazard`, the rocks crossing the arena, on
 * the screen shown the arena.
 */
function scoutPart(
  l: Layout,
  cfg: SimConfig,
  s: ScoutState,
  part: BossPart | undefined,
): AnchorPoint | null {
  if (part === "hazard") {
    if (!showsScoutArena(l.role)) return null;
    const r = (cfg.scoutHazardRadiusMilli * l.tile) / 1000;
    return around(
      s.hazards.map((h) => scoutAt(l, h)),
      r,
    );
  }
  if (s.phase === "lead") {
    const home = scoutAt(l, scoutHome(cfg.cols, cfg.rows));
    return around([home], (cfg.scoutHomeRadiusMilli * l.tile) / 1000);
  }
  return around([scoutAt(l, s)], ((cfg.scoutRadiusMilli * l.tile) / 1000) * 1.7);
}
