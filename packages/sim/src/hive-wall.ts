import type { SimConfig } from "./config.js";
import { hullRow } from "./config.js";
import { type HiveState, hiveBoss, hiveDown, hiveOnWall, hiveOpen } from "./hive.js";
import { hiveClenched, NO_PINCH } from "./hive-lobe.js";
import { livingKindForColor } from "./kinds.js";
import { spawnOne } from "./spawn.js";
import type { Bullet } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **THE HIVE's two walls**: the mass hangs down both sides of the field as
 * well as over the top, the owner's of 5 October 2026, and a wall carries
 * `hiveWallSites` cocoons one above the other in its own column.
 *
 * **A bolt fired straight up a wall's column meets the lowest cocoon on it**,
 * whatever that cocoon is — shut, open, or scarred over — because it is the
 * first thing in the way. Every cocoon above it is out of a straight bolt's
 * reach, and the one way to it is the pilot's thumb **held** on it: while it
 * is, every shot the cannon puts out steers into that cocoon round a corner,
 * as THE LOCK steers a shot into a held body (`lock.ts`), and arrives at it
 * from the side, past the ones below. So the two seats' sentence grows a
 * third half: *the high one on the left is red* is said by him and *hold it*
 * is his own hand.
 *
 * **A wall's breach spills sideways**, out of the wall into the column next
 * to it, on the cocoon's own row — a body falling down the wall's column
 * would fall through every cocoon under it.
 *
 * Everything else a cocoon is, it is as a site: it opens on the same clock
 * in the same seeded order, takes the same colour, swells and may be wrung
 * the same way, and is sealed for good the same way (`hive-shot.ts`).
 */

/** Where every wall cocoon is, as `{ col, row }`: down the left wall from the top, then the right. */
export function hiveWallPlaces(cfg: SimConfig): { col: number; row: number }[] {
  const out: { col: number; row: number }[] = [];
  const lowest = hullRow(cfg) - 2;
  for (const col of [0, cfg.cols - 1]) {
    for (let k = 0; k < cfg.hiveWallSites; k++) {
      const row = cfg.hiveWallRow + k * cfg.hiveWallGap;
      if (row > lowest) break;
      out.push({ col, row });
    }
  }
  return out;
}

/**
 * The cocoon a bolt in `col` meets first, coming up from `from` thousandths
 * of a row: the lowest one on that wall at or above it, or `-1`.
 */
function wallSiteAbove(s: HiveState, col: number, from: number): number {
  let best = -1;
  for (let i = 0; i < s.cols.length; i++) {
    if (s.cols[i] !== col || !hiveOnWall(s, i)) continue;
    const at = (s.rows[i] ?? 0) * MILLI;
    if (at > from) continue;
    if (best < 0 || at > (s.rows[best] ?? 0) * MILLI) best = i;
  }
  return best;
}

/**
 * The cocoon a bolt fired straight up `col` meets: the lowest on that wall,
 * or `-1` for a column with no wall in it. Every other cocoon on it needs the
 * pilot's thumb.
 */
export function hiveWallFront(s: HiveState, col: number): number {
  return wallSiteAbove(s, col, Number.MAX_SAFE_INTEGER);
}

/**
 * The wall cocoons a held thumb is worth something on right now: every open
 * breach up a wall behind the lowest cocoon on it, which a straight bolt meets
 * first. None while the mass is clenched up out of reach or once it is beaten. The ring
 * the pilot is offered (`render/hive-lock.ts`) and the cocoon a rehearsal's
 * hold lands on (`scene-aim.ts`) are both this list.
 */
export function hiveHoldable(s: HiveState): number[] {
  if (s.downBeat >= 0 || hiveClenched(s)) return [];
  const out: number[] = [];
  for (let i = 0; i < s.opened; i++) {
    if (!hiveOnWall(s, i) || !hiveOpen(s, i)) continue;
    if (hiveWallFront(s, s.cols[i] ?? 0) !== i) out.push(i);
  }
  return out;
}

/**
 * Where a shot sweeping `from` up to `to` in its column meets a wall cocoon,
 * in thousandths of a row, or `-1` — `bossAlong`'s question (`boss-along.ts`).
 * A beaten mass stops nothing.
 */
export function hiveWallAlong(world: World, b: Bullet, from: number, to: number): number {
  const s = hiveBoss(world);
  if (s === null || hiveDown(s)) return -1;
  const i = wallSiteAbove(s, b.col, from);
  if (i < 0) return -1;
  const at = (s.rows[i] ?? 0) * MILLI;
  return at < to ? -1 : at;
}

/** The cocoon a shot that `hiveWallAlong` stopped has met: the lowest at or above where it stands. */
export function hiveWallMet(s: HiveState, b: Bullet): number {
  return wallSiteAbove(s, b.col, b.row * MILLI - b.subMilli);
}

/**
 * Where the pilot's held thumb is steering his shots, for `steerShot`
 * (`lock.ts`): the cocoon's level in thousandths of a row and its column, or
 * null. Only an open breach is steered into — a held thumb on a shut cocoon
 * or a scar asks for nothing — and never while the mass is clenched up out of
 * reach or beaten.
 */
export function hiveAim(world: World): { milli: number; lane: number } | null {
  const s = hiveBoss(world);
  if (s === null || s.aim === NO_PINCH || hiveDown(s) || hiveClenched(s)) return null;
  if (!hiveOnWall(s, s.aim) || !hiveOpen(s, s.aim)) return null;
  return { milli: (s.rows[s.aim] ?? 0) * MILLI, lane: s.cols[s.aim] ?? 0 };
}

/**
 * A wall's breach spilling: the breach's colour, living, out of the wall into
 * the next column in, on its own row — gliding out sideways for its first
 * beat, as a rock sent across comes out of the wall it entered at.
 */
export function spillFromWall(world: World, s: HiveState, i: number): void {
  const wall = s.cols[i] ?? 0;
  const col = wall === 0 ? 1 : wall - 1;
  const row = s.rows[i] ?? 0;
  const color = s.colors[i] ?? "red";
  const before = world.creatures.length;
  spawnOne(world, { beat: world.beat, col, kind: livingKindForColor(color), color });
  const body = world.creatures[before];
  if (body !== undefined) {
    body.row = row;
    body.fromRow = row;
    body.fromCol = wall;
  }
}
