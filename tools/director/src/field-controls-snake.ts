import type { FieldControlDef } from "./field-control-def.js";

/**
 * **SNAKE's two hands on its own body**, in a file of its own, the split every
 * boss since THE INSTAR has made.
 *
 * Two rows on two targets, and what makes them this round rather than any boss
 * is **when they arrive**: a fight hands out a handle as it loses, and this
 * round hands these out as the pair *wins*. The body is long because it has
 * eaten, and at six tiles the jaws stick and at eight the tail drags — so the
 * better the round is going the more of it is played with a thumb on the animal
 * itself. They are also the first two rows here that are drawn on a thing that
 * **moves between beats**: the body steps on a tick and the picture carries it
 * the whole way, so both rings ride the slide (`render/snake-grip.ts`).
 *
 * **The rules shipped first and the pictures came after.** Both gestures were
 * heard by `sim/snake-controls.ts` from 18 September 2026 with nothing on
 * either screen to take hold of — the wave's own guide has been telling player
 * 1 to *drag them open on the head* the whole time — which is why there were no
 * rows here and `on-field-controls.test.ts` had `snakeJaws` and `snakeTail`
 * filed as `unbuilt`.
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
    seat: "player 1 only — the seat that shoots and swallows, never the driver",
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
  {
    name: "SNAKE'S TAIL",
    where:
      "on the last joint of the tail, sliding with it, from the moment the " +
      "body is past snakeShedTiles — the one place on the arena with nothing " +
      "else drawn on it (render/snake-grip.ts)",
    seat: "player 2 only — the driver, and nothing at all from the pilot",
    gesture: "hold",
    does:
      "Lifts the last snakeTailTiles of the body clear of the board for as " +
      "long as her thumb is down, so the head may run through its own tail " +
      "(sim/snake.ts, snakeLifted). It is the one thing in the round that " +
      "makes the body less dangerous, and it costs her the hand she steers " +
      "with — which is the whole of the trade, and why it is a hold and not " +
      "a press. Letting go puts the tail back on the board under wherever " +
      "the body has got to.",
    source: "touch.ts — snakeGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "snakeTail",
    sends: ["drag"],
    pose: "SNAKE · SHED",
  },
];
