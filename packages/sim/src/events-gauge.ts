/**
 * **What THE GAUGE's dial does that neither screen already says**, as eight
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
 * call. A mark and a miss are its two answers. A bind is what a mark can
 * cost, and it lands on the seat whose own screen never says so: the
 * navigator's band winding tight is a fact of her half — the exact asymmetry
 * `gauge-hand.ts` is about. A jam stood beside it until 2 October 2026, when
 * a miss began to lose the round. The fourth, `gaugeHold`, is no sound at all: it
 * is for the ring a thumb lands on (28 September 2026). The last two are the
 * tooth between two levels (`gauge-tooth.ts`, 30 September 2026): the right
 * one pulled, and the wrong one. The seventh is the tongue after the next
 * level, twisted by the two of them at once (`gauge-tongue.ts`).
 */
export type GaugeEvent =
  /** A call landed between the marks. */
  | { type: "gaugeMark" }
  /** A call did not, and the round is lost on this tick (`stepGauge`). */
  | { type: "gaugeMiss" }
  /** The mark beside this one wound the band tight: she cannot call while her
   * thumb is not holding it open. */
  | { type: "gaugeBind" }
  /** Her thumb landed on the wound band, a tooth or the tongue, or his on the tongue —
   * said once, on the landing, for the green round the ring
   * (`render/gauge-marks.ts`). Silent: the ring filling says it. */
  | { type: "gaugeHold"; part: "band" | "tooth" | "tongue" }
  /** The loose tooth came out, and the rest ends early. */
  | { type: "gaugePull" }
  /** A sound tooth came out instead, and the round is lost (`stepGauge`). */
  | { type: "gaugeWrongPull" }
  /** Both hands wrung the tongue opposite ways, and the rest ends early. */
  | { type: "gaugeTwist" };
