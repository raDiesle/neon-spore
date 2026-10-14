import type { ChrysalisStep, DragTarget, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE CHRYSALIS's thumbs: the slime lit with the pilot's thumb three turns
 * into rubbing his half, and the quills lit with his thumb carrying his next
 * quill most of a pull out. Photographed on the pilot's screen. A gallery
 * pose is run to, never set (`.claude/skills/new-boss` §4).
 */

const SLIME: ChrysalisStep[] = [{ skin: "slime", rubs: 6, beats: 40 }];
const QUILLS: ChrysalisStep[] = [{ skin: "quills", beats: 40 }];

const drag = (target: DragTarget, x: number, y = 0, id?: number): TimedCommand => ({
  tick: 0,
  player: 1,
  command: { kind: "drag", target, on: true, fromMilli: x, fromYMilli: y, ...(id && { id }) },
});

/** The cocoon in with `steps`, its first skin lit. */
function lit(steps: ChrysalisStep[]): World {
  const w = fresh([], [], { kind: "chrysalis", steps });
  runUntil(
    w,
    "the first skin lit",
    [],
    (x) => x.boss?.kind === "chrysalis" && x.boss.phase === "skin",
  );
  return w;
}

/** The pilot rubs his half of the slime three turns. */
function rubbing(): World {
  const w = lit(SLIME);
  run(w, TPB / 2, [{ ...drag("chrysalisRubLeft", 0, 0, 3), tick: w.tick }]);
  return w;
}

/** The pilot takes his first quill, top left, and carries it up and out most of a pull. */
function pulling(): World {
  const w = lit(QUILLS);
  run(w, 1, [{ ...drag("chrysalisQuillLeft", 0), tick: w.tick }]);
  run(w, TPB / 2, [{ ...drag("chrysalisQuillLeft", -900, -900), tick: w.tick }]);
  return w;
}

const CHRYSALIS_RUBBING: Pose = {
  name: "CHRYSALIS · RUBBING THE SLIME",
  note: "THE CHRYSALIS over the field: a plum cocoon hung on silk under a coat of lime slime, the slime lit. The pilot's thumb has rubbed his left half three turns of six, the half thinner and gleaming; the navigator's right half is whole, wearing the partner's ring. Player 1's screen.",
  lookAt:
    "whether the drop reads as a thing to rub back and forth, and the half thinning as how far is left",
  crop: "field",
  role: "p1",
  build: rubbing,
};

const CHRYSALIS_PULLING: Pose = {
  name: "CHRYSALIS · PULLING A QUILL",
  note: "THE CHRYSALIS with its slime off and its bone quills lit, four a side. The pilot's thumb has carried the knob on his next quill on the left most of a pull out along its way, the channel behind it filling and the quill stretched from its socket; the navigator's knob on the right is drawn dim, waiting. Player 1's screen.",
  lookAt:
    "whether the knob reads as a thing to pull out away from the cocoon, and the quill coming with it as how far is left",
  crop: "field",
  role: "p1",
  build: pulling,
};

export const CHRYSALIS_GRIPS: readonly Pose[] = [CHRYSALIS_RUBBING, CHRYSALIS_PULLING];
