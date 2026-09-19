import type { SimConfig } from "./config.js";
import { ORRERY_RINGS, type OrreryState, orreryDir, orreryOrbit, orrerySeized } from "./orrery.js";

/**
 * **THE ORRERY in the beat**: where each gap stands on a beat that has not
 * happened, and which of those beats a shot gets through.
 *
 * The cut is here because `orrery.ts` is the shape — the rings, the phases,
 * the state and which ring a hit is against — and this is the arithmetic
 * over it. Every function below is a pure question about a beat, asked of a
 * boss it never writes to, and all four are asked about beats ahead of the
 * one being played: that is the whole reason a gap is a function of the beat
 * rather than a slot stepped once a beat (`orrery.ts`'s own header).
 *
 * Next door again is `orrery-gap.ts`, which is where a gap is on the *field*
 * — a column — as opposed to where it is in the beat.
 */

/**
 * Where a ring's gap stands on a beat, as a slot of its orbit: 0 is the
 * bottom of the ring, which is the only slot a shot can pass through.
 *
 * The slots above the bottom are the organs to one side and then the other —
 * a gap at slot `orbit / 2` is at the top of the ring, where a shot from the
 * hull can never reach it, and the picture's job is to make that obvious.
 */
export function orreryGapSlot(cfg: SimConfig, b: OrreryState, ring: number, beat: number): number {
  const orbit = orreryOrbit(cfg, ring);
  if (orbit <= 0) return 0;
  const step = b.from[ring] ?? 0;
  // **A cracked ring does not drift.** It is jammed, and the anchor is the
  // whole of where its gap is until a thumb writes a new one — which is what
  // turns the gesture into something a pair can do at all: a gap still
  // running at its own cadence would have to be chased, and this fight
  // already asks them to agree on a beat. The arithmetic stays arithmetic;
  // it is the drift term that goes to nought (`orrerySeized`).
  if (orrerySeized(b, ring)) return step % orbit;
  const at = (step + orreryDir(ring) * (beat - b.anchorBeat)) % orbit;
  return at < 0 ? at + orbit : at;
}

/** Whether that ring's gap is at the bottom of its orbit on that beat. */
export function orreryRingOpen(
  cfg: SimConfig,
  b: OrreryState,
  ring: number,
  beat: number,
): boolean {
  return orreryGapSlot(cfg, b, ring, beat) === 0;
}

/**
 * **The shaft**: whether a shot leaving the top of the core's column on this
 * beat reaches the core.
 *
 * True once every ring is broken, which is not a special case but the same
 * sentence — there is nothing left in the way. What stops a shot then is the
 * core's own armour, and that is `orrery-shot.ts`'s to say.
 */
export function orreryShaftOpen(cfg: SimConfig, b: OrreryState, beat: number): boolean {
  for (let ring = b.broken; ring < ORRERY_RINGS; ring++) {
    if (!orreryRingOpen(cfg, b, ring, beat)) return false;
  }
  return true;
}

/**
 * Beats from `beat` to the next one the shaft is open on, `0` if it is open
 * now, and `-1` if it is not inside `cap`.
 *
 * **Searched rather than solved**, and deliberately: the closed form is the
 * Chinese remainder theorem over three moduli that need not be coprime, which
 * is a page of arithmetic with a case in it for every pair of rings that
 * share a factor — and the first hand laid on a ring would invalidate the
 * lot. A loop over at most `cap` beats asking the question this file already
 * answers cannot be wrong in a way the rest of the fight is not also wrong.
 *
 * This is the one thing player 2's readout is made of, and it is why a gap is
 * a function of the beat rather than a slot stepped once a beat: nothing can
 * be stepped forward twenty-four beats to see where it gets to and then
 * stepped back.
 */
export function orreryNextOpen(cfg: SimConfig, b: OrreryState, beat: number, cap: number): number {
  for (let ahead = 0; ahead <= cap; ahead++) {
    if (orreryShaftOpen(cfg, b, beat + ahead)) return ahead;
  }
  return -1;
}

/**
 * The anchors a ring gets so that every ring's gap is at the bottom of its
 * orbit on `first`, counted from the beat the boss was installed.
 *
 * The only way the fight is guaranteed to have a first window at all: three
 * residues picked apart need not ever come together, and with orbits that
 * share factors they usually do not.
 */
export function orreryAnchors(cfg: SimConfig, first: number): number[] {
  const out: number[] = [];
  for (let ring = 0; ring < ORRERY_RINGS; ring++) {
    const orbit = orreryOrbit(cfg, ring);
    const at = (-orreryDir(ring) * first) % orbit;
    out.push(at < 0 ? at + orbit : at);
  }
  return out;
}
