/**
 * **How far into its phase a choreographed boss is**, in beats, this beat's
 * own fraction counted in, and never before the phase began.
 *
 * Every pose file wrote this line out on its own state — THE OCULUS's, THE
 * FLUE's and seventeen more, the same clock nineteen times —
 * so it is one function here, and `packages/sim/test/copies-table.ts` fails
 * on the next file that writes it rather than calling it.
 */
export function phaseInto(
  s: { readonly phaseBeat: number },
  beat: number,
  beatPhase: number,
): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}
