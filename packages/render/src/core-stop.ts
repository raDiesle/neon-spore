import type { Color, CoreVerdict, World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";

/**
 * **Where a bolt meets a core hung over the middle column**, for `BoltStops`
 * (`bolt-stop.ts`) — the eleven bosses whose shot is `sim/core-verdict.ts`.
 *
 * - **The core, open on a fire step**, stops a bolt up the middle column at
 *   its lower rim, `core`: `target` in the colour that breaks it, `wrong` in
 *   the other.
 * - **Anything else the body stands over** stops a bolt at the body's foot,
 *   the lowest edge of it over that x, as `body` — the shut core's armour
 *   among it.
 *
 * `verdict` is the boss's own, never a copy of it.
 */
export function coreStopper(
  world: World,
  verdict: (world: World, col: number, color: Color) => CoreVerdict,
  core: number,
  foot: Foot,
): Stopper {
  return (col, x, color) => {
    const v = verdict(world, col, color);
    if (v === "target" || v === "wrong") return { y: core, hit: v };
    const y = foot(x);
    return y === null ? null : { y, hit: "body" };
  };
}

/** The screen y of a body's lowest edge over screen x, or `null` for none of it. */
export type Foot = (x: number) => number | null;

/** The foot of a round body about (`cx`, `cy`), `r` across and `ry` deep. */
export function roundFoot(cx: number, cy: number, r: number, ry = r): Foot {
  return (x) => {
    const k = (x - cx) / r;
    return Math.abs(k) >= 1 ? null : cy + ry * Math.sqrt(1 - k * k);
  };
}

/** The lowest of several feet over x: whichever part hangs furthest down. */
export function lowestFoot(feet: readonly Foot[]): Foot {
  return (x) => {
    let low: number | null = null;
    for (const foot of feet) {
      const y = foot(x);
      if (y !== null && (low === null || y > low)) low = y;
    }
    return low;
  };
}
