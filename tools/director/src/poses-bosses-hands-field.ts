import {
  curtainCoreBare,
  curtainLobesLeft,
  fleetAfloat,
  gorgePhase,
  hiveOpenCount,
  scuttleWinding,
  type World,
} from "@neon-spore/sim";
import { fleetHand } from "./boss-hand-fleet.js";
import {
  curtainHand,
  curtainHandWith,
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
    "flood",
    "P2 aims, P1 fires. A hit holes the hull. P2 holds the plume; P1 rakes the hull.",
    {
      hand: fleetHand,
      hold: TPB,
    },
  ),
  bossPose(
    "fleet",
    "wreck",
    "Hull raked end to end. P1 keeps a thumb on it; P2 drags the wreck down.",
    {
      hand: fleetHand,
      hold: TPB,
    },
  ),
  bossPose(
    "fleet",
    "hunt",
    "One ship sunk. P2 walks the sights past the splashes; P1 fires on the rest.",
    {
      hand: fleetHand,
      want: (w) =>
        w.boss?.kind === "fleet" &&
        w.boss.phase === "hunt" &&
        fleetAfloat(w.boss) < w.boss.ships.length,
      hold: TPB,
    },
  ),
  bossPose(
    "gorge",
    "spitting",
    "Two intakes burst and spitting back. P1 pinches the next one full; P2 fires its own colour into it.",
    { hand: gorgeHand, want: gorgeIs("spitting"), hold: 6 },
  ),
  bossPose(
    "gorge",
    "gorged",
    "The mouth is open and only the beam takes it. P1 aims under it; P2 holds the colour and pries the mouth.",
    { hand: gorgeHand, want: gorgeIs("gorged"), hold: 6, budgetBeats: 80 },
  ),
  bossPose(
    "gorge",
    "out",
    "The beam went through the pried mouth and the gorge is out. P1 aims at the wave again; P2 fires.",
    { hand: gorgeHand, want: gorgeIs("out"), hold: 6, budgetBeats: 80 },
  ),
  bossPose(
    "curtain",
    "soft",
    "One lobe softened and dropped. P1 shoves the fabric off the core; P2 fires any colour into a soft lobe.",
    { hand: curtainHand, want: (w) => w.boss?.kind === "curtain" && curtainLobesLeft(w.boss) < 7 },
  ),
  bossPose(
    "curtain",
    "bare",
    "The fabric is shoved a column off the core. P1 keeps shoving; P2 fires the core's colour up its column.",
    { hand: curtainHand, want: (w) => w.boss?.kind === "curtain" && curtainCoreBare(w, w.boss) },
  ),
  bossPose(
    "curtain",
    "pinned",
    "A hit jammed the rail; no shove moves it. P1 lifts the hem and holds; P2 fires the core's colour.",
    { hand: curtainHand, want: (w) => w.boss?.kind === "curtain" && w.boss.phase === "pinned" },
  ),
  bossPose(
    "curtain",
    "torn",
    "Every lobe gone and the fabric torn. P1 shoves with nothing left to shove; P2 fires at the bare core.",
    {
      hand: curtainHandWith(false),
      want: (w) => w.boss?.kind === "curtain" && w.boss.phase === "torn",
    },
  ),
  bossPose(
    "curtain",
    "out",
    "Three hits on the bare core and the curtain out. P1 aims at the wave again; P2 fires.",
    {
      hand: curtainHand,
      want: (w) => w.boss?.kind === "curtain" && w.boss.phase === "out",
      hold: 6,
    },
  ),
  bossPose(
    "scuttle",
    "winding",
    "One part left, winding in, and only the beam lands. P1 aims at the live socket; P2 holds a thumb on it.",
    {
      hand: scuttleHand,
      want: (w) => w.boss?.kind === "scuttle" && scuttleWinding(w.boss),
      budgetBeats: 80,
    },
  ),
  bossPose(
    "scuttle",
    "down",
    "The beam stood in the live socket and the scuttle is down. P1 aims at the wave again; P2 fires.",
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
    "A breach is spilling and a rock eats any bolt in its column. P1 aims at a clear breach; P2 fires its colour.",
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
