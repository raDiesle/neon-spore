import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { diastoleCue } from "./bind-diastole.js";
import { filamentCue } from "./bind-filament.js";
import { instarCue } from "./bind-instar.js";
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
    type: `instar${string}` | `filament${string}` | `diastole${string}` | `undertow${string}`;
  }
>;

export function lateCue(e: LateEvent, cols: number): Cue {
  switch (e.type) {
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
    default:
      return undertowCue(e, cols);
  }
}
