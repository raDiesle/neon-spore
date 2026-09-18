import type { SimEvent } from "@neon-spore/sim";
import { antiphonCue } from "./bind-antiphon.js";
import { batonCue } from "./bind-baton.js";
import { candleCue } from "./bind-candle.js";
import { type HandEvent, handCue } from "./bind-choreographed-b.js";
import type { Cue } from "./bind-cue.js";
import { curtainCue } from "./bind-curtain.js";
import { diastoleCue } from "./bind-diastole.js";
import { filamentCue } from "./bind-filament.js";
import { gorgeCue } from "./bind-gorge.js";
import { hiveCue } from "./bind-hive.js";
import { instarCue } from "./bind-instar.js";
import { leadCue } from "./bind-lead.js";
import { ledgerCue } from "./bind-ledger.js";
import { scuttleCue } from "./bind-scuttle.js";
import { sinewCue } from "./bind-sinew.js";
import { surgeCue } from "./bind-surge.js";
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
type ChoreographedEvent =
  | Extract<
      SimEvent,
      {
        type:
          | `baton${string}`
          | `undertow${string}`
          | `candle${string}`
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
          | `diastole${string}`;
      }
    >
  // And the hands the §6.2 brief added to bosses that had already shipped,
  // which have to be named one by one (`bind-choreographed-b.ts`).
  | HandEvent;

export function choreographedCue(e: ChoreographedEvent, cols: number): Cue {
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
    case "gorgePinch":
    case "gorgePry":
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
    case "scuttleEnter":
    case "scuttleLoose":
    case "scuttleThrow":
    case "scuttleStruck":
    case "scuttleRebuff":
    case "scuttleSlack":
    case "scuttleWind":
    case "scuttleLast":
    case "scuttleDown":
    case "scuttleOut":
      return scuttleCue(e, cols);
    case "antiphonEnter":
    case "antiphonGrow":
    case "antiphonPit":
    case "antiphonHarden":
    case "antiphonSink":
    case "antiphonSpill":
    case "antiphonStill":
    case "antiphonShip":
    case "antiphonBurst":
    case "antiphonOut":
      return antiphonCue(e, cols);
    case "hiveEnter":
    case "hiveSwell":
    case "hiveOpen":
    case "hiveSpill":
    case "hiveSkin":
    case "hiveWrong":
    case "hiveSeal":
    case "hiveDown":
    case "hiveOut":
      return hiveCue(e, cols);
    case "instarEnter":
    case "instarMorph":
    case "instarShow":
    case "instarRefuse":
    case "instarAnswer":
    case "instarDone":
    case "instarSlip":
    case "instarLand":
    case "instarStrike":
    case "instarDown":
    case "instarOut":
      return instarCue(e, cols);
    case "filamentEnter":
    case "filamentArm":
    case "filamentDrawn":
    case "filamentFollowed":
    case "filamentSnap":
    case "filamentRecoil":
    case "filamentDark":
    case "filamentPulled":
    case "filamentDown":
    case "filamentOut":
      return filamentCue(e, cols);
    case "diastoleClamp":
    case "diastoleSpasm":
      return diastoleCue(e, cols);
    case "wardenHold":
    case "wardenThrow":
    case "wardenSlam":
    case "vanePin":
    case "vaneSlip":
    case "vaneHaul":
    case "snakePrise":
    case "snakeLift":
    case "snakeDrop":
      return handCue(e, cols);
    default:
      return undertowCue(e, cols);
  }
}
