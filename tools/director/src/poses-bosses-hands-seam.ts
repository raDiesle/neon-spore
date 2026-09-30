import { type Hand, seamHand } from "@neon-spore/hands";
import { type SeamAsk, seamBoss, seamLitStep, type World } from "@neon-spore/sim";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE SEAM's states**, posed with a hand on the controls
 * (`boss-hands-seam.ts`): the still and the first lit point arrive by
 * themselves, and every later step of the script is reached by answering the
 * ones before it, the way the pair would.
 *
 * **Its second axis is what the lit step asks** (`SEAM_SIGHTS`), each run to
 * on the wave's own script: the grit, the rock, both at once, the blind
 * ridge, the glow, the false point and the dark.
 *
 * **The grit is caught late, on purpose.** The hand shields grit the tick it
 * is thrown, which is right and leaves no frame of grit meeting the shield,
 * so those poses hold the pilot's press until the shards are most of the way
 * down (`late`). The shield still answers the step on the tick it takes it.
 */

/** Whether the ridge has a step lit that asks `ask`. */
function asking(w: World, ask: SeamAsk): boolean {
  const s = seamBoss(w);
  return s !== null && seamLitStep(s)?.ask === ask;
}

/** Ticks the lit step has been lit. */
function litFor(w: World): number {
  const s = seamBoss(w);
  return s === null ? 0 : w.tick - s.litTick;
}

/** The hand, with the pilot's press on the shield held, at a step asking `ask`, until it has been lit `ticks`. */
function late(ask: SeamAsk, ticks: number): Hand {
  return (w) =>
    seamHand(w).filter((c) => c.command.kind !== "guard" || !asking(w, ask) || litFor(w) >= ticks);
}

/** The tick the shield takes the grit: the step just answered and resting, its grit on the shield. */
function tookGrit(w: World, ask: SeamAsk): boolean {
  const s = seamBoss(w);
  return (
    s !== null &&
    s.phase === "rest" &&
    s.steps[s.cursor - 1]?.ask === ask &&
    w.events.some((e) => e.type === "seamBlock")
  );
}

export const SEAM_POSES: Pose[] = [
  bossPose(
    "seam",
    "still",
    "The shelled ridge settles over the middle column, its crack dark. P1 and P2 wait: nothing is lit yet.",
    { hold: 6 },
  ),
  bossPose(
    "seam",
    "lit",
    "A point on the crack lit red under THE SLOW. P1 lays the cannon under it; P2 fires red.",
    { hold: 6 },
  ),
  bossPose(
    "seam",
    "rest",
    "The red point shot and dimmed, the ridge resting before its next step. P1 and P2 wait.",
    { hand: seamHand, hold: 6 },
  ),
  bossPose(
    "seam",
    "grit",
    "Grit thrown from the crack and taken on the shield under the ridge. P2 carries it there; P1 presses it.",
    {
      hand: late("grit", Math.round(TPB * 1.4)),
      want: (w) => tookGrit(w, "grit"),
      budgetBeats: 20,
    },
  ),
  bossPose(
    "seam",
    "rock",
    "A rock spat from the crack, arcing to its column. P1 lays the cannon under it; P2 fires cyan up at it.",
    {
      hand: seamHand,
      want: (w) =>
        asking(w, "rock") && seamBoss(w)?.shot === false && litFor(w) >= Math.round(TPB * 0.8),
      budgetBeats: 90,
      lookAt:
        "the rock in flight — whether it reads as thrown at the hull or as hanging in the air",
    },
  ),
  bossPose(
    "seam",
    "both",
    "Grit and a rock at once. P2 carries the shield under the ridge and fires; P1 lays the cannon, then presses the shield.",
    {
      hand: late("both", Math.round(TPB * 2)),
      want: (w) =>
        asking(w, "both") && seamBoss(w)?.shot === false && litFor(w) >= Math.round(TPB * 0.8),
      budgetBeats: 120,
    },
  ),
  bossPose(
    "seam",
    "blind",
    "The ridge turned face away, throwing grit with the crack out of sight. P2 carries the shield; P1 presses it.",
    {
      hand: late("blind", Math.round(TPB * 2)),
      want: (w) => asking(w, "blind") && litFor(w) >= TPB,
      budgetBeats: 40,
    },
  ),
  bossPose(
    "seam",
    "glow",
    "Heat gathered at one point on the crack. P1 holds the cannon under it; P2 fires either colour until it is quenched.",
    {
      hand: seamHand,
      want: (w) => asking(w, "glow") && seamBoss(w)?.quenched === 1,
      budgetBeats: 100,
    },
  ),
  bossPose(
    "seam",
    "decoy",
    "A false point flickering colourless mid-crack. P1 and P2 send nothing: a bolt into it is a hull hit.",
    { hand: seamHand, want: (w) => asking(w, "decoy") && litFor(w) >= TPB, budgetBeats: 80 },
  ),
  bossPose(
    "seam",
    "dark",
    "The crack dark and still after the last seal. P1 and P2 send nothing; a bolt holds it shut a beat longer.",
    { hand: seamHand, want: (w) => asking(w, "dark") && litFor(w) >= TPB, budgetBeats: 160 },
  ),
  bossPose(
    "seam",
    "split",
    "Every step answered, the sealed ridge splitting open. P1 and P2 are done.",
    { hand: seamHand, hold: 6, budgetBeats: 200 },
  ),
];
