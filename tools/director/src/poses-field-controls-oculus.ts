import type { OculusStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE OCULUS's two hands: a thumb on each half of the lens, holding the first
 * pair shut. **One instant photographed twice**, THE MANTLE's arrangement,
 * because both screens draw the whole lens and the point of the pair is that
 * each phone shows the other thumb's leaf sliding too. A gallery pose is run
 * to, never set (`.claude/skills/new-boss` §4).
 */

/** Wave 106's opening: three pairs to shut, then the break. */
const OPENING: OculusStep[] = [
  { ask: "shut", color: "either", beats: 4 },
  { ask: "shut", color: "either", beats: 4 },
  { ask: "shut", color: "either", beats: 4 },
  { ask: "break", color: "either", beats: 2 },
];

function held(tick: number, player: 1 | 2): TimedCommand {
  return {
    tick,
    player,
    command: {
      kind: "drag",
      target: player === 1 ? "oculusLeafLeft" : "oculusLeafRight",
      on: true,
      fromMilli: 0,
    },
  };
}

/** The first pair lit, and both thumbs down on it for two of its four beats. */
function holding(): World {
  const w = fresh([], [], { kind: "oculus", steps: OPENING });
  runUntil(w, "the first pair", [], (x) => x.boss?.kind === "oculus" && x.boss.phase === "lit");
  run(w, TPB * 2 + TPB / 2, [held(w.tick, 1), held(w.tick, 2)]);
  return w;
}

const HOLDING_NOTE =
  "THE OCULUS stood over the middle of the field: a grey rim of lapped plates with six pins, six dull glass leaves hung open under it. The first pair is lit white and both thumbs have been on it for two and a half of its four beats, so the pair has slid more than half-way across the face.";

const OCULUS_LEFT: Pose = {
  name: "OCULUS · THE LEFT LEAF UNDER A THUMB",
  note: `${HOLDING_NOTE} Player 1's screen, whose half is the left.`,
  lookAt:
    "whether the left half reads as his and the right as hers without a word, and whether the sliding pair plainly says *keep holding*",
  crop: "field",
  role: "p1",
  build: holding,
};

const OCULUS_RIGHT: Pose = {
  name: "OCULUS · THE RIGHT LEAF UNDER A THUMB",
  note: `${HOLDING_NOTE} Player 2's screen, the same instant.`,
  lookAt:
    "whether the pilot's thumb on the other half reads as the other half of one hold rather than as a thing to copy",
  crop: "field",
  role: "p2",
  build: holding,
};

export const OCULUS_GRIPS: readonly Pose[] = [OCULUS_LEFT, OCULUS_RIGHT];
