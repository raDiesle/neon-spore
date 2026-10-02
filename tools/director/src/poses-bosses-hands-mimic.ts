import { mimicHand } from "@neon-spore/hands";
import { GLYPHS, mimicBoss, mimicFiring, type World } from "@neon-spore/sim";
import { POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE MIMIC's states**, posed with a hand on the controls
 * (`boss-hands-mimic.ts`): the slap arrives by itself, and every later phase
 * is reached by drawing the signs before it, the way the pair would.
 *
 * **AUTO answers at once**, so a sign is caught before it is drawn, and the
 * core before it is shot: the hand is held off those two, and the mimicry is
 * a sign drawn wrong on purpose, one on from the right one. The cards are
 * the rig's screen, which is both seats: the sign and the pad on one frame.
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

/** The navigator draws the first sign wrong, a beat into its window, as the one after it. */
function drawsWrong(w: World) {
  const s = mimicBoss(w);
  if (s === null || s.phase !== "sign" || inPhase(w) < TPB) return [];
  const sign = ((s.signs[1] ?? 0) + 1) % GLYPHS.length;
  return [{ player: 2 as const, command: { kind: "glyph" as const, sign } }];
}

/** AUTO with the shot held, so the core stays bare. */
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
    "A sign on the skin, on P1's screen only. P1 says what it is; P2 draws it on the pad over the lower field.",
    { want: into("sign", 1) },
  ),
  bossPose(
    "mimic",
    "mimicking",
    "P2 drew the wrong sign: the skin wears it in red on both screens, then an arm reaches. P1 says the sign again.",
    { hand: drawsWrong, want: into("mimicking", 0.5) },
  ),
  bossPose(
    "mimic",
    "peeled",
    "A sign drawn right peels off, and the mimic flinches, every arm pulled in. P1 and P2 wait for the next.",
    { hand: mimicHand, want: into("peeled", 0), hold: Math.round(TPB / 3) },
  ),
  bossPose(
    "mimic",
    "rolling",
    "Three signs off, the mimic rolls edge-on to turn its other face. Now P2 sees the sign and P1 draws it.",
    { hand: mimicHand, want: into("rolling", 1), budgetBeats: 90 },
  ),
  bossPose(
    "mimic",
    "core",
    "Both halves of a split skin peeled, the core bare between them, lit red. P1 lays the cannon under it; P2 fires.",
    { hand: holdsFire, want: into("core", 1), budgetBeats: 160 },
  ),
  bossPose(
    "mimic",
    "clench",
    "The core shot: the halves clench back over it. P1 and P2 wait for the skin to split again.",
    { hand: mimicHand, budgetBeats: 160 },
  ),
  bossPose(
    "mimic",
    "spent",
    "The second core shot, the mimic shapeless and falling down the field as plain mottle. P1 and P2 are done.",
    { hand: mimicHand, hold: 6, budgetBeats: 220 },
  ),
];
