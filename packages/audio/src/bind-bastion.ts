import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type BastionSimEvent = Extract<SimEvent, { type: `bastion${string}` }>;

/** Whether an event is THE BASTION's, so a page of the chain can hand it over whole. */
export function isBastionEvent(e: SimEvent): e is BastionSimEvent {
  return e.type.startsWith("bastion");
}

/** How deep a shell lies, nought the outer plates: each shell in is heard a step lower. */
const DEPTH = { plates: 0, ring: 1, lattice: 2, port: 3 } as const;

/**
 * THE BASTION's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Everything is panned to its column: a plate to its own side, a gun to the
 * front, a node and a port to where they stand. **A shell coming off is
 * pitched down the deeper it lay**, so the four sheds are heard as a moon
 * getting smaller and heavier, and so is a shell lighting.
 */
export function bastionCue(e: BastionSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "bastionEnter":
      return { id: "boss.bastionEnter", pan };
    case "bastionLayer":
      return { id: "boss.bastionLayer", pan, pitch: 1 - DEPTH[e.layer] * 0.08 };
    case "bastionTear":
      return { id: "boss.bastionTear", pan, pitch: 1 + (e.piece % 4) * 0.05 };
    case "bastionSnap":
      return { id: "boss.bastionSnap", pan };
    case "bastionWrong":
      return { id: "boss.bastionWrong", pan };
    case "bastionGun":
      return { id: "boss.bastionGun", pan };
    case "bastionCharge":
      return { id: "boss.bastionCharge", pan };
    case "bastionBurst":
      return { id: "boss.bastionBurst", pan };
    case "bastionArc":
      return { id: "boss.bastionArc", pan };
    case "bastionPort":
      return { id: "boss.bastionPort", pan };
    case "bastionShed":
      return { id: "boss.bastionShed", pan, pitch: 1 - DEPTH[e.layer] * 0.1 };
    case "bastionRegrow":
      return { id: "boss.bastionRegrow", pan };
    case "bastionSpent":
      return { id: "boss.bastionSpent", pan };
    case "bastionOut":
      return { id: "boss.bastionOut", pan };
  }
}
