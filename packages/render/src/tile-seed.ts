/**
 * The seed a picture of one tile is drawn from.
 *
 * **Two numbers both phones agree about, and no third.** Anything a break, a
 * strike or a scar jitters has to jitter identically on the two screens, and
 * the only state the pair certainly shares at the moment an event arrives is
 * the tile it names — a column and a row, or a column and a beat. A seed taken
 * off a creature id, a tick or a frame clock is a seed that drifts the moment
 * one phone is a frame behind, and two players looking at two different
 * pictures of the same break have no way to find out that they are.
 *
 * It was written out four times — `effects-break.ts`, `body-strike.ts`,
 * `scars.ts` and, on 15 September 2026, nearly a fifth for THE BALLOON's
 * shreds — which is the shape `purity.test.ts`' table is kept for: a rule
 * every copy re-derives is a rule that changes in three places and stays put
 * in the fourth.
 *
 * The two multipliers are the usual spatial-hash pair; what matters is only
 * that they are odd, large and different, so neighbouring tiles do not land on
 * neighbouring seeds and a row of bodies does not break in a pattern.
 */
export function tileSeed(a: number, b: number): number {
  return Math.imul(a + 1, 73856093) ^ Math.imul(b + 1, 19349663);
}
