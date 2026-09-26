import { pinballHand, scoutHand } from "@neon-spore/hands";
import { pulseHeart, scoutLoad } from "@neon-spore/sim";
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
    "The table arrives: bumpers, flippers, the cannon a plunger. P1 finds the needle; P2 finds the bar.",
    FULL,
  ),
  bossPose(
    "pinball",
    "play",
    "The table is live and the same on both screens. P1 sets the angle; P2 sets the power.",
    { ...FULL, hold: 24 },
  ),
  bossPose(
    "pinball",
    "aim",
    "The needle sweeps the arc. P1 latches it where P2 calls; P2 watches the board and calls.",
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
    "The needle is latched and the bar runs. P2 launches on the bar; P1 winds the spring if it is slack.",
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
    "The ball is out of their hands. P1 slides the cannon under it; P2 may shove the table once.",
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
    "Every ball dropped or the clock run out. P1 waits; P2 waits out the verdict beats.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "pinball",
    "spent",
    "The table is over and only looked at. P1 waits; P2 waits for the next wave.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "pulse",
    "count",
    "The lanes are drawn and the meter at nothing. P1 reads his lane; P2 reads hers — no step yet.",
    FULL,
  ),
  bossPose(
    "pulse",
    "play",
    "Steps come down both lanes on the beat, one meter for the two. P1 steps his; P2 steps hers.",
    { ...FULL, hold: 24 },
  ),
  bossPose(
    "pulse",
    "verdict",
    "The stage is called and nobody stepped, so the meter never rose. P1 waits; P2 waits.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "pulse",
    "spent",
    "The stage is over and only looked at. P1 waits; P2 waits for the next wave.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "pulse",
    "steady",
    "The bar is full and the song runs. P1 names the arrow P2 cannot see; P2 names his.",
    {
      ...FULL,
      want: (w) =>
        w.boss?.kind === "pulse" &&
        w.boss.phase === "play" &&
        pulseHeart(w.cfg, w.boss) === "steady",
      hold: 6,
    },
  ),
  bossPose(
    "pulse",
    "flutter",
    "The bar is low and a thumb is offered. P1 takes it and stops stepping, or P2 does — not both.",
    {
      ...FULL,
      want: (w) =>
        w.boss?.kind === "pulse" &&
        w.boss.phase === "play" &&
        pulseHeart(w.cfg, w.boss) === "flutter",
      hold: 6,
    },
  ),
  bossPose(
    "pulse",
    "arrest",
    "The bar is at its lowest and one thumb buys nothing. P1 and P2 both hold it, and neither steps.",
    {
      ...FULL,
      want: (w) =>
        w.boss?.kind === "pulse" &&
        w.boss.phase === "play" &&
        pulseHeart(w.cfg, w.boss) === "arrest",
      hold: 4,
    },
  ),
  bossPose(
    "scout",
    "lead",
    "The arena arrives. P1 will fly the scout; P2 sees what it flies into — nothing is steered yet.",
    FULL,
  ),
  bossPose(
    "scout",
    "play",
    "The scout is under way. P1 steers and burns on what P2 says; P2 watches the arena.",
    { ...FULL, hold: 12 },
  ),
  bossPose(
    "scout",
    "light",
    "The scout carries nothing, as every arena opens. P1 flies it onto a mote; P2 opens the mouth.",
    {
      ...FULL,
      want: (w) =>
        w.boss?.kind === "scout" && w.boss.phase === "play" && scoutLoad(w.cfg, w.boss) === "light",
      hold: 12,
    },
  ),
  bossPose(
    "scout",
    "laden",
    "Four motes aboard, one to go. P1 flies the last one onto the ship; P2 keeps the mouth open.",
    {
      ...FULL,
      hand: scoutHand,
      want: (w) =>
        w.boss?.kind === "scout" && w.boss.phase === "play" && scoutLoad(w.cfg, w.boss) === "laden",
      hold: 12,
    },
  ),
  bossPose(
    "scout",
    "heavy",
    "Every mote aboard and the run over the moment they land. P1 flies for home; P2 keeps the mouth open.",
    {
      ...FULL,
      hand: scoutHand,
      want: (w) =>
        w.boss?.kind === "scout" && w.boss.phase === "play" && scoutLoad(w.cfg, w.boss) === "heavy",
      hold: 12,
    },
  ),
  bossPose(
    "scout",
    "verdict",
    "Caught, or through: the arena holds the moment the run ended. P1 waits; P2 waits.",
    { ...FULL, hold: 6 },
  ),
  bossPose(
    "scout",
    "spent",
    "The arena is over and only looked at. P1 waits; P2 waits for the next wave.",
    { ...FULL, hold: 12 },
  ),
];
