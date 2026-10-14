import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { panForCol } from "./bind-place.js";

type HydraSimEvent = Extract<SimEvent, { type: `hydra${string}` }>;

/** How late a kind of head comes, nought the first bite: each level is heard a step lower. */
const DEPTH = { bite: 0, coil: 1, eye: 2, maw: 3 } as const;

/**
 * THE HYDRA's seventeen, routed by their prefix (`bind-prefixed.ts`).
 *
 * Everything is panned to its column: a cut, a coil and an eye to its own
 * side, a maw to where it opens. **Heads coming are pitched down the later
 * the level**, THE CHRYSALIS's way, so the four are heard as the hydra going
 * deeper; a lap of a coil climbs a little each lap, so a coil nearly off is
 * heard nearly off.
 */
export function hydraCue(e: HydraSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "hydraEnter":
      return { id: "boss.hydraEnter", pan };
    case "hydraHeads":
      return { id: "boss.hydraHeads", pan, pitch: 1 - DEPTH[e.head] * 0.08 };
    case "hydraCut":
      return { id: "boss.hydraCut", pan, pitch: 1 + (e.piece % 3) * 0.05 };
    case "hydraGlance":
      return { id: "boss.hydraGlance", pan };
    case "hydraLap":
      return { id: "boss.hydraLap", pan, pitch: 1 + Math.min(6, e.laps) * 0.05 };
    case "hydraUncoil":
      return { id: "boss.hydraUncoil", pan };
    case "hydraOpen":
      return { id: "boss.hydraOpen", pan };
    case "hydraBlink":
      return { id: "boss.hydraBlink", pan };
    case "hydraPoke":
      return { id: "boss.hydraPoke", pan, pitch: 1 + (e.piece % 6) * 0.03 };
    case "hydraMiss":
      return { id: "boss.hydraMiss", pan };
    case "hydraMaw":
      return { id: "boss.hydraMaw", pan };
    case "hydraQuench":
      return { id: "boss.hydraQuench", pan };
    case "hydraWrong":
      return { id: "boss.hydraWrong", pan };
    case "hydraCleared":
      return { id: "boss.hydraCleared", pan, pitch: 1 - DEPTH[e.head] * 0.1 };
    case "hydraStrike":
      return { id: "boss.hydraStrike", pan };
    case "hydraSpent":
      return { id: "boss.hydraSpent", pan };
    case "hydraOut":
      return { id: "boss.hydraOut", pan };
  }
}
