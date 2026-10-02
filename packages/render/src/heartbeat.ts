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

/** How lit a part the cannon must hit is between beats, and how much the lub adds. */
const HEART_REST = 0.55;
const HEART_LUB = 0.45;

/**
 * **How lit a part the cannon must hit is this instant**, for `lightWithin`
 * (`part-light.ts`): brighter than an asked mark's `MARK_LIGHT`, beating on
 * `lubDub`, still lit between beats, never dark.
 *
 * **It beats in light, not in size.** Until 2 October 2026 the part also
 * swelled by a third on the lub, with a glow of its colour round its rim;
 * the owner, that day: *only let the part of body shape glow … no glowing
 * outside. and the borders should not be red … only when player needs to
 * shoot a specific part of body it can glow and pulse some more.* A part
 * that swells is a coloured shape growing over what stands round it.
 */
export function heartLight(beatPhase: number): number {
  return HEART_REST + HEART_LUB * lubDub(beatPhase);
}
