import type { SimEvent } from "@neon-spore/sim";
import { batonCue } from "./bind-baton.js";
import type { Cue } from "./bind-cue.js";
import { undertowCue } from "./bind-undertow.js";

/**
 * The choreographed bosses' events (`docs/spec/bosses-choreographed.md`),
 * reached from `cueFor`'s `default` rather than from a case each.
 *
 * `bind.ts` came back to its limit with THE UNDERTOW, and a boss of this page
 * is nine or ten events at a time — so the switch there names every field
 * event and hands the rest here, narrowed by the cases above it. The check is
 * the same as before, in two halves: an event nobody bound in `bind.ts`
 * lands in its `default` and is not a `ChoreographedEvent`, and one missed
 * *here* leaves a switch without an ending return. Either is a type
 * error, and `test/bind.test.ts` plays one of each as well.
 */
type ChoreographedEvent = Extract<SimEvent, { type: `baton${string}` | `undertow${string}` }>;

export function choreographedCue(e: ChoreographedEvent, cols: number): Cue {
  switch (e.type) {
    case "batonLaunch":
    case "batonStruck":
    case "batonLanded":
    case "batonRelit":
    case "batonSettled":
    case "batonShed":
    case "batonDown":
      return batonCue(e, cols);
    default:
      return undertowCue(e, cols);
  }
}
