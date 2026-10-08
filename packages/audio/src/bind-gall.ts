import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type GallSimEvent = Extract<SimEvent, { type: `gall${string}` }>;

/** Whether an event is THE GALL's, so a page of the chain can hand it over whole. */
export function isGallEvent(e: SimEvent): e is GallSimEvent {
  return e.type.startsWith("gall");
}

/**
 * THE GALL's eleven, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: what happens to the gall is panned to the
 * point it sits on, so **a jump is heard landing on its new side** before
 * either seat has found it — the one thing the sound can tell the pair that
 * the picture makes them look for. The root and the seam are in the middle.
 *
 * **A close rises as they add up**, and so does a hit.
 */
export function gallCue(e: GallSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "gallEnter":
      return { id: "boss.gallEnter", pan };
    case "gallLight":
      return { id: "boss.gallLight", pan };
    case "gallPress":
      return { id: "boss.gallPress", pan };
    case "gallSlip":
      return { id: "boss.gallSlip", pan };
    case "gallClose":
      return { id: "boss.gallClose", pan, pitch: 1 + Math.max(0, e.closes - 1) * 0.08 };
    case "gallSwell":
      return { id: "boss.gallSwell", pan };
    case "gallBare":
      return { id: "boss.gallBare", pan };
    case "gallHit":
      return { id: "boss.gallHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "gallMiss":
      return { id: "boss.gallMiss", pan };
    case "gallFlat":
      return { id: "boss.gallFlat", pan };
    case "gallOut":
      return { id: "boss.gallOut", pan };
  }
}
