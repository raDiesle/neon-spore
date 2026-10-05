import { type LampreyStep, lampreyBoss, type World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE LAMPREY's hands, **each photographed from the seat that presses it**:
 * the tail from the pilot's screen, the head and the teeth from the
 * navigator's. A gallery pose is run to, never set (`.claude/skills/new-boss`
 * §4). The eel is `render/src/lamprey-draw.ts`.
 */

/** The pilot holds the tail; the navigator pulls the head, then taps. */
const STEPS: LampreyStep[] = [
  { ask: "pull", holder: 1, teeth: 0, jump: 2, beats: 12, color: "either" },
  { ask: "teeth", holder: 1, teeth: 2, jump: 3, beats: 16, color: "either" },
];

/** The first stay on, the pilot's thumb down on the tail. */
function held(): World {
  const w = fresh([], [], { kind: "lamprey", steps: STEPS });
  runUntil(w, "the first bite on", [], (x) => lampreyBoss(x)?.phase === "bite");
  run(w, TPB, [
    {
      tick: w.tick,
      player: 1,
      command: { kind: "drag", target: "lampreyTail", on: true, fromMilli: 0, fromYMilli: 0 },
    },
  ]);
  return w;
}

/** The tail held, and the navigator's thumb half way up with the head. */
function pulling(): World {
  const w = held();
  const drag = (fromYMilli: number) => ({
    kind: "drag" as const,
    target: "lampreyHead" as const,
    on: true,
    fromMilli: 0,
    fromYMilli,
  });
  run(w, TPB, [
    { tick: w.tick, player: 2, command: drag(0) },
    { tick: w.tick, player: 2, command: drag(-700) },
  ]);
  return w;
}

/** The second stay on, a `teeth`, the pilot's thumb on the tail. */
function biting(): World {
  const w = pulling();
  run(w, TPB, [
    {
      tick: w.tick,
      player: 2,
      command: { kind: "drag", target: "lampreyHead", on: true, fromMilli: 0, fromYMilli: -1600 },
    },
  ]);
  runUntil(w, "the second bite on", [], (x) => {
    const s = lampreyBoss(x);
    return s?.phase === "bite" && s.cursor === 1;
  });
  run(w, TPB, [
    {
      tick: w.tick,
      player: 1,
      command: { kind: "drag", target: "lampreyTail", on: true, fromMilli: 0, fromYMilli: 0 },
    },
  ]);
  return w;
}

const LAMPREY_TAIL: Pose = {
  name: "LAMPREY · THE TAIL HELD",
  note: "THE LAMPREY bitten into a tile, its tail laid away from where it leaps next. Player 1's thumb is down on the tail's knob, so the partner's pull will count. Player 1's screen, the holding seat's.",
  lookAt: "whether the tail's knob reads as *keep your thumb here*",
  crop: "field",
  role: "p1",
  build: held,
};

const LAMPREY_HEAD: Pose = {
  name: "LAMPREY · THE HEAD PULLED",
  note: "The same stay on player 2's screen: the head's knob on the tile, its channel running straight up, the thumb half way, the mouth coming off the tile with it.",
  lookAt: "whether the head's channel reads as *drag this up*",
  crop: "field",
  role: "p2",
  build: pulling,
};

const LAMPREY_TOOTH: Pose = {
  name: "LAMPREY · THE LIT TOOTH",
  note: "A `teeth` stay on player 2's screen, the worker's: one tooth of the ring lit, the partner's thumb holding the tail.",
  lookAt: "whether the one lit tooth reads as *tap this one, now*",
  crop: "field",
  role: "p2",
  build: biting,
};

export const LAMPREY_GRIPS: readonly Pose[] = [LAMPREY_TAIL, LAMPREY_HEAD, LAMPREY_TOOTH];
