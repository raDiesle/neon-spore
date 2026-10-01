/**
 * **One heartbeat**, as a share of its strongest: a lub on the beat and a dub
 * half its height a quarter of a beat later, each falling away fast. The
 * owner, 1 October 2026: the part a bolt must hit "must beat like vulnerable
 * hearth". THE FILAMENT's heart swelled on this curve first
 * (`filament-heart.ts`); it is here so every target beats on the same one.
 */
export function lubDub(beatPhase: number): number {
  const dub = beatPhase - 0.25;
  return Math.exp(-beatPhase * 9) + (dub > 0 ? 0.5 * Math.exp(-dub * 9) : 0);
}
