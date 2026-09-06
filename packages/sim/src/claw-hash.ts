import { CLAW_PHASES, type ClawState } from "./claw.js";

/**
 * What THE CLAW puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `maze-hash.ts` is one: `hash-boss.ts` grows by a
 * whole boss at a time and had reached the ceiling `CLAUDE.md` sets, and this
 * is the one subject in the round that is not about where the claw stands. It
 * is read by `hash-boss.ts` and by nobody else, and every rule in it is about
 * what two devices could come to disagree about rather than about a claw.
 */

/**
 * Everything about THE CLAW that goes into `hashWorld`, in a fixed order.
 *
 * **The wreck field is first and it is the fight.** It is dealt from the seeded
 * rng and only one seat is shown it, so a device that thinks one socket holds a
 * rock where the other thinks it is empty is a device charging the hull for a
 * grab the other one is calling a pod — and neither player could ever see the
 * disagreement, because the seat that can see the field is the seat that cannot
 * press anything. Everything after it is the machine standing over the top.
 */
export function clawHashParts(b: ClawState): number[] {
  const parts = [
    CLAW_PHASES.indexOf(b.phase),
    b.phaseBeat,
    b.openBeat,
    b.passed ? 1 : 0,
    b.cells.length,
  ];
  for (const hold of b.cells) parts.push(hold);
  parts.push(b.cell, b.pods, b.rocks, b.grabBeat, b.grabCell, b.grabHold);
  // The drift, the last one included. Nothing but the picture reads where a
  // wreck came from, and it is in here anyway: rule 4 has no clause for a field
  // only the drawing wants, and `driftBeat` is what says when the next shift is
  // due — which is a rule, and one the two devices have to agree about.
  parts.push(b.driftBeat, b.driftFrom, b.driftTo);
  return parts;
}
