import type { SimEvent } from "@neon-spore/sim";
import { antiphonCue } from "./bind-antiphon.js";
import type { Cue } from "./bind-cue.js";
import { diastoleCue } from "./bind-diastole.js";
import { filamentCue } from "./bind-filament.js";
import { gimbalCue } from "./bind-gimbal.js";
import { haspCue } from "./bind-hasp.js";
import { hiveCue } from "./bind-hive.js";
import { instarCue } from "./bind-instar.js";
import { ratchetCue } from "./bind-ratchet.js";
import { scuttleCue } from "./bind-scuttle.js";
import { spoolCue } from "./bind-spool.js";
import { undertowCue } from "./bind-undertow.js";

/**
 * **The tail of `bind-choreographed.ts`**, cut off it the day THE SCUTTLE's
 * carry took that page over its 250-line limit.
 *
 * The seam is the page's own build order, the rule the other overflowing
 * pages carry in their headers: a page at the limit gives its **last** bosses
 * back, never the boss being worked on, whose cases stay with the comment
 * that explains them. THE INSTAR, THE FILAMENT and THE DIASTOLE were the
 * three below THE SCUTTLE, and THE UNDERTOW comes with them because it is not
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
      | `diastole${string}`
      | `undertow${string}`;
  }
>;

export function lateCue(e: LateEvent, cols: number): Cue {
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
    case "antiphonPull":
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
    // THE SPOOL's eleven, bound on this page rather than next door because
    // next door was seventeen lines from its limit when THE SPOOL landed and
    // has not moved since (`bind-spool.ts`).
    case "spoolEnter":
    case "spoolZone":
    case "spoolLeg":
    case "spoolGrip":
    case "spoolLet":
    case "spoolSlip":
    case "spoolRock":
    case "spoolRib":
    case "spoolSlack":
    case "spoolDrift":
    case "spoolOut":
      return spoolCue(e, cols);
    case "haspEnter":
    case "haspLit":
    case "haspGrip":
    case "haspLet":
    case "haspBurn":
    case "haspCool":
    case "haspSeize":
    case "haspFree":
    case "haspOpen":
    case "haspBolt":
    case "haspBoltOut":
    case "haspBoltHit":
    case "haspClear":
    case "haspOut":
      return haspCue(e, cols);
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
      return ratchetCue(e, cols);
    case "diastoleClamp":
    case "diastoleSpasm":
      return diastoleCue(e, cols);
    default:
      return undertowCue(e, cols);
  }
}
