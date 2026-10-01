import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE THROAT's four, in a file of their own for `bind-vane.ts`' reason —
 * `bind.ts` is full — and every one of them panned to the column the mouth is
 * over, because the mouth is carried and its column is where the pair's eyes
 * are.
 *
 * The colour set is the gullet pinched to a new shape: a soft close, heard by
 * both seats because each sets only two of the four colours and the other has
 * to know the mouth changed under the body they are carrying to it. The
 * swallow is the fight's progress, one ring slack. The refusal is THE
 * INSTAR's, the one sound every refused mark makes — here a body in the wrong
 * colour, or a press on the other seat's colour. The eversion is the ending.
 */
export function throatCue(e: Extract<SimEvent, { type: `throat${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "throatMode":
      return { id: "boss.throatCinch", pan };
    case "throatSwallow":
      return { id: "boss.throatSwallow", pan };
    case "throatEvert":
      return { id: "boss.throatEvert", pan };
    case "throatRefuse":
      return { id: "boss.instarRefuse", pan };
  }
}
