import type { HalterStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE HALTER's two grips: the left segment asked for, the pilot's two thumbs
 * down on its grips and the navigator sending nothing. **One instant
 * photographed twice**, THE TRIVET's arrangement, because both screens draw
 * the whole seam and the point of the step is that one phone is held and the
 * other is left alone. A gallery pose is run to, never set
 * (`.claude/skills/new-boss` §4).
 */

const OPENING: HalterStep[] = [
  { ask: "left", color: "either", beats: 10 },
  { ask: "fire", color: "red", beats: 3 },
];

/** One of the pilot's thumbs, down on grip `side`. */
function gripped(tick: number, side: 0 | 1): TimedCommand {
  return {
    tick,
    player: 1,
    command: {
      kind: "drag",
      target: side === 0 ? "halterChordLeft" : "halterChordRight",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: side,
    },
  };
}

/** The left step lit, both grips down, the navigator settled and the pair a beat into its hold. */
function holding(): World {
  const w = fresh([], [], { kind: "halter", steps: OPENING });
  runUntil(w, "the first step", [], (x) => x.boss?.kind === "halter" && x.boss.phase === "lit");
  const t = w.tick;
  run(w, TPB * 4 + TPB / 2, [gripped(t, 0), gripped(t, 1)]);
  return w;
}

const HOLDING_NOTE =
  "THE HALTER over the middle column: a plated slab cut along one seam into three segments. The left segment's seam is lit with a grip near each end; player 1 has held both grips for four and a half beats and player 2 has sent nothing at all, so the plating has gone still and the segment is starting to part.";

const HALTER_GRIPPED: Pose = {
  name: "HALTER · THE LEFT SEGMENT GRIPPED",
  note: `${HOLDING_NOTE} Player 1's screen, the one with the thumbs on it.`,
  lookAt:
    "whether the two held grips read as one hold, and whether the seam parting under them says *keep holding* without a word",
  crop: "field",
  role: "p1",
  build: holding,
};

const HALTER_RESTED: Pose = {
  name: "HALTER · THE LEFT SEGMENT RESTED",
  note: `${HOLDING_NOTE} Player 2's screen, the same instant, with no word on it.`,
  lookAt:
    "whether the still plating reads as *this is working, keep your hands off* rather than as the game having stopped",
  crop: "field",
  role: "p2",
  build: holding,
};

export const HALTER_GRIPS: readonly Pose[] = [HALTER_GRIPPED, HALTER_RESTED];
