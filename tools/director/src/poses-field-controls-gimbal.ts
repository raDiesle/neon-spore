import { GIMBAL_SCRIPT } from "@neon-spore/content";
import type { TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE GIMBAL's two rings, one under each seat's thumb — **the first pair of
 * poses here that are the same moment photographed twice**.
 *
 * Its own file for `poses-field-controls-surge.ts`'s reason (that page is at
 * its limit), and two poses rather than one because this boss's control is
 * two controls that cannot be shown together: the pilot is never drawn the
 * inner ring and the navigator never the outer, so a single picture would be
 * a picture of half the handle with the other half missing and nothing
 * saying why. Side by side they are the encounter — the same alignment, one
 * beat of it, and the marks standing in two places that do not look like
 * the same place.
 *
 * Three beats in, so the cradle has lit its first alignment (`gimbalStillBeats`
 * is two) and the marks are up on both rims.
 *
 * Two messages a thumb, the ring's own arrangement: the grab carries
 * `NO_BEARING` and turns nothing, and the sample after it is where the thumb
 * actually is. That second one is also what lights the knurl — `gimbalHeld`
 * is true from it on (`render/gimbal-grip.ts`).
 */

/** One thumb going on one rim: the grab that turns nothing, then where it is. */
function thumb(
  tick: number,
  player: 1 | 2,
  target: "gimbalOuter" | "gimbalInner",
  atMilli: number,
): TimedCommand[] {
  const drag = (fromMilli: number) =>
    ({ kind: "drag", target, on: true, fromMilli, fromYMilli: 0 }) as const;
  return [
    { tick, player, command: drag(-1) },
    { tick: tick + 1, player, command: drag(atMilli) },
  ];
}

const GIMBAL_OUTER: Pose = {
  name: "GIMBAL · THE OUTER RING UNDER A THUMB",
  note: "THE GIMBAL hung in its yoke over the middle of the field: a sealed drum inside the pilot's ring, pinned at the top and the bottom, with three latch-teeth standing out of its rim. The knurl is the ring of short ticks across the rim, lit because his thumb is on it, and the wedge outside the rim is his own mark. Player 1's screen: the navigator's ring is not drawn here at all.",
  lookAt:
    "whether the knurl reads as the part a hand answers rather than as more teeth, and whether the wedge reads as a place the rim has to be brought to",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "gimbal", marks: GIMBAL_SCRIPT });
    run(w, TPB * 3);
    run(w, 2, thumb(w.tick, 1, "gimbalOuter", 120));
    return w;
  },
};

const GIMBAL_INNER: Pose = {
  name: "GIMBAL · THE INNER RING UNDER A THUMB",
  note: "The same cradle one beat later on the other phone: the navigator's ring, smaller and pinned at its sides rather than at its top and bottom, with her own mark outside it and the knurl lit under her thumb. Player 2's screen, and the pilot's ring is not drawn here — the two pins are the only thing on either screen that says which ring this is.",
  lookAt:
    "whether the side pins make this read as a different ring from the pilot's rather than as the same picture smaller, and whether her mark sits somewhere his does not",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([], [], { kind: "gimbal", marks: GIMBAL_SCRIPT });
    run(w, TPB * 3);
    run(w, 2, thumb(w.tick, 2, "gimbalInner", 620));
    return w;
  },
};

export const GIMBAL_GRIPS: readonly Pose[] = [GIMBAL_OUTER, GIMBAL_INNER];
