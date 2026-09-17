import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE SURGE's twelve, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Every one of them is panned, and here the pan says less than anywhere
 * else in the game: the bulb hangs in the middle column and every event is
 * its own, so the sound sits in the middle until a gum is thrown down one
 * of its columns. What the ear adds instead is the pressure: the vent and
 * the burst are the two ends of one gesture, and they are the two sounds a
 * pair has to be able to tell apart with their eyes on their thumbs.
 */
export function surgeCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "surgeSettle"
        | "surgeGrip"
        | "surgeRelease"
        | "surgeNear"
        | "surgeVent"
        | "surgeBurst"
        | "surgeGum"
        | "surgeLost"
        | "surgeAbsorb"
        | "surgeClose"
        | "surgeEvert"
        | "surgeOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "surgeSettle":
      return { id: "boss.surgeSettle", pan };
    case "surgeGrip":
      return { id: "boss.surgeGrip", pan };
    case "surgeRelease":
      return { id: "boss.surgeRelease", pan };
    case "surgeNear":
      return { id: "boss.surgeNear", pan };
    case "surgeVent":
      // A step up per notch open, so the seam opening can be counted by ear.
      return { id: "boss.surgeVent", pan, pitch: 0.9 + e.notches * 0.05 };
    case "surgeBurst":
      return { id: "boss.surgeBurst", pan };
    case "surgeGum":
      return { id: "boss.surgeGum", pan };
    case "surgeLost":
      return { id: "boss.surgeLost", pan };
    case "surgeAbsorb":
      return { id: "boss.surgeAbsorb", pan };
    case "surgeClose":
      return { id: "boss.surgeClose", pan };
    case "surgeEvert":
      return { id: "boss.surgeEvert", pan };
    case "surgeOut":
      return { id: "boss.surgeOut", pan };
  }
}
