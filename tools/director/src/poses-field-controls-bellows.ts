import type { TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE BELLOWS's two handles, one under each seat's thumb — and, like THE
 * GIMBAL's pair next door, the same encounter photographed twice rather than
 * one picture with a second angle.
 *
 * Two poses because this boss's control is two controls that are **never**
 * offered at once: the pilot is never drawn her bar and the navigator never
 * his, and each is only live in its own beat. A single picture would show one
 * rail with a hand on it and nothing at all saying why the other chamber has
 * no handle under it.
 *
 * The second pose is the first one carried on: his stroke lands, the beat
 * turns, and her bar is the one that is lit. That is why the push pose runs
 * the pull first rather than setting a phase — a gallery pose is **run to**,
 * never set (`.claude/skills/new-boss` §4), and the two pictures side by side
 * are then the alternation itself rather than two arrangements of it.
 */

/** One thumb on one bar: the grab, which carries nothing, then where it is. */
function thumb(
  tick: number,
  player: 1 | 2,
  target: "bellowsPull" | "bellowsPush",
  downMilli: number,
): TimedCommand[] {
  const drag = (fromYMilli: number) =>
    ({ kind: "drag", target, on: true, fromMilli: 0, fromYMilli }) as const;
  return [
    { tick, player, command: drag(0) },
    { tick: tick + 1, player, command: drag(downMilli) },
  ];
}

const BELLOWS_PULL: Pose = {
  name: "BELLOWS · THE PULL HANDLE UNDER A THUMB",
  note: "THE BELLOWS slung across the top of the field: two ribbed chambers joined at a leather waist of four seams, the pilot's own drawn part way out under his thumb. The bar hanging under his cap is the handle, on the rail it runs down; the cap and the bar are both lit because the lung is waiting on him, and PULL stands on the bar. Player 1's screen — the navigator's handle is not drawn here at all.",
  lookAt:
    "whether the bar reads as a thing to carry down rather than as a weight hanging off the housing, and whether the chamber looks drawn out by exactly as far as the thumb has gone",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "bellows" });
    run(w, TPB * 3);
    // Short of `bellowsWorkMilli`, on purpose: past it the stroke lands and
    // the beat turns, which is the *next* pose.
    run(w, 2, thumb(w.tick, 1, "bellowsPull", 420));
    return w;
  },
};

const BELLOWS_PUSH: Pose = {
  name: "BELLOWS · THE PUSH HANDLE UNDER A THUMB",
  note: "The same lung a beat later on the other phone, with his stroke landed: his chamber stands drawn full open across the waist and hers is being pressed shut under her thumb. Her cap and bar are the lit pair now and PUSH stands on her bar — his went dark the moment the beat turned. Player 2's screen, and his handle is not drawn on it.",
  lookAt:
    "whether it is plain at a glance which of the two chambers the field is waiting on, with no word on either cap and nothing counting the beat",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([], [], { kind: "bellows" });
    run(w, TPB * 3);
    // His whole stroke: the bar crossing `bellowsWorkMilli` downward is the
    // act, and letting go is what leaves the next one a hand to start from.
    run(w, 2, thumb(w.tick, 1, "bellowsPull", 900));
    run(w, 1, [
      {
        tick: w.tick,
        player: 1,
        command: { kind: "drag", target: "bellowsPull", on: false, fromMilli: 0, fromYMilli: 0 },
      },
    ]);
    run(w, 2, thumb(w.tick, 2, "bellowsPush", 420));
    return w;
  },
};

export const BELLOWS_GRIPS: readonly Pose[] = [BELLOWS_PULL, BELLOWS_PUSH];
