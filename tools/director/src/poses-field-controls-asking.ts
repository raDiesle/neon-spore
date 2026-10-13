import { batonHand, gaugeHand, type Hand, pinballHand, queenHand } from "@neon-spore/hands";
import {
  type BossKind,
  batonMayStrip,
  gaugeBandAsks,
  pinPlungerAsks,
  queenAsks,
  type World,
} from "@neon-spore/sim";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * **Four controls photographed on the tick they first ask for a thumb.**
 *
 * Each of these rows on CONTROLS › ON THE FIELD pointed at a boss's state
 * pose, and every one of those caught the moment *after* the control: THE
 * GAUGE's band with its wound shot out and regrowing, THE BATON passing on a
 * beat no socket swelled, THE BULB QUEEN's mark already pried, PINBALL on a
 * shot whose spring was never slack. Nothing pressed anywhere on the phone
 * reached the row, so the card kept half the phone (`field-focus.ts`,
 * `docs/queue.md`, 9 October 2026). These stop the boss's own hand on the
 * first tick the game's hit test would answer — the ring up, haloed, and no
 * thumb on it yet. A gallery pose is run to, never set
 * (`.claude/skills/new-boss` §4).
 */

/** The boss's wave, its hand on the controls until `asks` says the ring is up. */
function asking(kind: BossKind, hand: Hand, asks: (w: World) => boolean, budgetBeats = 120) {
  return (): World => {
    const w = bossWorld(kind);
    runHand(w, `${kind} asking`, hand, asks, budgetBeats * TPB);
    return w;
  };
}

/**
 * PINBALL's hand, launching only once the bar is past `pinballHardMilli`: a
 * hard shot is what leaves the spring slack, and the plunger is only asked
 * on the shot after one (`sim/pinball-hand.ts`).
 */
const hardLaunchHand: Hand = (w) => {
  const b = w.boss;
  const soft =
    b?.kind === "pinball" &&
    b.phase === "play" &&
    b.shot === "power" &&
    !b.slack &&
    b.powerMilli < w.cfg.pinballHardMilli;
  return soft ? [] : pinballHand(w);
};

const GAUGE_BAND_ASKS: Pose = {
  name: "GAUGE · THE BAND WOUND, ASKING A THUMB",
  note: "THE GAUGE in play, the marks landed and the band wound tight round a fresh wound. Its ring stands in the middle of the band, out at the rim, haloed and empty. Player 2's screen, the only one the band is drawn on.",
  lookAt: "whether the ring on the band reads as *hold me* before a thumb is on it",
  crop: "field",
  role: "p2",
  build: asking("gauge", gaugeHand, (w) => w.boss?.kind === "gauge" && gaugeBandAsks(w.boss)),
};

const BATON_STRIP_ASKS: Pose = {
  name: "BATON · A SOCKET SWELLING, ASKING A STRIP",
  note: "THE BATON passing, and the shell on one socket swelling away from the arm. Its ring stands on the socket, with the window's dial full, on the screen of the seat the beat has locked. The test screen.",
  lookAt: "whether the swelling shell reads as the thing to strip, and not the arm under it",
  crop: "field",
  role: "test",
  build: asking(
    "baton",
    batonHand,
    (w) =>
      w.boss?.kind === "baton" &&
      (batonMayStrip(w.boss, 1, w.beat) || batonMayStrip(w.boss, 2, w.beat)),
  ),
};

const QUEEN_MARKS_ASK: Pose = {
  name: "BULB QUEEN · HER MARKS ASKING A PRESS",
  note: "THE BULB QUEEN bloomed under BROOD, armoured still: a ring round each of her two marks and neither pried. One is real. Player 1's screen, the seat that presses without being told which.",
  lookAt:
    "whether the two rings read as *press one* and as the same, since he cannot tell them apart",
  crop: "field",
  role: "p1",
  build: asking("queen", queenHand, (w) => {
    const q = w.creatures.find((c) => c.kind === "queen");
    return w.boss?.kind === "queen" && q !== undefined && queenAsks(w.boss, q) === "pry";
  }),
};

const PINBALL_PLUNGER_ASKS: Pose = {
  name: "PINBALL · THE SPRING SLACK, ASKING A WIND",
  note: "PINBALL on the shot after a hard launch: the spring slack, the strength bar standing still, and the plunger's ring at the right-hand end of the band, haloed. Player 1's screen, the seat that winds it.",
  lookAt: "whether the ring reads as the reason the bar is not running",
  crop: "field",
  role: "p1",
  build: asking(
    "pinball",
    hardLaunchHand,
    (w) => w.boss?.kind === "pinball" && pinPlungerAsks(w.boss),
  ),
};

export const ASKING_GRIPS: readonly Pose[] = [
  GAUGE_BAND_ASKS,
  BATON_STRIP_ASKS,
  QUEEN_MARKS_ASK,
  PINBALL_PLUNGER_ASKS,
];
