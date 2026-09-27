import type { CapstanStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE CAPSTAN's rub: the left band asked for, the pilot's phone tipped over
 * so its face is round, and the navigator rubbing it. Photographed on the
 * navigator's screen, the one with the thumb on it. A gallery pose is run to,
 * never set (`.claude/skills/new-boss` §4).
 */

const OPENING: CapstanStep[] = [
  { ask: "left", color: "either", beats: 10 },
  { ask: "fire", color: "red", beats: 3 },
];

/** Reversals a rubbing thumb makes in a beat — the autopilot's pace. */
const RUBS_PER_BEAT = 4;

/** The left band lit, the pilot leant well past the mark and five of the navigator's reversals worn in. */
function rubbing(): World {
  const w = fresh([], [], { kind: "capstan", steps: OPENING });
  runUntil(w, "the first band", [], (x) => x.boss?.kind === "capstan" && x.boss.phase === "lit");
  const t = w.tick;
  const lean: TimedCommand = {
    tick: t,
    player: 1,
    command: {
      kind: "drag",
      target: "capstanLean",
      on: true,
      fromMilli: -2 * w.cfg.capstanLeanMilli,
    },
  };
  const turns: TimedCommand[] = [1, 2, 3, 4, 5].map((id) => ({
    tick: t + 1 + Math.round(((id - 1) * TPB) / RUBS_PER_BEAT),
    player: 2,
    command: { kind: "drag", target: "capstanRub", on: true, fromMilli: 0, fromYMilli: 0, id },
  }));
  run(w, TPB + TPB / 2, [lean, ...turns]);
  return w;
}

const CAPSTAN_RUBBED: Pose = {
  name: "CAPSTAN · THE LEFT BAND RUBBED",
  note: "THE CAPSTAN over the middle column: a rusted drum on its side in a cradle, a band round each end. The left band is lit; player 1's phone is tipped left so the cradle has rocked the left face round, and player 2 has rubbed it back and forth five times in a beat and a quarter. Player 2's screen, the one with the thumb on it.",
  lookAt:
    "whether the marks scrubbing bright on the left band read as *keep rubbing*, and the rocked drum as the other phone's doing",
  crop: "field",
  role: "p2",
  build: rubbing,
};

export const CAPSTAN_GRIPS: readonly Pose[] = [CAPSTAN_RUBBED];
