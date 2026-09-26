import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { oculusCue } from "./bind-oculus.js";
import { seamCue } from "./bind-seam.js";
import { undertowCue } from "./bind-undertow.js";
import { valveCue } from "./bind-valve.js";
import { viseCue } from "./bind-vise.js";

/**
 * **The tail of `bind-choreographed-c.ts`**, cut off it the day THE OCULUS
 * came to be bound on a page eight lines from its limit.
 *
 * The same rule as the page before it: the last bosses go on, and THE
 * UNDERTOW's `default` goes with them because it has to stand at the foot of
 * whichever page ends the chain. So an event bound nowhere still arrives at
 * `undertowCue`, whose parameter names the undertow's events one by one, and a
 * boss of this family gaining an event it never binds is still a type error.
 */
type LaterEvent = Extract<
  SimEvent,
  {
    type:
      | `valve${string}`
      | `seam${string}`
      | `oculus${string}`
      | `vise${string}`
      | `undertow${string}`;
  }
>;

export function laterCue(e: LaterEvent, cols: number): Cue {
  switch (e.type) {
    case "valveEnter":
    case "valveLight":
    case "valveHold":
    case "valveSlip":
    case "valveLapse":
    case "valveFreeze":
    case "valveThaw":
    case "valvePull":
    case "valveSpark":
    case "valveSparkOut":
    case "valveSparkHit":
    case "valveOpen":
    case "valveOut":
      return valveCue(e, cols);
    case "seamEnter":
    case "seamLight":
    case "seamDim":
    case "seamSeal":
    case "seamRockOut":
    case "seamBlock":
    case "seamMiss":
    case "seamSplit":
    case "seamOut":
      return seamCue(e, cols);
    case "oculusEnter":
    case "oculusLight":
    case "oculusSlip":
    case "oculusShut":
    case "oculusSpring":
    case "oculusBreak":
    case "oculusHit":
    case "oculusReseal":
    case "oculusSwallow":
    case "oculusMiss":
    case "oculusShatter":
    case "oculusOut":
      return oculusCue(e, cols);
    case "viseEnter":
    case "viseLight":
    case "viseSlip":
    case "viseCrack":
    case "viseSpring":
    case "viseBare":
    case "viseHit":
    case "viseBrace":
    case "viseCover":
    case "viseMiss":
    case "viseSplit":
    case "viseOut":
      return viseCue(e, cols);
    default:
      return undertowCue(e, cols);
  }
}
