import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE BATON's sixteen, in a file of their own because `bind.ts` is at its
 * limit — and along the seam the fight itself has: every one of these is a
 * handover, or a handover missed, or the arm giving way under a thumb, and the
 * bead is always in a column.
 *
 * All of them are panned, which is the opposite of THE STARE's decision and
 * for the opposite reason: the bead *is* somewhere, and once the arm swings
 * the column it is in is the whole of what the pilot has to know before his
 * next turn. A sound placed in a lane is a sound telling him where to slide.
 */
export function batonCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "batonLaunch"
        | "batonStruck"
        | "batonLanded"
        | "batonRelit"
        | "batonSettled"
        | "batonTwin"
        | "batonMerged"
        | "batonAct"
        | "batonMissed"
        | "batonShed"
        | "batonSwell"
        | "batonStripped"
        | "batonRefused"
        | "batonHeld"
        | "batonParted"
        | "batonDown";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "batonLaunch":
      return { id: "boss.batonLaunch", pan };
    case "batonStruck":
      return { id: "boss.batonStruck", pan };
    case "batonLanded":
      // A step higher for every socket the bead is down the arm, so the fight
      // is heard to be getting somewhere without anyone counting aloud — the
      // arrangement `mirror.echo` made for a round going well.
      return { id: "boss.batonLanded", pan, pitch: 1 + e.socket * 0.04 };
    case "batonRelit":
      return { id: "boss.batonRelit", pan };
    case "batonSettled":
      return { id: "boss.batonSettled", pan };
    case "batonTwin":
      return { id: "boss.batonTwin", pan };
    case "batonMerged":
      return { id: "boss.batonMerged", pan };
    case "batonAct":
      // A step higher for every act made, the landing's arrangement: the
      // crossing is heard climbing to the drop.
      return { id: "boss.batonAct", pan, pitch: 1 + e.act * 0.04 };
    case "batonMissed":
      return { id: "boss.batonMissed", pan };
    case "batonShed":
      return { id: "boss.batonShed", pan };
    case "batonSwell":
      return { id: "boss.batonSwell", pan };
    case "batonStripped":
      return { id: "boss.batonStripped", pan };
    case "batonRefused":
      return { id: "boss.batonRefused", pan };
    case "batonHeld":
      return { id: "boss.batonHeld", pan };
    case "batonParted":
      return { id: "boss.batonParted", pan };
    case "batonDown":
      return { id: "boss.batonDown", pan };
  }
}
