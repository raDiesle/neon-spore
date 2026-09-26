import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { cystCue } from "./bind-cyst.js";
import { davitCue } from "./bind-davit.js";
import { grindstoneCue } from "./bind-grindstone.js";
import { keelCue } from "./bind-keel.js";
import { oculusCue } from "./bind-oculus.js";
import { plumbCue } from "./bind-plumb.js";
import { rimeCue } from "./bind-rime.js";
import { seamCue } from "./bind-seam.js";
import { slingCue } from "./bind-sling.js";
import { trivetCue } from "./bind-trivet.js";
import { undertowCue } from "./bind-undertow.js";
import { valveCue } from "./bind-valve.js";
import { viseCue } from "./bind-vise.js";

/**
 * **The tail of `bind-choreographed-c.ts`**, cut off it the day THE OCULUS
 * came to be bound on a page eight lines from its limit; THE KEEL came over
 * the same day, when its story's eight arrived.
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
      | `undertow${string}`;
  }
>;

export function laterCue(e: LaterEvent, cols: number): Cue {
  switch (e.type) {
    case "keelEnter":
    case "keelLight":
    case "keelLock":
    case "keelMiss":
    case "keelSlip":
    case "keelSplit":
    case "keelSocket":
    case "keelShut":
    case "keelSocketHit":
    case "keelDim":
    case "keelRigid":
    case "keelThrow":
    case "keelRockOut":
    case "keelRockHit":
    case "keelStraight":
    case "keelOut":
    case "keelFlip":
    case "keelArrest":
    case "keelSnap":
    case "keelMarrow":
    case "keelSeal":
    case "keelBurn":
    case "keelCool":
    case "keelFlare":
      return keelCue(e, cols);
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
    case "valveJet":
    case "valveCap":
    case "valveBlow":
    case "valveShudder":
    case "valveBrace":
    case "valveShake":
    case "valveFilm":
    case "valveDry":
    case "valveSmear":
    case "valveStrain":
    case "valveSeal":
    case "valveRough":
      return valveCue(e, cols);
    case "seamEnter":
    case "seamLight":
    case "seamDim":
    case "seamQuench":
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
    case "oculusBlock":
    case "oculusGlance":
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
    case "rimeEnter":
    case "rimeLight":
    case "rimeShave":
    case "rimeClear":
    case "rimeFrost":
    case "rimeBare":
    case "rimeHit":
    case "rimeBlock":
    case "rimeCloud":
    case "rimeMiss":
    case "rimeShatter":
    case "rimeOut":
      return rimeCue(e, cols);
    case "trivetEnter":
    case "trivetLight":
    case "trivetSlip":
    case "trivetPlant":
    case "trivetSpring":
    case "trivetHub":
    case "trivetHit":
    case "trivetBrace":
    case "trivetRock":
    case "trivetMiss":
    case "trivetCollapse":
    case "trivetOut":
      return trivetCue(e, cols);
    case "plumbEnter":
    case "plumbLight":
    case "plumbDrift":
    case "plumbSettle":
    case "plumbSwing":
    case "plumbCore":
    case "plumbHit":
    case "plumbSteady":
    case "plumbDim":
    case "plumbMiss":
    case "plumbFree":
    case "plumbOut":
      return plumbCue(e, cols);
    case "slingEnter":
    case "slingLight":
    case "slingSlack":
    case "slingLoose":
    case "slingSpring":
    case "slingYoke":
    case "slingHit":
    case "slingSteady":
    case "slingDim":
    case "slingMiss":
    case "slingFree":
    case "slingOut":
      return slingCue(e, cols);
    case "grindstoneEnter":
    case "grindstoneLight":
    case "grindstoneShave":
    case "grindstoneClear":
    case "grindstoneRegrit":
    case "grindstoneBite":
    case "grindstoneSlip":
    case "grindstoneClamp":
    case "grindstoneLoose":
    case "grindstoneHit":
    case "grindstoneMiss":
    case "grindstoneFree":
    case "grindstoneOut":
      return grindstoneCue(e, cols);
    case "cystEnter":
    case "cystLight":
    case "cystStill":
    case "cystShudder":
    case "cystSlip":
    case "cystCrack":
    case "cystSpring":
    case "cystBare":
    case "cystHit":
    case "cystGuard":
    case "cystSeal":
    case "cystMiss":
    case "cystSplit":
    case "cystOut":
      return cystCue(e, cols);
    case "davitEnter":
    case "davitLight":
    case "davitDrift":
    case "davitSlack":
    case "davitLoose":
    case "davitSway":
    case "davitPivot":
    case "davitHit":
    case "davitReland":
    case "davitDim":
    case "davitMiss":
    case "davitSpent":
    case "davitOut":
      return davitCue(e, cols);
    default:
      return undertowCue(e, cols);
  }
}
