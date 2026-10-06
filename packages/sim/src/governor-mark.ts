import { type GovernorState, governorLitStep, governorOff, governorTapping } from "./governor.js";
import type { World } from "./world.js";

/**
 * **THE GOVERNOR's marks**: which of the lit step's marks are landed, which
 * a tap may land now, whose they are and whether the needle is on one —
 * asked by the tap (`governor-hand.ts`), the picture, the cue and the hand.
 *
 * A step's marks are open together, every one not landed; an `ordered` step
 * opens only the first of those, so the pair land them in the order written.
 */

/** Whether mark `i` of the lit step is landed. */
export function governorMarkLanded(s: GovernorState, i: number): boolean {
  return (s.landed & (1 << i)) !== 0;
}

/**
 * The marks a tap may land now, by index: every one not yet landed, or on an
 * ordered step only the first of those. Empty with no tap step lit.
 */
export function governorOpenMarks(s: GovernorState): number[] {
  const step = governorLitStep(s);
  if (step === null || !governorTapping(s)) return [];
  const out: number[] = [];
  for (let i = 0; i < step.marks.length; i++) {
    if (governorMarkLanded(s, i)) continue;
    out.push(i);
    if (step.ordered) break;
  }
  return out;
}

/**
 * Whether `seat` has a mark still to land in the lit step, open now or
 * waiting its turn — the seats a tap is heard from.
 */
export function governorAsksSeat(s: GovernorState, seat: 1 | 2): boolean {
  const step = governorLitStep(s);
  if (step === null || !governorTapping(s)) return false;
  return step.marks.some((m, i) => m.seat === seat && !governorMarkLanded(s, i));
}

/** Whether `seat` has a mark open now: one its tap may land this lap. */
export function governorOpenFor(s: GovernorState, seat: 1 | 2): boolean {
  const step = governorLitStep(s);
  return step !== null && governorOpenMarks(s).some((i) => step.marks[i]?.seat === seat);
}

/** Whether the needle is on mark `i` of the lit step this instant. */
export function governorOnMark(world: World, s: GovernorState, i: number): boolean {
  const mark = governorLitStep(s)?.marks[i];
  return (
    mark !== undefined && governorOff(s.needleMilli, mark.markMilli) <= world.cfg.governorMarkMilli
  );
}

/** The mark `seat` lands if it taps now, or null: one of its open marks with the needle on it. */
export function governorMarkFor(world: World, s: GovernorState, seat: 1 | 2): number | null {
  const step = governorLitStep(s);
  if (step === null) return null;
  for (const i of governorOpenMarks(s)) {
    if (step.marks[i]?.seat === seat && governorOnMark(world, s, i)) return i;
  }
  return null;
}

/** Whether the needle is on any mark a tap may land now. */
export function governorOnAnyMark(world: World, s: GovernorState): boolean {
  return governorOpenMarks(s).some((i) => governorOnMark(world, s, i));
}
