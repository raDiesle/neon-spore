import type { SimEvent } from "@neon-spore/sim";
import { batonCue } from "./bind-baton.js";
import { type AddedEvent, addedCue, isAddedEvent } from "./bind-choreographed-b.js";
import { lateCue } from "./bind-choreographed-c.js";
import type { Cue } from "./bind-cue.js";
import { curtainCue } from "./bind-curtain.js";
import { gorgeCue } from "./bind-gorge.js";
import { leadCue } from "./bind-lead.js";
import { ledgerCue } from "./bind-ledger.js";
import { sinewCue } from "./bind-sinew.js";
import { surgeCue } from "./bind-surge.js";
import { tasterCue } from "./bind-taster.js";

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
 *
 * **And it gives a boss back rather than grow.** At the limit the page hands
 * its *last* bosses on to `bind-choreographed-c.ts`, never the boss being
 * worked on, whose cases stay with the comment that explains them; the
 * `default` goes with them, because the arm that catches what nobody named is
 * what has to stand at the foot of the chain.
 */
type ChoreographedEvent =
  | Extract<
      SimEvent,
      {
        type:
          | `baton${string}`
          | `undertow${string}`
          | `gorge${string}`
          | `curtain${string}`
          | `taster${string}`
          | `ledger${string}`
          | `sinew${string}`
          | `surge${string}`
          | `lead${string}`
          | `scuttle${string}`
          | `antiphon${string}`
          | `hive${string}`
          | `instar${string}`
          | `filament${string}`
          | `gimbal${string}`
          | `spool${string}`
          | `hasp${string}`
          | `ratchet${string}`
          | `mantle${string}`
          | `keel${string}`
          | `valve${string}`
          | `seam${string}`
          | `oculus${string}`
          | `vise${string}`
          | `rime${string}`
          | `trivet${string}`
          | `plumb${string}`
          | `sling${string}`;
      }
    >
  // And the events added to bosses that had already shipped, which have to be
  // named one by one over there (`bind-choreographed-b.ts`).
  | AddedEvent;

export function choreographedCue(e: ChoreographedEvent, cols: number): Cue {
  // The events added to bosses that had already shipped, asked as one question
  // rather than as a `case` each: this file is at its limit and that list
  // grows by a handful of names per boss (`bind-choreographed-b.ts`).
  if (isAddedEvent(e)) return addedCue(e, cols);
  switch (e.type) {
    case "batonLaunch":
    case "batonStruck":
    case "batonLanded":
    case "batonRelit":
    case "batonSettled":
    case "batonTwin":
    case "batonMerged":
    case "batonAct":
    case "batonMissed":
    case "batonShed":
    case "batonSwell":
    case "batonStripped":
    case "batonRefused":
    case "batonHeld":
    case "batonParted":
    case "batonDown":
      return batonCue(e, cols);
    case "gorgeSettle":
    case "gorgeSwallow":
    case "gorgeEmptied":
    case "gorgeFull":
    case "gorgeRupture":
    case "gorgeNick":
    case "gorgeVent":
    case "gorgeSpit":
    case "gorgeMouth":
    case "gorgeOut":
    case "gorgePinch":
    case "gorgePry":
    case "gorgePryFill":
    case "gorgeClench":
      return gorgeCue(e, cols);
    case "curtainUnroll":
    case "curtainShadow":
    case "curtainSoft":
    case "curtainShove":
    case "curtainReroll":
    case "curtainLobeOff":
    case "curtainCoreHit":
    case "curtainFire":
    case "curtainPin":
    case "curtainJam":
    case "curtainLift":
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
    case "tasterPryFill":
    case "tasterOut":
      return tasterCue(e, cols);
    case "ledgerRoot":
    case "ledgerSeam":
    case "ledgerRefused":
    case "ledgerBead":
    case "ledgerWard":
    case "ledgerWhip":
    case "ledgerBill":
    case "ledgerSocket":
    case "ledgerLast":
    case "ledgerHeld":
    case "ledgerTear":
      return ledgerCue(e, cols);
    case "sinewSettle":
    case "sinewGrip":
    case "sinewRelease":
    case "sinewEnter":
    case "sinewLoose":
    case "sinewPart":
    case "sinewSnap":
    case "sinewRock":
    case "sinewCatch":
    case "sinewSlack":
    case "sinewFall":
    case "sinewSwing":
    case "sinewOut":
    case "sinewCrush":
      return sinewCue(e, cols);
    case "surgeSettle":
    case "surgeGrip":
    case "surgeRelease":
    case "surgeNear":
    case "surgeVent":
    case "surgeBurst":
    case "surgeGum":
    case "surgeRock":
    case "surgeLost":
    case "surgeAbsorb":
    case "surgeClose":
    case "surgeEvert":
    case "surgeOut":
      return surgeCue(e, cols);
    case "leadEnter":
    case "leadPace":
    case "leadTurn":
    case "leadFlight":
    case "leadHit":
    case "leadMiss":
    case "leadReverse":
    case "leadTorch":
    case "leadRock":
    case "leadStill":
    case "leadPass":
    case "leadWall":
    case "leadDown":
    case "leadOut":
      return leadCue(e, cols);
    // THE INSTAR, THE FILAMENT, THE GIMBAL and the
    // undertow's own default, which is what a page at its limit gives back
    // (`bind-choreographed-c.ts`) — and since 22 September 2026 THE SCUTTLE,
    // THE ANTIPHON and THE HIVE, the last three cases this page had, handed
    // over when the queue found it seventeen lines from the limit and a
    // choreographed boss still had to touch it.
    default:
      return lateCue(e, cols);
  }
}
