/**
 * THE SCUTTLE's numbers — how many sockets the frame has and how many of the
 * parts in them are pods, how long the pair is given to count before the
 * first part comes loose, the cadence and what it tightens to, from how many
 * parts left it doubles and quickens, what a pod taken buys, the beat of
 * slack on the wind-up, where a thrown pod hangs, and how long the frame
 * takes to collapse (`scuttle.ts`, `docs/spec/bosses-choreographed.md` §15).
 *
 * Its own file for `config-lead.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.scuttleThrowBeats`.
 *
 * **The cadence is the window.** A part hangs for exactly the beats between
 * one throw and the next, so there is one number the pair counts and it is
 * both the clock they are racing and the time they have to shoot; a boss
 * that hung its parts for one count and threw on another would be two
 * clocks, and the design has one.
 */
export interface ScuttleConfig {
  /** Rows of sockets on the frame. */
  scuttleRows: number;
  /** Sockets across the frame, centred on the middle column. */
  scuttleCols: number;
  /** How many of the parts are pods, sown among the sockets by the seed. */
  scuttlePods: number;
  /** Beats it hangs whole before the first part comes loose: the count. */
  scuttleLookBeats: number;
  /** Beats a loose part hangs before it is thrown, while the frame is dense: the cadence, and the window. */
  scuttleThrowBeats: number;
  /** The cadence once the frame is down to `scuttleFastParts`. */
  scuttleFastBeats: number;
  /** Parts left from which two come loose a cycle, one of them live. */
  scuttleTwinParts: number;
  /** Parts left from which it throws at the fast cadence, and the live part is the attached one farthest from the last. */
  scuttleFastParts: number;
  /** Beats every cadence grows by for the rest of the fight when a thrown pod is taken. */
  scuttlePodSlackBeats: number;
  /** Beats on top of `lancePrimeBeats` the wind-up lasts, so a fill started on the wind-up's own beat is standing before the throw. */
  scuttleWindSlackBeats: number;
  /** Row a thrown pod hangs at, from the top of the field. */
  scuttlePodRow: number;
  /** Beats the field runs at the slow rate from the wind-up (THE SLOW). */
  scuttleSlowBeats: number;
  /** Beats the frame stands empty after the beam before the wave may end. */
  scuttleOutBeats: number;
  /** How far the pilot must carry a hanging part, in thousandths of a tile, before it swings a column (`scuttle-hand.ts`). */
  scuttleSwingMilli: number;
}

/**
 * Three rows of seven, twenty-one parts, which at three beats a throw is a
 * minute of cadence and at two beats from the last seven is a shade under.
 * Two pods among them, since one is a rule and three is a habit; twins from
 * twelve left and the fast cadence from seven, the design's own thirds; a
 * pod worth one beat of every cadence after it, which over the back half of
 * the fight is what the design calls *time given back*.
 *
 * The swing is two fifths of a tile: shorter than the half-tile a thumb
 * covers, so the part goes the moment the carry is plainly sideways rather
 * than a press that wandered, and far enough that a finger resting on a part
 * it only meant to hold does not throw it into the next column.
 */
export const SCUTTLE_DEFAULTS: ScuttleConfig = {
  scuttleRows: 3,
  scuttleCols: 7,
  scuttlePods: 2,
  scuttleLookBeats: 4,
  scuttleThrowBeats: 3,
  scuttleFastBeats: 2,
  scuttleTwinParts: 12,
  scuttleFastParts: 7,
  scuttlePodSlackBeats: 1,
  scuttleWindSlackBeats: 1,
  scuttlePodRow: 4,
  scuttleSlowBeats: 4,
  scuttleOutBeats: 3,
  scuttleSwingMilli: 400,
};
