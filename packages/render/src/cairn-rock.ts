import { STILL } from "./idle-drift-parts.js";
import { partOn } from "./outline-parts.js";

/**
 * THE CAIRN's stones rocking on one another — the outline tier's parts
 * (`outline-parts.ts`) for a body that is nothing but parts.
 *
 * Each stone is a part with its joint where it sits: the bottom of its own
 * facets, on the stones under it. It rocks there, out of step with every
 * other stone (a seed a slot), its top moving `PART.tip` of a tile at the
 * widest — **big enough to be seen** (`docs/looks.md`) — and what stands on it
 * rides along: a stone's seat is where the tops of the stones under it went,
 * weighted by how squarely it sits on each. So the apex wanders furthest, the
 * way a stack does, and the base course only rocks.
 *
 * Rotate only. The rock's fire already turns by a `roll` (`drawRockBody`), so a
 * rocked stone costs no op a still one does not; a tilt or a turn would need a
 * transform a stone.
 *
 * Nothing reads a stone's place but the picture — the hand holds the whole
 * pile, and the pull is the finger's travel — and every mark that stands on a
 * stone (the settle's ring, the hand's ring, the blow's red) takes it from
 * `cairnUnits`, so each follows the stone it is on.
 */

/** A stone's rock, radians, clockwise on screen. `hush` is `outlineHush`'s. */
export function stoneRock(slot: number, time: number, hush: number, height: number): number {
  return partOn("cairn", slot, "lobe", () => STILL, height, hush)(time).rotate;
}

/** Where a stone's rock puts its middle and its top, from its seat, in pixels. */
export function rocked(angle: number, r: number): { mid: Shift; top: Shift } {
  const across = Math.sin(angle);
  const down = 1 - Math.cos(angle);
  return {
    mid: { x: r * across, y: r * down },
    top: { x: 2 * r * across, y: 2 * r * down },
  };
}

export interface Shift {
  x: number;
  y: number;
}

/**
 * Where a stone's seat went: the tops of the stones under it, each weighted by
 * how nearly it stands over them — 1 straight above, 0 a full stone's width
 * aside. The base course sits on the ground and has none.
 */
export function seatOf(
  x: number,
  under: readonly { x: number; top: Shift }[],
  width: number,
): Shift {
  let w = 0;
  let sx = 0;
  let sy = 0;
  for (const u of under) {
    const k = Math.max(0, 1 - Math.abs(u.x - x) / width);
    w += k;
    sx += u.top.x * k;
    sy += u.top.y * k;
  }
  return w === 0 ? { x: 0, y: 0 } : { x: sx / w, y: sy / w };
}
