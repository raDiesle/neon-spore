import { midCol, type SimConfig } from "./config.js";
import { ORRERY_RINGS, type OrreryState, orreryCoreCol, orreryOrbit } from "./orrery.js";
import { orreryGapSlot } from "./orrery-beat.js";

/**
 * **Where a gap is on the field**, as opposed to where it is in the beat.
 *
 * Next door is time (`orrery-beat.ts`) — which slot of its orbit a gap is in,
 * and whether that slot is the bottom one a shot can pass through. This is the other question
 * the same gap answers: which column of the field it is standing over, which
 * is what the pair *says* to each other and what the core throws a rock down
 * (`orrery-step.ts`).
 *
 * **A column does not say whether a shot can pass.** Slot 0 is the bottom of
 * the ring and slot `orbit / 2` is the top, and both of them are over the
 * core's own column — so a seat reading a gap's column alone knows half of
 * where it is. That is not a flaw to be papered over: it is the picture's
 * job to make the difference between the near side of a ring and the far one
 * obvious, and `orreryRingOpen` is the only thing the rules ever ask.
 */

/**
 * How far from the middle a ring's organs go, in columns. The outer ring
 * reaches nearly the walls and the inner one barely leaves the core, which is
 * what makes three orbits legible in a field eleven columns wide.
 *
 * Derived rather than authored, because it is a *picture* number that has to
 * agree with a field whose width is configurable — a reach written down in
 * columns would be a ring hanging off the edge of a narrow field.
 */
export function orreryReach(cfg: SimConfig, ring: number): number {
  const half = midCol(cfg);
  return Math.max(1, Math.round((half * (ORRERY_RINGS - ring)) / ORRERY_RINGS));
}

/**
 * The column a ring's gap stands over on a beat.
 *
 * A triangle rather than a circle's own cosine, and the reason is the control
 * scheme: this number is said out loud. A gap that crossed the field fast in
 * the middle and hung at the walls — which is what an orbit at a constant
 * angular rate actually looks like from below — cannot be counted in beats by
 * somebody who is also talking. A gap that moves an even share of its reach
 * per organ can: *three out, coming back*. The organs are drawn on the circle
 * where they belong; it is the gap the pair reads, and it reads evenly.
 */
export function orreryGapCol(cfg: SimConfig, b: OrreryState, ring: number, beat: number): number {
  const orbit = orreryOrbit(cfg, ring);
  const slot = orreryGapSlot(cfg, b, ring, beat);
  const half = orbit / 2;
  if (half <= 0) return orreryCoreCol(cfg);
  // Slot 0 is the bottom and `half` the top; the slots between are one side of
  // the ring and the ones after are the other.
  const side = slot <= half ? 1 : -1;
  const along = slot <= half ? slot : slot - half;
  // The triangle: nought at the bottom and the top, one at the widest point.
  const out = Math.min(along, half - along);
  const reach = orreryReach(cfg, ring);
  const off = Math.round((reach * out * 2) / half) * side;
  return orreryCoreCol(cfg) + off;
}
