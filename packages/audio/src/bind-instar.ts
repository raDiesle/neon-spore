import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE INSTAR's twelve, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Every one is panned to the column it happened over, and here the pan is
 * **the mark**: a mark's answer, its done and its slip all come from where
 * the mark sits on the body, so the ear can tell the hand's slap from the
 * eggs coming away before either seat has looked up. The body's own sounds
 * — coming in, morphing, showing its marks, landing a beat, going down and
 * out — are from the middle, where it hangs. The refusal is the one sound
 * addressed to a seat, and it is not panned to the mark but said flat: it is
 * the boss saying *not yours*, not the mark saying anything.
 *
 * The shove is the jaw forcing itself open against a thumb, once a beat, and
 * it is **louder and lower the harder it pushes**: the third bite's shove is
 * twice the second's (`instar-script-breath.ts`), and the pair should hear
 * that it is.
 */
export function instarCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "instarEnter"
        | "instarMorph"
        | "instarShow"
        | "instarRefuse"
        | "instarAnswer"
        | "instarShove"
        | "instarDone"
        | "instarSlip"
        | "instarLand"
        | "instarStrike"
        | "instarDown"
        | "instarOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "instarEnter":
      return { id: "boss.instarEnter", pan };
    case "instarMorph":
      return { id: "boss.instarMorph", pan };
    case "instarShow":
      return { id: "boss.instarShow", pan };
    case "instarRefuse":
      return { id: "boss.instarRefuse", pan: 0 };
    case "instarAnswer":
      return { id: "boss.instarAnswer", pan };
    case "instarShove":
      return {
        id: "boss.instarShove",
        pan,
        gain: Math.min(1, 0.5 + e.pushMilli / 1000),
        pitch: 1 - Math.min(0.2, e.pushMilli / 2500),
      };
    case "instarDone":
      return { id: "boss.instarDone", pan };
    case "instarSlip":
      return { id: "boss.instarSlip", pan };
    case "instarLand":
      // A step up per beat landed, so how far through the pair is can be heard.
      return { id: "boss.instarLand", pan, pitch: 1 + Math.min(6, e.step) * 0.05 };
    case "instarStrike":
      return { id: "boss.instarStrike", pan };
    case "instarDown":
      return { id: "boss.instarDown", pan };
    case "instarOut":
      return { id: "boss.instarOut", pan };
  }
}
