import type { Wave } from "../wave-types.js";

/**
 * Act three: new mechanics after the first five bosses.
 *
 * It ends on `THE VEIL` because it filled up there — `THE VANE` and the three
 * waves after it are in `act-3b.ts`, in the same order, and `waves.ts`
 * concatenates the acts so nothing about the game moved. Adding one `scene:`
 * line here had cost two rounds of shaving a sentence out of a comment to stay
 * under the 250-line ceiling, which is the warning the limits test exists to
 * give. `waves.ts` says why acts at all.
 */
/**
 * **THE LURE, in three figures.** Written here rather than beside the entries
 * because the director rewrites the array and keeps only what stands above it
 * (`serialize.ts`) — and this is the half of that wave no test can check. A
 * lure costs nothing if it is ignored, so what has to bite is the
 * *column-seconds*: player 1 standing over a body that will never pay while a
 * real one falls somewhere they are not.
 *
 * 1. Beats 0–3, the shape, cheaply. One lure alone, then a real body of the
 *    other colour across the field. There is time to be told and time to
 *    cross, and the pair learns the sentence they will need.
 * 2. Beats 8–9, the twin. A lure wearing a slick and a real slick two columns
 *    apart, one beat apart, the same red. Nothing but the ring tells them
 *    apart, so player 1 cannot guess and has to be told *which* — the moment
 *    the disguise stops being a trick and becomes the mechanic.
 * 3. Beats 14–20, the squeeze. Three cyan bulbs across the left half with the
 *    middle one a lie, then two reds at the far edges. Every beat spent on the
 *    lie is a beat of the run either side, and the field is busy by then.
 *
 * A lure entry names its kind and its colour and nothing else: the body it
 * wears follows from the colour, the way every real arrival's does
 * (`queueFromWave`). Not a shortcut — a lure has to be a correct body in a
 * correct colour or it is not wearing anything, and a cyan slick would be the
 * one tell in this wave that nothing else in the game could produce.
 */
/**
 * **THE VEIL, in three figures.** Here for the reason the block above is: the
 * director rewrites the array and keeps only what stands over it, so a note
 * written between two entries is a note that survives until the next time
 * somebody saves a wave in the editor.
 *
 * What has to bite is not the colour — either colour is one tap — but the
 * *staleness* of it. A veil is easy while the pair has nothing else to say and
 * impossible the moment saying it costs a beat they needed elsewhere.
 *
 * 1. Beats 0–4, the sentence. One cloud alone, then a real cyan body across
 *    the field. The whole descent is available, so the pair finds the two
 *    halves of the call — the body and the beats left — with nothing pressing
 *    them; and the second arrival is there so that *which one* is already a
 *    question the first time it is asked.
 * 2. Beats 10–11, the pair. Two clouds four columns apart. They turn over on
 *    the same beat, because the morph is read off the shared clock rather than
 *    a phase of each body's own — so one count serves both, and what player 1
 *    has to say is two colours and one number rather than two of each.
 * 3. Beats 18–24, the squeeze. A third cloud, a rock in the middle of it and a
 *    red body after that. The rock is the point: the shield's column is player
 *    2's hand and the trigger is player 1's, so the two of them are already
 *    talking about something else when a call expires. A rebuff here costs two
 *    seconds of a body that goes on turning over while it is shut.
 *
 * A veil entry names its kind and *no* colour, and that is not the lure's
 * arrangement with a field left out: what is inside a cloud is rolled when it
 * enters the field (`veilOnSpawn`), because the only thing this game leaves
 * random is what one player knows and the other does not.
 */
/**
 * **THE COUNT, in three figures.** Here for the reason the two blocks above
 * are. The mistake it punishes is firing on sight, and three shut beats are
 * what a shot off zero costs (`sim/countdown.ts`) — so what has to bite is a
 * navigator with a matching colour loaded, a body in the lane, and no
 * permission to pull yet.
 *
 * 1. Beat 0, one body alone, red. Fifteen rows is two zeros, sometimes three,
 *    and the whole descent is there to find the sentence: the pilot counting
 *    down out loud and the navigator firing on the word.
 * 2. Beats 8–10, the cover. A cyan count on the left and an ordinary red slick
 *    on the right two beats later. The slick is the point: it is shot on
 *    sight like every body before this wave, and the count is not — the same
 *    thumb has to do both, and the pilot has to say which lane is which kind.
 * 3. Beats 18–19, two counts a beat apart. Each has a phase of its own
 *    (`countdownOnSpawn`), so the two zeros do not fall together and the
 *    pilot is holding two counts at once — and the navigator two colours.
 *
 * A count entry names its kind and a colour, the throb's arrangement: the
 * colour is the navigator's half of the sentence and is authored; the phase is
 * the pilot's and is rolled, because a phase read off the arrival would be one
 * the navigator could keep unaided.
 */
