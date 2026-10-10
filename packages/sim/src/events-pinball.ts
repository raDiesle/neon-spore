/**
 * **What PINBALL's two hands on the table do that neither screen already
 * says**, as four events (`pinball-hand.ts`).
 *
 * Its own file on `events-vane.ts`' terms: one round, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 * The round had no events of its own until 18 September 2026.
 *
 * The table is drawn on **both** screens — the owner's call, against the
 * advice (`docs/spec/bosses.md` §11.7) — so these are not sounds for a
 * half somebody cannot see. They are sounds for a half somebody is not
 * *watching*: the spring coming back under his thumb while she is reading the
 * ball, and a nudge from either of them while the cannon runs under it.
 */
export type PinballEvent =
  /** Player 1 wound the slack spring: the bar runs again. */
  | { type: "pinWind" }
  /** Either seat shoved the table, and the ball with it. `way` is -1 or 1. */
  | { type: "pinNudge"; way: number }
  /** And one shove too many: the table tilts and both hands on it are dead this flight. */
  | { type: "pinTilt" }
  /**
   * A press on the other seat's asked ring, refused (`pinball-hand.ts`). Only
   * the plunger has another seat: the table is both of theirs.
   */
  | { type: "pinRefuse"; part: "plunger"; player: 1 | 2 };
