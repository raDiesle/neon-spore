/**
 * THE KEEL's tuning: how many segments the spine has, and the beats every row
 * of its beat list takes (`docs/spec/bosses-choreographed.md` §24).
 *
 * What is **not** here is the socket's colour or the order the third movement
 * re-lights its joints: those are the wave's, authored on its entry, so a wave
 * may ask for a different cannon or a different run without touching this
 * file.
 */
export interface KeelConfig {
  /** Segments in the spine, and so its health. Even, so the midpoint falls
   * between two of them and each half is one seat's. */
  keelSegments: number;
  /** Beats the spine arches into frame, loose and dim, before the first joint. */
  keelStillBeats: number;
  /** The first movement's joint window, in beats, under THE SLOW. */
  keelJointBeats: number;
  /** Beats between a joint and the next — after a miss, the design's *a beat
   * later*; after a landed tap, what is left of the beat it landed in. */
  keelRestBeats: number;
  /** Beats the midpoint splits open before its socket flashes. */
  keelSplitBeats: number;
  /** The socket's window, in beats, under THE SLOW. */
  keelSocketBeats: number;
  /** The second movement's last joint, a shorter window, under THE SLOW. */
  keelLastJointBeats: number;
  /** The third movement's joints, at tempo — no SLOW, on purpose. */
  keelTempoBeats: number;
  /** Beats the spine holds rigid before the tail throws. */
  keelRigidBeats: number;
  /** Beats the tail's rock has before it reaches the hull. */
  keelRockBeats: number;
  /** Beats the straightened spine hangs before the wave may end. */
  keelOpenBeats: number;
  /** The flip's window, in beats, under THE SLOW: the arch bows the wrong way
   * and the chord on the two end joints must arrest it inside this. */
  keelFlipBeats: number;
  /** Beats in a row both end joints must be held down to arrest the flip. */
  keelChordBeats: number;
  /** The marrow's window, in beats, under THE SLOW: both colours up the middle. */
  keelMarrowBeats: number;
  /** Beats the locked segments take to bank, one after another, hands off. */
  keelCoolBeats: number;
  /** The most beats reflex taps may add to the cooldown, one a tap. */
  keelCoolFlares: number;
}

export const KEEL_DEFAULTS: KeelConfig = {
  keelSegments: 6,
  keelStillBeats: 2,
  keelJointBeats: 4,
  keelRestBeats: 1,
  keelSplitBeats: 1,
  keelSocketBeats: 3,
  keelLastJointBeats: 3,
  keelTempoBeats: 2,
  keelRigidBeats: 1,
  keelRockBeats: 2,
  keelOpenBeats: 2,
  keelFlipBeats: 4,
  keelChordBeats: 2,
  keelMarrowBeats: 3,
  keelCoolBeats: 3,
  keelCoolFlares: 2,
};
