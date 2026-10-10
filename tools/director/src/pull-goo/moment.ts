import type { Point } from "@neon-spore/content";
import type { PullAfter } from "@neon-spore/render";
import { clamp01 } from "./noise.js";

/**
 * **Where a GOO pull is in its story**, read the same way by the channel and
 * the drop from what the PULL LAB tells a look (`PullAfter`): waiting, held,
 * counted and splashing, failed and snapping, crawling home, landing back.
 */

/** Seconds the glob that seals a count takes to fall onto the place; the drop is gone after. */
export const IMPACT = 0.16;
/** Seconds a splash lasts from the count. */
export const SPLASH = 1.1;
/** Seconds a snapped neck takes to whip back into its two ends. */
export const SNAP = 0.3;
/** Seconds a fresh drop takes to fall into its start after a count. */
export const DROP_IN = 0.22;
/** How far above its place a falling glob starts, in drop radii: a count's glob, and a fresh drop. */
export const FALL = 4;
export const FALL_IN = 2.6;

export interface GooMoment {
  readonly held: boolean;
  readonly time: number;
  /** Seconds since the pull was counted, while the count is shown. */
  readonly counted: number | null;
  /** Seconds since the pull failed — short or off the path — while it is shown. */
  readonly failed: number | null;
  /** The drop is on its way home from a failure, the failure no longer shown. */
  readonly crawling: boolean;
  /** Seconds at rest with nothing shown, and what came before the rest. */
  readonly rested: number;
  readonly last: PullAfter["last"];
  /** The hand's offset off the path, the tolerance either side, and how near its edge, 0..1. */
  readonly off: Point;
  readonly reach: number | null;
  readonly warn: number;
}

export function momentOf(held: boolean, time: number, after: PullAfter | undefined): GooMoment {
  const age = after?.age ?? after?.since ?? 0;
  const off = after?.off ?? { x: 0, y: 0 };
  const reach = after?.reach ?? null;
  const rested = after?.rested ?? 1;
  const last = after?.last ?? null;
  const far = Math.hypot(off.x, off.y);
  return {
    held,
    time,
    counted: after?.verdict === "counted" ? age : null,
    failed: after?.verdict === "refused" ? age : null,
    crawling: !held && after?.verdict == null && last === "refused" && rested === 0,
    rested,
    last,
    off,
    reach,
    warn: reach !== null && held ? clamp01((far / reach - 0.4) / 0.6) : 0,
  };
}

/** Seconds since a fresh drop began to fall into its start, or null when none is falling. */
export function droppingIn(m: GooMoment): number | null {
  return !m.held && m.last === "counted" && m.counted === null && m.rested < 1 ? m.rested : null;
}

/** The drop is drawn: not once a count's glob has landed on it, nor while it goes home after. */
export function dropShown(m: GooMoment): boolean {
  if (m.counted !== null) return m.counted < IMPACT;
  return !(m.last === "counted" && !m.held && m.rested === 0);
}

/** How red the slime is: a failure, fading as it crawls home, or the band's edge near. */
export function redness(m: GooMoment): number {
  if (m.failed !== null) return 0.9 - 0.4 * clamp01(m.failed / 0.9);
  if (m.crawling) return 0.45;
  return m.warn * 0.85;
}

/** The fall a glob takes from `from` radii above onto `at`, `t` seconds in over `span`. */
export function fallen(at: Point, r: number, t: number, span: number, from = FALL): Point {
  const u = clamp01(t / span);
  return { x: at.x, y: at.y - r * from * (1 - u * u) };
}

/** The ends a pull is going to: the far end, or for a two-way pull still at rest, both. */
export function goals(origin: number, at: number): (0 | 1)[] {
  if (origin <= 0) return [1];
  if (origin >= 1) return [0];
  if (at > origin + 0.01) return [1];
  if (at < origin - 0.01) return [0];
  return [0, 1];
}

/** How much of the way to `goal` the hand has come, 0..1. */
export function share(origin: number, at: number, goal: 0 | 1): number {
  const span = Math.abs(goal - origin) || 1;
  return clamp01(((at - origin) * (goal - origin > 0 ? 1 : -1)) / span);
}
