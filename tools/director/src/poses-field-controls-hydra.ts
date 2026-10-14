import type { DragTarget, HydraStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE HYDRA's thumbs: the biting heads lit with the pilot's thumb most of
 * the way across his neck, the coils lit with his thumb a lap and a half
 * round his, and the eyes lit with one of his put out and the next one open.
 * Photographed on the pilot's screen. A gallery pose is run to, never set
 * (`.claude/skills/new-boss` §4).
 */

const BITES: HydraStep[] = [{ head: "bite", count: 2, beats: 40 }];
const COILS: HydraStep[] = [{ head: "coil", laps: 2, beats: 40 }];
const EYES: HydraStep[] = [{ head: "eye", count: 4, beats: 40 }];

const drag = (target: DragTarget, x: number, on = true): TimedCommand => ({
  tick: 0,
  player: 1,
  command: { kind: "drag", target, on, fromMilli: x, fromYMilli: 0 },
});

/** The hydra in with `steps`, its first level lit. */
function lit(steps: HydraStep[]): World {
  const w = fresh([], [], { kind: "hydra", steps });
  runUntil(
    w,
    "the first level lit",
    [],
    (x) => x.boss?.kind === "hydra" && x.boss.phase === "heads",
  );
  return w;
}

/** The pilot carries his knob most of the way across his first neck, outward. */
function swiping(): World {
  const w = lit(BITES);
  run(w, 1, [{ ...drag("hydraNeckLeft", 0), tick: w.tick }]);
  run(w, TPB / 2, [{ ...drag("hydraNeckLeft", -1100), tick: w.tick }]);
  return w;
}

/** The pilot turns his coil a lap and a half round anticlockwise. */
function turning(): World {
  const w = lit(COILS);
  run(w, 1, [{ ...drag("hydraCoilLeft", 0), tick: w.tick }]);
  for (let m = -400; m >= -8400; m -= 400)
    run(w, 1, [{ ...drag("hydraCoilLeft", m), tick: w.tick }]);
  run(w, TPB / 2);
  return w;
}

/** The pilot taps his first eye out as it opens, and the next one opens. */
function tapping(): World {
  const w = lit(EYES);
  const open = (x: World) => x.boss?.kind === "hydra" && x.boss.lidOpen[0];
  runUntil(w, "the pilot's first eye open", [], open);
  run(w, 1, [{ ...drag("hydraEyeLeft", 0), tick: w.tick }]);
  run(w, 1, [{ ...drag("hydraEyeLeft", 0, false), tick: w.tick }]);
  runUntil(w, "the pilot's next eye open", [], open);
  run(w, TPB / 4);
  return w;
}

const HYDRA_SWIPING: Pose = {
  name: "HYDRA · SWIPING A NECK",
  note: "THE HYDRA over the field, a teal slime with its biting heads lit, two a side, swinging down on their necks at the hull. The pilot's thumb has carried the knob on his next neck most of the way across it, the channel filling and a gash opening in the neck; the navigator's knob on the right is drawn dim, waiting. Player 1's screen.",
  lookAt:
    "whether the knob reads as a thing to swipe across the neck, and the gash opening as how far is left",
  crop: "field",
  role: "p1",
  build: swiping,
};

const HYDRA_TURNING: Pose = {
  name: "HYDRA · TURNING A COIL",
  note: "THE HYDRA with its coils lit, a neck a side wound flat on the field with its head biting at the middle. The pilot's thumb has carried the knob on his coil's ring a lap and a half round anticlockwise, the coil a ring smaller and turned with it; the navigator's coil on the right is whole, its knob dim. Player 1's screen.",
  lookAt:
    "whether the lever reads as a thing to turn round, and the spiral shrinking as how far is left",
  crop: "field",
  role: "p1",
  build: turning,
};

const HYDRA_TAPPING: Pose = {
  name: "HYDRA · TAPPING AN EYE",
  note: "THE HYDRA with its eyes lit, a great bulb of a head a side with its eyes in a ring. The pilot has tapped his first eye out as it opened — seared shut and stitched — and the next one round is open, amber and haloed with TAP. Player 1's screen.",
  lookAt: "whether the open eye reads as the one to tap, and the stitched eye as one done",
  crop: "field",
  role: "p1",
  build: tapping,
};

export const HYDRA_GRIPS: readonly Pose[] = [HYDRA_SWIPING, HYDRA_TURNING, HYDRA_TAPPING];
