import {
  sinewCaught,
  sinewHeld,
  sinewSwinging,
  surgeInBand,
  surgeSealing,
  surgeWarding,
  type World,
} from "@neon-spore/sim";
import { gimbalHand } from "./boss-hands-gimbal.js";
import {
  filamentHand,
  instarHand,
  sinewCatchHand,
  sinewHand,
  sinewSnapHand,
  surgeHand,
  surgeHandWith,
} from "./boss-hands-handles.js";
import { haspHand } from "./boss-hands-hasp.js";
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
 * letting go. A third is posed with a hand that plays the *answer* to one of
 * those: the catch is reached by snapping the tendon first and then taking
 * both handles back mid-whip, so its card is a wrong pull and a right
 * recovery in one run.
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
const gimbalIn = (phase: string) => (w: World) =>
  w.boss?.kind === "gimbal" && w.boss.phase === phase;
const filamentIn =
  (phase: string, head = 0) =>
  (w: World) =>
    w.boss?.kind === "filament" && w.boss.phase === phase && w.boss.head >= head;

export const HANDLE_HAND_POSES: Pose[] = [
  bossPose(
    "sinew",
    "held",
    "Both hands pull and the sum sits in the zone. P1 carries half of it; P2 carries the other half.",
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
    "Pulled past the zone and the tendon snapped back. P1 lets go; P2 lets go, and both take hold again.",
    { crop: F, hand: sinewSnapHand, want: sinew((w, s) => sinewSwinging(s, w)), hold: 6 },
  ),
  bossPose(
    "sinew",
    "caught",
    "The swinging tendon caught before it settled. P1 carries his handle left; P2 carries hers right.",
    {
      crop: F,
      hand: sinewCatchHand,
      want: sinew((w, s) => sinewCaught(s, w.cfg, w.beat)),
      hold: 6,
    },
  ),
  bossPose(
    "sinew",
    "falling",
    "The last fibre parted and the mass falls. P1 sways one way; P2 sways the same way, a column a beat.",
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
    "The mass landed three columns clear of the ship. P1 lets go of his handle; P2 lets go of hers.",
    { crop: F, hand: sinewHand, want: sinew((_, s) => s.outBeat >= 0), hold: 6, budgetBeats: 120 },
  ),
  bossPose(
    "surge",
    "band",
    "The pressure has risen into the notch's band. P1 lifts his thumb; P2 lifts hers on the same tick.",
    {
      crop: F,
      hand: surgeHand,
      want: surge((w, s) => surgeInBand(s, w.cfg) && (s.heldP1 || s.heldP2)),
      hold: 3,
    },
  ),
  bossPose(
    "surge",
    "warding",
    "A rock spat out of the bulb with both thumbs on it. P1 wards it with his other thumb; P2 holds on.",
    {
      crop: F,
      hand: surgeHand,
      want: surge((w, s) => surgeWarding(s, w)),
      hold: 3,
      budgetBeats: 120,
    },
  ),
  bossPose(
    "surge",
    "sealing",
    "Held past the band and burst, with three gums thrown out. P1 keeps off the seam; P2 keeps off it too.",
    { crop: F, hand: surgeHandWith(false), want: surge((w, s) => surgeSealing(s, w)), hold: 6 },
  ),
  bossPose(
    "surge",
    "everting",
    "The fifth notch vented and the bulb turns inside out. P1 waits; P2 waits — no handle is left.",
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
    "The eversion is done and the surge out. P1 aims at the wave again; P2 fires.",
    { crop: F, hand: surgeHand, want: surge((_, s) => s.outBeat >= 0), hold: 6, budgetBeats: 120 },
  ),
  bossPose(
    "instar",
    "land",
    "Every mark of the step answered and the beat landed. P1 pulls his side of the jaw; P2 pulls hers.",
    { hand: instarHand, want: instarIn("land"), hold: 6 },
  ),
  bossPose(
    "instar",
    "down",
    "The last step landed and the instar is down. P1 holds a thumb on the head; P2 holds one too.",
    { hand: instarHand, want: instarIn("down"), hold: 6, budgetBeats: 150 },
  ),
  bossPose(
    "filament",
    "trace",
    "Both thumbs on the armed filament. P1 carries the lit end up a tile a beat; P2 follows a tile behind.",
    { hand: filamentHand, want: filamentIn("trace", 3), hold: 6 },
  ),
  bossPose(
    "filament",
    "pull",
    "Her thumb met his at the root and the strand pulls out. P1 holds the lit end; P2 holds the root.",
    { hand: filamentHand, want: filamentIn("pull"), hold: 6 },
  ),
  bossPose(
    "filament",
    "down",
    "The seventh filament pulled and the body is down. P1 aims at the wave again; P2 fires.",
    { hand: filamentHand, want: filamentIn("down"), hold: 6, budgetBeats: 240 },
  ),
  bossPose(
    "gimbal",
    "shear",
    "Both rings sat true together and a latch-tooth is off each. P1 and P2 hold what they have.",
    { hand: gimbalHand, want: gimbalIn("shear"), hold: 6, budgetBeats: 240 },
  ),
  bossPose(
    "gimbal",
    "open",
    "The last teeth gone: both rings spin free and the drum splits. P1 aims at the seam; P2 fires.",
    { hand: gimbalHand, want: gimbalIn("open"), hold: 6, budgetBeats: 480 },
  ),
  bossPose(
    "hasp",
    "swing",
    "A clasp wound off and swinging away. P1's latch is cool again; P2's wheel is a fresh circle.",
    { hand: haspHand, hold: 6, budgetBeats: 240 },
  ),
  bossPose(
    "hasp",
    "clear",
    "All three clasps gone and the door standing open. P1 and P2 are done; the passage behind lights.",
    { hand: haspHand, hold: 6, budgetBeats: 480 },
  ),
];
