import { MANTLE_SCRIPT } from "@neon-spore/content";
import type { TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE MANTLE's three hands: the two knobs under the two thumbs, and a tap on
 * the bared core. The knobs are **one instant photographed twice**, THE
 * HASP's arrangement next door, because both screens draw both handles and
 * the point of the pair is that each phone shows the other thumb's pull too.
 * A gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** A thumb on a knob, carried to a depth. A level, so one message is the whole of it. */
function pulled(tick: number, player: 1 | 2, depthMilli: number): TimedCommand {
  return {
    tick,
    player,
    command: {
      kind: "drag",
      target: player === 1 ? "mantleLeft" : "mantleRight",
      on: true,
      fromMilli: 0,
      fromYMilli: depthMilli,
    },
  };
}

/** Both thumbs down, both past the floor, and the sum just short of the first shear. */
function pulling(): World {
  const w = fresh([], [], { kind: "mantle", thresholds: MANTLE_SCRIPT });
  // Past the still, so the handles are lit and the pull counts.
  run(w, TPB * 3);
  run(w, TPB, [pulled(w.tick, 1, 800), pulled(w.tick, 2, 550)]);
  return w;
}

const KNOBS_NOTE =
  "THE MANTLE hung over the middle of the field: a shell of two hinged valves laid in lapped plates, a knob hung off each valve's tail in a groove that runs straight down. Both thumbs are on, the pilot's most of the way down and the navigator's just past the floor notch, and the cord between the knobs is lit in from both ends, the two lights not quite met: the sum is just short of the first shear.";

const MANTLE_LEFT: Pose = {
  name: "MANTLE · THE LEFT KNOB UNDER A THUMB",
  note: `${KNOBS_NOTE} Player 1's screen, whose knob is the left one.`,
  lookAt:
    "whether the left knob reads as his and the right as hers without a word, and whether the grey floor notch and the bright half-way notch read as two different things",
  crop: "field",
  role: "p1",
  build: pulling,
};

const MANTLE_RIGHT: Pose = {
  name: "MANTLE · THE RIGHT KNOB UNDER A THUMB",
  note: `${KNOBS_NOTE} Player 2's screen, the same instant: the pilot's pull is drawn on it too, which is the opposite of every other pair boss.`,
  lookAt:
    "whether the other seat's deeper knob reads as help rather than as hers to match, and whether the cord says how much further the two of them have to go",
  crop: "field",
  role: "p2",
  build: pulling,
};

const MANTLE_CORE: Pose = {
  name: "MANTLE · THE CORE UNDER A THUMB",
  note: "Every pair shed and the shell split down its seam round the bared, beating core; the pilot has just landed the finish's first tap, so the core is a step dimmer and the navigator's half of the ring is the one beating now. Player 1's screen.",
  lookAt:
    "whether the ring reads as one thing to tap rather than two halves to hold, and whether the half that beats plainly says the other phone is next",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "mantle", thresholds: MANTLE_SCRIPT });
    for (let i = 0; i < MANTLE_SCRIPT.length; i++) {
      run(w, TPB * 3);
      run(w, TPB, [pulled(w.tick, 1, 1300), pulled(w.tick, 2, 1300)]);
    }
    runUntil(w, "the split", [], (x) => x.boss?.kind === "mantle" && x.boss.phase === "heartbeat");
    const tap: TimedCommand = {
      tick: w.tick,
      player: 1,
      command: { kind: "drag", target: "mantleCore", on: true, fromMilli: 0 },
    };
    runUntil(
      w,
      "the first tap",
      [tap],
      (x) => x.boss?.kind === "mantle" && x.boss.heartbeatDone === 1,
    );
    return w;
  },
};

export const MANTLE_GRIPS: readonly Pose[] = [MANTLE_LEFT, MANTLE_RIGHT, MANTLE_CORE];
