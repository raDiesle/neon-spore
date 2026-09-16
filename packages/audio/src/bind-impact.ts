import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **What a shot meeting a body sounds like** — the six the whole game is made
 * of, and the ones a pair hears more often than every boss put together.
 *
 * Its own file rather than six cases in `bind.ts`, which was at its limit and
 * bought its last line by deleting a paragraph a reader needed. The seam is
 * `bind-fleet.ts`'s: a group of events with one subject, dispatched by name so
 * the switch next door stays exhaustive and a new event is a compile error
 * rather than a silence.
 *
 * **Everything here is panned and the two that report a body are pitched.**
 * The column is where it happened, which is the sentence the pair is about to
 * say; the row is how far down the field it was, and it is worth saying only
 * where something ended. A bolt turned away or a petal knocked loose is an
 * event about a column, and a pitch on it would be one more coordinate offered
 * at the moment nobody wants another (`bind-fleet.ts` says the same about a
 * hull going down).
 */
export function impactCue(
  e: Extract<
    SimEvent,
    { type: "crawlerBreak" | "destroy" | "hole" | "reject" | "deflect" | "petal" }
  >,
  cols: number,
  rows: number,
): Cue {
  const pan = panForCol(e.col, cols);
  if (e.type === "reject") return { id: "impact.reject", pan };
  if (e.type === "deflect") return { id: "impact.deflect", pan };
  if (e.type === "petal") return { id: "impact.petal", pan };
  if (e.type === "hole") return { id: "impact.hole", pan, pitch: pitchForRow(e.row, rows) };
  // A kill, in the colour that made it — and a ring off a crawler shares it
  // exactly. The eye was given a burst of its own because a sac coming apart
  // does not look like a slick going out (`events-crawler.ts`); the ear was
  // not, because it *is* a kill and the pair has spent the whole game learning
  // what one sounds like.
  return {
    id: e.color === "red" ? "impact.destroyRed" : "impact.destroyCyan",
    pan,
    pitch: pitchForRow(e.row, rows),
  };
}
