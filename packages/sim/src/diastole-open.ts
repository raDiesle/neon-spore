import {
  DIASTOLE_SIDES,
  type DiastoleSide,
  type DiastoleState,
  diastoleBeating,
  diastoleContracts,
} from "./diastole.js";

/**
 * **When THE DIASTOLE can be hurt** — the one question the beam asks, and
 * the one place the clamp changes the answer (`diastole-step.ts`,
 * `diastole-hand.ts`).
 *
 * Its own file rather than a paragraph of `diastole.ts` because the clamp
 * put a second answer under the first: everywhere in the fight but one, a
 * chamber is open on the beat it contracts, and the picture squeezes it on
 * that beat (`diastoleContracts`). The alone right chamber is the exception,
 * on purpose — its contraction is a single beat on a count of seven that the
 * seat holding the lance cannot see, and a beat one seat cannot see and the
 * other cannot hold is a beat nobody hits. So the pair *holds* it: the seat
 * that sees it says *now*, the other seat's thumb comes down on the chamber,
 * and the contraction stays open for `diastoleClampBeats` from the beat the
 * clamp caught. Under a clamp the chamber is open; with no clamp on it, the
 * alone right chamber is open on no beat at all, however well the count was
 * kept. The beat still has to be found — a clamp that misses it is a spasm —
 * and the lance still has to be on the bridge; what the clamp buys is that
 * the two seats no longer have to land the same single beat blind.
 */

/** Whose thumb the clamp is: player 1's, the seat whose screen shows the right chamber grey. */
export const diastoleClampSeat = 1;

/** The thumb is off, or the beam has landed: no clamp. */
export function clearDiastoleClamp(b: DiastoleState): void {
  b.clampBeat = -1;
  b.clampUntil = -1;
}

/** Whether a thumb is holding the chamber right now. */
export function diastoleClamped(b: DiastoleState): boolean {
  return b.clampBeat !== -1;
}

/**
 * Whether the clamp's window reaches this beat: from the contraction it
 * caught, `diastoleClampBeats` wide, and not a beat past it.
 */
export function diastoleClampHolds(b: DiastoleState, beat: number): boolean {
  return diastoleClamped(b) && beat >= b.clampBeat && beat < b.clampUntil;
}

/**
 * Whether that chamber is **open** on this beat — the beat it can be hurt on.
 * The contraction everywhere, and the clamp's window for the alone right.
 */
export function diastoleOpen(b: DiastoleState, beat: number, side: DiastoleSide): boolean {
  if (!diastoleBeating(b, side)) return false;
  if (b.phase === "alone" && side === 1) return diastoleClampHolds(b, beat);
  return diastoleContracts(b, beat, side);
}

/**
 * **The coincidence**: every chamber still beating is open on this beat.
 *
 * With two up it falls every fifteen beats and on no beat between, because
 * three and five do not divide each other (`config-diastole.ts` says why that
 * is a comment and not a coincidence). With one up it is that one's own beat,
 * held open by the clamp. With none it is never, which is what keeps a beam
 * fired into a dead boss from finding anything.
 */
export function diastoleCoincides(b: DiastoleState, beat: number): boolean {
  let beating = 0;
  for (const side of DIASTOLE_SIDES) {
    if (!diastoleBeating(b, side)) continue;
    beating += 1;
    if (!diastoleOpen(b, beat, side)) return false;
  }
  return beating > 0;
}
