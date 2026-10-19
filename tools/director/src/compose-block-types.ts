import type { Wave, WaveEntry } from "@neon-spore/content";
import type { PodEntry } from "@neon-spore/sim";
import type { Step } from "./compose-steps.js";

/**
 * **What a block is**, as every composer imports it: `Motif` and `Block`, cut
 * out of `compose-block.ts` on 18 October 2026 when the fillers' `only` took
 * that file to 221 lines. These grow a field per kind of block; `readBlock`
 * and `motifsIn`, which read one off the list, change rarely. Both are
 * re-exported from `compose-block.ts`, so no importer moved.
 */

/** One arrival as an author wrote it — an entry or a pod, with whatever
 * fields it carries — at beat 0. `anchor` is the column it is placed by, on
 * the eleven-column field. A list rather than one, so a later motif can be a
 * pair an author wrote together. */
export interface Motif {
  entries: WaveEntry[];
  pods: PodEntry[];
  length: number;
  anchor: number;
}

export interface Block {
  /** Where the intro is in the list, and which block it is, from 0. */
  intro: number;
  number: number;
  x: string;
  /** The block before's thing, and every thing from three or more back. */
  y?: string;
  z: string[];
  /** Slick, bulb and the slow rock, as far as they are known yet. */
  basics: string[];
  motifs: ReadonlyMap<string, readonly Motif[]>;
  tutorial: boolean;
  /** The block's regular waves that are already written. */
  existing: number;
  /** Blocks since the tutorial arc ended: 0 for the first after it, -1 in
   * the arc. What the steps grow by (`compose-grow.ts`). */
  sinceTutorial: number;
  /** The gentlest composed regular wave of the nearest block before with one,
   * which this block's first aims a little above (`START_RISE`). */
  floor?: number;
  /** The same block's gentlest talk (`waveTalk`), which this block's first
   * aims not to fall under (`compose-talk.ts`). */
  talkFloor?: number;
  /** Whether the block's written regular waves stand for its first steps, so
   * the composed ones follow them, rising from `after`, the last one's
   * pressure (`leadingBlock`). */
  leads?: true;
  after?: number;
  /** Where composed waves go in the list, and the panel they are played on. */
  insertAt: number;
  controls: Wave["controls"];
  /** A lesson's faults, which every composed wave carries as far as it
   * lasts (`compose-lesson.ts`). */
  faults?: Wave["faults"];
  /** Whether every composed wave carries them, or a wave AUTO cannot play
   * with them may go without (`compose.ts` tries this first). */
  faultsOnly?: true;
  /** Whether it is THE CLAW's block, placed as pods and the rocks they
   * answer on the claw's panel rather than by the steps (`compose-claw.ts`). */
  claw?: true;
  /** Whether it is a lesson's block, whose composed waves do not lead up to
   * the written ones after them: those are the lesson's set pieces (THE CAGE,
   * THE ANCHOR and THE PENDULUM after THE LANCE's), not the rest of a ramp. */
  lesson?: true;
  /** The things every wave draws a few of, in place of `x`, `y` and `z`,
   * for a block with no thing of its own — a filler, a lesson, a review:
   * what was taught before it, less the slick and the bulb, which come
   * anyway (`compose-place.ts`). */
  pool?: readonly string[];
  /** The steps composed, when not the block's own: a lesson's or a
   * review's. */
  only?: readonly Step["id"][];
}
