import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE HYDRA's six thumbs, as six rows of the ON THE FIELD tab: a neck a
 * side while the biting heads are lit, a coil a side while the coils are,
 * and a head of eyes a side while the eyes are (`sim/hydra-hand.ts`,
 * `docs/spec/bosses.md` §11.64). The maws take no thumb: the cannon answers
 * them.
 *
 * **Both screens draw the one hydra and every mark**, and whose a mark is is
 * the simulation's; a press on the partner's is sent through for the
 * simulation to refuse aloud (`render/hydra-grip.ts`).
 */
const neck = (side: "left" | "right") =>
  `A **swipe**: a thumb on the knob over the ${side} side's next biting ` +
  "head, carried straight across its neck the way the knob's arrow points " +
  "— the one generic PULL, signed sideways (sim/pull.ts). At hydraCutMilli " +
  "the neck is cut through and the head falls; let go short and it glances " +
  "off, and only that neck is still to cut. The knob comes down with its " +
  "head as the window runs, and on its own seat's screen wears the channel " +
  "across (render/hydra-handles.ts).";

const coil = (side: "left" | "right", way: string) =>
  `A **lever**: a thumb on the knob on the ${side} coil's ring, carried ` +
  `round ${way} — THE MAZE's rim (sim/rim-turn.ts). Every lap round takes ` +
  "a ring of the coil off, and the step's laps turn the coil off; round the " +
  "other way it winds back on. **A coil keeps its laps when the thumb " +
  "lifts.** The knob wears the arrow round the way it unwinds and, on its " +
  "own seat's screen, a channel round the ring (render/hydra-handles.ts).";

const eye = (side: "left" | "right") =>
  `A **tap**: a thumb anywhere on the ${side} head of eyes while its eye ` +
  "is open — an edge, a resting thumb has to lift and come down again. Open, " +
  "the eye is put out and the next one wakes; shut, the tap is refused red " +
  "(hydraMiss). The eye opens for hydraStareBeats and blinks shut for " +
  "hydraBlinkBeats, round and round, so the timing is the whole of it.";

const source = "handles.ts — hydraGripUnder() under handleUnder()";

export const HYDRA_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE HYDRA'S LEFT NECK",
    where:
      "on the knob over the next biting head on the left, on both screens, while the bites are lit",
    seat: "player 1",
    gesture: "grab and drag",
    does: neck("left"),
    source,
    holdKind: "drag",
    dragTarget: "hydraNeckLeft",
    sends: ["drag"],
    pose: "HYDRA · SWIPING A NECK",
  },
  {
    name: "THE HYDRA'S RIGHT NECK",
    where:
      "on the knob over the next biting head on the right, on both screens, while the bites are lit",
    seat: "player 2",
    gesture: "grab and drag",
    does: neck("right"),
    source,
    holdKind: "drag",
    dragTarget: "hydraNeckRight",
    sends: ["drag"],
    pose: "HYDRA · SWIPING A NECK",
  },
  {
    name: "THE HYDRA'S LEFT COIL",
    where: "on the knob on the left coil's ring, on both screens, while the coils are lit",
    seat: "player 1",
    gesture: "grab and drag",
    does: coil("left", "anticlockwise"),
    source,
    holdKind: "drag",
    dragTarget: "hydraCoilLeft",
    sends: ["drag"],
    pose: "HYDRA · TURNING A COIL",
  },
  {
    name: "THE HYDRA'S RIGHT COIL",
    where: "on the knob on the right coil's ring, on both screens, while the coils are lit",
    seat: "player 2",
    gesture: "grab and drag",
    does: coil("right", "clockwise"),
    source,
    holdKind: "drag",
    dragTarget: "hydraCoilRight",
    sends: ["drag"],
    pose: "HYDRA · TURNING A COIL",
  },
  {
    name: "THE HYDRA'S LEFT EYE",
    where: "anywhere on the left head of eyes, on both screens, while the eyes are lit",
    seat: "player 1",
    gesture: "press",
    does: eye("left"),
    source,
    holdKind: "drag",
    dragTarget: "hydraEyeLeft",
    sends: ["drag"],
    pose: "HYDRA · TAPPING AN EYE",
  },
  {
    name: "THE HYDRA'S RIGHT EYE",
    where: "anywhere on the right head of eyes, on both screens, while the eyes are lit",
    seat: "player 2",
    gesture: "press",
    does: eye("right"),
    source,
    holdKind: "drag",
    dragTarget: "hydraEyeRight",
    sends: ["drag"],
    pose: "HYDRA · TAPPING AN EYE",
  },
];
