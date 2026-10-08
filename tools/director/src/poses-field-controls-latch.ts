import type { LatchStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE LATCH's grips, hand over hand: the first level lit, the navigator
 * holding the right grip, and the pilot's thumb carried most of a pull down
 * the left. Photographed on the pilot's screen. A gallery pose is run to,
 * never set (`.claude/skills/new-boss` §4).
 */

const OPENING: LatchStep[] = [{ ask: "haul", knots: 2, beats: 28 }];

const grip = (player: 1 | 2, depth: number): TimedCommand => ({
  tick: 0,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "latchGripLeft" : "latchGripRight",
    on: true,
    fromMilli: 0,
    fromYMilli: depth,
  },
});

/** The level lit; the navigator takes hold, then the pilot, then the pilot pulls. */
function hauling(): World {
  const w = fresh([], [], { kind: "latch", steps: OPENING });
  runUntil(w, "the first level", [], (x) => x.boss?.kind === "latch" && x.boss.phase === "level");
  run(w, 1, [{ ...grip(2, 0), tick: w.tick }]);
  run(w, 1, [{ ...grip(1, 0), tick: w.tick }]);
  run(w, TPB / 2, [{ ...grip(1, 1800), tick: w.tick }]);
  return w;
}

const LATCH_HAULING: Pose = {
  name: "LATCH · HAND OVER HAND",
  note: "THE LATCH over the middle column: a colony of six ochre bodies in one skin, its tendril run down to a hook in the hull with a pale knot coming down it. The navigator's thumb holds the right grip; the pilot's has carried the left grip most of a pull down its channel, its strap taut, the tendril and the colony drawn down after it. Player 1's screen.",
  lookAt:
    "whether the pulling grip and the holding grip read as two different jobs, and the knot coming down as *how far to the next*",
  crop: "field",
  role: "p1",
  build: hauling,
};

export const LATCH_GRIPS: readonly Pose[] = [LATCH_HAULING];
