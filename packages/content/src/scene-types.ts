import type { BossEntry, PodEntry } from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";
import type { SceneStep } from "./scene-step-types.js";
import type { WaveFault } from "./wave-faults.js";
import type { WaveEntry } from "./wave-types.js";

/**
 * The shapes a rehearsal is written in. The films themselves are one per file
 * under `scenes/`, and `scenes.ts` is the list of them.
 *
 * **Everything here is authored in the game's own vocabulary.** Arrivals are
 * `WaveEntry`s in the same seven columns every wave is written in, put through
 * the same `queueFromWave`; a press names a `ControlId` and nothing else, and
 * which seat sends it, what `Command` it becomes and where the ghost thumb has
 * to be are all read off that one name. Two copies of "player 2 fires red"
 * would be two copies that could disagree, and the one that disagreed would be
 * the picture — a thumb pressing a button the world never felt.
 */

export interface GuideScene {
  /** How long one turn of the loop is, in ticks. */
  ticks: number;
  /**
   * The rehearsal's tempo. It used to be 180, on the argument that a film with
   * five things to show should not make anybody sit through them. That
   * argument is spent: the film is a stack of pages the pair turns itself
   * (`sim/guide-steps.ts`), so nothing waits on the end of it, and the owner's
   * answer to the old one was that **the animations were too fast**. 120 is a
   * beat every half second; `test/scenes.test.ts` holds that it divides the
   * tick rate.
   *
   * The *field* is the game's own, unlike the tempo: same columns, same rows,
   * same hull. A rehearsal is played at full size now, so there is nothing to
   * be gained by shrinking it and a shape to be taught wrongly if it were.
   * The one exception is `pinballRows`, and it says why.
   */
  bpm: number;
  /**
   * The shot grid the film's presses were authored against, when it matters.
   *
   * `shotChargeBeats` lays a press on a grid: it waits for the next point
   * strictly after it and the bolt leaves from *there* (`sim/shot-charge.ts`).
   * `apps/game` plays at 0.5 so player 1 can see a press happening; the host's
   * value flows straight through this file into the film, and
   * `DEFAULT_CONFIG` ships zero so a recorded replay keeps its timing to the
   * tick. A film whose bolts have to pair with something falling is therefore
   * a different film on each, and only one of the two was ever traced: THE
   * HIVE's was authored for the grid, proved against the default, and breached
   * the hull at beat 21 in the browser with its test green (21 September 2026).
   *
   * So a film that cares says which grid it was written on, here, the way it
   * says its own tempo — and then it plays the same everywhere, including in
   * the director. Left off, the host's own value stands, which is what every
   * film did before this one and what most of them can go on doing: a film
   * whose shots meet nothing at a deadline does not notice the difference.
   * `test/scene-grid.test.ts` holds every film that names no grid to the
   * same events on both, which is what found the six that named zero until
   * each was retimed for the half-beat grid.
   */
  chargeBeats?: number;
  /**
   * Rows in the film's pinball table. PINBALL's header sits in the air above
   * its first pins, which on a rehearsal is where the corner plate stands, and
   * its board hangs from the ceiling with nowhere to drop to. A row fewer is
   * the owner's answer of 10 September 2026: the same board, one row lower,
   * the header in its top row.
   */
  pinballRows?: number;
  seed: number;
  entries: WaveEntry[];
  /**
   * Pods hanging in the field, and the boss it is played against — both in the
   * same shapes a wave writes them in, and both optional because most films
   * have neither.
   *
   * **They are here because a rehearsal that could not carry them could not
   * teach half the game.** `sceneScript` used to hand the runner `pods: []` and
   * `boss: null` as literals, which meant SALVAGE — a wave whose entire subject
   * is a pod — and the six bosses of act two, each a mechanic taught nowhere
   * else, were the waves a film could never be written for. Nothing in
   * `packages/sim` was missing: `startWave` has always taken both.
   */
  pods?: PodEntry[];
  boss?: BossEntry;
  /**
   * The wave's **fault**, on the same terms as the two above and for the same
   * reason: a rehearsal that could not carry one could not teach the waves
   * whose whole subject is a control running by itself.
   *
   * THE COIL is why it exists. Its dome comes off wherever the plate is
   * standing while the shield is armed, and on that wave the shield is armed
   * on every beat with nobody pressing anything — so a film played without the
   * fault would show a pair of controls that behave, which is the one thing
   * that wave is not. `startWave` has always taken it; only this shape was
   * missing.
   */
  faults?: WaveFault[];
  acts: SceneAct[];
  steps: SceneStep[];
}

// A caption and the thing it points at are `scene-step-types.ts` next door,
// cut out when THE PUSH's `dir` took this file over its 250-line limit and
// along the seam it already had: an *act* is a thumb on a control and a
// **step** is a page of words, and nothing here reads the other. The act
// followed on 14 September 2026, when the gestures it had grown since — a
// shake, a tap, a strip put where the body is — brought the file back to the
// line: `scene-act-types.ts`. Both re-exported so nothing that reached for
// either through this file had to move.
export type { SceneAct } from "./scene-act-types.js";
export type { BossPart, SceneAnchor, SceneStep } from "./scene-step-types.js";
