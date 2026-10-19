import { WAVES } from "@neon-spore/content";
import { swapWarning } from "@neon-spore/sim";
import { fresh, POSE_CONFIG, type Pose, until } from "./pose-kit.js";

/**
 * THE SWAP, a beat before the first warning — `swap:notice` is judged here.
 *
 * The fault trades the two panels every `swapEveryBeats` and warns each change
 * `swapWarnBeats` ahead (`sim/swap.ts`); the slot asks how the ship says the
 * countdown and how one panel turns into the other. The pilot's phone, because
 * the rig never trades. SALVAGE's panel rather than wave 0's, so both halves
 * carry round buttons and a change has controls on it to turn.
 *
 * The period is authored short — eight beats rather than the game's twelve —
 * so one replay holds the whole warning, the change, three quiet beats, the
 * second warning and the change back: both directions, in under ten seconds.
 */

const WAVE = WAVES.findIndex((w) => w.id === "salvage");
const WARN = POSE_CONFIG.swapWarnBeats;
const EVERY = 8;
/** The first change, a whole warning and a beat into the wave. */
const AT = WARN + 2;
const OPEN_ON = AT - WARN;
/** From the beat the pose opens on to two beats after the panels are back. */
const REPLAY_BEATS = AT + EVERY + 2 - OPEN_ON;

export const SWAP_CHANGE_POSE: Pose = {
  name: "SWAP · THE CHANGE",
  note: "The pilot's screen a beat before THE SWAP's countdown. Five beats of warning, the panels change hands, three quiet beats, five more of warning, and they change back.",
  lookAt:
    "the band and the hull just above it — whether the countdown is seen near the thumbs, and whether one panel visibly turns into the other at the change",
  crop: "ship",
  role: "p1",
  cadenceSeconds: (REPLAY_BEATS * 60) / POSE_CONFIG.bpm,
  build: () => {
    const w = fresh([], [], null, { swapEveryBeats: EVERY }, WAVE, [
      { kind: "swap", at: AT, beats: EVERY * 2 },
    ]);
    until(w, "the beat before the warning", (x) => x.waveBeat >= OPEN_ON);
    if (swapWarning(w) > 0) throw new Error("the warning came before the pose opened");
    return w;
  },
};
