/**
 * **What THE GAUGE's dial does that neither screen already says**, as four
 * events (`gauge.ts`, `gauge-hand.ts`).
 *
 * Its own file on `events-pulse.ts`'s terms: one round, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 * The round had no events of its own until 19 September 2026 (`docs/queue.md`,
 * *THE GAUGE is the only boss with no events and no sound*).
 *
 * The needle is drawn on both screens and the band on the navigator's alone,
 * so these are not sounds for a half somebody cannot see — they are sounds
 * for the one moment in the round that is *decided* rather than watched: the
 * call. A mark and a miss are its two answers. A jam and a bind are what a
 * miss and a mark can cost, and each lands on the seat whose own screen never
 * says so: the pilot's valve going dead is a fact of his own half, and the
 * navigator's band winding tight is a fact of hers — the exact asymmetry
 * `gauge-hand.ts` is about.
 */
export type GaugeEvent =
  /** A call landed between the marks. */
  | { type: "gaugeMark" }
  /** A call did not — free the first time, and costing only the rest between
   * two of them. */
  | { type: "gaugeMiss" }
  /** The miss beside this one stuck the valve: the needle is his hand on it
   * until the next call lands. */
  | { type: "gaugeJam" }
  /** The mark beside this one wound the band tight: she cannot call while her
   * thumb is not holding it open. */
  | { type: "gaugeBind" };
