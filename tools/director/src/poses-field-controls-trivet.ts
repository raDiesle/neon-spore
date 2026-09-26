import type { TimedCommand, TrivetStep, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE TRIVET's two hands: a chord of two on each foot, both seats keeping
 * the stand planted together. **One instant photographed twice**, THE VISE's
 * arrangement, because both screens draw the whole stand and the point of a
 * `both` step is that each phone shows the other seat's foot held too. A
 * gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** A `both` step first, so the one instant has both seats' fingers on it. */
const OPENING: TrivetStep[] = [
  { ask: "both", pads: 2, color: "either", beats: 4 },
  { ask: "fire", pads: 2, color: "red", beats: 3 },
];

/** One finger of a seat's chord, down on pad `pad`. */
function pressed(tick: number, player: 1 | 2, pad: number): TimedCommand {
  return {
    tick,
    player,
    command: {
      kind: "drag",
      target: player === 1 ? "trivetPadFront" : "trivetPadRear",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: pad,
    },
  };
}

/** The step lit, both feet chorded for two and a half of its four beats. */
function chording(): World {
  const w = fresh([], [], { kind: "trivet", steps: OPENING });
  runUntil(w, "the first step", [], (x) => x.boss?.kind === "trivet" && x.boss.phase === "lit");
  const t = w.tick;
  run(w, TPB * 2 + TPB / 2, [
    pressed(t, 1, 0),
    pressed(t, 1, 1),
    pressed(t, 2, 0),
    pressed(t, 2, 1),
  ]);
  return w;
}

const CHORDING_NOTE =
  "THE TRIVET stood over the middle column: a hub on three legs, a front foot splayed left and a rear foot splayed right, each with a row of sockets. Two sockets on each foot are lit and both seats have held a chord of two fingers on their own foot for two and a half of the step's four beats.";

const TRIVET_FRONT: Pose = {
  name: "TRIVET · THE FRONT FOOT CHORDED",
  note: `${CHORDING_NOTE} Player 1's screen, whose foot is the front.`,
  lookAt:
    "whether the front foot reads as his and the rear as hers without a word, and whether the lit sockets plainly say *how many fingers* rather than *where*",
  crop: "field",
  role: "p1",
  build: chording,
};

const TRIVET_REAR: Pose = {
  name: "TRIVET · THE REAR FOOT CHORDED",
  note: `${CHORDING_NOTE} Player 2's screen, the same instant.`,
  lookAt:
    "whether the pilot's chord on the other foot reads as the other half of one hold rather than as a thing to copy",
  crop: "field",
  role: "p2",
  build: chording,
};

export const TRIVET_GRIPS: readonly Pose[] = [TRIVET_FRONT, TRIVET_REAR];
