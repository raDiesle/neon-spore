import { type GovernorStep, governorLitStep, type World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE GOVERNOR's two hands, **each photographed from the seat that presses
 * it**: the brake from the navigator's screen, the tap from the pilot's. The
 * world is the same one, and a gallery pose is run to, never set
 * (`.claude/skills/new-boss` §4).
 */

/** The pilot's first tap, with the navigator braking. */
const STEPS: GovernorStep[] = [
  { ask: "tap", tapper: 1, markMilli: 250, paceMilli: 3, color: "either", beats: 10 },
  { ask: "fire", tapper: 1, markMilli: 0, paceMilli: 0, color: "red", beats: 3 },
];

/** The first tap lit, the navigator's two pads down on the yoke. */
function braked(): World {
  const w = fresh([], [], { kind: "governor", steps: STEPS });
  runUntil(
    w,
    "the first mark lit",
    [],
    (x) => x.boss?.kind === "governor" && governorLitStep(x.boss) !== null,
  );
  const pad = (id: number) => ({
    tick: w.tick,
    player: 2 as const,
    command: {
      kind: "drag" as const,
      target: "governorChordRight" as const,
      on: true,
      fromMilli: 0,
      id,
    },
  });
  run(w, TPB, [pad(0), pad(1)]);
  return w;
}

const GOVERNOR_BRAKE: Pose = {
  name: "GOVERNOR · THE BRAKE HELD",
  note: "THE GOVERNOR mid-field: a brass flywheel with a needle, a flyball governor standing behind it and a brake drum at its foot. The pilot's first mark is lit; player 2 has both pads down, the yoke's jaws are shut on the drum and the flyweights hang slow. Player 2's screen, the braking seat's.",
  lookAt: "whether the shut jaws and hanging weights read as *the brake is holding*",
  crop: "field",
  role: "p2",
  build: braked,
};

const GOVERNOR_TAP: Pose = {
  name: "GOVERNOR · THE MARK LIT",
  note: "The same moment on player 1's screen, the tapper's: the lit mark breathing on the track, the window running down round the rim, and the needle sweeping toward it slow, braked by the partner.",
  lookAt: "whether the lit mark reads as *tap as the needle crosses here*",
  crop: "field",
  role: "p1",
  build: braked,
};

export const GOVERNOR_GRIPS: readonly Pose[] = [GOVERNOR_BRAKE, GOVERNOR_TAP];
