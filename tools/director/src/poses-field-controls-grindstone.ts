import type { GrindstoneStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE GRINDSTONE's four hands: a flat part ground, once a seat, and the
 * caliper clamped by both seats, **one instant photographed twice**, THE
 * TRIVET's arrangement, because both screens draw the whole wheel and a clamp
 * is the two jaws held together. A gallery pose is run to, never set
 * (`.claude/skills/new-boss` §4).
 */

/** The seat's flat asked first, so the one pass is the only thing lit. */
const flatFirst = (ask: "left" | "right"): GrindstoneStep[] => [
  { ask, color: "either", beats: 8 },
  { ask: "fire", color: "red", beats: 3 },
];

/** A clamp first: the caliper takes a chord whether or not a flat is clean. */
const CLAMP_FIRST: GrindstoneStep[] = [
  { ask: "clamp", color: "either", beats: 4 },
  { ask: "fire", color: "red", beats: 3 },
];

/** Reversals a rubbing thumb makes in a beat — the autopilot's pace. */
const RUBS_PER_BEAT = 4;

/** Five reversals on a seat's flat, a quarter-beat apart: grit shaved to under half. */
function rubbing(side: 0 | 1): () => World {
  return () => {
    const w = fresh([], [], {
      kind: "grindstone",
      steps: flatFirst(side === 0 ? "left" : "right"),
    });
    runUntil(
      w,
      "the first pass",
      [],
      (x) => x.boss?.kind === "grindstone" && x.boss.phase === "lit",
    );
    const t = w.tick;
    const target = side === 0 ? "grindFlatLeft" : "grindFlatRight";
    const player = side === 0 ? 1 : 2;
    const turns: TimedCommand[] = [1, 2, 3, 4, 5].map((id) => ({
      tick: t + ((id - 1) * TPB) / RUBS_PER_BEAT,
      player,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id },
    }));
    run(w, TPB + TPB / 2, turns);
    return w;
  };
}

/** One pad of a seat's jaw, down. */
function pad(tick: number, player: 1 | 2, id: number): TimedCommand {
  const target = player === 1 ? "grindJawLeft" : "grindJawRight";
  return {
    tick,
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id },
  };
}

/** The clamp lit, both jaws held shut for two and a half of its four beats. */
function clamping(): World {
  const w = fresh([], [], { kind: "grindstone", steps: CLAMP_FIRST });
  runUntil(w, "the clamp", [], (x) => x.boss?.kind === "grindstone" && x.boss.phase === "lit");
  const t = w.tick;
  run(w, TPB * 2 + TPB / 2, [pad(t, 1, 0), pad(t, 1, 1), pad(t, 2, 0), pad(t, 2, 1)]);
  return w;
}

const WHEEL =
  "THE GRINDSTONE over the middle column: a gritted wheel with a flat cut on each side and a caliper of two jaws hung over its crown.";

const GRINDSTONE_LEFT_FLAT: Pose = {
  name: "GRINDSTONE · THE LEFT FLAT RUBBED",
  note: `${WHEEL} The left flat's pass is lit; player 1 has rubbed it back and forth five times in a beat and a quarter and player 2 waits. Player 1's screen.`,
  lookAt:
    "whether the grit coming off the left flat reads as *keep rubbing* and the right flat as not yet hers",
  crop: "field",
  role: "p1",
  build: rubbing(0),
};

const GRINDSTONE_RIGHT_FLAT: Pose = {
  name: "GRINDSTONE · THE RIGHT FLAT RUBBED",
  note: `${WHEEL} The right flat's pass is lit; player 2 has rubbed it back and forth five times in a beat and a quarter and player 1 waits. Player 2's screen.`,
  lookAt: "whether the right flat reads as hers on a screen that also draws his",
  crop: "field",
  role: "p2",
  build: rubbing(1),
};

const CLAMP_NOTE = `${WHEEL} A clamp is lit and both seats have held both pads of their own jaw for two and a half of its four beats, so the caliper is bitten shut on the stone.`;

const GRINDSTONE_CLAMPED: Pose = {
  name: "GRINDSTONE · THE CALIPER CLAMPED",
  note: `${CLAMP_NOTE} Player 1's screen, whose jaw is the left.`,
  lookAt:
    "whether two fingers on the left jaw read as one hold, and the right jaw shut too as hers",
  crop: "field",
  role: "p1",
  build: clamping,
};

const GRINDSTONE_CLAMPED_P2: Pose = {
  name: "GRINDSTONE · THE CALIPER CLAMPED, THE OTHER SEAT",
  note: `${CLAMP_NOTE} Player 2's screen, the same instant.`,
  lookAt:
    "whether the pilot's jaw held shut reads as the other half of one clamp rather than as a thing to copy",
  crop: "field",
  role: "p2",
  build: clamping,
};

export const GRINDSTONE_GRIPS: readonly Pose[] = [
  GRINDSTONE_LEFT_FLAT,
  GRINDSTONE_RIGHT_FLAT,
  GRINDSTONE_CLAMPED,
  GRINDSTONE_CLAMPED_P2,
];
