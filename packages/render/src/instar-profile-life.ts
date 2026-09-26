import type { Point } from "./instar-place.js";

/**
 * **THE INSTAR side-on, alive**: what the long body does on its own clock
 * while the script holds it in a pose — the owner, 26 September 2026: *more
 * natural living animations*. Three motions, each on a period no other part
 * of the body shares (`docs/style-guide.md`, "Living motion"), so nothing of
 * it moves in lockstep:
 *
 * - **Breath**: the chest swells and settles, most just behind the neck and
 *   nothing at the rear. It shares its period with the ember glow in the
 *   chest (`instar-profile.ts`) on purpose — the fire brightens as the lung
 *   fills, which is one thing happening, not two in step.
 * - **Undulation**: a slow wave runs down the spine behind the far nest to
 *   the engines, growing as it goes, so the back the eggs sit on holds still
 *   and the rear swims — and the tail and the engines ride the rear with it.
 * - **Follow-through**: the head rides the breath a fraction of a cycle
 *   late, the way a head carried on a neck lags the chest that lifts it.
 *
 * And one that is not a motion of the silhouette at all: the **roll**, the
 * body turning a little about its own length, which carries the surface —
 * the scales, the lamps, the ridge — round under a light that stays put
 * (`instar-profile-surface.ts`).
 *
 * All of it reads `look.time`, the wall clock, not the beat: this is the
 * body's own life, and THE SLOW is shown by the weave (`instar-sway.ts`).
 */

const TAU = Math.PI * 2;

/** How far the chest swells, as a share of its width, and how long a breath takes. */
const BREATH = 0.07;
export const BREATH_PERIOD = 3.4;
/** Where along the body the chest is, and how far the swell reaches from it. */
const CHEST_AT = 0.24;
const CHEST_REACH = 0.22;

/** How far the rear swims, in head radii, and the wave's period and its length in bodies. */
const UNDULATE = 0.12;
/** Where along the body the swim starts: the far nest's own place on the spine. */
const UNDULATE_FROM = 2 / 3;
const UNDULATE_PERIOD = 4.3;
const UNDULATE_WAVES = 0.8;

/** How far the head lags the breath, in cycles, and how far it rises on it. */
const HEAD_LAG = 0.14;
const HEAD_BOB = 0.035;

/** The roll about the body's own length, in radians, and its period. */
const ROLL = 0.32;
const ROLL_PERIOD = 6.1;

/** The width multiplier at `u` along the body (0 the neck, 1 the rear). */
export function breathAt(u: number, time: number): number {
  const d = (u - CHEST_AT) / CHEST_REACH;
  return 1 + BREATH * Math.exp(-d * d) * Math.sin((time * TAU) / BREATH_PERIOD);
}

/** The spine, swimming: each sample carried across the body's line. In place. */
export function undulate(spine: Point[], r: number, time: number): void {
  const n = spine.length - 1;
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    const reach = Math.max(0, (u - UNDULATE_FROM) / (1 - UNDULATE_FROM)) ** 1.5;
    if (reach === 0) continue;
    const p = spine[i] as Point;
    p.y += r * UNDULATE * reach * Math.sin((time / UNDULATE_PERIOD - u * UNDULATE_WAVES) * TAU);
  }
}

/** Where the head rides this frame: the breath, late. */
export function headBob(head: Point, r: number, time: number): Point {
  const lagged = Math.sin((time / BREATH_PERIOD - HEAD_LAG) * TAU);
  return { x: head.x, y: head.y - r * HEAD_BOB * lagged };
}

/** The roll about the body's length this frame, in radians. */
export function rollAt(time: number): number {
  return ROLL * Math.sin((time * TAU) / ROLL_PERIOD);
}
