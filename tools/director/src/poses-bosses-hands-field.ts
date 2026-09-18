import {
  curtainCoreBare,
  curtainLobesLeft,
  fleetAfloat,
  gorgePhase,
  hiveOpenCount,
  scuttleWinding,
  type World,
} from "@neon-spore/sim";
import {
  curtainHand,
  curtainHandWith,
  fleetHand,
  gorgeHand,
  hiveHand,
  scuttleHand,
} from "./boss-hands-field.js";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states the pair's hands bring on the bosses of the field** — THE
 * FLEET's chart, THE GORGE's mouth, THE CURTAIN's fabric, THE SCUTTLE's last
 * part, THE HIVE's spill — posed the way `poses-bosses-hands-shots.ts` poses
 * the shot bosses': the boss's wave, a hand on the controls
 * (`boss-hands-field.ts`), the run held until the state is there.
 *
 * THE HIVE's `down` is not here: a breach that has spilled once cannot be
 * sealed — its column carries a rock every three rows and a bolt is lost on
 * one, the beam stopped by one — so the hand seals the cells that open on a
 * clear beat and no more (`docs/queue.md`, the HIVE item). Until the sim
 * answers that, `test/boss-states.test.ts` still owes it.
 */

export const FIELD_HAND_POSES: Pose[] = [
  bossPose(
    "fleet",
    "struck",
    "The first shell on a ship: the sights were opened over one, the pilot's salvo went where they stood, and the chart marks the hit while the ship is still afloat.",
    {
      hand: fleetHand,
      want: (w) =>
        w.boss?.kind === "fleet" &&
        w.boss.struck.length > 0 &&
        fleetAfloat(w.boss) === w.boss.ships.length,
      hold: TPB,
    },
  ),
  bossPose(
    "fleet",
    "sunk",
    "A ship struck along its whole length and gone under: the navigator walked the sights a square a press past each splash, the pilot fired the salvo on every rest.",
    {
      hand: fleetHand,
      want: (w) => w.boss?.kind === "fleet" && fleetAfloat(w.boss) < w.boss.ships.length,
      hold: TPB,
    },
  ),
  bossPose(
    "gorge",
    "spitting",
    "Two intakes fed full and ruptured, and the gorge spitting them back: the feeding goes on through it, from the outer intakes in, each in its own colour.",
    { hand: gorgeHand, want: gorgeIs("spitting"), hold: 6 },
  ),
  bossPose(
    "gorge",
    "gorged",
    "Enough intakes ruptured that the mouth is open: only the beam takes it, in the mouth's own colour, under the navigator's pry on the mouth — his other thumb over the colour.",
    { hand: gorgeHand, want: gorgeIs("gorged"), hold: 6, budgetBeats: 80 },
  ),
  bossPose(
    "gorge",
    "out",
    "The beam through the pried mouth in its colour, and the gorge out: every intake spent, the field under it the wave's own again.",
    { hand: gorgeHand, want: gorgeIs("out"), hold: 6, budgetBeats: 80 },
  ),
  bossPose(
    "curtain",
    "soft",
    "One lobe softened and taken: any colour into a soft lobe drops it, and the fabric hangs a lobe shorter over the core it is there to cover.",
    { hand: curtainHand, want: (w) => w.boss?.kind === "curtain" && curtainLobesLeft(w.boss) < 7 },
  ),
  bossPose(
    "curtain",
    "bare",
    "The pilot's shove has carried the fabric a column off the core: the core's column is uncovered and its own colour up it counts — a wrong one lights a torch.",
    { hand: curtainHand, want: (w) => w.boss?.kind === "curtain" && curtainCoreBare(w, w.boss) },
  ),
  bossPose(
    "curtain",
    "torn",
    "Every lobe shot off and the pilot still shoving: a shove with nothing left to shove tears the fabric, and the core hangs naked from here on.",
    {
      hand: curtainHandWith(false),
      want: (w) => w.boss?.kind === "curtain" && w.boss.tornBeat >= 0,
    },
  ),
  bossPose(
    "curtain",
    "out",
    "Three of the core's colour up the bare core, a lobe dropped with each, and the core out: the fabric gone and the wave running on under where it hung.",
    { hand: curtainHand, want: (w) => w.boss?.kind === "curtain" && w.boss.outBeat >= 0, hold: 6 },
  ),
  bossPose(
    "scuttle",
    "winding",
    "Every part but one shot off its socket, and the last winding back in: nothing single lands now, and the navigator's thumb is down over the live socket for the beam.",
    {
      hand: scuttleHand,
      want: (w) => w.boss?.kind === "scuttle" && scuttleWinding(w.boss),
      budgetBeats: 80,
    },
  ),
  bossPose(
    "scuttle",
    "down",
    "The beam standing in the live socket's column as the last part winds in, and the scuttle down: every socket empty, nothing left to throw.",
    {
      hand: scuttleHand,
      want: (w) => w.boss?.kind === "scuttle" && w.boss.downBeat >= 0,
      hold: 6,
      budgetBeats: 80,
    },
  ),
  bossPose(
    "hive",
    "spilling",
    "An open breach on its spill beat: a rock out of it at the top of its column, and a bolt sent up that column now is lost on it — the hand takes another cell.",
    {
      hand: hiveHand,
      want: (w) =>
        w.boss?.kind === "hive" && hiveOpenCount(w.boss) > 0 && w.boss.spillBeat === w.beat,
      hold: 4,
    },
  ),
];

/** THE GORGE in one of its named phases. */
function gorgeIs(phase: string): (w: World) => boolean {
  return (w) => w.boss?.kind === "gorge" && gorgePhase(w.boss, w.cfg) === phase;
}
