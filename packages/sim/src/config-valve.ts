/**
 * THE VALVE's tuning: the beats every row of its beat list takes, how near a
 * mark counts as on it, and how deep a pull has to go
 * (`docs/spec/bosses-choreographed.md` §25).
 *
 * What is **not** here is where each movement's mark sits: those are the
 * wave's, authored on its entry, so a wave may ask for a different wheel
 * without touching this file.
 */
export interface ValveConfig {
  /** Beats the drum settles into frame before the first mark lights. */
  valveStillBeats: number;
  /** How near the mark the wheel has to stand, in thousandths of a turn, for
   * the freeze window to open. */
  valveNearMilli: number;
  /** How far the wheel must have been turned, one way, before the third
   * movement's mark counts — a full lap, the long way round. */
  valveLapMilli: number;
  /** The first movement's freeze window, in beats, under THE SLOW. */
  valveFreezeBeats: number;
  /** The freeze window in the second and third movements. */
  valveFreezeFastBeats: number;
  /** The first movement's pull window, in beats, under THE SLOW. */
  valvePullBeats: number;
  /** The pull window in the second and third movements. */
  valvePullFastBeats: number;
  /** How deep a thumb has to draw the pin, in thousandths of its track, for
   * it to come out. */
  valvePullMilli: number;
  /** How far a lapsed or thawed wheel is kicked off its mark. */
  valveKickMilli: number;
  /** Beats the drum lists after a pin before the next mark lights. */
  valveListBeats: number;
  /** Beats the spark has before it reaches the hull. */
  valveSparkBeats: number;
  /** Beats the open face hangs before the wave may end. */
  valveOpenBeats: number;
}

export const VALVE_DEFAULTS: ValveConfig = {
  valveStillBeats: 2,
  valveNearMilli: 40,
  valveLapMilli: 1000,
  valveFreezeBeats: 2,
  valveFreezeFastBeats: 1,
  valvePullBeats: 3,
  valvePullFastBeats: 2,
  valvePullMilli: 600,
  valveKickMilli: 200,
  valveListBeats: 1,
  valveSparkBeats: 2,
  valveOpenBeats: 2,
};
