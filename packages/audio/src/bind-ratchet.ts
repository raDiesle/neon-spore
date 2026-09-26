import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE RATCHET's twenty-four, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Everything comes from the middle**, THE HASP's argument: the rack stands
 * over `midCol` with both hands on it, so what the ear is given is not where
 * but *which*: a clean click or a dull burn.
 *
 * **The click is pitched up per clean tooth**, so how far the rack has
 * climbed can be heard rather than counted.
 */
export function ratchetCue(e: Extract<SimEvent, { type: `ratchet${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "ratchetEnter":
      return { id: "boss.ratchetEnter", pan };
    case "ratchetLit":
      return { id: "boss.ratchetLit", pan };
    case "ratchetSet":
      return { id: "boss.ratchetSet", pan };
    case "ratchetLet":
      return { id: "boss.ratchetLet", pan };
    case "ratchetClick":
      // Higher as the rack climbs: the first clean tooth lowest, the fifth highest.
      return { id: "boss.ratchetClick", pan, pitch: 1 + Math.max(0, e.clean - 1) * 0.06 };
    case "ratchetBurn":
      return { id: "boss.ratchetBurn", pan };
    case "ratchetBolt":
      return { id: "boss.ratchetBolt", pan };
    case "ratchetBoltOut":
      return { id: "boss.ratchetBoltOut", pan };
    case "ratchetBoltHit":
      return { id: "boss.ratchetBoltHit", pan };
    case "ratchetOpen":
      return { id: "boss.ratchetOpen", pan };
    case "ratchetJam":
      return { id: "boss.ratchetJam", pan };
    case "ratchetOut":
      return { id: "boss.ratchetOut", pan };
    // The story between the teeth borrows the rack's own voice, bent: each
    // threat is the lit pawl or the burn low, each answer the clean click at
    // its own pitch, each miss the jam — no new sound for any of the twelve.
    case "ratchetSlip":
      return { id: "boss.ratchetBurn", pan, pitch: 0.8 };
    case "ratchetBite":
      return { id: "boss.ratchetSet", pan, pitch: 0.85 };
    case "ratchetDrop":
      return { id: "boss.ratchetJam", pan, pitch: 1.1 };
    case "ratchetKick":
      return { id: "boss.ratchetLit", pan, pitch: 1.25 };
    case "ratchetSeat":
      return { id: "boss.ratchetClick", pan, pitch: 0.75 };
    case "ratchetFly":
      return { id: "boss.ratchetJam", pan, pitch: 1.2 };
    case "ratchetBind":
      return { id: "boss.ratchetBurn", pan, pitch: 0.65 };
    case "ratchetMesh":
      return { id: "boss.ratchetClick", pan, pitch: 0.9 };
    case "ratchetShake":
      return { id: "boss.ratchetJam", pan, pitch: 0.9 };
    case "ratchetWind":
      return { id: "boss.ratchetLit", pan, pitch: 0.7 };
    case "ratchetWound":
      return { id: "boss.ratchetOpen", pan, pitch: 1.3 };
    case "ratchetUnwind":
      return { id: "boss.ratchetJam", pan, pitch: 0.8 };
  }
}
