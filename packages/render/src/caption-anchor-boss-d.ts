import type { BossPart } from "@neon-spore/content";
import {
  fleetCols,
  fleetRows,
  type GorgeState,
  gorgeBoss,
  type SimConfig,
  stareBoss,
  type World,
} from "@neon-spore/sim";
import type { AnchorPoint } from "./caption-anchor.js";
import { bossAnchorE } from "./caption-anchor-boss-e.js";
import { around, box } from "./caption-anchor-box.js";
import { gorgeSackBox, gorgeTallyY } from "./gorge-draw.js";
import { type Layout, tileCX } from "./layout.js";
import { mirrorHullY } from "./mirror.js";
import { stareEye } from "./stare-shape.js";
import { showsGorgeTally } from "./view-role-clocks.js";

/**
 * **Where the fixtures of THE GORGE, THE FLEET, THE MIRROR and THE STARE
 * are** — the fourth of `caption-anchor-boss.ts`, split off `-c` on line
 * count, and read the same way: each line asks the boss's own draw file, and
 * a part a screen does not draw is no ring at all.
 *
 * These four came off the hull on 21 September 2026. All four films said *a
 * sack hangs*, *player 1 sees the ships*, *call each move*, *an eye* over the
 * middle of the player's own hull, which is the one thing on those screens
 * none of those sentences is about — and in three of the four the subject is
 * not even on the field, it is over it.
 */

export function bossAnchorD(
  l: Layout,
  world: World,
  part: BossPart | undefined,
  beatPhase: number,
): AnchorPoint | null {
  const cfg = world.cfg;
  const gorge = gorgeBoss(world);
  if (gorge !== null) return gorgePart(l, cfg, gorge, part);
  if (world.boss?.kind === "fleet") return fleetChart(l, cfg);
  if (world.boss?.kind === "mirror") return mirrorShip(l, cfg);
  if (stareBoss(world) !== null) return stareSocket(l, cfg);
  // The four of the fifth file, on the same line-count argument.
  return bossAnchorE(l, world, part, beatPhase);
}

/** How much of a tile one of the pilot's counts is worth as a ring. */
const TALLY_R = 0.25;

/**
 * THE GORGE: the sack where it hangs this frame, breath and sag and all —
 * the whole boss, since there is no body of it among the creatures and the
 * lobes across it are what every shot is aimed into (`gorge-draw.ts`).
 * `tally` is the pilot's row of counts under those lobes, and the navigator
 * is not shown a number at all, so on her screen it is no ring.
 */
function gorgePart(
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  part: BossPart | undefined,
): AnchorPoint | null {
  if (part === "tally") {
    if (!showsGorgeTally(l.role)) return null;
    const y = gorgeTallyY(l, cfg, g);
    return around(
      g.intakes.map((_, i) => ({ x: tileCX(l, g.col + i), y })),
      l.tile * TALLY_R,
    );
  }
  return box(gorgeSackBox(l, cfg, g));
}

/**
 * THE FLEET: the chart, all of it — both its opening pages are about what is
 * drawn on the same squares and the difference between the two screens is
 * what is *on* them, so the ring is the same ring on both (`fleet-chart.ts`).
 * It is the one boss in the game with a board instead of a shape.
 */
function fleetChart(l: Layout, cfg: SimConfig): AnchorPoint {
  const rx = (fleetCols(cfg) * l.tile) / 2;
  const ry = (fleetRows(cfg) * l.tile) / 2;
  return box({ x: l.gridLeft + rx, y: l.gridTop + ry, rx, ry });
}

/**
 * THE MIRROR: the copy of the ship at the top of the field, read off the one
 * number that says where it is — the surface its hull is flipped about
 * (`mirror.ts`). A tile either side of that line holds both halves of it,
 * since the flip puts the body above the surface and the lobes that perform
 * the move below it.
 */
function mirrorShip(l: Layout, cfg: SimConfig): AnchorPoint {
  return box({
    x: l.gridLeft + l.gridWidth / 2,
    y: mirrorHullY(l, cfg),
    rx: l.gridWidth / 2,
    ry: l.tile,
  });
}

/**
 * THE STARE: the eye in its socket, which is the whole boss — the cowl round
 * it, how far it has turned and which seat it settled on are all read off the
 * same centre (`stare-shape.ts`). All four of its pages are about the eye,
 * including the two that are about a seat: what the seat has to say is what
 * the eye is doing.
 */
function stareSocket(l: Layout, cfg: SimConfig): AnchorPoint {
  const eye = stareEye(l, cfg);
  return box({ x: eye.cx, y: eye.cy, rx: eye.rx, ry: eye.ry });
}
