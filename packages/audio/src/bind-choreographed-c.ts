import type { SimEvent } from "@neon-spore/sim";
import { antiphonCue } from "./bind-antiphon.js";
import { burgeeCue, isBurgeeEvent } from "./bind-burgee.js";
import { capstanCue, isCapstanEvent } from "./bind-capstan.js";
import { laterCue } from "./bind-choreographed-d.js";
import type { Cue } from "./bind-cue.js";
import { filamentCue } from "./bind-filament.js";
import { flueCue, isFlueEvent } from "./bind-flue.js";
import { gallCue, isGallEvent } from "./bind-gall.js";
import { gimbalCue } from "./bind-gimbal.js";
import { governorCue, isGovernorEvent } from "./bind-governor.js";
import { haspCue, isHaspEvent } from "./bind-hasp.js";
import { hiveCue } from "./bind-hive.js";
import { instarCue } from "./bind-instar.js";
import { isLampreyEvent, lampreyCue } from "./bind-lamprey.js";
import { mantleCue } from "./bind-mantle.js";
import { isMimicEvent, mimicCue } from "./bind-mimic.js";
import { ratchetCue } from "./bind-ratchet.js";
import { scuttleCue } from "./bind-scuttle.js";
import { isSpoolEvent, spoolCue } from "./bind-spool.js";

/**
 * **The tail of `bind-choreographed.ts`**, cut off it the day THE SCUTTLE's
 * carry took that page over its 250-line limit.
 *
 * The seam is the page's own build order, the rule the other overflowing
 * pages carry in their headers: a page at the limit gives its **last** bosses
 * back, never the boss being worked on, whose cases stay with the comment
 * that explains them. THE INSTAR and THE FILAMENT were the
 * two below THE SCUTTLE, and THE UNDERTOW comes with them because it is not
 * a case at all — it is the `default`, and a default has to stand at the foot
 * of whichever page ends the chain.
 *
 * **Three more came over on 22 September 2026.** THE SCUTTLE, THE ANTIPHON
 * and THE HIVE were the last three cases on that page when the queue found
 * it seventeen lines from the limit with a choreographed boss still to be
 * bound there, so the end of the chain moved again and nothing in the middle
 * was touched.
 *
 * **The check next door is unchanged, and it is why the default may be a
 * call.** `choreographedCue`'s `default` hands what is left to `lateCue`, and
 * an event bound nowhere in either page arrives at `undertowCue` below, whose
 * parameter names the undertow's events one by one. So a boss of this family
 * gaining an event it never binds is a type error here, exactly as it was a
 * type error there — the guarantee moved with the arm rather than thinning.
 *
 * **And three more went on to `bind-choreographed-d.ts` on 26 September
 * 2026**, THE VALVE and THE SEAM with THE UNDERTOW's default, when THE OCULUS
 * came to be bound on a page eight lines from the limit. THE KEEL followed
 * them the same day, when its story's eight came to be bound here.
 */
type LateEvent = Extract<
  SimEvent,
  {
    type:
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
      | `sling${string}`
      | `grindstone${string}`
      | `cyst${string}`
      | `davit${string}`
      | `halter${string}`
      | `capstan${string}`
      | `gall${string}`
      | `burgee${string}`
      | `flue${string}`
      | `governor${string}`
      | `lamprey${string}`
      | `mimic${string}`
      | `undertow${string}`;
  }
>;

export function lateCue(e: LateEvent, cols: number): Cue | null {
  // THE CAPSTAN, THE GALL, THE BURGEE, THE FLUE, THE GOVERNOR, THE LAMPREY and THE MIMIC are bound here and not on `bind-choreographed-d.ts`,
  // which is two lines from the limit: handed over whole, before the switch.
  // THE HASP joined them when its story brought twelve more (`bind-hasp.ts`),
  // and THE SPOOL when its story brought nine (`bind-spool.ts`).
  if (isHaspEvent(e)) return haspCue(e, cols);
  if (isSpoolEvent(e)) return spoolCue(e, cols);
  if (isCapstanEvent(e)) return capstanCue(e, cols);
  if (isGallEvent(e)) return gallCue(e, cols);
  if (isBurgeeEvent(e)) return burgeeCue(e, cols);
  if (isFlueEvent(e)) return flueCue(e, cols);
  if (isGovernorEvent(e)) return governorCue(e, cols);
  if (isLampreyEvent(e)) return lampreyCue(e, cols);
  if (isMimicEvent(e)) return mimicCue(e, cols);
  switch (e.type) {
    // The three that came over on 22 September 2026, in the order they stood
    // at the foot of `bind-choreographed.ts`.
    case "scuttleEnter":
    case "scuttleLoose":
    case "scuttleThrow":
    case "scuttleStruck":
    case "scuttleSwing":
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
    case "hiveClench":
    case "hiveHaul":
    case "hiveWrung":
    case "hiveDown":
    case "hiveOut":
      return hiveCue(e, cols);
    case "instarEnter":
    case "instarMorph":
    case "instarShow":
    case "instarRefuse":
    case "instarAnswer":
    case "instarShove":
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
    case "filamentLate":
    case "filamentPulled":
    case "filamentDown":
    case "filamentOut":
      return filamentCue(e, cols);
    // THE GIMBAL, built on this page rather than next door for the header's
    // reason read forward: `bind-choreographed.ts` is within sixteen lines of
    // its limit and this page has room, so nothing had to be handed back.
    case "gimbalEnter":
    case "gimbalMarks":
    case "gimbalTrue":
    case "gimbalSlip":
    case "gimbalShear":
    case "gimbalLeak":
    case "gimbalSeamOut":
    case "gimbalSeamHit":
    case "gimbalHatch":
    case "gimbalOut":
      return gimbalCue(e, cols);
    case "ratchetEnter":
    case "ratchetLit":
    case "ratchetSet":
    case "ratchetLet":
    case "ratchetClick":
    case "ratchetBurn":
    case "ratchetBolt":
    case "ratchetBoltOut":
    case "ratchetBoltHit":
    case "ratchetOpen":
    case "ratchetJam":
    case "ratchetOut":
    case "ratchetSlip":
    case "ratchetBite":
    case "ratchetDrop":
    case "ratchetKick":
    case "ratchetSeat":
    case "ratchetFly":
    case "ratchetBind":
    case "ratchetMesh":
    case "ratchetShake":
    case "ratchetWind":
    case "ratchetWound":
    case "ratchetUnwind":
      return ratchetCue(e, cols);
    case "mantleEnter":
    case "mantleLight":
    case "mantleShear":
    case "mantleSplit":
    case "mantleLeak":
    case "mantleSparkOut":
    case "mantleSparkHit":
    case "mantleBeat":
    case "mantleDark":
    case "mantleOut":
    case "mantleGlow":
    case "mantleSlip":
    case "mantleSteady":
    case "mantleLapse":
    case "mantleBuckle":
    case "mantleFlat":
    case "mantleVent":
    case "mantleSeal":
    case "mantleCross":
    case "mantleTurn":
    case "mantleSwing":
    case "mantleTurned":
      return mantleCue(e, cols);
    // THE KEEL, THE VALVE, THE SEAM, THE OCULUS and the default: `bind-choreographed-d.ts`.
    default:
      return laterCue(e, cols);
  }
}
