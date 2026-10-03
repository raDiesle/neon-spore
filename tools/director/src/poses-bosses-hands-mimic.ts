import { mimicHand } from "@neon-spore/hands";
import { mimicBoss, mimicFiring, type World } from "@neon-spore/sim";
import { POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE MIMIC's states**, posed with a hand on the controls
 * (`boss-hands-mimic.ts`): the slap arrives by itself, and every later phase
 * is reached by painting the pictures before it, the way the pair would.
 *
 * **AUTO answers at once**, so a picture is caught before it is painted, and
 * the core before it is tapped: the hand is held off those two, and the
 * mottle is a window let run out on purpose. The cards are the rig's screen,
 * which is both seats: the picture and the board on one frame.
 */

/** Ticks the mimic has been in the phase it is in, in whole beats: the phase starts on one. */
function inPhase(w: World): number {
  const s = mimicBoss(w);
  return s === null ? 0 : (w.beat - s.phaseBeat) * TPB;
}

/** Whether the mimic is in `phase`, `beats` into it. */
const into =
  (phase: string, beats: number) =>
  (w: World): boolean =>
    mimicBoss(w)?.phase === phase && inPhase(w) >= beats * TPB;

/** Nobody paints: the first window runs out. */
const letsRunOut = () => [];

/** AUTO with the tap held, so the core stays bare. */
function holdsFire(w: World) {
  const s = mimicBoss(w);
  return s !== null && mimicFiring(s) ? [] : mimicHand(w);
}

export const MIMIC_POSES = [
  bossPose(
    "mimic",
    "entering",
    "The flat mottle at the top slaps into a round mantle, eight arms out. P1 and P2 wait: nothing is asked yet.",
    { want: into("entering", 2.6) },
  ),
  bossPose(
    "mimic",
    "sign",
    "A picture of tiles, on P1's screen only. P1 says which tiles in which colour; P2 taps them in; both set the brush.",
    { want: into("sign", 1) },
  ),
  bossPose(
    "mimic",
    "mimicking",
    "The window ran out with the picture unpainted: an arm reaches. P1 says it again; P2 taps it in again.",
    { hand: letsRunOut, want: into("mimicking", 0.5), budgetBeats: 60 },
  ),
  bossPose(
    "mimic",
    "peeled",
    "A picture painted exactly peels off, and the mimic flinches, every arm pulled in. P1 and P2 wait for the next.",
    { hand: mimicHand, want: into("peeled", 0), hold: Math.round(TPB / 3) },
  ),
  bossPose(
    "mimic",
    "rolling",
    "Three pictures off, the mimic rolls edge-on to turn its other face. Now P2 sees the picture and P1 paints it.",
    { hand: mimicHand, want: into("rolling", 1), budgetBeats: 90 },
  ),
  bossPose(
    "mimic",
    "core",
    "Both halves peeled, the core bare between them, lit red. P2 sets the brush red; P1 or P2 taps the core.",
    { hand: holdsFire, want: into("core", 1), budgetBeats: 160 },
  ),
  bossPose(
    "mimic",
    "clench",
    "The core tapped: the halves clench back over it. P1 and P2 wait for the board to split again.",
    { hand: mimicHand, budgetBeats: 160 },
  ),
  bossPose(
    "mimic",
    "spent",
    "The second core tapped, the mimic shapeless and falling down the field as plain mottle. P1 and P2 are done.",
    { hand: mimicHand, hold: 6, budgetBeats: 220 },
  ),
];
