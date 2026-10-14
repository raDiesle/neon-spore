import type { WardenState } from "./boss-state.js";
import type { SimConfig } from "./config.js";
import { pullDownMilli, tileCentreMilli } from "./handle-pull.js";
import { type PullPath, pullBowPath, pullPathLength, pullPathPoint } from "./pull-path.js";

/**
 * **THE WARDEN's rope bows**: its path from where the hand takes hold is
 * no longer straight down but a half-wave out toward the middle of the field
 * and back — the owner, 13 October 2026, choosing which pulls bend: *every
 * straight pull with room*, this rope first (`pull-path.ts`).
 *
 * - **Down as far as it went straight**: the path drops the room-cut
 *   `wardenTautMilli` (`pullDownMilli`), so the field holds it wherever the
 *   pupil hangs it, and bows `wardenBowMilli` across halfway down.
 * - **Toward the middle**, so a rope hung over either edge column still has
 *   the field to bow into.
 * - **The tension stays in thousandths of taut.** `pullMilli` is the progress
 *   along the path scaled to the drop, so the hatch's openness, `pullIsTaut`
 *   and every film that writes a carry in taut's units read as they did; the
 *   path's own length is only the hand's.
 *
 * Integer throughout: the bow is `pullBowPath`'s table of the half-sine.
 */

/** The rope's rest with nobody on it, in thousandths of a tile. */
export function wardenRopeRest(cfg: SimConfig, b: WardenState): { x: number; y: number } {
  return tileCentreMilli(b.pupilCol, cfg.wardenRow + cfg.wardenHangRows);
}

/** Where the path starts: the anchor while a hand is on it, the rest while none is. */
function ropeFrom(cfg: SimConfig, b: WardenState): { x: number; y: number } {
  return b.pulling ? { x: b.pullAnchorX, y: b.pullAnchorY } : wardenRopeRest(cfg, b);
}

/** How far down the path drops: taut, or the field's edge where that comes first. */
export function wardenRopeDrop(cfg: SimConfig, anchorY: number): number {
  return pullDownMilli(cfg, anchorY, cfg.wardenTautMilli, cfg.wardenTautMilli);
}

/** The rope's path from where it starts, in thousandths of a tile from there. */
export function wardenRopePath(cfg: SimConfig, b: WardenState): PullPath {
  const from = ropeFrom(cfg, b);
  const drop = wardenRopeDrop(cfg, from.y);
  const side = from.x * 2 < cfg.cols * 1000 ? 1 : -1;
  return pullBowPath({ dx: 0, dy: 1 }, { dx: side, dy: 0 }, drop, cfg.wardenBowMilli);
}

/** The tension a progress along the path is, in thousandths of a tile of the drop. */
export function wardenRopeTension(cfg: SimConfig, b: WardenState, along: number): number {
  const len = pullPathLength(wardenRopePath(cfg, b));
  if (len <= 0) return 0;
  return Math.trunc((along * wardenRopeDrop(cfg, ropeFrom(cfg, b).y)) / len);
}

/** How far along the path a tension stands, in thousandths of a tile of the path. */
export function wardenRopeAlong(cfg: SimConfig, b: WardenState, tension: number): number {
  const drop = wardenRopeDrop(cfg, ropeFrom(cfg, b).y);
  if (drop <= 0) return 0;
  return Math.trunc((tension * pullPathLength(wardenRopePath(cfg, b))) / drop);
}

/**
 * Where a hand that grabbed at nought stands when it has carried the rope to
 * `tension`: the displacement a film, the autopilot or the keys send, so
 * anything that writes the carry in taut's units follows the bow
 * (`scene-aim.ts`, `hands/`).
 */
export function wardenRopeFromMilli(
  cfg: SimConfig,
  b: WardenState,
  tension: number,
): { fromMilli: number; fromYMilli: number } {
  const at = pullPathPoint(wardenRopePath(cfg, b), wardenRopeAlong(cfg, b, tension));
  return { fromMilli: at.x, fromYMilli: at.y };
}
