/**
 * THE GORGE's numbers — how wide the sack is, how many beads fill an intake,
 * how long a full one waits before it vents, when it starts spitting beads
 * back and how often, when it is gorged, how many beads sink it a row, and
 * how long it stands after the beam ends it (`gorge.ts`,
 * `docs/spec/bosses-choreographed.md` §3).
 *
 * Its own file for `config-candle.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.gorgeFullBeads`, and the
 * split is about how much of one file a reader has to hold at once.
 *
 * **Every count here is one the pair says aloud.** The bead tally is on
 * player 1's screen and the colour an intake wants on player 2's, so the
 * fill is a call per shot; the vent is the one window that is *seen* rather
 * than called, and it is the only warning the pair gets (§3, THE SLOW).
 *
 * **Both windows are doubled on the owner's rule of 22 September 2026**, and
 * the need in each raised to two (`docs/spec/choreographed-windows.md`): a
 * full intake takes two shots in eight beats, and the pried mouth two fills
 * of the beam in eight. THE SLOW spans each ask exactly (`gorge-slow.ts`).
 */
export interface GorgeConfig {
  /** Columns the sack spans, one intake each, centred on `midCol`. Clamped to the field. */
  gorgeIntakes: number;
  /** Beads of one colour that fill an intake: transparent, pierceable, and about to vent. */
  gorgeFullBeads: number;
  /** Beats a full intake waits for the pierce before it vents a torch and empties. */
  gorgeVentBeats: number;
  /** Shots, of either colour, a full intake takes before it ruptures: the pierce is this many, inside `gorgeVentBeats`. */
  gorgeVentShots: number;
  /** Ruptures after which the sack spits beads back as bodies. */
  gorgeSpitRuptures: number;
  /** Beats between spits — and between the mouth feeding itself a bead. */
  gorgeSpitBeats: number;
  /** Ruptures after which the intake nearest the centre becomes the mouth. */
  gorgeMouthRuptures: number;
  /** Beads held per row the sack sinks. A picture: render reads it, nothing else does. */
  gorgeSinkPer: number;
  /** Beats the sack stands after the beam ends it, before the wave may end. */
  gorgeOutBeats: number;
  /** Beats the mouth stays pried before it clenches on the thumb and spits a bead (`gorge-hand.ts`). */
  gorgePryBeats: number;
  /** Beams in the mouth's colour, inside one pry, that end the fight. */
  gorgePryFills: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: seven intakes, four beads each, eight beats to put two
 * shots through a full one; it spits after the second rupture, every three
 * beats, and is gorged after the fourth, when the mouth fills itself over
 * twelve beats. Twenty-four shots of restraint, and two beams — under a pry
 * that holds eight beats, two beats more than two fills of `lancePrimeBeats`.
 */
export const GORGE_DEFAULTS: GorgeConfig = {
  gorgeIntakes: 7,
  gorgeFullBeads: 4,
  gorgeVentBeats: 8,
  gorgeVentShots: 2,
  gorgeSpitRuptures: 2,
  gorgeSpitBeats: 3,
  gorgeMouthRuptures: 4,
  gorgeSinkPer: 4,
  gorgeOutBeats: 2,
  gorgePryBeats: 8,
  gorgePryFills: 2,
};
