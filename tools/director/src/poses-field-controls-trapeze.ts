import { type TimedCommand, type TrapezeStep, trapezeOnMark, type World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE TRAPEZE's two hands, **each photographed from the seat whose hand it
 * is**, because that is the screen its mark is drawn full on. A gallery pose
 * is run to, never set (`.claude/skills/new-boss` §4).
 */

/** Act 13's first catch, the pilot's freeze and the navigator's draw, and the fire after it. */
const STEPS: TrapezeStep[] = [
  { ask: "catch", freezer: 1, offset: -1, sweepMilli: 1000, color: "either", beats: 6 },
  { ask: "fire", freezer: "either", offset: 0, sweepMilli: 0, color: "red", beats: 3 },
];

function lit(): World {
  const w = fresh([], [], { kind: "trapeze", steps: STEPS });
  runUntil(w, "the catch", [], (x) => x.boss?.kind === "trapeze" && x.boss.phase === "lit");
  return w;
}

/** The first catch lit a beat, the flag swinging on toward the ring. */
function ringLit(): World {
  const w = lit();
  run(w, TPB);
  return w;
}

/** The pilot's tap has stilled the flag on the ring, and the navigator's finger has been down a beat and a half. */
function drawHeld(): World {
  const w = lit();
  runUntil(
    w,
    "the flag on the ring",
    [],
    (x) => x.boss?.kind === "trapeze" && trapezeOnMark(x, x.boss),
  );
  const t = w.tick;
  const freeze: TimedCommand = {
    tick: t,
    player: 1,
    command: { kind: "drag", target: "trapezeFreeze", on: true, fromMilli: 0 },
  };
  const draw: TimedCommand = {
    tick: t + 1,
    player: 2,
    command: { kind: "drag", target: "trapezeDraw", on: true, fromMilli: 0 },
  };
  run(w, TPB + TPB / 2, [freeze, draw]);
  return w;
}

const FLAG =
  "THE TRAPEZE over the middle column: a canvas pennant on a steel boom, hanging from a turned spindle.";

const TRAPEZE_FREEZE: Pose = {
  name: "TRAPEZE · THE FREEZE RING LIT",
  note: `${FLAG} The first catch is lit a beat in; the ring stands over the column left of the middle and the flag swings toward it. Player 1's screen, the freezer's, where the ring is drawn full.`,
  lookAt:
    "whether the ring reads as *tap here, when the flag is in it*, and not as a target to shoot",
  crop: "field",
  role: "p1",
  build: ringLit,
};

const TRAPEZE_DRAW: Pose = {
  name: "TRAPEZE · THE DRAW HELD",
  note: `${FLAG} Player 1 has tapped the flag still on the ring, and player 2 has had a finger down on the track for a beat and a half — the draw counted, ready to swipe left. Player 2's screen, the one the draw is taken on.`,
  lookAt: "whether the filled track reads as *ready*, and which way the swipe must go",
  crop: "field",
  role: "p2",
  build: drawHeld,
};

export const TRAPEZE_GRIPS: readonly Pose[] = [TRAPEZE_FREEZE, TRAPEZE_DRAW];
