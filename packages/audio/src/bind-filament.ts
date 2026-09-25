import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE FILAMENT's eleven, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Every one is panned to the column it happened over, and here the pan is
 * **the thumb**: a tile drawn and a tile followed come from where the thumb
 * reached, so the ear hears the line bend before either seat has looked
 * along it — which matters most to the navigator, who cannot see where the
 * pilot's thumb is going. The drawn tile is pitched up a little per row
 * climbed, so a filament being pulled in is a scale going up, and the two
 * faults that are one seat's each — the snap his, the recoil hers — are
 * distinct sounds; the dark, which is the two of them, is a third, and the
 * late — a thumb that never moved — a fourth, from under the thumb waited on. The
 * body's own — coming in, a filament arming, one pulled, going down and out
 * — are from the free end or the middle, where they hang.
 */
export function filamentCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "filamentEnter"
        | "filamentArm"
        | "filamentDrawn"
        | "filamentFollowed"
        | "filamentSnap"
        | "filamentRecoil"
        | "filamentDark"
        | "filamentLate"
        | "filamentPulled"
        | "filamentDown"
        | "filamentOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "filamentEnter":
      return { id: "boss.filamentEnter", pan };
    case "filamentArm":
      return { id: "boss.filamentArm", pan };
    case "filamentDrawn":
      // Higher as the thumb climbs, so the line being pulled in is a scale.
      return { id: "boss.filamentDrawn", pan, pitch: 1 + Math.max(0, 12 - e.row) * 0.03 };
    case "filamentFollowed":
      return { id: "boss.filamentFollowed", pan, pitch: 1 + Math.max(0, 12 - e.row) * 0.03 };
    case "filamentSnap":
      return { id: "boss.filamentSnap", pan };
    case "filamentRecoil":
      return { id: "boss.filamentRecoil", pan };
    case "filamentDark":
      return { id: "boss.filamentDark", pan };
    case "filamentLate":
      return { id: "boss.filamentLate", pan };
    case "filamentPulled":
      // A step up per filament out, so how far through the pair is can be heard.
      return { id: "boss.filamentPulled", pan, pitch: 1 + Math.min(6, e.index) * 0.05 };
    case "filamentDown":
      return { id: "boss.filamentDown", pan };
    case "filamentOut":
      return { id: "boss.filamentOut", pan };
  }
}
