import type { RimeStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE RIME's two hands: a half of the lens rubbed, once a seat. Both screens
 * draw the whole lens, so each is photographed on the screen of the seat
 * rubbing it. A gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** The seat's half asked first, so the one wipe is the only thing lit. */
const halfFirst = (ask: "left" | "right"): RimeStep[] => [
  { ask, color: "either", beats: 8 },
  { ask: "fire", color: "red", beats: 3 },
];

/** Reversals a rubbing thumb makes in a beat — the autopilot's pace. */
const RUBS_PER_BEAT = 4;

/** Five reversals on a seat's half, a quarter-beat apart: frost shaved to under half. */
function rubbing(side: 0 | 1): () => World {
  return () => {
    const w = fresh([], [], { kind: "rime", steps: halfFirst(side === 0 ? "left" : "right") });
    runUntil(w, "the first wipe", [], (x) => x.boss?.kind === "rime" && x.boss.phase === "lit");
    const t = w.tick;
    const target = side === 0 ? "rimeHalfLeft" : "rimeHalfRight";
    const player = side === 0 ? 1 : 2;
    const turns: TimedCommand[] = [1, 2, 3, 4, 5].map((id) => ({
      tick: t + Math.round(((id - 1) * TPB) / RUBS_PER_BEAT),
      player,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id },
    }));
    run(w, TPB + TPB / 2, turns);
    return w;
  };
}

const LENS =
  "THE RIME over the middle column: a frosted lens split down its spine, its core dark behind the frost.";

const RIME_LEFT_HALF: Pose = {
  name: "RIME · THE LEFT HALF RUBBED",
  note: `${LENS} The left half's wipe is lit; player 1 has rubbed it back and forth five times in a beat and a quarter and player 2 waits. Player 1's screen.`,
  lookAt:
    "whether the frost coming off the left half reads as *keep rubbing* and the right half as not yet his",
  crop: "field",
  role: "p1",
  build: rubbing(0),
};

const RIME_RIGHT_HALF: Pose = {
  name: "RIME · THE RIGHT HALF RUBBED",
  note: `${LENS} The right half's wipe is lit; player 2 has rubbed it back and forth five times in a beat and a quarter and player 1 waits. Player 2's screen.`,
  lookAt: "whether the right half reads as the navigator's on a screen that also draws the pilot's",
  crop: "field",
  role: "p2",
  build: rubbing(1),
};

export const RIME_GRIPS: readonly Pose[] = [RIME_LEFT_HALF, RIME_RIGHT_HALF];
