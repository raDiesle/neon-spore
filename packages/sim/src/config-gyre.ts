/**
 * THE GYRE's numbers: how fast the rim turns, how hard the maw slows it, and
 * how far the diamond sinks before the wheel starts grinding the ship
 * (`gyre.ts`, `gyre-rim.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-pinball.ts` and `config-snake.ts` already give: every call site still
 * reads `cfg.gyreSpinMilli`, and the split is about how much of one file a
 * reader has to hold at once.
 *
 * **Its own file rather than seven more rows in `config-creatures.ts`**, which
 * went past its limit the day these arrived. That file is the bestiary's
 * shared one — a creature or two numbers each, argued about a creature at a
 * time — and this creature has seven, which is more than any other body in the
 * game and as many as some of the bosses. Seven of anything in a shared list
 * stops being a row and becomes a section, and a section is a file. PINBALL is
 * the precedent and the argument is the same one pointed at a body instead of
 * at a round.
 *
 * **The turn is in thousandths of a rim position per beat, not in beats per
 * position.** Everything else about a creature's clock in this game is a count
 * of beats — `throbSpinBeats`, `veilMorphBeats`, `wispDwellBeats` — because
 * those are cycles the pair counts out loud. This one is not counted, it is
 * *felt getting worse*: it accelerates, and a period in beats can only ever be
 * halved. What the creature needs is a rim that gets quicker by an amount too
 * small to notice on any one beat and impossible to ignore across a wave, and
 * that is a rate with a remainder rather than a period.
 */
export interface GyreConfig {
  /**
   * Thousandths of a rim position THE GYRE's wheel turns on the beat it
   * arrives. 350 is a click every third beat, which is slow enough that the
   * pair's first sentence about one — a colour and a column — is still true
   * when it lands.
   *
   * Thousandths and not beats-per-click, unlike `echoFallBeats` next door,
   * because this one accelerates: a period in beats can only ever be halved,
   * and what the creature needs is a rim that gets faster by an amount too
   * small to notice on any one beat and impossible to ignore over a wave.
   */
  gyreSpinMilli: number;
  /** Thousandths added to that for every beat the wheel stays up. 25 doubles it in
   * fourteen beats and reaches the cap in twenty-six — under half a minute,
   * which is about as long as a pair can hold one sentence together. */
  gyreSpinGainMilli: number;
  /**
   * The fastest the rim may ever turn: one whole position a beat.
   *
   * A cap and not a taste. A wheel that turned further than a position between
   * two beats would step a mount *past* a tile — the pair would be firing at a
   * column no body was ever in, and two mounts would swap places without
   * either crossing the ground between them. It is the same argument
   * `fallTilesPerBeat` makes for the torch's `+ 8`.
   */
  gyreSpinCapMilli: number;
  /** What the rim turns at while the maw is open. 120 is a click every eight
   * beats — visibly stopped rather than merely slower, because what the pull
   * has to buy is a column that stays true long enough to be said. */
  gyreSuckSpinMilli: number;
  /**
   * How long one press of the maw holds a wheel, in milliseconds. The third
   * sibling of `guardWindowMs` and `intakeWindowMs`, and the longest of them
   * on purpose: those two answer a body that has already arrived, and this one
   * has to cover a spoken exchange — 2400 ms is about four beats at 96 BPM,
   * which is a call made, heard and acted on (docs/spec/latency.md).
   */
  gyreSuckMs: number;
  /** Laps of the diamond after which the circuit stops sinking. Three, which
   * is where the foot of the rim reaches exactly the hull row — so a wheel
   * left alone grinds against the ship instead of settling above it. */
  gyreSinkLaps: number;
  /** What a wheel is worth once the last body is off it. Twice `scoreDestroy`,
   * beside the six kills it took: the wave is the wheel, and clearing one is
   * the moment rather than the sixth shot that happened to land. */
  scoreGyreBreak: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const GYRE_DEFAULTS: GyreConfig = {
  gyreSpinMilli: 350,
  gyreSpinGainMilli: 25,
  gyreSpinCapMilli: 1000,
  gyreSuckSpinMilli: 120,
  gyreSuckMs: 2400,
  gyreSinkLaps: 3,
  scoreGyreBreak: 200,
};
