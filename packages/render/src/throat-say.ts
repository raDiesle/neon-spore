/**
 * **What THE THROAT's field says about why** — the reason under each of its
 * cue verbs (`BossCue.why`), and the receipt by the mouth when it swallows
 * (`throat-receipt.ts`).
 *
 * The owner, 25 September 2026, after playing it: *add some ingame text
 * help what I have to do in the moments.* Since the rework of 1 October 2026
 * there are two verbs, one a seat, and each line says what its handle does.
 *
 * **#34 still holds**: no column, no colour, no count. Each line is the
 * reason the verb is worth anything, which the verb cannot say.
 */
export const THROAT_WHY: Readonly<Record<string, string>> = {
  // The mouth, under the navigator's thumb: carry it to what it should eat.
  PULL: "MOVE THE MOUTH",
  // The pump, under the pilot's: up and down, and the circle opens.
  PUMP: "UP AND DOWN, FAST",
};

/** The receipt for a body swallowed, a ring the poorer. */
export const SWALLOWED = "SWALLOWED";
