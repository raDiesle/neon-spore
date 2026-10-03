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
 * `verdict` is the boss's own, never a copy of it. A boss whose step can ask
 * for a part in another column (`sim/core-verdict.ts`'s `aside`) hands `core`
 * as the rim's y in each column.
 */
export function coreStopper(
  world: World,
  verdict: (world: World, col: number, color: Color) => CoreVerdict,
  core: number | ((col: number) => number),
  foot: Foot,
): Stopper {
  return (col, x, color) => {
    const v = verdict(world, col, color);
    if (v === "target" || v === "wrong")
      return { y: typeof core === "number" ? core : core(col), hit: v };
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

/**
 * The foot of a closed outline through `points`, laid `dx`, `dy` off where
 * they stand: the lowest of its edges over x. A Catmull-Rom contour runs
 * through its points, so the polygon is its foot to well under a pixel.
 */
export function outlineFoot(points: readonly { x: number; y: number }[], dx = 0, dy = 0): Foot {
  return (x) => {
    const u = x - dx;
    let low: number | null = null;
    for (let i = 0; i < points.length; i++) {
      const a = points[i] as { x: number; y: number };
      const b = points[(i + 1) % points.length] as { x: number; y: number };
      if (u < Math.min(a.x, b.x) || u > Math.max(a.x, b.x) || a.x === b.x) continue;
      const y = a.y + ((u - a.x) / (b.x - a.x)) * (b.y - a.y);
      if (low === null || y > low) low = y;
    }
    return low === null ? null : low + dy;
  };
}

/** The foot of a straight rod from `a` to `b`, `half` either side of its line: a boom, a cord, a chain. */
export function rodFoot(
  a: { x: number; y: number },
  b: { x: number; y: number },
  half: number,
): Foot {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = (-(b.y - a.y) / len) * half;
  const ny = ((b.x - a.x) / len) * half;
  return outlineFoot([
    { x: a.x + nx, y: a.y + ny },
    { x: b.x + nx, y: b.y + ny },
    { x: b.x - nx, y: b.y - ny },
    { x: a.x - nx, y: a.y - ny },
  ]);
}
