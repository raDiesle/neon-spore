import type { DavitStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE DAVIT's two steers and two looses: a swing lit, one seat's thumb
 * carrying the boom onto its column and the other holding its draw, each
 * **photographed from the seat whose hand it is** — the steer from the
 * steerer's screen, the loose from the looser's. A gallery pose is run to,
 * never set (`.claude/skills/new-boss` §4).
 */

/** Where the swing asks the boom, act 13's first two swings. */
const swingFirst = (ask: "left" | "right"): DavitStep[] => [
  { ask, leanMilli: ask === "left" ? -20000 : 20000, rangeMilli: 8000, color: "either", beats: 6 },
  { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
];

/** Swing `ask` lit, the boom carried onto the target and the other seat's draw down for three and a half beats. */
function drawing(ask: "left" | "right"): () => World {
  return () => {
    const steps = swingFirst(ask);
    const w = fresh([], [], { kind: "davit", steps });
    runUntil(w, "the swing", [], (x) => x.boss?.kind === "davit" && x.boss.phase === "lit");
    const t = w.tick;
    const steerer = ask === "left" ? 1 : 2;
    const looser = ask === "left" ? 2 : 1;
    // The carry that swings the boom to the target (`sim/davit-hand.ts`).
    const carry = (steps[0]?.leanMilli ?? 0) / w.cfg.davitSteerDegreesPerTile;
    const steer: TimedCommand = {
      tick: t,
      player: steerer,
      command: {
        kind: "drag",
        target: steerer === 1 ? "davitSteerLeft" : "davitSteerRight",
        on: true,
        fromMilli: carry,
      },
    };
    const draw: TimedCommand = {
      tick: t + 1,
      player: looser,
      command: {
        kind: "drag",
        target: looser === 1 ? "davitLooseLeft" : "davitLooseRight",
        on: true,
        fromMilli: 0,
      },
    };
    run(w, TPB * 3 + TPB / 2, [steer, draw]);
    return w;
  };
}

const BOOM =
  "THE DAVIT over the hull's spine: a crane boom on a pivot with a hook hanging from its end.";

const DAVIT_LEFT_LOOSE: Pose = {
  name: "DAVIT · THE LEFT LOOSE DRAWN",
  note: `${BOOM} The right swing is lit; player 2's thumb has carried the boom onto the right column and holds it there, and player 1 has had a thumb down on the field for three and a half of the step's six beats, ready to swipe right. Player 1's screen, the one the loose is taken on.`,
  lookAt:
    "whether a thumb down anywhere reads as *drawing the hook*, and the boom on its column as *hers, keep holding*",
  crop: "field",
  role: "p1",
  build: drawing("right"),
};

const DAVIT_RIGHT_LOOSE: Pose = {
  name: "DAVIT · THE RIGHT LOOSE DRAWN",
  note: `${BOOM} The left swing is lit; player 1's thumb has carried the boom onto the left column and holds it there, and player 2 has had a thumb down on the field for three and a half of the step's six beats, ready to swipe left. Player 2's screen, the one the loose is taken on.`,
  lookAt: "whether the draw's count reads as nearly there, and which way the swipe must go",
  crop: "field",
  role: "p2",
  build: drawing("left"),
};

const DAVIT_LEFT_STEER: Pose = {
  name: "DAVIT · THE LEFT STEER CARRIED",
  note: `${BOOM} The left swing is lit; player 1's thumb has carried the boom onto the left column and holds it there while player 2 draws. Player 1's screen, the one the steer is taken on.`,
  lookAt: "whether the boom reads as *his to carry*, and the lit column as where to hold it",
  crop: "field",
  role: "p1",
  build: drawing("left"),
};

const DAVIT_RIGHT_STEER: Pose = {
  name: "DAVIT · THE RIGHT STEER CARRIED",
  note: `${BOOM} The right swing is lit; player 2's thumb has carried the boom onto the right column and holds it there while player 1 draws. Player 2's screen, the one the steer is taken on.`,
  lookAt: "whether the boom under the thumb reads as held, and how far off the column it may stray",
  crop: "field",
  role: "p2",
  build: drawing("right"),
};

export const DAVIT_GRIPS: readonly Pose[] = [
  DAVIT_LEFT_STEER,
  DAVIT_RIGHT_STEER,
  DAVIT_LEFT_LOOSE,
  DAVIT_RIGHT_LOOSE,
];
