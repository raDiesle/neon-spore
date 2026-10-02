import type { GorgeLevel } from "@neon-spore/sim";

/**
 * THE GORGE's levels: five rows or rings of bubbles, and the layout is the level.
 *
 * Each bubble asks for a number of shots in a colour, and player 1 is the one
 * who reads the number and the order; player 2 reads the colour. What a
 * bubble asks for is rolled from `needMin`–`needMax` by the seeded rng when
 * the level is hung, so no two runs ask the same sum — but **the shape of
 * each level is authored, never generated**, for the reason THE STARE's
 * patterns are: a climb nobody composed is a climb nobody can teach. They
 * climb — a row in any order, a row in one order, the row bent into a ring
 * that turns and has to be opened at the bottom before it takes a shot, and
 * then bubbles that ask for both colours at once
 * (`docs/spec/bosses-choreographed.md` §3).
 */
export const GORGE_LEVELS: readonly GorgeLevel[] = [
  { intakes: 4, ordered: false, ring: false, mixed: 0, needMin: 1, needMax: 3 },
  { intakes: 5, ordered: true, ring: false, mixed: 0, needMin: 1, needMax: 3 },
  { intakes: 5, ordered: true, ring: true, mixed: 0, needMin: 2, needMax: 3 },
  { intakes: 6, ordered: true, ring: true, mixed: 2, needMin: 2, needMax: 4 },
  { intakes: 6, ordered: true, ring: true, mixed: 6, needMin: 2, needMax: 4 },
];
