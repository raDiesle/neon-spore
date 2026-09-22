import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE BELLOWS's sixteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **The pan is the whole of what says whose beat it is.** The lung's two
 * chambers hang off the left and the right of one waist, so a grip and a pull
 * come from the side that acted and everything the waist itself does comes
 * from the middle — and a pair that has stopped looking at each other's
 * screens can hear the exchange going back and forth without a word. The two
 * hazards pan where they are: the spark leaks from the middle, the breath
 * goes down whatever column the cannon is standing in.
 *
 * **The seam is pitched up per seam**, so how far through the waist is can be
 * heard rather than counted — the four gaps are drawn on the waist, but the
 * fight is loud enough at three seams down that neither seat is looking.
 */
export function bellowsCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "bellowsEnter"
        | "bellowsMarks"
        | "bellowsPulled"
        | "bellowsSeam"
        | "bellowsJam"
        | "bellowsLate"
        | "bellowsSpark"
        | "bellowsSparkOut"
        | "bellowsSparkHit"
        | "bellowsBreath"
        | "bellowsGlow"
        | "bellowsGrip"
        | "bellowsSplit"
        | "bellowsHold"
        | "bellowsVent"
        | "bellowsOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "bellowsEnter":
      return { id: "boss.bellowsEnter", pan };
    case "bellowsMarks":
      return { id: "boss.bellowsMarks", pan };
    case "bellowsPulled":
      return { id: "boss.bellowsPulled", pan };
    case "bellowsSeam":
      // Higher as the seams go: three left is the lowest, the last the highest.
      return { id: "boss.bellowsSeam", pan, pitch: 1 + Math.max(0, 3 - e.seams) * 0.07 };
    case "bellowsJam":
      return { id: "boss.bellowsJam", pan };
    case "bellowsLate":
      return { id: "boss.bellowsLate", pan };
    case "bellowsSpark":
      return { id: "boss.bellowsSpark", pan };
    case "bellowsSparkOut":
      return { id: "boss.bellowsSparkOut", pan };
    case "bellowsSparkHit":
      return { id: "boss.bellowsSparkHit", pan };
    case "bellowsBreath":
      return { id: "boss.bellowsBreath", pan };
    case "bellowsGlow":
      return { id: "boss.bellowsGlow", pan };
    case "bellowsGrip":
      return { id: "boss.bellowsGrip", pan };
    case "bellowsSplit":
      return { id: "boss.bellowsSplit", pan };
    case "bellowsHold":
      return { id: "boss.bellowsHold", pan };
    case "bellowsVent":
      return { id: "boss.bellowsVent", pan };
    case "bellowsOut":
      return { id: "boss.bellowsOut", pan };
  }
}
