import type { Circle } from "./layout.js";

/**
 * **How far past its drawn edge a circle answers a thumb.** Every ring, lobe,
 * handle and mark on the glass is found through `hitCircle`, so this is the
 * one number for the whole game's touch tolerance.
 *
 * Half again the radius drawn, and never under `HIT_FLOOR_PX` — the owner,
 * 24 September 2026, generic: *the area should be bigger than visible so
 * players can touch it*. It was 30% until then, which on a small mark left
 * a ring a fingertip covers entirely. Where two rings' reaches overlap, the
 * callers take the nearest centre, never the first in a list.
 */
export const HIT_REACH = 1.5;
/** A reach's floor in CSS pixels: a 48px target, the size a fingertip is. */
export const HIT_FLOOR_PX = 24;

/** The radius a circle of radius `r` answers a press at. */
export function hitReach(r: number): number {
  return Math.max(r * HIT_REACH, HIT_FLOOR_PX);
}

export function hitCircle(c: Circle, x: number, y: number): boolean {
  const dx = x - c.x;
  const dy = y - c.y;
  return dx * dx + dy * dy <= hitReach(c.r) ** 2;
}
