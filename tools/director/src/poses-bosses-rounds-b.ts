import { scoutLoad } from "@neon-spore/sim";
import { pinballHand } from "./boss-hands-rounds.js";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The rounds' states, the second page** — PINBALL's and THE PULSE's.
 *
 * Cut when PINBALL's three shots took `poses-bosses-rounds.ts` seven lines over
 * its 250-line limit, the way `bosses-clocks-b.ts` was cut off the boss barrel:
 * the seam is the order the rounds were built in and nothing depends on it.
 * `poses-bosses.ts` spreads both pages, so the gallery is one list.
 *
 * PINBALL is the reason there are two pages and the reason the second one will
 * go on growing: it is the first round whose **second** axis of state is posed
 * as well as its clock — `aim`, `power` and `flight`, each waiting on a
 * different thumb, and two of them with a hand on the table since 18 September
 * 2026 (`docs/spec/interludes.md`, PINBALL's *Three shots, three hands*).
 */

const FULL = { crop: "full" as const };

export const ROUND_BOSS_POSES_B: Pose[] = [
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
    "aim",
    "The needle sweeping the arc and nobody having latched it yet. It is player 1's thumb the round is waiting on, and the six and a half seconds of the sweep are what the pair has to talk over.",
    {
      ...FULL,
      hand: pinballHand,
      want: (w) => w.boss?.kind === "pinball" && w.boss.phase === "play" && w.boss.shot === "aim",
      hold: 6,
    },
  ),
  bossPose(
    "pinball",
    "power",
    "The needle latched and the bar running: player 2's moment and strength against player 1's place and direction. A hard launch leaves the spring slack and the bar will not run until he winds it.",
    {
      ...FULL,
      hand: pinballHand,
      want: (w) => w.boss?.kind === "pinball" && w.boss.phase === "play" && w.boss.shot === "power",
      hold: 6,
    },
  ),
  bossPose(
    "pinball",
    "flight",
    "The ball out of their hands: nothing either of them presses reaches it, and the only things left are the cannon getting under it and the one nudge player 2 may shove the table with.",
    {
      ...FULL,
      hand: pinballHand,
      want: (w) =>
        w.boss?.kind === "pinball" && w.boss.phase === "play" && w.boss.shot === "flight",
      hold: 12,
    },
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
    "light",
    "The little ship carrying nothing, which is how every arena opens and how a pair that banks each mote as it takes it flies the whole round. The three verbs and the mouth, and no hand on the picture at all.",
    {
      ...FULL,
      want: (w) =>
        w.boss?.kind === "scout" && w.boss.phase === "play" && scoutLoad(w.cfg, w.boss) === "light",
      hold: 12,
    },
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
