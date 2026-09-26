import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GUM's one gesture, in a file of its own on `field-controls-balloon.ts`'s
 * pattern — `field-controls-page.ts` is at its limit, and this row belongs
 * beside the balloon's handles anyway: the second control on the field that
 * is a whole body rather than a cord or a ring hanging off one, and the one
 * that is the grip's own hand read a third way (THE PUSH is the second).
 */
export const GUM_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GUM",
    where: "on the drop itself while it is falling, on both screens",
    seat: "either seat — the same hand the grip is",
    gesture: "grab and drag",
    does:
      "A gum falls straight down a lane, cannot be shot, is not stopped by " +
      "the shield, and hits the ship the moment it reaches it: no scar, but " +
      "the hull takes it and the drop splashes across the whole ship. A " +
      "thumb that only rests on it does nothing — it goes on falling under " +
      "the finger. Carry the finger gumSwipeMilli to the left or to the " +
      "right and it leaves the lane: it flies out level along its row, " +
      "gumFlingCols a beat, and is gone at the wall. Either side is right. " +
      "A gum already on the ship's row is too late to take (sim/gum.ts).",
    source: "touch-move.ts — the grip branch of touchMove()",
    holdKind: "grip",
    dragTarget: "gripBody",
    sends: ["drag"],
    pose: "GUM · FLUNG OUT OF THE FIELD",
  },
];
