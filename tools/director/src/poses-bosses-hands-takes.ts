import { repriseEchoing, repriseHeld, spliceRound, type World } from "@neon-spore/sim";
import { antiphonHand, cairnHand, spliceHand, undertowHand } from "./boss-hands-takes.js";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states a taking brings on** — a rock out of THE CAIRN, a number down
 * THE SPLICE's straw, the last lobe held in THE UNDERTOW's maw, THE
 * ANTIPHON's organs pitted and its ship shot — posed the way
 * `poses-bosses-hands-field.ts` poses the field bosses': the boss's wave, a
 * hand on the controls (`boss-hands-takes.ts`), the run held until the state
 * is there. THE REPRISE's two are here as well and want no hand: the echo
 * and the beats it holds the wave for are its own clock, and what the pair
 * does during one is ward from memory.
 */

const F = "full" as const;

/** A tick just stepped sent this event: the state's own first flash. */
const sent = (type: string) => (w: World) => w.events.some((e) => e.type === type);

export const TAKE_HAND_POSES: Pose[] = [
  bossPose(
    "cairn",
    "leaving",
    "A hand carried across the pile and the right-hand pair of columns coming away as a two-tile rock: the first unit gone, six standing, and the pile's own count restarted.",
    { crop: F, hand: cairnHand, want: sent("cairnPulled"), hold: TPB },
  ),
  bossPose(
    "cairn",
    "settled",
    "The pile stood still eight beats with no hand on it and letting one go by itself, down the column it settles on: the shed the pair is counting against.",
    { crop: F, want: sent("cairnShed"), hold: TPB },
  ),
  bossPose(
    "splice",
    "verdict",
    "The wanted number sucked down its straw and arrived: the verdict lit at the entrance it came out of, and the count of fed numbers one higher.",
    {
      crop: F,
      hand: spliceHand,
      want: spliceIs((s) => s.verdictBeat >= 0 && s.verdict === 1),
      hold: 6,
    },
  ),
  bossPose(
    "splice",
    "passed",
    "Every number fed in order and the round passed: the tangle settling for its four beats before the next round's straws are laid.",
    { crop: F, hand: spliceHand, want: spliceIs((s) => s.passBeat !== -1), hold: TPB * 2 },
  ),
  bossPose(
    "reprise",
    "echoing",
    "The stretch that has just come down sent again with nothing drawn — the same kinds in the same columns at the same spacing — and the wave's own arrivals standing still while it plays.",
    { crop: F, want: (w) => repriseEchoing(w), hold: TPB * 2 },
  ),
  bossPose(
    "reprise",
    "held",
    "The echo run out and the wave taking up again where it stopped: its clock behind by every beat spent inside an echo, so the script was paused, never played over.",
    {
      crop: F,
      want: (w) => !repriseEchoing(w) && repriseHeld(w) > 0,
      hold: TPB * 2,
      budgetBeats: 100,
    },
  ),
  bossPose(
    "undertow",
    "taken",
    "The maw held open under the last lobe for the beats it takes, and the lobe swallowed: the seams going dark, the floor still, the undertow taken.",
    {
      hand: undertowHand,
      want: (w) => w.boss?.kind === "undertow" && w.boss.phase === "taken",
      hold: TPB * 2,
      budgetBeats: 150,
    },
  ),
  bossPose(
    "antiphon",
    "still",
    "The sixth organ pitted and the surface gone still: no organ up, no rail, the four beats' quiet before the last shape pushes out — their own ship.",
    {
      crop: F,
      hand: antiphonHand,
      want: (w) => w.boss?.kind === "antiphon" && w.boss.stillBeat >= 0 && w.boss.downBeat < 0,
      hold: 6,
      budgetBeats: 100,
    },
  ),
  bossPose(
    "antiphon",
    "down",
    "The ship fired at up its column in its colour, and the antiphon down: the surface bursting where it stood, the pits it was described in the record.",
    {
      crop: F,
      hand: antiphonHand,
      want: (w) => w.boss?.kind === "antiphon" && w.boss.downBeat >= 0,
      hold: 6,
      budgetBeats: 100,
    },
  ),
];

/** THE SPLICE, read by its round's state. */
function spliceIs(p: (s: NonNullable<ReturnType<typeof spliceRound>>) => boolean) {
  return (w: World) => {
    const s = spliceRound(w);
    return s !== null && p(s);
  };
}
