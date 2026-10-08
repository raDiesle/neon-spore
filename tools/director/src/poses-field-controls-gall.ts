import type { GallStep, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE GALL's press: the first close lit with the gall on the seam's first
 * point, and the pilot holding it shut there. Photographed on the pilot's
 * screen, the one with the finger on it. A gallery pose is run to, never
 * set (`.claude/skills/new-boss` §4).
 */

const OPENING: GallStep[] = [
  { ask: "close", color: "either", beats: 6 },
  { ask: "fire", color: "red", beats: 3 },
];

/** The first close lit and the pilot's press shut on point nought for a beat and a half. */
function pressing(): World {
  const w = fresh([], [], { kind: "gall", steps: OPENING });
  runUntil(w, "the first close", [], (x) => x.boss?.kind === "gall" && x.boss.phase === "lit");
  const press = {
    tick: w.tick,
    player: 1 as const,
    command: {
      kind: "drag" as const,
      target: "gallPress" as const,
      on: true,
      fromMilli: 0,
      id: 0,
    },
  };
  run(w, TPB + TPB / 2, [press]);
  return w;
}

const GALL_PRESSED: Pose = {
  name: "GALL · THE PRESS ON THE LEFT END",
  note: "THE GALL: a raised seam across the field with four scars, and a soft nodule riding it on the leftmost point. The first close is lit and player 1 has held a press shut on it for a beat and a half of its six. Player 1's screen, the one with the finger on it.",
  lookAt:
    "whether the nodule squeezed and pressed into the seam reads as *keep it shut*, and the leftmost point as the pilot's without a word",
  crop: "field",
  role: "p1",
  build: pressing,
};

export const GALL_GRIPS: readonly Pose[] = [GALL_PRESSED];
