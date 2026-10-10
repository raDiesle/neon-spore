import type { SimEvent } from "@neon-spore/sim";
import { balloonCue } from "./bind-balloon.js";
import { beatboxCue } from "./bind-beatbox.js";
import { blisterCue } from "./bind-blister.js";
import { caromCue } from "./bind-carom.js";
import { choirCue } from "./bind-choir.js";
import { clingCue } from "./bind-cling.js";
import { coilCue } from "./bind-coil.js";
import type { Cue } from "./bind-cue.js";
import { fenceCue } from "./bind-fence.js";
import { handedCue } from "./bind-handed.js";
import { volleyCue } from "./bind-volley.js";

/**
 * The creatures whose cues each live in a `bind-*.ts` of their own, cut out
 * the way their events were cut out of `events-creature.ts`, and gathered
 * here so `bind.ts` names one guard rather than an import and a case for each.
 *
 * Cut out of `bind.ts` when THE BLISTER's cue took it to 223 lines: every
 * creature with a cue of its own adds a line here, and the next one now does
 * not move that file. `cueFor` reaches this through `isFieldEvent`, never a
 * `default`, for `bind-creatures.ts`' reason — the guard narrows the switch
 * there as the cases did, so a new event is still a compile error, and a
 * family named in the list below and missing from the switch is one here.
 */
const FIELD_EVENTS = [
  "coilBreak",
  "coilJump",
  "choirArm",
  "choirMerge",
  "choirOpen",
  "choirSing",
  "balloonSplit",
  "balloonPop",
  "balloonTopped",
  "clingGrip",
  "clingFreed",
  "clingBlast",
  "weightCrushed",
  "cairnPulled",
  "cairnShed",
  "cairnHeld",
  "caromBounce",
  "caromCrack",
  "caromEject",
  "chuteOpen",
  "chuteCut",
  "crystalBounce",
  "crystalCatch",
  "crystalSplit",
  "beatboxTap",
  "beatboxWave",
  "beatboxSilent",
  "blisterBlow",
  "fencePass",
  "fenceBurn",
  "volleyReturn",
  "volleyHatch",
  "shieldPush",
] as const;
type FieldEvent = Extract<SimEvent, { type: (typeof FIELD_EVENTS)[number] }>;

/** The family, so `cueFor` reads one guard rather than 34 cases. */
export function isFieldEvent(e: SimEvent): e is FieldEvent {
  return (FIELD_EVENTS as readonly string[]).includes(e.type);
}

export function fieldCue(e: FieldEvent, cols: number, rows: number): Cue | null {
  switch (e.type) {
    case "coilBreak":
    case "coilJump":
      return coilCue(e, cols, rows);
    case "choirArm":
    case "choirMerge":
    case "choirOpen":
    case "choirSing":
      return choirCue(e, cols, rows);
    case "balloonSplit":
    case "balloonPop":
    case "balloonTopped":
      return balloonCue(e, cols, rows);
    case "clingGrip":
    case "clingFreed":
    case "clingBlast":
      return clingCue(e, cols);
    // The four a hand answers, in `bind-handed.ts` — about a thumb, not a shot.
    case "weightCrushed":
    case "cairnPulled":
    case "cairnShed":
    case "cairnHeld":
      return handedCue(e, cols, rows);
    case "caromBounce":
    case "caromCrack":
    case "caromEject":
    case "chuteOpen":
    case "chuteCut":
    case "crystalBounce":
    case "crystalCatch":
    case "crystalSplit":
      return caromCue(e, cols, rows);
    // THE BEATBOX's three, in `bind-beatbox.ts` — about a rhythm, not a shot.
    case "beatboxTap":
    case "beatboxWave":
    case "beatboxSilent":
      return beatboxCue(e, cols, rows);
    case "blisterBlow":
      return blisterCue(e, cols);
    case "fencePass":
    case "fenceBurn":
      return fenceCue(e, cols, rows);
    case "volleyReturn":
    case "volleyHatch":
    case "shieldPush":
      return volleyCue(e, cols, rows);
  }
}
