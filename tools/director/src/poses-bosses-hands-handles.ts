import { sinewHeld, sinewSwinging, surgeInBand, surgeSealing, type World } from "@neon-spore/sim";
import {
  filamentHand,
  instarHand,
  sinewHand,
  sinewSnapHand,
  surgeHand,
  surgeHandWith,
} from "./boss-hands-handles.js";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states a handle brings on** — THE SINEW's tendon pulled, THE SURGE's
 * bulb held and let go, THE INSTAR's marks answered — posed the way
 * `poses-bosses-hands-field.ts` poses the field bosses': the boss's wave, a
 * hand on the controls (`boss-hands-handles.ts`), the run held until the
 * state is there. Two states are posed with a hand that plays it *wrong* on
 * purpose, because the state is the fight's answer to that: THE SINEW's
 * snap-back comes of pulling past the zone, THE SURGE's sealing of never
 * letting go.
 */

const F = "full" as const;

const sinew =
  (p: (w: World, s: NonNullable<World["boss"] & { kind: "sinew" }>) => boolean) => (w: World) =>
    w.boss?.kind === "sinew" && p(w, w.boss);
const surge =
  (p: (w: World, s: NonNullable<World["boss"] & { kind: "surge" }>) => boolean) => (w: World) =>
    w.boss?.kind === "surge" && p(w, w.boss);
const instarIn = (phase: string) => (w: World) =>
  w.boss?.kind === "instar" && w.boss.phase === phase;
const filamentIn =
  (phase: string, head = 0) =>
  (w: World) =>
    w.boss?.kind === "filament" && w.boss.phase === phase && w.boss.head >= head;

export const HANDLE_HAND_POSES: Pose[] = [
  bossPose(
    "sinew",
    "held",
    "Both hands on the handles and pulling: the sum of the two on the navigator's band, inside the zone the pilot sees, and the hold counting toward the fibre parting.",
    {
      crop: F,
      hand: sinewHand,
      want: sinew((_, s) => sinewHeld(s, 1) && sinewHeld(s, 2)),
      hold: TPB,
    },
  ),
  bossPose(
    "sinew",
    "swinging",
    "Pulled past the top of the zone and the tendon snapped back: both hands thrown off, the handles swinging where no hand takes hold, and a rock shed from the mass.",
    { crop: F, hand: sinewSnapHand, want: sinew((w, s) => sinewSwinging(s, w)), hold: 6 },
  ),
  bossPose(
    "sinew",
    "falling",
    "The last fibre parted and the mass falling: four beats to the hull, and both hands swaying the one way to walk it a column a beat clear of the ship.",
    {
      crop: F,
      hand: sinewHand,
      want: sinew((_, s) => s.fallBeat >= 0),
      hold: TPB,
      budgetBeats: 120,
    },
  ),
  bossPose(
    "sinew",
    "out",
    "The mass walked three columns from the middle and landed clear: the sinew out, the ship under it untouched, the handles gone slack for good.",
    { crop: F, hand: sinewHand, want: sinew((_, s) => s.outBeat >= 0), hold: 6, budgetBeats: 120 },
  ),
  bossPose(
    "surge",
    "band",
    "Both thumbs on the bulb and the pressure risen into the notch's band: the beat it slows on, and the one both hands have to come off in together.",
    {
      crop: F,
      hand: surgeHand,
      want: surge((w, s) => surgeInBand(s, w.cfg) && (s.heldP1 || s.heldP2)),
      hold: 3,
    },
  ),
  bossPose(
    "surge",
    "sealing",
    "Held past the band and burst: the pressure gone to nought, three gums thrown out of the bulb, and the seam re-sealing for two beats in which no thumb takes hold.",
    { crop: F, hand: surgeHandWith(false), want: surge((w, s) => surgeSealing(s, w)), hold: 6 },
  ),
  bossPose(
    "surge",
    "everting",
    "The fifth notch vented and the bulb turning inside out: five beats of eversion under the slow, with nothing left for a hand to hold.",
    {
      crop: F,
      hand: surgeHand,
      want: surge((_, s) => s.evertBeat >= 0),
      hold: 6,
      budgetBeats: 120,
    },
  ),
  bossPose(
    "surge",
    "out",
    "The eversion finished and the surge out: the seam open the whole way, the bulb gone, the field under it the wave's own again.",
    { crop: F, hand: surgeHand, want: surge((_, s) => s.outBeat >= 0), hold: 6, budgetBeats: 120 },
  ),
  bossPose(
    "instar",
    "land",
    "Every mark of the step answered — the jaw pulled open both ways in the same beats — and the beat landed: the body settling into the pose under the slow before the next morph.",
    { hand: instarHand, want: instarIn("land"), hold: 6 },
  ),
  bossPose(
    "instar",
    "down",
    "The last step landed and the instar down: the lunge answered by both thumbs held on the head, the body spent, three beats before it is gone.",
    { hand: instarHand, want: instarIn("down"), hold: 6, budgetBeats: 150 },
  ),
  bossPose(
    "filament",
    "trace",
    "Both thumbs on the armed filament: the pilot's three tiles up from the free end, lighting the line as it goes, the navigator's a tile behind his on the lit part — the gap between them the one number neither can see whole.",
    { hand: filamentHand, want: filamentIn("trace", 3), hold: 6 },
  ),
  bossPose(
    "filament",
    "pull",
    "The first filament traced end to end — her thumb arriving on his at the root — and pulled out of the body under the slow, the bundle a strand narrower.",
    { hand: filamentHand, want: filamentIn("pull"), hold: 6 },
  ),
  bossPose(
    "filament",
    "down",
    "The seventh filament pulled and the body down: nothing left to draw, three beats before it is gone.",
    { hand: filamentHand, want: filamentIn("down"), hold: 6, budgetBeats: 240 },
  ),
];
