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
    // **THE HUSK has no sound yet, and the silence is half-built rather than
    // decided.** Its rules are on the field and its look is the other half of
    // the creature; no wave hangs one, so neither of these can reach an ear in
    // a game anybody is playing. Both are loud moments when they arrive — a
    // lie collapsing, and a lie swallowed a beat before the wave is lost — and
    // `bind.test.ts` holds the pair in a set that names this file.
    case "huskRefused":
    case "huskSwallowed":
      return null;
  }
}
