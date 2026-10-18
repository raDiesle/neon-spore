import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * **What the one thing on the field that is *taken* sounds like** — and what
 * the one thing that must be refused does not sound like yet.
 *
 * Its own file for `bind-volley.ts`'s reason: `bind.ts` was back at its
 * 250-line limit, and the seam it is cut along here is the same one
 * `pod-intake.ts` cuts in the simulation — everything that happens at the maw.
 * A pod is freed, taken or broken, and a husk is the same arrival paying the
 * other way.
 */
export function podCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "podLoose"
        | "podTaken"
        | "podLost"
        | "huskRefused"
        | "huskSwallowed"
        | "seederSeeds"
        | "podGripped";
    }
  >,
  cols: number,
): Cue | null {
  switch (e.type) {
    case "podLoose":
      return { id: "pod.loose", pan: panForCol(e.col, cols) };
    // THE SEEDER's pod, hung where it died: the pip the pod family kept spare
    // for "one is up there", heard after the kill (`sim/seeder.ts`).
    case "seederSeeds":
      return { id: "pod.blink", pan: panForCol(e.col, cols) };
    // A heavy pod gripped by the first press: the maw's chew, closing on
    // something it has not got down yet. The swallow is the second press's.
    case "podGripped":
      return { id: "pod.chew", pan: panForCol(e.col, cols) };
    case "podTaken":
      // One pod and one answer: the warm rising fifth, the debt paid. The purge
      // and the ward had a sound each while there were cargoes (`sounds/pod.ts`).
      return { id: "pod.takenMend", pan: panForCol(e.col, cols) };
    case "podLost":
      return { id: "pod.lost", pan: panForCol(e.col, cols) };
    // **THE HUSK's two, and they are the loudest pair in the family.** A lie
    // let go is the one funny sound in the game and a lie swallowed is the
    // sourest; that they are *this* family's — the only consonant one in the
    // catalogue — is the whole joke (`sounds/pod.ts`).
    case "huskRefused":
      return { id: "pod.huskFlight", pan: panForCol(e.col, cols) };
    case "huskSwallowed":
      return { id: "pod.huskTaken", pan: panForCol(e.col, cols) };
  }
}
