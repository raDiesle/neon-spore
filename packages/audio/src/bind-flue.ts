import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type FlueSimEvent = Extract<SimEvent, { type: `flue${string}` }>;

/** Whether an event is THE FLUE's, so a page of the chain can hand it over whole. */
export function isFlueEvent(e: SimEvent): e is FlueSimEvent {
  return e.type.startsWith("flue");
}

/**
 * THE FLUE's sixteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: a tap, a skid, a lapse and the steadying are
 * panned to the ember's column, so **the seat that taps hears where the
 * ember went**. The core, the damper and the flue as a whole are in the
 * middle.
 *
 * **A tap rises as the count adds up**, and so does a hit, so a lapse after
 * two is heard as the climb it cost.
 */
export function flueCue(e: FlueSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "flueEnter":
      return { id: "boss.flueEnter", pan };
    case "flueLight":
      return { id: "boss.flueLight", pan };
    case "flueSteady":
      return { id: "boss.flueSteady", pan };
    case "flueStir":
      return { id: "boss.flueStir", pan };
    case "flueTick":
      return { id: "boss.flueTick", pan, pitch: 1 + Math.max(0, e.taps - 1) * 0.08 };
    case "flueSkid":
      return { id: "boss.flueSkid", pan };
    case "flueLapse":
      return { id: "boss.flueLapse", pan };
    case "flueVent":
      return { id: "boss.flueVent", pan };
    case "flueBare":
      return { id: "boss.flueBare", pan };
    case "flueChoke":
      return { id: "boss.flueChoke", pan };
    case "flueHeld":
      return { id: "boss.flueHeld", pan };
    case "flueShut":
      return { id: "boss.flueShut", pan };
    case "flueHit":
      return { id: "boss.flueHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "flueMiss":
      return { id: "boss.flueMiss", pan };
    case "flueSpent":
      return { id: "boss.flueSpent", pan };
    case "flueOut":
      return { id: "boss.flueOut", pan };
  }
}
