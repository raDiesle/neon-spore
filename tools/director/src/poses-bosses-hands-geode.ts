import { geodeHand } from "@neon-spore/hands";
import { geodeBoss, type World } from "@neon-spore/sim";
import { POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE GEODE's states**, posed with a hand on the controls
 * (`boss-hands-geode.ts`): the stone sinks in by itself, a level runs out and
 * lands when nobody touches it, and every other phase is reached by burning
 * the cracks before it, the way the pair would — THE HYDRA's cards
 * (`poses-bosses-hands-hydra.ts`). The cards are the rig's screen, which is
 * both seats.
 */

/** Whether the geode is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean => {
    const s = geodeBoss(w);
    return s?.phase === phase && (w.beat - s.phaseBeat) * TPB >= beats * TPB;
  };

export const GEODE_POSES = [
  bossPose(
    "geode",
    "enter",
    "A stone as wide as the field sinks in over the ship. P1 and P2 wait: nothing is asked yet.",
    { want: into("enter", 2) },
  ),
  bossPose(
    "geode",
    "crack",
    "A crack glows. P2 says where it runs, P1 says its colour; P1 slides under it, P2 holds the colour.",
    { hand: geodeHand, want: into("crack", 1) },
  ),
  bossPose(
    "geode",
    "split",
    "The beam ran down the crack: the stone breaks in two and the halves fly apart. P1 and P2 wait.",
    { hand: geodeHand, want: into("split", 1), budgetBeats: 80 },
  ),
  bossPose(
    "geode",
    "struck",
    "P1 and P2 burn no crack in time: the stone lands on the hull and the wave is lost.",
    { want: into("struck", 0), budgetBeats: 60 },
  ),
  bossPose(
    "geode",
    "spent",
    "The heart's last crack burnt: the crystal shatters. P1 and P2 let go and watch the shards.",
    { hand: geodeHand, want: into("spent", 1), budgetBeats: 200 },
  ),
];
