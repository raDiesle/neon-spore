/**
 * **What PINBALL's two hands on the table do that neither screen already
 * says**, as three events (`pinball-hand.ts`).
 *
 * Its own file on `events-snake.ts`' terms: one round, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 * The round had no events of its own until 18 September 2026.
 *
 * The table is drawn on **both** screens — the owner's call, against the
 * advice (`docs/spec/bosses.md` §11.7) — so these three are not sounds for a
 * half somebody cannot see. They are sounds for a half somebody is not
 * *watching*: the spring coming back under his thumb while she is reading the
 * ball, and her nudge while he is running the cannon under it.
 */
export type PinballEvent =
  /** Player 1 wound the slack spring: the bar runs again. */
  | { type: "pinWind" }
  /** Player 2 shoved the table, and the ball with it. `way` is -1 or 1. */
  | { type: "pinNudge"; way: number }
  /** And one shove too many: the table tilts and her hand is dead this flight. */
  | { type: "pinTilt" };
