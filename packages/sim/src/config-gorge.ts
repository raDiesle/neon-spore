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
 * than called, and it is four beats because the design makes it the only
 * warning the pair gets (§3, THE SLOW).
 */
export interface GorgeConfig {
  /** Columns the sack spans, one intake each, centred on `midCol`. Clamped to the field. */
  gorgeIntakes: number;
  /** Beads of one colour that fill an intake: transparent, pierceable, and about to vent. */
  gorgeFullBeads: number;
  /** Beats a full intake waits for the pierce before it vents a torch and empties. */
  gorgeVentBeats: number;
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
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: seven intakes, four beads each, four beats to pierce a
 * full one; it spits after the second rupture, every three beats, and is
 * gorged after the fourth, when the mouth fills itself over twelve beats.
 * Twenty shots of restraint, and the beam.
 */
export const GORGE_DEFAULTS: GorgeConfig = {
  gorgeIntakes: 7,
  gorgeFullBeads: 4,
  gorgeVentBeats: 4,
  gorgeSpitRuptures: 2,
  gorgeSpitBeats: 3,
  gorgeMouthRuptures: 4,
  gorgeSinkPer: 4,
  gorgeOutBeats: 2,
};
