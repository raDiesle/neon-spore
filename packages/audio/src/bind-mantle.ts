import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE MANTLE's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Almost nothing here pans anywhere**, the same as THE GIMBAL's: the shell
 * hangs in the middle of the field and both handles pull toward it, so all
 * but one come from the middle. The one that does not is the bared core's
 * spark, which leaks where it leaks and is the only thing in the fight the
 * cannon answers.
 *
 * **The shear is pitched down per pair sheared**, so which movement the pair
 * are on can be heard without either of them counting: the shell getting
 * emptier reads as the crack getting lower.
 */
export function mantleCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "mantleEnter"
        | "mantleLight"
        | "mantleShear"
        | "mantleSplit"
        | "mantleLeak"
        | "mantleSparkOut"
        | "mantleSparkHit"
        | "mantleBeat"
        | "mantleDark"
        | "mantleOut"
        | "mantleGlow"
        | "mantleSlip"
        | "mantleSteady"
        | "mantleLapse";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "mantleEnter":
      return { id: "boss.mantleEnter", pan };
    case "mantleLight":
      return { id: "boss.mantleLight", pan };
    case "mantleShear":
      // Lower as the pairs go: the shell getting emptier reads as the crack
      // dropping, THE GIMBAL's shear turned the other way.
      return { id: "boss.mantleShear", pan, pitch: 1 - Math.max(0, 3 - e.left) * 0.06 };
    case "mantleSplit":
      return { id: "boss.mantleSplit", pan };
    case "mantleLeak":
      return { id: "boss.mantleLeak", pan };
    case "mantleSparkOut":
      return { id: "boss.mantleSparkOut", pan };
    case "mantleSparkHit":
      return { id: "boss.mantleSparkHit", pan };
    case "mantleBeat":
      // A step up per tap landed, so the finish's own count can be heard.
      return { id: "boss.mantleBeat", pan, pitch: 1 + Math.min(5, 6 - e.left) * 0.05 };
    case "mantleDark":
      return { id: "boss.mantleDark", pan };
    case "mantleOut":
      return { id: "boss.mantleOut", pan };
    case "mantleGlow":
      return { id: "boss.mantleGlow", pan };
    case "mantleSlip":
      return { id: "boss.mantleSlip", pan };
    case "mantleSteady":
      return { id: "boss.mantleSteady", pan };
    case "mantleLapse":
      return { id: "boss.mantleLapse", pan };
  }
}
