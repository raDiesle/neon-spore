import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type GallSimEvent = Extract<SimEvent, { type: `gall${string}` }>;

/** Whether an event is THE GALL's, so a page of the chain can hand it over whole. */
export function isGallEvent(e: SimEvent): e is GallSimEvent {
  return e.type.startsWith("gall");
}

/**
 * THE GALL's ten, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: what happens to the alien is panned to the
 * point it sits on, so **a landing is heard on its new side**.
 *
 * **A tap rises as the charge builds**, and a hit as they add up.
 */
export function gallCue(e: GallSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "gallEnter":
      return { id: "boss.gallEnter", pan };
    case "gallLight":
      return { id: "boss.gallLight", pan };
    case "gallTap":
      return { id: "boss.gallTap", pan, pitch: 1 + Math.max(0, e.taps - 1) * 0.06 };
    case "gallWhiff":
      return { id: "boss.gallWhiff", pan };
    case "gallLeap":
      return { id: "boss.gallLeap", pan };
    case "gallLand":
      return { id: "boss.gallLand", pan };
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
