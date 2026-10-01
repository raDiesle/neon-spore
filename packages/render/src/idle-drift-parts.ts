import { smoothstep } from "./ease.js";
import { DEG, headYawDeg, IDLE_DRIFT, subSeed, type Wander, wander } from "./idle-drift.js";
import { noise1 } from "./solid-motion.js";

/**
 * THE PART DRIFT: every named part of a boss turns, tilts and rotates a
 * little about its own joint, on top of the body's drift
 * (`docs/spec/living-bosses.md` §1, "Every part moves on its own"; the owner,
 * 26 September 2026). Split off `idle-drift.ts` for its length; the ceilings
 * and the seeding are that file's.
 *
 * A part is a child of what it hangs on and does what its parent did a
 * little **earlier** and a little **less** — `FALLOFF` of the parent a row's
 * `lag` ago — plus its own noise on its own seed, which is what keeps it from
 * being a delayed copy. The angles returned are the part's as the eye sees
 * them, parent and all; `life` 0 gives the parent's own, exactly.
 *
 * - **turn** swings about the joint's up axis, **tilt** nods about its side
 *   axis, **rotate** cocks in the plane we see. Radians.
 * - A chain — neck, tail, horn — is one call a link, each link's parent the
 *   link before, `link` of `links` growing the turn from root to tip.
 * - The seed is the part's: `partSeed(bossSeed, index)`. Two parts share
 *   nothing, a pair included, and a pair is not a mirror.
 * - The eyes are not angles: `glance` moves both pupils the same way, as
 *   eyes do, ahead of the head.
 */

export type PartRow =
  | "head"
  | "jaw"
  | "neck"
  | "arm"
  | "hand"
  | "finger"
  | "wing"
  | "tail"
  | "horn"
  | "lobe";

export interface PartAngles {
  readonly turn: number;
  readonly tilt: number;
  readonly rotate: number;
}

export const STILL: PartAngles = { turn: 0, tilt: 0, rotate: 0 };

interface Row {
  /** Reach in degrees at the root and at the tip of a chain; equal for a single part. */
  readonly turn: readonly [number, number];
  readonly tilt: readonly [number, number];
  readonly rotate: readonly [number, number];
  /** Where the tilt wanders about: a jaw opens from shut and never past it. */
  readonly tiltBias?: number;
  /** Seconds, the slow end of the table's range — the ceilings want it (`idle-drift.ts`). */
  readonly period: number;
  /** How far behind its parent, seconds (a link behind the link before). */
  readonly lag: number;
}

/** The spec's table, one row a kind of part. A part not here takes the row nearest it in size and use. */
export const PART_ROWS: Readonly<Record<PartRow, Row>> = {
  head: { turn: [6, 6], tilt: [6, 6], rotate: [8, 8], period: 5, lag: 0.3 },
  jaw: { turn: [0, 0], tilt: [2, 2], rotate: [0, 0], tiltBias: 2, period: 4, lag: 0.1 },
  neck: { turn: [4, 4], tilt: [3, 3], rotate: [3, 3], period: 5, lag: 0.15 },
  arm: { turn: [5, 5], tilt: [6, 6], rotate: [4, 4], period: 6, lag: 0.35 },
  hand: { turn: [8, 8], tilt: [8, 8], rotate: [6, 6], period: 4, lag: 0.25 },
  finger: { turn: [0, 0], tilt: [10, 10], rotate: [0, 0], period: 3, lag: 0.15 },
  wing: { turn: [4, 4], tilt: [5, 5], rotate: [3, 3], period: 5, lag: 0.3 },
  tail: { turn: [5, 10], tilt: [4, 4], rotate: [4, 4], period: 11, lag: 0.2 },
  horn: { turn: [4, 12], tilt: [6, 6], rotate: [0, 0], period: 4, lag: 0.15 },
  lobe: { turn: [0, 0], tilt: [4, 4], rotate: [3, 3], period: 5, lag: 0.25 },
};

/** How much of its parent a child follows with. */
export const FALLOFF = 0.9;

