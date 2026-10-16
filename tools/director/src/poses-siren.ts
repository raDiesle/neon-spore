import { beatSeconds, type SpawnEntry } from "@neon-spore/sim";
import { fresh, POSE_CONFIG, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/** The beat the torch is written on: its warning comes on `radarLead` beats
 * before, so the first stretch of the replay is the plain call alone. */
const TORCH_BEAT = 10;
/** How many beats the replay plays from its first. */
const PLAYS = 9;

/**
 * **The siren through both of its lit states**, one after the other: a veil on
 * the field lights it for player 1 to talk (a plain call), and a torch written
 * nine beats later turns it into the alarm once its warning comes on the
 * strip. `siren:look` is judged here (16 October 2026): every answer on it
 * draws both states, and the owner asked for alternatives for both. Cadenced,
 * because the change from one to the other is half the question.
 */
export const SIREN_STATES_POSE: Pose = {
  name: "SIREN · A CALL, THEN A TORCH",
  note: "A veil on the field lights the siren for a plain call; a few beats on, a torch's warning comes up on player 1's strip and the siren goes to its alarm.",
  lookAt:
    "the siren at the top of the screen — whether a call and a torch read as two different alarms from across a table",
  crop: "field",
  cadenceSeconds: PLAYS * beatSeconds(POSE_CONFIG),
  build: () => {
    const entries: SpawnEntry[] = [
      { beat: 0, col: 2, kind: "veil", color: "red" },
      { beat: TORCH_BEAT, col: 5, kind: "torch", color: null },
    ];
    const w = fresh(entries);
    run(w, TPB);
    return w;
  },
};
