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
  /** Beats a done mark waits for its partner before it slips back to nought. */
  instarTogetherBeats: number;
  /** Thousandths of a tile a thumb must carry a mark before the lift counts a swipe. */
  instarSwipeMilli: number;
  /** Beats the field runs at a third rate from every step landing, and from the last (THE SLOW). */
  instarSlowBeats: number;
  /** Beats the beaten body hangs before the wave may end. */
  instarOutBeats: number;
}

export const INSTAR_DEFAULTS: InstarConfig = {
  instarTogetherBeats: 2,
  instarSwipeMilli: 600,
  instarSlowBeats: 2,
  instarOutBeats: 3,
};
