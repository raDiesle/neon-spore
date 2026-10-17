import { beatSeconds, livingKindForColor, type SpawnEntry } from "@neon-spore/sim";
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

/** How many beats the two-word replay plays from its first. */
const WORD_PLAYS = 6;

/**
 * **The siren owing a word on each seat, with bodies coming down under it.**
 * A veil gives player 1 COLOUR and a lure wearing a bulb gives player 2 FAKE,
 * so both chips are lit and both words are owed at once; three plain bodies
 * enter beside them, so an answer is seen over the top of the field it would
 * cover. `siren:words` is judged here (17 October 2026): where the help text
 * goes, whose it is, and what it hides.
 */
export const SIREN_WORDS_POSE: Pose = {
  name: "SIREN · A WORD EACH",
  note: "A veil and a lure on the field: player 1 owes COLOUR and player 2 owes FAKE, while three plain bodies come down the top of the field.",
  lookAt:
    "the words under or beside the siren — whose each one is, whether it reads at a glance, and how much of the bodies coming down it hides",
  crop: "field",
  cadenceSeconds: WORD_PLAYS * beatSeconds(POSE_CONFIG),
  build: () => {
    const entries: SpawnEntry[] = [
      { beat: 0, col: 2, kind: "veil", color: "red" },
      { beat: 0, col: 4, kind: "lure", color: "cyan", wears: "bulb" },
      { beat: 1, col: 1, kind: livingKindForColor("cyan"), color: "cyan" },
      { beat: 1, col: 3, kind: livingKindForColor("red"), color: "red" },
      { beat: 2, col: 5, kind: livingKindForColor("red"), color: "red" },
    ];
    const w = fresh(entries);
    run(w, TPB * 2);
    return w;
  },
};
