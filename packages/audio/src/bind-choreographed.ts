import type { SimEvent } from "@neon-spore/sim";
import { batonCue } from "./bind-baton.js";
import { candleCue } from "./bind-candle.js";
import type { Cue } from "./bind-cue.js";
import { curtainCue } from "./bind-curtain.js";
import { gorgeCue } from "./bind-gorge.js";
import { tasterCue } from "./bind-taster.js";
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
type ChoreographedEvent = Extract<
  SimEvent,
  {
    type:
      | `baton${string}`
      | `undertow${string}`
      | `candle${string}`
      | `gorge${string}`
      | `curtain${string}`
      | `taster${string}`;
  }
>;

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
    case "candleDark":
    case "candleDim":
    case "candleMove":
    case "candleTurn":
    case "candleFed":
    case "candleLast":
    case "candleOut":
      return candleCue(e, cols);
    case "gorgeSettle":
    case "gorgeSwallow":
    case "gorgeEmptied":
    case "gorgeFull":
    case "gorgeRupture":
    case "gorgeVent":
    case "gorgeSpit":
    case "gorgeMouth":
    case "gorgeOut":
      return gorgeCue(e, cols);
    case "curtainUnroll":
    case "curtainShadow":
    case "curtainSoft":
    case "curtainShove":
    case "curtainReroll":
    case "curtainLobeOff":
    case "curtainCoreHit":
    case "curtainFire":
    case "curtainTear":
    case "curtainOut":
      return curtainCue(e, cols);
    case "tasterRise":
    case "tasterGrow":
    case "tasterSet":
    case "tasterThick":
    case "tasterPare":
    case "tasterShear":
    case "tasterCrest":
    case "tasterLift":
    case "tasterTaste":
    case "tasterClose":
    case "tasterRefused":
    case "tasterOut":
      return tasterCue(e, cols);
    default:
      return undertowCue(e, cols);
  }
}
