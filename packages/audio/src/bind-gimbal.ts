import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE GIMBAL's ten, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Almost nothing here pans anywhere**, and that is the boss: the drum hangs
 * in the middle of the field and both rings turn around it, so nine of the ten
 * come from the middle and the ear learns to stop looking sideways. The one
 * that does not is the seam — it leaks where it leaks, it is the only thing in
 * the fight the cannon answers, and the pan is the whole of what tells the
 * pilot where to put the barrel.
 *
 * **The shear is pitched up per tooth pair**, so how far through the pair is
 * can be heard without either of them counting out loud — the rim is drawn
 * with the teeth on it, but only one seat is looking at a given rim at a
 * given moment.
 */
export function gimbalCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "gimbalEnter"
        | "gimbalMarks"
        | "gimbalTrue"
        | "gimbalSlip"
        | "gimbalShear"
        | "gimbalLeak"
        | "gimbalSeamOut"
        | "gimbalSeamHit"
        | "gimbalHatch"
        | "gimbalOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "gimbalEnter":
      return { id: "boss.gimbalEnter", pan };
    case "gimbalMarks":
      // A step up per alignment, so the second and third announce themselves
      // as later than the first without a word being said.
      return { id: "boss.gimbalMarks", pan, pitch: 1 + Math.min(2, e.index) * 0.06 };
    case "gimbalTrue":
      return { id: "boss.gimbalTrue", pan };
    case "gimbalSlip":
      return { id: "boss.gimbalSlip", pan };
    case "gimbalShear":
      // Higher as the teeth go: three pairs left is the lowest, one the highest.
      return { id: "boss.gimbalShear", pan, pitch: 1 + Math.max(0, 3 - e.teeth) * 0.07 };
    case "gimbalLeak":
      return { id: "boss.gimbalLeak", pan };
    case "gimbalSeamOut":
      return { id: "boss.gimbalSeamOut", pan };
    case "gimbalSeamHit":
      return { id: "boss.gimbalSeamHit", pan };
    case "gimbalHatch":
      return { id: "boss.gimbalHatch", pan };
    case "gimbalOut":
      return { id: "boss.gimbalOut", pan };
  }
}
