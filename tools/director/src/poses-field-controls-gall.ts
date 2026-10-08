import type { GallStep, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE GALL's taps: the first leap lit with the alien on the seam's first
 * point, and the pilot two taps into its three. Photographed on the pilot's
 * screen, the one with the finger on it. A gallery pose is run to, never
 * set (`.claude/skills/new-boss` §4).
 */

const OPENING: GallStep[] = [
  { ask: "leap", taps: 3, color: "either", beats: 6 },
  { ask: "fire", taps: 0, color: "red", beats: 6 },
];

/** One tap on point nought: the press, and the lift a tick later where it went down. */
function tap(tick: number, on: boolean) {
  return {
    tick,
    player: 1 as const,
    command: {
      kind: "drag" as const,
      target: "gallPress" as const,
      on,
      fromMilli: 0,
      fromYMilli: 0,
      id: 0,
    },
  };
}

/** The first leap lit and two taps in on point nought. */
function tapping(): World {
  const w = fresh([], [], { kind: "gall", steps: OPENING });
  runUntil(w, "the first leap", [], (x) => x.boss?.kind === "gall" && x.boss.phase === "lit");
  const t = w.tick;
  run(w, TPB, [tap(t, true), tap(t + 2, false), tap(t + 8, true), tap(t + 10, false)]);
  return w;
}

const GALL_TAPPED: Pose = {
  name: "GALL · TAPS ON THE LEFT END",
  note: "THE GALL: a raised seam across the field with four scars, and the alien sitting on the leftmost point. The first leap is lit and player 1 has tapped it twice of the three it asks before the pull. Player 1's screen, the one with the finger on it.",
  lookAt:
    "whether the alien wound tight by two taps reads as *one more, then pull it up*, and the leftmost point as the pilot's without a word",
  crop: "field",
  role: "p1",
  build: tapping,
};

export const GALL_GRIPS: readonly Pose[] = [GALL_TAPPED];