export const WAVES_ACT_3: Wave[] = [
  {
    id: "theLure",
    name: "THE LURE",
    guide: {
      both: "One of these is not what it looks like. Only one of you can tell.",
      p1: "1. You will see a body worth shooting, and nothing will happen.\n2. Believe your partner and move. Your column is the one you are losing.",
      p2: "1. The one in the corner frame is a lure. Ignore it.\n2. Do not wait for a question. Say its column, then the column to go to.",
      scene: "theLure",
    },
    entries: [
      { beat: 0, col: 2, kind: "lure", color: "cyan" },
      { beat: 3, col: 5, color: "red" },
      { beat: 8, col: 3, kind: "lure", color: "red" },
      { beat: 9, col: 4, color: "red" },
      { beat: 15, col: 2, kind: "lure", color: "cyan" },
      { beat: 16, col: 4, color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theThrob",
    name: "THE THROB",
    guide: {
      both: "Red on one side, cyan on the other, turning clockwise as it falls. The half facing the cannon is the colour that kills it. The other wastes a shot.",
      p1: "Say which colour is facing you, and say it again the moment it turns over.",
      p2: "Fire the colour just called. Not the one you loaded a turn ago.",
      scene: "theThrob",
    },
    entries: [{ beat: 0, col: 3, kind: "throb", color: "red" }],
    controls: "standard5",
  },
  {
    id: "theCount",
    name: "THE COUNT",
    guide: {
      both: "A round body with an eye. Blades close it, one fewer each beat. Shoot only on the beat the eye opens. Any other beat shuts it grey for three beats.",
      p1: "1. You can see the blades.\n2. Count them down out loud: three, two, one, zero.\n3. Say the column with it.",
      p2: "1. Your eye never blinks.\n2. Load the colour and aim the column.\n3. Fire on the word zero. Not on sight, not on your own count.",
    },
    entries: [
      { beat: 0, col: 3, kind: "countdown", color: "red" },
      { beat: 8, col: 1, kind: "countdown", color: "cyan" },
      { beat: 18, col: 2, kind: "countdown", color: "red" },
      { beat: 19, col: 5, kind: "countdown", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theThirdShot",
    name: "THE SHELL",
    guide: {
      both: "A slick or a bulb inside armour, in two pieces, one per column. Any colour chips a piece off. Only when both are gone does its own colour kill it.",
      p1: "1. Two pieces, two columns. Say which one still has armour.\n2. Stand under that one. A shot up the bare column does nothing.",
      p2: "1. Fire any colour while a piece is still on.\n2. When the last one goes, load the colour you could see all along. Not before.",
      scene: "theThirdShot",
    },
    entries: [
      { beat: 0, col: 1, kind: "shell", color: "cyan" },
      { beat: 10, col: 4, kind: "shell", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theClasp",
    name: "THE CLASP",
    guide: {
      both: "A slick or a bulb in a shield of its own. Shots bounce off. Trigger your own shield under it to open it. Then shoot it in its colour.",
      p1: "1. Your strip says where they come in.\n2. Trigger while the shield is under one, and it comes apart.\n3. The shield holds one column, and the rocks want it too.\n4. Say which you spend it on.",
      p2: "1. Put the shield in the column your partner names, and hold it.\n2. Do not fire until the clasp opens. A shot at a shut one does nothing.\n3. The colour shows through, so load it early.",
      scene: "theClasp",
    },
    entries: [
      { beat: 0, col: 3, kind: "clasp", color: "cyan" },
      { beat: 6, col: 1, kind: "clasp", color: "red" },
      { beat: 12, col: 5, kind: "clasp", color: "red" },
      { beat: 20, col: 2, kind: "clasp", color: "cyan" },
      { beat: 28, col: 4, kind: "clasp", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theDart",
    name: "THE DART",
    guide: {
      both: "A dart never falls straight down. Every other beat it jumps two rows down and two columns to one side. In between, it hangs for one beat, already aimed.",
      p1: "1. The column under it is the wrong column.\n2. Wait for the side, then move two columns that way.\n3. Be there before the beat turns over.",
      p2: "1. Only your screen shows the arrow over it.\n2. Say the side while it hangs, not while it moves.\n3. Once it moves, your partner sees it anyway.",
      scene: "theDart",
    },
    entries: [
      { beat: 0, col: 3, kind: "dart", color: "red" },
      { beat: 8, col: 6, kind: "dart", color: "cyan" },
      { beat: 16, col: 1, kind: "dart", color: "red" },
      { beat: 17, col: 5, kind: "dart", color: "cyan" },
      { beat: 26, col: 2, kind: "dart", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theVeil",
    name: "THE VEIL",
    guide: {
      both: "A thundercloud, and something is falling inside it. The lightning is on the beat. Count it.",
      p1: "1. You can see into the cloud. Your partner cannot.\n2. Say the body and how long: “cyan, two beats”.\n3. The ring over it is the clock.",
      p2: "1. You have only a corner frame, so ask.\n2. Fire on what your partner says now, not on what you heard before.\n3. A wrong colour shuts the cloud for two seconds. The answer changes meanwhile.",
      scene: "theVeil",
    },
    entries: [
      { beat: 0, col: 3, kind: "veil", color: null },
      { beat: 10, col: 1, kind: "veil", color: null },
      { beat: 11, col: 5, kind: "veil", color: null },
      { beat: 18, col: 2, kind: "veil", color: null },
      { beat: 24, col: 0, kind: "veil", color: null },
    ],
    controls: "standard5",
  },
];
