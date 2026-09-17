import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE HIVE's nine, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Every one of them is panned, and here the pan is the *site*: a breach
 * swells, opens, spills and is sealed over one column, so the four sounds a
 * site makes in its life come from one place, and the ear can tell two open
 * breaches apart before either seat has said a number. The swell is the
 * navigator's warning and the open is the pilot's — the pan is the one half
 * of each the other seat is given for free. The seal steps up as the count
 * of unsealed sites comes down, so the fight's length can be counted by ear.
 */
export function hiveCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "hiveEnter"
        | "hiveSwell"
        | "hiveOpen"
        | "hiveSpill"
        | "hiveSkin"
        | "hiveWrong"
        | "hiveSeal"
        | "hiveDown"
        | "hiveOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "hiveEnter":
      return { id: "boss.hiveEnter", pan };
    case "hiveSwell":
      return { id: "boss.hiveSwell", pan };
    case "hiveOpen":
      return { id: "boss.hiveOpen", pan };
    case "hiveSpill":
      return { id: "boss.hiveSpill", pan };
    case "hiveSkin":
      return { id: "boss.hiveSkin", pan };
    case "hiveWrong":
      return { id: "boss.hiveWrong", pan };
    case "hiveSeal":
      // A step up per site sealed, so the count left can be heard.
      return { id: "boss.hiveSeal", pan, pitch: 1.3 - Math.min(8, e.left) * 0.035 };
    case "hiveDown":
      return { id: "boss.hiveDown", pan };
    case "hiveOut":
      return { id: "boss.hiveOut", pan };
  }
}
