import type { BastionStep, DragTarget, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE BASTION's thumbs: the armour lit with the pilot's thumb carrying his
 * next slab most of a pull out, and the gun ring lit with his thumb on the
 * rim, the moon turned a way round. Photographed on the pilot's screen. A
 * gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

const ARMOUR: BastionStep[] = [{ layer: "plates", beats: 32 }];
const RING: BastionStep[] = [
  { layer: "ring", colors: ["red", "cyan", "red", "cyan", "red", "cyan"], beats: 40 },
];

const drag = (target: DragTarget, x: number, y = 0): TimedCommand => ({
  tick: 0,
  player: 1,
  command: { kind: "drag", target, on: true, fromMilli: x, fromYMilli: y },
});

/** The moon in with `steps`, its first shell lit. */
function lit(steps: BastionStep[]): World {
  const w = fresh([], [], { kind: "bastion", steps });
  runUntil(
    w,
    "the first shell lit",
    [],
    (x) => x.boss?.kind === "bastion" && x.boss.phase === "layer",
  );
  return w;
}

/** The pilot takes his first slab, top left, and carries it up and out most of a pull. */
function pulling(): World {
  const w = lit(ARMOUR);
  run(w, 1, [{ ...drag("bastionPlateLeft", 0), tick: w.tick }]);
  run(w, TPB / 2, [{ ...drag("bastionPlateLeft", -900, -900), tick: w.tick }]);
  return w;
}

/** The pilot takes the rim and carries it a stretch round. */
function turning(): World {
  const w = lit(RING);
  run(w, 1, [{ ...drag("bastionSpin", 0), tick: w.tick }]);
  run(w, TPB / 2, [{ ...drag("bastionSpin", 1600), tick: w.tick }]);
  return w;
}

const BASTION_PULLING: Pose = {
  name: "BASTION · PULLING A SLAB",
  note: "THE BASTION over the field: a metal moon in blue gunmetal slabs, the armour lit. The pilot's thumb has carried the knob on his next slab on the left most of a pull out along the slab's way, the channel behind it filling; the navigator's knob on the right is drawn dim, waiting. Player 1's screen.",
  lookAt:
    "whether the knob reads as a thing to pull out away from the moon, and the slab coming with it as how far is left",
  crop: "field",
  role: "p1",
  build: pulling,
};

const BASTION_TURNING: Pose = {
  name: "BASTION · TURNING THE RING",
  note: "THE BASTION with its armour off and its bronze gun ring lit, red and cyan guns round it. The pilot's thumb is on the knob under the moon and has carried it a stretch round the ring's channel, the moon and its guns turned with it. Player 1's screen.",
  lookAt:
    "whether the rim reads as a thing to turn either way, and the gun at the front as the one the shot will meet",
  crop: "field",
  role: "p1",
  build: turning,
};

export const BASTION_GRIPS: readonly Pose[] = [BASTION_PULLING, BASTION_TURNING];
