import { type LampreyStep, lampreyBoss, type World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE LAMPREY's two hands, **each photographed from the seat that presses
 * it**: the jaw from the pilot's screen, the teeth from the navigator's. The
 * world is the same one, and a gallery pose is run to, never set
 * (`.claude/skills/new-boss` §4). The eel is still the shape sheet's stand-in,
 * so these show where the hands go, not what the eel looks like.
 */

/** The pilot pins the first bite; the navigator taps. */
const STEPS: LampreyStep[] = [
  {
    ask: "bite",
    pinner: 1,
    teeth: 3,
    toothBeats: 6,
    col: 4,
    crawl: 1,
    crawlBeats: 4,
    color: "either",
    beats: 0,
  },
  {
    ask: "gullet",
    pinner: 1,
    teeth: 2,
    toothBeats: 4,
    col: 4,
    crawl: -1,
    crawlBeats: 4,
    color: "red",
    beats: 6,
  },
];

/** The first bite on, the pilot's thumb down on the jaw. */
function pinned(): World {
  const w = fresh([], [], { kind: "lamprey", steps: STEPS });
  runUntil(w, "the first bite on", [], (x) => lampreyBoss(x)?.phase === "bite");
  const col = lampreyBoss(w)?.jawCol ?? 0;
  run(w, TPB, [
    {
      tick: w.tick,
      player: 1,
      command: { kind: "drag", target: "lampreyJaw", on: true, fromMilli: 0, id: col },
    },
  ]);
  return w;
}

const LAMPREY_JAW: Pose = {
  name: "LAMPREY · THE JAW PINNED",
  note: "THE LAMPREY bitten onto the hull, its sucker mouth a ring of seven teeth. Player 1's thumb is down on the jaw, so the bite is not deepening; the jaw crawls a column every few beats and the thumb has to follow it. Player 1's screen, the pinning seat's.",
  lookAt: "whether the held jaw reads as *your thumb is keeping it from biting*",
  crop: "field",
  role: "p1",
  build: pinned,
};

const LAMPREY_TOOTH: Pose = {
  name: "LAMPREY · THE LIT TOOTH",
  note: "The same moment on player 2's screen, the tapper's: one tooth of the ring lit, its window running down, the partner's thumb holding the jaw still enough to reach it.",
  lookAt: "whether the one lit tooth reads as *tap this one, now*",
  crop: "field",
  role: "p2",
  build: pinned,
};

export const LAMPREY_GRIPS: readonly Pose[] = [LAMPREY_JAW, LAMPREY_TOOTH];
