import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE BASTION's three thumbs, as three rows of the ON THE FIELD tab: a slab
 * knob on each side while the armour is lit, and the pilot's rim while the
 * gun ring is (`sim/bastion-hand.ts`, `docs/spec/bosses.md` §11.62).
 *
 * **Both screens draw the one moon and every knob**, and whose a knob is is
 * the simulation's; a press on the partner's is sent through for the
 * simulation to refuse aloud (`render/bastion-grip.ts`).
 */
const slab = (side: "left" | "right") =>
  `A **pull**: a thumb on the knob of the next slab on the ${side} takes hold ` +
  "of it, and carried out along the slab's own way pulls it off the moon — " +
  "sideways and back towards the core count for nothing. Out past " +
  "bastionPullMilli the slab tears off on the tick; let go before that and it " +
  "snaps back, and only that slab starts over (sim/bastion-hand.ts). The knob " +
  "wears the arrow out and, on its own seat's screen, a channel one pull long " +
  "(render/bastion-handles.ts).";

export const BASTION_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE BASTION'S LEFT SLAB",
    where:
      "on the knob in the middle of the next armour slab on the left of the moon, on both screens, while the armour is lit",
    seat: "player 1",
    gesture: "grab and drag",
    does: slab("left"),
    source: "handles.ts — bastionGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "bastionPlateLeft",
    sends: ["drag"],
    pose: "BASTION · PULLING A SLAB",
  },
  {
    name: "THE BASTION'S RIGHT SLAB",
    where:
      "on the knob in the middle of the next armour slab on the right of the moon, on both screens, while the armour is lit",
    seat: "player 2",
    gesture: "grab and drag",
    does: slab("right"),
    source: "handles.ts — bastionGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "bastionPlateRight",
    sends: ["drag"],
    pose: "BASTION · PULLING A SLAB",
  },
  {
    name: "THE BASTION'S RIM",
    where:
      "on the knob under the moon on the gun ring's rim, on both screens, while the gun ring is lit",
    seat: "player 1",
    gesture: "grab and drag",
    does:
      "A **lever**: a thumb on the rim's knob and carried round the moon turns " +
      "it as far, either way — THE MAZE's rim (sim/rim-turn.ts). The guns ride " +
      "round with it, and the one at the front is the one the navigator's shot " +
      "meets. The knob wears a two-headed arrow and, on the pilot's screen, a " +
      "channel round the whole rim (render/bastion-handles.ts).",
    source: "handles.ts — bastionGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "bastionSpin",
    sends: ["drag"],
    pose: "BASTION · TURNING THE RING",
  },
];
