import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type FlueSimEvent = Extract<SimEvent, { type: `flue${string}` }>;

/** Whether an event is THE FLUE's, so a page of the chain can hand it over whole. */
export function isFlueEvent(e: SimEvent): e is FlueSimEvent {
  return e.type.startsWith("flue");
}

/**
 * THE FLUE's six, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**, and never where the ember is: a hit and a
 * miss are panned to the shot's column, which is the cannon's, and
 * everything else to the middle. The navigator cannot see the ember, and a
 * sound that followed it would show it.
 *
 * **A hit rises with the levels cleared**, and a miss falls as the level's
 * shots run out, so the last one left is heard as the last.
 */
export function flueCue(e: FlueSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "flueEnter":
      return { id: "boss.flueEnter", pan };
    case "flueLight":
      return { id: "boss.flueLight", pan };
    case "flueHit":
      return { id: "boss.flueHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "flueMiss":
      return { id: "boss.flueMiss", pan, pitch: 1 - (2 - Math.min(2, e.shots)) * 0.1 };
    case "flueSpent":
      return { id: "boss.flueSpent", pan };
    case "flueOut":
      return { id: "boss.flueOut", pan };
  }
}
