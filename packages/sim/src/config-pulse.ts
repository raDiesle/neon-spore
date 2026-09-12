/**
 * THE PULSE's numbers — the step grid, the two windows a press is judged in,
 * and what an emptied meter costs (`pulse.ts`, `docs/spec/bosses.md` 11.8).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-gauge.ts` and `config-pinball.ts` already give: every call site still
 * reads `cfg.pulseStepTicks`, and the split is about how much of one file a
 * reader has to hold at once.
 *
 * **The grid is in ticks and it has to divide the beat.** A beat at the
 * shipped tempo is 75 ticks, and 75 is 3 × 25 — so a step of 25 ticks puts
 * exactly three of them in a beat and the game's own click lands on every
 * third one. That is the whole reason the chart is not written in eighths:
 * half a beat is 37.5 ticks, which is not a tick, and a rhythm game whose grid
 * rounds is a rhythm game whose two devices disagree about when a note was.
 * At 96 BPM three steps to a beat is 288 steps a minute, which is the same
 * grid as straight eighths at 144 — fast, and reachable with one thumb.
 *
 * **Both windows are wider than a console's, and that is the touchscreen.** A
 * cabinet judges a steel plate under a foot; this judges glass under a thumb
 * that has to travel between four buttons, on a phone whose own frame is 16 ms
 * before anything of ours runs. Sixty-seven milliseconds either side for the
 * clean hit and a hundred and fifty for the scruffy one is what makes the
 * round playable rather than lenient — a miss is still a miss, and there are
 * a hundred of them in a stage.
 */
export interface PulseConfig {
  /** Ticks between one step of the grid and the next. Must divide the beat. */
  pulseStepTicks: number;
  /**
   * How long a note stands on the screen before the tick it is due, in ticks.
   *
   * This is the *scroll speed* and it is the one number a player would feel
   * changed. Two hundred ticks is 1.67 s, which is eight steps of the grid —
   * so a screen carries about eight arrows at once and the pair can read a
   * whole bar ahead of the line, which is what a call needs.
   */
  pulseLeadTicks: number;
  /** Ticks either side of a note's own tick that count as a clean hit. */
  pulsePerfectTicks: number;
  /** Ticks either side that still count. Beyond it the note is missed. */
  pulseGoodTicks: number;
  /**
   * What the pair's meter starts a stage at, in thousandths.
   *
   * One meter and not two: both seats feed and drain the same bar
   * (`PulseState.meter`). Halfway up, so the first bar of a stage is neither a
   * cushion nor a cliff.
   */
  pulseMeterStartMilli: number;
  /** The most it can hold. A meter at the top is not a meter with slack. */
  pulseMeterMaxMilli: number;
  /** What a clean hit puts back, in thousandths. */
  pulsePerfectMilli: number;
  /** What a scruffy one puts back. Less, so the window is not a free pass. */
  pulseGoodMilli: number;
  /** What a missed note takes off. */
  pulseMissMilli: number;
  /**
   * What a press with no note under it takes off.
   *
   * It exists because of the veil: a seat that cannot read its own arrow could
   * otherwise hold all four buttons down through the bar and never be wrong.
   * A wrong move has to hurt (`docs/looks.md` is not the argument — the
   * owner's rule is), so mashing costs more per press than waiting costs.
   */
  pulseStrayMilli: number;
}

export const PULSE_DEFAULTS: PulseConfig = {
  // Three to the beat. See the header — this is the only value that divides
  // 75 into a musical number.
  pulseStepTicks: 25,
  pulseLeadTicks: 200,
  pulsePerfectTicks: 8,
  pulseGoodTicks: 18,
  pulseMeterStartMilli: 500,
  pulseMeterMaxMilli: 1000,
  // Halved against the draft that gave each seat a meter of its own, because
  // one bar now takes two presses per arrow: both seats hit every note, so
  // every number here arrives twice as often as it used to.
  pulsePerfectMilli: 11,
  pulseGoodMilli: 5,
  // Three and a bit misses to undo ten clean hits. A stage of a hundred notes
  // is survivable with a dozen mistakes in it and not with thirty.
  pulseMissMilli: 35,
  pulseStrayMilli: 13,
};
