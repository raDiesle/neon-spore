import { nettleHand } from "@neon-spore/hands";
import type { World } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE NETTLE's four states**, THE INSTAR's four (`poses-bosses-clocks.ts`,
 * `poses-bosses-hands-handles.ts`) on a jellyfish: the morph and the first
 * window arrive by themselves, the landing and the fall are earned by the
 * hand that answers every mark (`boss-hands-scene.ts`) — the thumbs on the
 * body and the panel under a SHOOT, SHIELD or SUCK mark.
 */

const nettleIn = (phase: string) => (w: World) =>
  w.boss?.kind === "nettle" && w.boss.phase === phase;

export const NETTLE_POSES: Pose[] = [
  bossPose(
    "nettle",
    "morph",
    "The jellyfish drifts in with its marks hidden. P1 and P2 both wait for the rings.",
    { hold: 6 },
  ),
  bossPose(
    "nettle",
    "act",
    "The rings are up and closing. P1 pulls the left arm up off the ship; P2 pulls the right.",
    { hold: 6 },
  ),
  bossPose(
    "nettle",
    "land",
    "Every mark of the step answered and the beat landed. P1 lets go of the arm; P2 lets go too.",
    { hand: nettleHand, want: nettleIn("land"), hold: 6 },
  ),
  bossPose(
    "nettle",
    "down",
    "The core shot out and the jellyfish sinks away. P1 and P2 are done.",
    { hand: nettleHand, want: nettleIn("down"), hold: 6, budgetBeats: 200 },
  ),
];
