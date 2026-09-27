import type { DavitStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE DAVIT's two looses: a swing lit, one seat leaning the boom onto its
 * column and the other holding its draw, **photographed from the seat that
 * looses**, because that is the only screen the loose is taken on. A gallery
 * pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** Where the swing asks the boom, act 13's first two swings. */
const swingFirst = (ask: "left" | "right"): DavitStep[] => [
  { ask, leanMilli: ask === "left" ? -20000 : 20000, rangeMilli: 8000, color: "either", beats: 6 },
  { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
];

/** Swing `ask` lit, its lean held on the target and the other seat's draw down for three and a half beats. */
function drawing(ask: "left" | "right"): () => World {
  return () => {
    const steps = swingFirst(ask);
    const w = fresh([], [], { kind: "davit", steps });
    runUntil(w, "the swing", [], (x) => x.boss?.kind === "davit" && x.boss.phase === "lit");
    const t = w.tick;
    const steerer = ask === "left" ? 1 : 2;
    const looser = ask === "left" ? 2 : 1;
    const lean: TimedCommand = {
      tick: t,
      player: steerer,
      command: {
        kind: "drag",
        target: steerer === 1 ? "davitSteerLeft" : "davitSteerRight",
        on: true,
        fromMilli: steps[0]?.leanMilli ?? 0,
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
    run(w, TPB * 3 + TPB / 2, [lean, draw]);
    return w;
  };
}

const BOOM =
  "THE DAVIT over the hull's spine: a crane boom on a pivot with a hook hanging from its end.";

const DAVIT_LEFT_LOOSE: Pose = {
  name: "DAVIT · THE LEFT LOOSE DRAWN",
  note: `${BOOM} The right swing is lit; player 2 leans her phone and holds the boom on the right column, and player 1 has had a thumb down on the field for three and a half of the step's six beats, ready to swipe right. Player 1's screen, the one the loose is taken on.`,
  lookAt:
    "whether a thumb down anywhere reads as *drawing the hook*, and the boom on its column as *hers, keep holding*",
  crop: "field",
  role: "p1",
  build: drawing("right"),
};

const DAVIT_RIGHT_LOOSE: Pose = {
  name: "DAVIT · THE RIGHT LOOSE DRAWN",
  note: `${BOOM} The left swing is lit; player 1 leans his phone and holds the boom on the left column, and player 2 has had a thumb down on the field for three and a half of the step's six beats, ready to swipe left. Player 2's screen, the one the loose is taken on.`,
  lookAt: "whether the draw's count reads as nearly there, and which way the swipe must go",
  crop: "field",
  role: "p2",
  build: drawing("left"),
};

export const DAVIT_GRIPS: readonly Pose[] = [DAVIT_LEFT_LOOSE, DAVIT_RIGHT_LOOSE];
