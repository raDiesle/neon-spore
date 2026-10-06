import type { FieldControlDef } from "./field-control-def.js";

/**
 * **SNAKE's hand on its own body**, in a file of its own, the split every boss
 * since THE INSTAR has made.
 *
 * What makes it this round rather than any boss is **when it arrives**: a
 * fight hands out a handle as it loses, and this round hands this one out as
 * the pair *wins*. The body is long because it has eaten, and at six tiles the
 * jaws stick. It is also the first row here drawn on a thing that **moves
 * between beats**: the body steps on a tick and the picture carries it the
 * whole way, so the ring rides the slide (`render/snake-grip.ts`).
 *
 * **The rule shipped first and the picture came after.** The prise was heard
 * by `sim/snake-controls.ts` from 18 September 2026 with nothing on either
 * screen to take hold of — the wave's own guide has been telling player 1 to
 * *drag them open on the head* the whole time. SNAKE'S TAIL, the driver's
 * thumb holding the tail clear, was the second row until the owner took the
 * hold out of the round on 6 October 2026.
 */
export const SNAKE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "SNAKE'S JAWS",
    where:
      "on the first segment of the neck, one tile behind the head and " +
      "sliding with it, from the moment the body is past snakeGorgeTiles — " +
      "behind the jaws rather than over them, so the ring never covers the " +
      "muzzle, the mouth and the heading, which are one thing on this arena " +
      "and the only thing either seat aims with (render/snake-grip.ts)",
    seat:
      "player 1 only — the seat that shoots and swallows. Haloed on his screen " +
      "while asked, the clock on hers; the prise washes it green, and her " +
      "press on it is refused once and washes it red (render/snake-marks.ts)",
    gesture: "grab and drag",
    does:
      "Prises the stuck jaws apart: a carry of at least snakeJawsMilli, " +
      "which opens exactly the window the MAW press used to and is refused " +
      "by exactly the rest that press was held to (sim/snake-controls.ts). " +
      "Past snakeGorgeTiles the press itself is a dead button — this is the " +
      "whole of how a point is swallowed from there on, and the reason the " +
      "round gets harder as it goes well rather than as it goes badly. A " +
      "thumb resting on the neck does nothing at all: the press says " +
      "nothing, the pull is the mouth.",
    source: "touch.ts — snakeGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "snakeJaws",
    sends: ["drag"],
    pose: "SNAKE · GORGE",
  },
];
