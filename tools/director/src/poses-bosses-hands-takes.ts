import { repriseEchoing, repriseHeld, spliceRound, type World } from "@neon-spore/sim";
import {
  antiphonHand,
  antiphonPullHand,
  cairnHand,
  cairnHoldHand,
  spliceHand,
  undertowHand,
} from "./boss-hands-takes.js";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states a taking brings on** — a rock out of THE CAIRN, the same pile
 * held so that none comes out of it, a number down
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
    "held",
    "A thumb resting on the pile and its clock stopped: it lets none go while it is held. P1 rests a hand on it; P2 waits.",
    { crop: F, hand: cairnHoldHand, want: sent("cairnHeld"), hold: TPB },
  ),
  bossPose(
    "cairn",
    "leaving",
    "The right-hand pair of columns comes away as a rock. P1 carries a hand across the pile; P2 waits.",
    { crop: F, hand: cairnHand, want: sent("cairnPulled"), hold: TPB },
  ),
  bossPose(
    "cairn",
    "settled",
    "Eight beats with no hand on it and the pile sheds one itself. P1 waits; P2 counts the shed.",
    { crop: F, want: sent("cairnShed"), hold: TPB },
  ),
  bossPose(
    "splice",
    "verdict",
    "The wanted number came down its straw. P1 opens the maw under its entrance; P2 reads the next off the tangle.",
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
    "Every number fed in order and the round is passed. P1 waits; P2 waits four beats for the next straws.",
    { crop: F, hand: spliceHand, want: spliceIs((s) => s.passBeat !== -1), hold: TPB * 2 },
  ),
  bossPose(
    "reprise",
    "echoing",
    "The stretch just past comes down again, undrawn. P1 aims as he did the first time; P2 fires the same.",
    { crop: F, want: (w) => repriseEchoing(w), hold: TPB * 2 },
  ),
  bossPose(
    "reprise",
    "held",
    "The echo ran out and the wave takes up where it stopped. P1 aims; P2 fires — nothing was skipped.",
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
    "The maw held open under the last lobe and it is swallowed. P1 holds the maw there; P2 waits it out.",
    {
      hand: undertowHand,
      want: (w) => w.boss?.kind === "undertow" && w.boss.phase === "taken",
      hold: TPB * 2,
      budgetBeats: 190,
    },
  ),
  bossPose(
    "antiphon",
    "pulled",
    "A candidate crossed off the rail. P2 drags one she is sure is wrong off it; P1 waits on the organ he can see.",
    {
      crop: F,
      hand: antiphonPullHand,
      want: (w) => w.boss?.kind === "antiphon" && w.boss.crossed.length > 0,
      hold: 6,
      budgetBeats: 100,
    },
  ),
  bossPose(
    "antiphon",
    "still",
    "The sixth organ pitted and the surface still. P1 aims where the last shape will push out; P2 waits.",
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
    "Their own ship fired at up its column and the antiphon is down. P1 aims at it; P2 fires its colour.",
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
