import type { InterludeEntry } from "@neon-spore/sim";

/**
 * Which gap between waves carries an interlude, and which one.
 *
 * The same call `queue.ts` makes for a wave, over the same kind of table:
 * which authored thing belongs to which wave is content's question, never the
 * sim's, and the sim only ever sees the round `startInterlude` opens from an
 * entry handed to it.
 *
 * **Nine gaps, one filled.** Ten acts is nine gaps between them
 * (`docs/spec/interludes.md`), which is more interludes than anybody should
 * build and exactly the right number of slots to have. A table rather than
 * arithmetic over the act length: eleven more rounds are coming and each of
 * them is a decision about *which gap*, not a formula.
 */
export const GAPS: Record<number, InterludeEntry> = {
  10: { kind: "gauge" },
};
