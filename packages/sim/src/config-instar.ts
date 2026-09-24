/**
 * THE INSTAR's tuning: the rules that hold across every step of a scene.
 *
 * What is *not* here is any clock of the scene itself — how long a morph
 * takes, how long a window stays open, how much a mark needs — because those
 * are the script's, one figure per step, authored beside the pose they
 * belong to (`packages/content/src/instar-script.ts`). A window that was one
 * number for every step would make the jaws and the tail the same beat, and
 * they are not. What is here is what makes two thumbs *together*, and what
 * a swipe is, which are the engine's and not the scene's (`instar.ts`).
 */
export interface InstarConfig {
  /**
   * Beats a done mark waits for its partner before it slips back to nought —
   * the gap between two finishes, not the time to act. One figure for every
   * pose, on the owner's word of 20 September 2026: *"For the moment keep
   * simple."* Not widened, and no step names its own; what made two beats
   * read as too short was the picture never saying this clock was running,
   * and that is `render/instar-together.ts`.
   */
  instarTogetherBeats: number;
  /** Thousandths of a tile a thumb must carry a mark before the lift counts a swipe. */
  instarSwipeMilli: number;
  /**
   * Beats the field runs at the slow rate from every step landing, and from
   * the last (THE SLOW). Doubled on 22 September 2026 with the script's own
   * windows: at two it was a second of slow and the owner could not read the
   * window's own picture before it was gone.
   */
  instarSlowBeats: number;
  /** Beats the beaten body hangs before the wave may end. */
  instarOutBeats: number;
}

export const INSTAR_DEFAULTS: InstarConfig = {
  instarTogetherBeats: 2,
  instarSwipeMilli: 600,
  instarSlowBeats: 4,
  instarOutBeats: 3,
};