export interface PartOptions {
  /** Which link of a chain, 0 at the root. */
  readonly link?: number;
  readonly links?: number;
  /** The drawer's `life` level, 0 to 1: 0 is the parent's angles exactly. */
  readonly life?: number;
  /** A gesture's `letGo(...)`, 1 when the script does not own the part. */
  readonly letGo?: number;
  /** How many times the row's period the part takes, 1 unless it is larger than its row. */
  readonly slow?: number;
}

/** A part's seed: the boss's and the part's index, hashed together. */
export function partSeed(bossSeed: number, index: number): number {
  return subSeed(bossSeed, 101 + index);
}

const reach = (r: readonly [number, number], tip: number) => r[0] + (r[1] - r[0]) * tip;

/** A part's own wander about its joint, degrees, before the hush — what the table's ranges bound. */
export function partOwn(
  time: number,
  seed: number,
  part: PartRow,
  link = 0,
  links = 1,
  slow = 1,
): PartAngles {
  const row = PART_ROWS[part];
  const tip = links > 1 ? link / (links - 1) : 0;
  const at = (k: number, r: readonly [number, number]): number => {
    const w: Wander = { amp: reach(r, tip), period: row.period * slow };
    return w.amp === 0 ? 0 : wander(time, subSeed(seed, k), w);
  };
  return {
    turn: at(0, row.turn),
    tilt: (row.tiltBias ?? 0) + at(1, row.tilt),
    rotate: at(2, row.rotate),
  };
}

/**
 * One part's three angles at `time`: its parent `FALLOFF` of the way a
 * `lag` ago, and its own wander scaled by `hush`, the gesture's `letGo` and
 * the drawer's `life`. `parent` is a function of time because following late
 * needs to ask where the parent was.
 */
export function partDrift(
  time: number,
  seed: number,
  part: PartRow,
  parent: (t: number) => PartAngles,
  hush = 1,
  opts: PartOptions = {},
): PartAngles {
  const row = PART_ROWS[part];
  const life = opts.life ?? 1;
  const now = parent(time);
  if (life === 0) return now;
  const late = parent(time - row.lag);
  const own = partOwn(time, seed, part, opts.link ?? 0, opts.links ?? 1, opts.slow ?? 1);
  const k = hush * (opts.letGo ?? 1) * DEG;
  const mix = (n: number, l: number, o: number) => n + life * (FALLOFF * l - n + o * k);
  return {
    turn: mix(now.turn, late.turn, own.turn),
    tilt: mix(now.tilt, late.tilt, own.tilt),
    rotate: mix(now.rotate, late.rotate, own.rotate),
  };
}

/** The pupils' reach, in eye radii, and how the glances are spaced. */
export const GLANCE = { reach: 0.2, cell: 2.75, move: 0.3, lead: 0.6 } as const;

/**
 * Where both pupils look, in eye radii from the eye's centre, never past
 * `GLANCE.reach`. A glance is a move and a hold: over the first `move` of a
 * cell the pupil goes to its next target and then stays, the cells stretched
 * by noise so the holds run about 1.5 to 4 seconds. Each target is where the
 * head will be looking `lead` seconds after the middle of its hold, so **the
 * eyes lead the head** rather than holding on where it has been.
 * One call serves both eyes, which is what keeps them together.
 */
export function glance(time: number, seed: number, hush = 1): { x: number; y: number } {
  const c = GLANCE.cell;
  const u = time / c + 0.35 * noise1(time / (c * 2), subSeed(seed, 40));
  const i = Math.floor(u);
  const s = smoothstep((u - i) / GLANCE.move);
  const target = (n: number) => ({
    x: Math.max(
      -1,
      Math.min(1, headYawDeg((n + 0.5) * c + GLANCE.lead, seed) / IDLE_DRIFT.headYaw.amp),
    ),
    y: 0.5 * noise1(n * 0.73, subSeed(seed, 41)),
  });
  const a = target(i - 1);
  const b = target(i);
  const x = a.x + (b.x - a.x) * s;
  const y = a.y + (b.y - a.y) * s;
  const len = Math.hypot(x, y);
  const k = (GLANCE.reach * hush) / Math.max(1, len);
  return { x: x * k, y: y * k };
}
