import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";
import { POD_TAKEN_SOUNDS } from "./bind-lookups.js";

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
    { type: "podLoose" | "podTaken" | "podLost" | "huskRefused" | "huskSwallowed" }
  >,
  cols: number,
): Cue | null {
  switch (e.type) {
    case "podLoose":
      return { id: "pod.loose", pan: panForCol(e.col, cols) };
    case "podTaken":
      return { id: POD_TAKEN_SOUNDS[e.kind] ?? "pod.takenMend", pan: panForCol(e.col, cols) };
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
