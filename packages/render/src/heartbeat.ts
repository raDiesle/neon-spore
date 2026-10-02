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

/** How far a lit target swells on the lub, as a share of its size: THE SEAM's point's. */
export const HEART_SWELL = 0.3;

/**
 * **A lit core's heartbeat**, for every boss whose target is a round core lit
 * in its cannon's colour: how far it is swollen, how full its fill, and how
 * hard its rim glows this instant. Still lit between beats, never dark.
 */
export function heartCore(beatPhase: number): { swell: number; fill: number; glow: number } {
  const thump = lubDub(beatPhase);
  return { swell: 1 + HEART_SWELL * thump, fill: 0.6 + 0.4 * thump, glow: thump };
}
