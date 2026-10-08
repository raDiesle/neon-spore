import type { Layout } from "./layout.js";

/**
 * **How shut a thumb has carried THE VISE's lobe**: the gap the lobe stands
 * at open, less however far the thumb has come since the press, in
 * thousandths of a tile and never below nought — `SqueezeGap` from one
 * finger, THE PLUMB's pull read as a closing.
 *
 * **Any way at all.** The lobe shuts toward the spine on the picture, but a
 * thumb that went up or out has come just as far, and a seat that is refused
 * for a direction it was never shown has lost a beat to the arrow nobody drew.
 * The distance is the gesture; the simulation is sent the gap it already
 * read, so nothing past this page learned the pinch had gone.
 *
 * Its own page so `touch-move.ts` answers the carry without importing the
 * case's whole geometry (`vise-grip.ts`).
 */
export function viseCarriedGap(l: Layout, openMilli: number, dx: number, dy: number): number {
  if (l.tile <= 0) return openMilli;
  const carried = Math.round((Math.hypot(dx, dy) * 1000) / l.tile);
  return Math.max(0, openMilli - carried);
}
