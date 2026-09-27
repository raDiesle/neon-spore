import type { SlingStep, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE SLING's two cords, **each photographed from the seat that draws it**,
 * the screen its thumb is on. A gallery pose is run to, never set
 * (`.claude/skills/new-boss` §4).
 */

/** Act 12's first draw on arm `side`, and the fire after it. */
const firstDraw = (side: 0 | 1): SlingStep[] => [
  {
    ask: side === 0 ? "left" : "right",
    aim: side === 0 ? "left" : "right",
    color: "either",
    beats: 5,
  },
  { ask: "fire", aim: "left", color: "red", beats: 3 },
];

/** Arm `side`'s draw lit, and its seat's finger down on it for three beats of the five. */
function drawn(side: 0 | 1): () => World {
  return () => {
    const w = fresh([], [], { kind: "sling", steps: firstDraw(side) });
    runUntil(w, "the draw", [], (x) => x.boss?.kind === "sling" && x.boss.phase === "lit");
    run(w, TPB * 3, [
      {
        tick: w.tick,
        player: side === 0 ? 1 : 2,
        command: {
          kind: "drag",
          target: side === 0 ? "slingDrawLeft" : "slingDrawRight",
          on: true,
          fromMilli: 0,
        },
      },
    ]);
    return w;
  };
}

const FORK =
  "THE SLING bolted mid-hull: a forked arm, a cord from each tine to its handle and a cup between them.";

const SLING_LEFT: Pose = {
  name: "SLING · THE LEFT CORD DRAWN",
  note: `${FORK} The left arm's draw is lit, aimed left; player 1 has held it for three beats of five, the cord glowing and drawn part of the way home. Player 1's screen, the drawer's.`,
  lookAt: "whether the drawn cord reads as *still holding* and as short of home",
  crop: "field",
  role: "p1",
  build: drawn(0),
};

const SLING_RIGHT: Pose = {
  name: "SLING · THE RIGHT CORD DRAWN",
  note: `${FORK} The right arm's draw is lit, aimed right; player 2 has held it for three beats of five, the cord glowing and drawn part of the way home. Player 2's screen, the drawer's.`,
  lookAt: "whether the right cord reads as hers while the left hangs slack",
  crop: "field",
  role: "p2",
  build: drawn(1),
};

export const SLING_GRIPS: readonly Pose[] = [SLING_LEFT, SLING_RIGHT];
