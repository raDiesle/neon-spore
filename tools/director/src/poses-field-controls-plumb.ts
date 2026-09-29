import type { PlumbStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE PLUMB's pull: the left weight asked for, the bob skewed left, and both
 * stones pulled right until it hangs true. Photographed on the pilot's
 * screen. A gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

const OPENING: PlumbStep[] = [
  { ask: "left", skewMilli: -3000, rangeMilli: 600, color: "either", beats: 5 },
  { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
];

/** The left weight lit and both stones pulled half the skew each, held a beat and a half. */
function pulling(): World {
  const w = fresh([], [], { kind: "plumb", steps: OPENING });
  runUntil(w, "the first weight", [], (x) => x.boss?.kind === "plumb" && x.boss.phase === "lit");
  const pulls: TimedCommand[] = ([1, 2] as const).map((player) => ({
    tick: w.tick,
    player,
    command: {
      kind: "drag",
      target: player === 1 ? "plumbLevelLeft" : "plumbLevelRight",
      on: true,
      fromMilli: 1500,
    },
  }));
  run(w, TPB + TPB / 2, pulls);
  return w;
}

const PLUMB_PULLED: Pose = {
  name: "PLUMB · THE LEFT WEIGHT PULLED TRUE",
  note: "THE PLUMB over the middle column: a bronze bob on a hook, a stone on a chain at each end of its beam, a spirit level under each. The left weight is lit and the bob hangs skewed further left than one pull reaches; both thumbs have dragged their stones right, the left shrinking and the right growing, until both bubbles sit inside the marks. Player 1's screen.",
  lookAt:
    "whether the two stones' sizes read as the two thumbs' doing, and the bubbles inside their marks as *hold it there*",
  crop: "field",
  role: "p1",
  build: pulling,
};

export const PLUMB_GRIPS: readonly Pose[] = [PLUMB_PULLED];
