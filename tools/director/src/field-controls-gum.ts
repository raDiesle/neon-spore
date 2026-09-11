import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GUM's one handle, in a file of its own on `field-controls-balloon.ts`'s
 * pattern — `field-controls-page.ts` is at its limit, and this row belongs
 * beside the balloon's right handle anyway: the second control on the field
 * that is player 2's, and the first that is a whole body rather than a cord or
 * a ring hanging off one.
 */
export const GUM_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GUM",
    where: "on the smear itself, stuck to the ship, on both screens",
    seat: "player 2 — the seat that cannot move the cannon",
    gesture: "grab and drag",
    does:
      "A gum falls straight down a lane, cannot be shot, is not stopped by " +
      "the shield, and sticks to the ship where it lands. While it is stuck " +
      "the cannon fires nothing from under it. It only moves while the " +
      "cannon is parked in one of its columns — player 1's half of the " +
      "gesture — and then a swipe of gumSwipeMilli toward the **nearer** " +
      "side wall flings it off for scoreGumFlung. A swipe toward the far " +
      "wall spreads it gumSpreadCols wider instead, once per hold. Swiped " +
      "with no cannon under it, it does not budge, which is how player 2 " +
      "reads where the cannon is (sim/gum.ts).",
    source: "touch.ts — gumUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gum",
    sends: ["drag"],
  },
];
