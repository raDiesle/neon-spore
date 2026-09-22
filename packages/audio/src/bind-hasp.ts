import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE HASP's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Everything in this fight comes from the middle**, and that is the point
 * rather than a shortcut: the door stands over `midCol` and both hands are on
 * it — the latch under one thumb and the wheel under the other — so there is
 * no side for a cue to come from and nothing either seat could locate by ear.
 * What the ear is given instead is *which accident happened*: the burn and the
 * seize land on the same beat, from the same place, and they are two entirely
 * different sounds, because they are what the two seats have to say to each
 * other (`sim/hasp-step.ts`).
 *
 * **The open is pitched up per hasp**, so how far through the door is can be
 * heard rather than counted — the three clasps are drawn on it, but by the
 * last one the pilot is watching his own heat and nothing else.
 */
export function haspCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "haspEnter"
        | "haspLit"
        | "haspGrip"
        | "haspLet"
        | "haspBurn"
        | "haspCool"
        | "haspSeize"
        | "haspFree"
        | "haspOpen"
        | "haspBolt"
        | "haspBoltOut"
        | "haspBoltHit"
        | "haspClear"
        | "haspOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "haspEnter":
      return { id: "boss.haspEnter", pan };
    case "haspLit":
      return { id: "boss.haspLit", pan };
    case "haspGrip":
      return { id: "boss.haspGrip", pan };
    case "haspLet":
      return { id: "boss.haspLet", pan };
    case "haspBurn":
      return { id: "boss.haspBurn", pan };
    case "haspCool":
      return { id: "boss.haspCool", pan };
    case "haspSeize":
      return { id: "boss.haspSeize", pan };
    case "haspFree":
      return { id: "boss.haspFree", pan };
    case "haspOpen":
      // Higher as the clasps go: two left is the lowest, the last the highest.
      return { id: "boss.haspOpen", pan, pitch: 1 + Math.max(0, 2 - e.hasps) * 0.08 };
    case "haspBolt":
      return { id: "boss.haspBolt", pan };
    case "haspBoltOut":
      return { id: "boss.haspBoltOut", pan };
    case "haspBoltHit":
      return { id: "boss.haspBoltHit", pan };
    case "haspClear":
      return { id: "boss.haspClear", pan };
    case "haspOut":
      return { id: "boss.haspOut", pan };
  }
}
