import { gaugeRound, snakeGrip } from "@neon-spore/sim";
import { gaugeHand, mazeHand, mirrorHand } from "./boss-hands-rounds.js";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The rounds' states** — the bosses that take the field away and hand the
 * pair a screen of their own (`docs/spec/interludes.md`), posed at every
 * phase their clock reaches on its own.
 *
 * A round's phases are choreography: a lead-in so two screens that have just
 * stopped being the field can be read, the play, a verdict, and `spent`, the
 * picture held until the next wave. Most of those arrive with nobody
 * pressing anything — a round nobody plays is lost, and a lost round still
 * shows its verdict — so most poses here send no commands and the frame is
 * what the pair sees when they freeze. The states a round only reaches when
 * it is *played* — THE MAZE's `travel`, THE GAUGE's `verdict` and `spent` —
 * are posed with a hand on the round's controls (`boss-hands-rounds.ts`).
 */

const FULL = { crop: "full" as const };

export const ROUND_BOSS_POSES: Pose[] = [
  bossPose(
    "mirror",
    "lead",
    "The beat or two of quiet before a sequence: the ship gone upside down and into the wrong colours, the band locked, nothing shown yet. The pair learns the boss is their own ship.",
    FULL,
  ),
  bossPose(
    "mirror",
    "show",
    "The ship performs a sequence of the pair's own moves with the band locked. Watching is the only thing either player can do, which is the fight.",
    {
      ...FULL,
      want: (w) => w.boss?.kind === "mirror" && w.boss.phase === "show" && w.boss.shown > 0,
    },
  ),
  bossPose(
    "mirror",
    "listen",
    "The band is back and the row above it says how much of the sequence has been answered. The steps are controls, drawn as the same buttons the band draws.",
    { ...FULL, hold: 10 },
  ),
  bossPose(
    "mirror",
    "verdict",
    "The pause that shows how the round went. Nobody answered here, so it is the lost verdict, with the reason — the pair can fail three ways and only one is the wrong button.",
    { ...FULL, hold: 6 },
  ),
  bossPose("mirror", "hold", "P1: thumb on its cannon. P2: thumb on its shield. Both, and hold.", {
    ...FULL,
    hand: mirrorHand,
    // Two beats into the count, so the dial is half drained and not yet the fall.
    want: (w) =>
      w.boss?.kind === "mirror" && w.boss.holdThumbs === 3 && w.beat - w.boss.holdBeat >= 2,
  }),
  bossPose(
    "maze",
    "lead",
    "The field gone and the wheel arriving: the beats in which two screens that have just stopped being the field can be read before anything is asked.",
    FULL,
  ),
  bossPose(
    "maze",
    "read",
    "The wheel to read. One seat sees the lattice and the other the way in; a shot cannot be sent until the two have agreed on which arm it goes down.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "maze",
    "travel",
    "P1: pull the string until the way in clicks onto a column. P2: fire up that column in the heart's colour. The shot walks the route.",
    { ...FULL, hand: mazeHand, hold: TPB * 2 },
  ),
  bossPose("maze", "grip", "P1: hand on the string. P2: pull the heart down.", {
    ...FULL,
    hand: mazeHand,
    hold: TPB,
  }),
  bossPose(
    "maze",
    "verdict",
    "The verdict stands. No shot went down here, so it is the wheel timed out — the round lost with nothing travelled, which the ship pays for when it settles.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "gauge",
    "lead",
    "The dial arriving over where the field was: the lead-in, so a needle and a valve on two different screens can be read before either is worked.",
    FULL,
  ),
  bossPose(
    "gauge",
    "play",
    "The needle drifting and the valve open to be worked: one seat reads the mark the needle must be held to, the other holds it there, and the call is what passes between them.",
    { ...FULL, hold: 24 },
  ),
  bossPose(
    "gauge",
    "verdict",
    "P1: turn the valve toward the mark P2 calls out. P2: call when the needle sits between the marks. Five calls landed: passed.",
    {
      ...FULL,
      hand: gaugeHand,
      want: (w) => gaugeRound(w)?.phase === "verdict" && gaugeRound(w)?.passed === true,
      hold: 6,
    },
  ),
  bossPose(
    "gauge",
    "spent",
    "Nothing to do. The passed round holds its picture until the next wave.",
    { ...FULL, hand: gaugeHand, hold: 6 },
  ),
  bossPose(
    "snake",
    "morph",
    "The table arriving over the field — a picture rather than a rule, and a phase because the pair needs beats to read a screen that has stopped being the field.",
    FULL,
  ),
  bossPose(
    "snake",
    "play",
    "The snake running on the board, turned by one seat and fed by the other's shot. Nobody turns it here, so it runs straight at the wall.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "snake",
    "crawl",
    "The body as a round opens it: three tiles, and the four verbs answering as they were built. The jaws still open on a press, and the tail is short enough to be nobody's problem.",
    {
      ...FULL,
      want: (w) =>
        w.boss?.kind === "snake" && w.boss.phase === "play" && snakeGrip(w.cfg, w.boss) === "crawl",
      hold: 12,
    },
  ),
  bossPose(
    "snake",
    "verdict",
    "The crash: the snake into a wall and the board holding the moment. The verdict beats show what happened before the round is put away.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "snake",
    "spent",
    "The round is over and only being looked at. It stays installed so the picture holds until the next wave replaces it, rather than dropping back to an empty field.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "pinball",
    "morph",
    "The table arriving over the field: bumpers, flippers and the cannon becoming the plunger, in the beats the pair has to read a screen that has stopped being the field.",
    FULL,
  ),
  bossPose(
    "pinball",
    "play",
    "The table live, the same on both screens by the owner's word: one seat sets the angle, the other the power, and the shot is what the two agree on. Nothing is set here, so the ball never leaves.",
    { ...FULL, hold: 24 },
  ),
  bossPose(
    "pinball",
    "verdict",
    "The round called: every ball dropped or the clock run out, and the table holding the score while the verdict beats show it.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "pinball",
    "spent",
    "The table over, only being looked at, held until the next wave replaces it.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "pulse",
    "count",
    "The beats before the first step: the lanes drawn, the meter at nothing, and the count the pair gets to look at a screen that has just stopped being the field.",
    FULL,
  ),
  bossPose(
    "pulse",
    "play",
    "Steps coming down both seats' lanes on the beat, one meter for the two of them, and every step missed falling into the ship like a rock does.",
    { ...FULL, hold: 24 },
  ),
  bossPose(
    "pulse",
    "verdict",
    "The stage called: the meter where the two of them left it, held for the verdict beats. Nobody stepped here, so the meter never rose.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "pulse",
    "spent",
    "The stage over and only being looked at, held until the next wave replaces it.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "scout",
    "lead",
    "The arena arriving: the beats in which the two screens can be read — one sees the scout, the other the burning it is steered away from.",
    FULL,
  ),
  bossPose(
    "scout",
    "play",
    "The scout under way in the arena, steered by one seat on what the other seat can see. Nobody steers here, so it flies straight.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "scout",
    "verdict",
    "Caught, or through: the arena holding the moment the run ended for the verdict beats.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "scout",
    "spent",
    "The arena over and only being looked at, held until the next wave replaces it.",
    { ...FULL, hold: 12 },
  ),
];
