import { type GovernorStep, governorLitStep, type World } from "@neon-spore/sim";
import { fresh, type Pose, runUntil } from "./pose-kit.js";

/**
 * THE GOVERNOR's tap, **photographed from the pilot's seat**: a step with a
 * mark for each seat. The world is run to, never set
 * (`.claude/skills/new-boss` §4).
 */

const mark = (seat: 1 | 2, markMilli: number) => ({ seat, markMilli });

/** A mark each, then three in order, the pilot's first. */
const STEPS: GovernorStep[] = [
  {
    ask: "tap",
    marks: [mark(1, 250), mark(2, 750)],
    ordered: false,
    paceMilli: 7,
    color: "either",
    beats: 5,
  },
  {
    ask: "tap",
    marks: [mark(1, 625), mark(2, 125), mark(1, 375)],
    ordered: true,
    paceMilli: 8,
    color: "either",
    beats: 6,
  },
  { ask: "fire", marks: [], ordered: false, paceMilli: 4, color: "red", beats: 8 },
];

/** The governor run until step `n` is lit, the steps before it given up. */
function lit(n: number): () => World {
  return () => {
    const w = fresh([], [], { kind: "governor", steps: STEPS });
    runUntil(
      w,
      `step ${n} lit`,
      [],
      (x) => x.boss?.kind === "governor" && governorLitStep(x.boss) !== null && x.boss.cursor === n,
    );
    return w;
  };
}

const GOVERNOR_BOTH: Pose = {
  name: "GOVERNOR · BOTH MARKS LIT",
  note: "THE GOVERNOR mid-field: a brass flywheel with a needle, a flyball governor standing behind it. The first step is lit: a mark for each seat on the track. Player 1's screen: its own mark breathing with TAP on it, the navigator's faint.",
  lookAt: "whether the two marks read as *mine* and *my partner's*",
  crop: "field",
  role: "p1",
  build: lit(0),
};

export const GOVERNOR_GRIPS: readonly Pose[] = [GOVERNOR_BOTH];
