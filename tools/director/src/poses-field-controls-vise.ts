import type { TimedCommand, ViseStep, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE VISE's two hands: a pinch on each lobe, both seats holding the case
 * shut together. **One instant photographed twice**, THE OCULUS's
 * arrangement, because both screens draw the whole case and the point of a
 * `both` step is that each phone shows the other seat's lobe pinched too. A
 * gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** A `both` step first, so the one instant has both seats' fingers on it. */
const OPENING: ViseStep[] = [
  { ask: "both", color: "either", beats: 4 },
  { ask: "fire", color: "red", beats: 3 },
];

function pinched(tick: number, player: 1 | 2, gapMilli: number): TimedCommand {
  return {
    tick,
    player,
    command: {
      kind: "drag",
      target: player === 1 ? "viseLobeLeft" : "viseLobeRight",
      on: true,
      fromMilli: gapMilli,
    },
  };
}

/** The step lit, both lobes pinched under the shut line for two of its four beats. */
function pinching(): World {
  const w = fresh([], [], { kind: "vise", steps: OPENING });
  runUntil(w, "the first step", [], (x) => x.boss?.kind === "vise" && x.boss.phase === "lit");
  run(w, TPB * 2 + TPB / 2, [pinched(w.tick, 1, 400), pinched(w.tick, 2, 600)]);
  return w;
}

const PINCHING_NOTE =
  "THE VISE stood over the middle column: a seed-case of two lobes either side of a spine. Both lobes are lit and both seats have held a pinch shut on their own for two and a half of the step's four beats.";

const VISE_LEFT: Pose = {
  name: "VISE · THE LEFT LOBE PINCHED",
  note: `${PINCHING_NOTE} Player 1's screen, whose lobe is the left.`,
  lookAt:
    "whether the left lobe reads as his and the right as hers without a word, and whether a lobe pinched shut plainly says *keep squeezing*",
  crop: "field",
  role: "p1",
  build: pinching,
};

const VISE_RIGHT: Pose = {
  name: "VISE · THE RIGHT LOBE PINCHED",
  note: `${PINCHING_NOTE} Player 2's screen, the same instant.`,
  lookAt:
    "whether the pilot's pinch on the other lobe reads as the other half of one squeeze rather than as a thing to copy",
  crop: "field",
  role: "p2",
  build: pinching,
};

export const VISE_GRIPS: readonly Pose[] = [VISE_LEFT, VISE_RIGHT];
