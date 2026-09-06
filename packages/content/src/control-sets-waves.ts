import {
  type ControlSet,
  type ControlSetId,
  controlSet,
  DEFAULT_CONTROL_SET_ID,
} from "./control-sets.js";
import { WAVES } from "./waves.js";

/**
 * The three questions a **wave** asks about a panel.
 *
 * Cut out of `control-sets.ts` when THE CLAW's set took that file past its
 * 250-line limit, along the seam it already had: everything left next door is
 * pure over a `ControlSet` somebody hands it — what form it is, what is on it,
 * what it is a reduction of — and these three are the only ones that reach
 * into `WAVES`. That is also why they were the ones to move: a function that
 * reads the wave list is a function a tool editing an unsaved list has to be
 * careful with, and `firstOnPanel` already takes its list as an argument for
 * exactly that reason.
 *
 * Every name is re-exported from `control-sets.ts`.
 */

/**
 * The panel a wave is played on. The one place that turns a wave index into a
 * set, so nothing else has to remember that a missing field means the default —
 * including everything past the end of `WAVES`, which is generated and gets the
 * ordinary panel.
 */
export function controlSetForWave(waveIndex: number): ControlSet {
  return controlSet(WAVES[waveIndex]?.controls);
}

/**
 * Whether this wave is the **first in the game played on its panel** — the one
 * that has to introduce it.
 *
 * A guide teaches the first wave to carry a creature, a pod, a boss or a
 * mechanic (`test/waves.test.ts`), and a panel was the one new thing that
 * arrived unannounced: a pair reaching STANDARD 3 is handed a button they have
 * never seen, and the wave said nothing about it. The owner named the gap in
 * those terms — a first-time introduction not only for new enemies but for
 * control panels and for the modifications of one — so this is the question a
 * test asks over the whole list and the director asks about one row.
 *
 * **Returning to a panel is not an introduction.** The wave after THE GAUGE is
 * the ordinary field again, and a pair who has played fifteen waves on it does
 * not need to be told what a strip is. So it is the first *sight* of a set that
 * matters, not every change of one.
 *
 * It takes the list rather than reading `WAVES` because the director edits a
 * list that is not on disk yet, and an answer read out of `WAVES` there would
 * be about whatever was last saved.
 */
export function firstOnPanel(
  waves: readonly { controls?: ControlSetId }[],
  index: number,
): boolean {
  const here = controlSet(waves[index]?.controls).id;
  for (let i = 0; i < index; i++) {
    if (controlSet(waves[i]?.controls).id === here) return false;
  }
  return true;
}

/**
 * Which waves are played on a set, by name. A set no wave reaches is a panel
 * nobody can see, which is the same failure as a creature no wave spawns —
 * `test/control-sets.test.ts` is what makes that a failure rather than an
 * opinion, and this is what a director page would list under each panel.
 */
export function wavesUsingSet(id: ControlSetId): readonly string[] {
  return WAVES.filter((w) => (w.controls ?? DEFAULT_CONTROL_SET_ID) === id).map((w) => w.name);
}
