import type { SimConfig } from "./config.js";
import { cordRest, lidSide } from "./lid.js";
import { LID_DOWN, LID_UP, lidWayNow, lidWayVec } from "./lid-way.js";
import {
  type PullPath,
  pullBowAt,
  pullBowPath,
  pullPathLength,
  pullPathNearest,
} from "./pull-path.js";
import type { Creature } from "./types.js";

/**
 * **THE LID's cord bows**: along whichever of its four ways the grab took
 * (`lid-way.ts`), `lidTautMilli` long, and `lidBowMilli` to one side halfway
 * — the owner, 13 October 2026, choosing which pulls bend: *every straight
 * pull with room*, this cord second (`pull-path.ts`, `warden-bow.ts`).
 *
 * - **Which side**: a cord run down or up bows toward the middle of the
 *   field, the side it hangs on (`lidSide`), so it has room from any column;
 *   one run across bows **up**, because a cord only runs across when the lid
 *   is too low for one down, and a low lid has the field above it.
 * - **The tension is the straight distance along the way**, as it was: the
 *   handle stands on the bow at that distance (`pullBowAt`), so the room the
 *   field has that way still bounds it exactly (`stepLidPulls`). The bow's
 *   own length is the hand's, and only the stray rule reads it.
 */

/** The way the cord runs and the side it bows to, unit steps. */
function lidBowAxes(cfg: SimConfig, c: Creature) {
  const w = lidWayNow(cfg, c);
  const side = w === LID_DOWN || w === LID_UP ? { dx: lidSide(cfg, c), dy: 0 } : { dx: 0, dy: -1 };
  return { way: lidWayVec(w), side };
}

/** The cord's path from its rest, in thousandths of a tile from there. */
export function lidCordPath(cfg: SimConfig, c: Creature): PullPath {
  const { way, side } = lidBowAxes(cfg, c);
  return pullBowPath(way, side, cfg.lidTautMilli, cfg.lidBowMilli);
}

/** Where the handle stands from the rest with the cord carried `tension` along its way. */
export function lidCordPoint(
  cfg: SimConfig,
  c: Creature,
  tension: number,
): { x: number; y: number } {
  const { way, side } = lidBowAxes(cfg, c);
  return pullBowAt(way, side, cfg.lidTautMilli, cfg.lidBowMilli, tension);
}

/** The straight distance along the way of a point on the cord's path. */
export function lidCordTension(cfg: SimConfig, c: Creature, p: { x: number; y: number }): number {
  const { way } = lidBowAxes(cfg, c);
  return way.dx * p.x + way.dy * p.y;
}

/** Roughly how far along the path a tension stands: the window the stray rule looks in. */
export function lidCordAlong(cfg: SimConfig, c: Creature, tension: number): number {
  if (cfg.lidTautMilli <= 0) return 0;
  return Math.trunc((tension * pullPathLength(lidCordPath(cfg, c))) / cfg.lidTautMilli);
}

/**
 * The pull as a vector: the handle's place from the rest, on the bow, nought
 * where a lid has no hand on it. Thousandths of a tile, x across and y down.
 */
export function lidPull(cfg: SimConfig, c: Creature): { x: number; y: number } {
  if (c.lidPullMilli === undefined) return { x: 0, y: 0 };
  return lidCordPoint(cfg, c, c.lidPullMilli);
}

/**
 * Where the handle is, in thousandths of a tile — the cord's rest **today**
 * plus how far the hand has carried it.
 *
 * So the handle goes down the field with the lid, held or not, and the cord
 * keeps its length: the owner's ask, *it should glide as the lid glides*. It
 * was the other way for a while — an anchor frozen at the grab, so the handle
 * sat under a still thumb while the body fell away and the cord paid out —
 * and that read as the handle having come off the creature. The tension is
 * how far the hand has come from where it grabbed (`lidHeard`), which a body
 * falling under a still hand does not change; the picture the pilot is
 * holding simply travels with the thing it is attached to, and the finger,
 * which is captured, does not have to follow it.
 *
 * Render glides this by the beat's phase rather than reading it off the row;
 * this is the rule the room and the tests are on.
 */
export function lidHandleMilli(cfg: SimConfig, c: Creature): { x: number; y: number } {
  const rest = cordRest(cfg, c);
  const pull = lidPull(cfg, c);
  return { x: rest.x + pull.x, y: rest.y + pull.y };
}

/**
 * How much of the bow's own length the handle has come, 0..1: what the
 * channel fills green to and where its arrow points (`render/lid-string.ts`),
 * which the straight distance would leave short of the knob mid-bow.
 */
export function lidCordShare(cfg: SimConfig, c: Creature): number {
  const path = lidCordPath(cfg, c);
  const len = pullPathLength(path);
  if (c.lidPullMilli === undefined || len <= 0) return 0;
  const at = lidPull(cfg, c);
  const near = pullPathNearest(path, lidCordAlong(cfg, c, c.lidPullMilli), at.x, at.y);
  return near.alongMilli / len;
}

/**
 * Where a hand that grabbed at nought stands with the cord carried `tension`
 * along its way: on the bow, which a film and the autopilot send so they
 * follow the channel (`scene-aim.ts`, `hands/`).
 */
export function lidCordFromMilli(
  cfg: SimConfig,
  c: Creature,
  tension: number,
): { fromMilli: number; fromYMilli: number } {
  const at = lidCordPoint(cfg, c, tension);
  return { fromMilli: at.x, fromYMilli: at.y };
}
