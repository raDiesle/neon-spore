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
    "The ship is upside down and in the wrong colours, the band locked. P1 watches; P2 watches — nothing else.",
    FULL,
  ),
  bossPose(
    "mirror",
    "show",
    "The ship plays back the pair's own moves. P1 counts the steps; P2 counts them with him.",
    {
      ...FULL,
      want: (w) => w.boss?.kind === "mirror" && w.boss.phase === "show" && w.boss.shown > 0,
    },
  ),
  bossPose(
    "mirror",
    "listen",
    "The band is back and the steps must come in order. P1 makes his — cannon, maw, shield; P2 fires hers.",
    { ...FULL, hold: 10 },
  ),
  bossPose(
    "mirror",
    "verdict",
    "The round is called and nobody answered. P1 waits; P2 waits for the next sequence.",
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
    "The field is gone and the wheel arriving. P1 finds the string; P2 reads the route in — no shot yet.",
    FULL,
  ),
  bossPose(
    "maze",
    "read",
    "The wheel is to be read. P1 turns the string until a way in clicks; P2 says whether it is the right one.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "maze",
    "travel",
    "P1 pulls the string until a way in clicks onto a column. P2 fires up it in the heart's colour.",
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
    "The wheel timed out and nothing travelled. P1 lets the string go; P2 holds her fire.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "gauge",
    "lead",
    "The dial arrives where the field was. P1 finds the valve; P2 finds her marks — nothing is turned yet.",
    FULL,
  ),
  bossPose(
    "gauge",
    "play",
    "The needle drifts and the valve is open. P2 calls the mark only she can see; P1 turns the valve to it.",
    { ...FULL, hold: 24 },
  ),
  bossPose(
    "gauge",
    "verdict",
    "Five calls landed: the round is passed. P1 lets the valve go; P2 stops calling.",
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
    "Nothing to do. The passed round holds its picture. P1 waits; P2 waits for the next wave.",
    { ...FULL, hand: gaugeHand, hold: 6 },
  ),
  bossPose(
    "snake",
    "morph",
    "The board arrives over the field. P1 finds the maw; P2 finds the wheel — the snake has not moved.",
    FULL,
  ),
  bossPose(
    "snake",
    "play",
    "The snake runs on the board. P2 turns it at the wall; P1 feeds it with the maw.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "snake",
    "crawl",
    "Three tiles of body and the verbs answer as built. P1 prises the jaws; P2 turns the wheel.",
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
    "The snake is into a wall and the board holds the moment. P1 waits; P2 waits.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "snake",
    "spent",
    "The round is over and only looked at. P1 waits; P2 waits for the next wave.",
    { ...FULL, hold: 12 },
  ),
];
