import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE VANE's two hands**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * Two rows on two targets, and the one thing worth saying about the pair is
 * that they are a *sequence* rather than a choice: nothing the navigator can
 * do reaches the housing until the pilot has stopped the arm, and from VEER
 * the housing splits nowhere else. So these are the first rows on this tab for
 * handles that, between them, are **the only way a fight can be finished** —
 * the cycle's own openings stop at VEER (`sim/vane-open.ts`), and a wave with
 * no pin in it offers no window at all.
 *
 * **The rules shipped first and the pictures came after**, by three days: both
 * gestures landed on 18 September 2026 with nothing on either screen to take
 * hold of, which is why there were no rows here and `on-field-controls.test.ts`
 * had `vaneArm` and `vaneHousing` filed as `unbuilt`.
 */
export const VANE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE VANE'S ARM",
    where:
      "on the tip of the sweeping arm itself, above the field's first row, " +
      "from VEER on — the ring travels with the arm rather than waiting at a " +
      "rest position, because where the arm is when the thumb lands is the " +
      "whole of what the press decides (render/vane-grip.ts)",
    seat: "player 1 only — the pilot, and nothing at all from the navigator",
    gesture: "hold",
    does:
      "Stops the arm in the column it was in and holds it there while the " +
      "thumb is down, and the housing splits over that column rather than at " +
      "the ends of the sweep. So the grab is an aim: it is the pilot " +
      "choosing which column the navigator will have a window in, on a tip " +
      "that is moving while he decides (sim/vane-hand.ts). Lifting lets the " +
      "arm sweep on and shuts the housing behind it, and the sweep tears it " +
      "out of his thumb vanePinBeats later whatever he does — so the window " +
      "he buys is the one he pays for with the hand he carries the cannon " +
      "with. Refused under SWING, where the cycle is still opening the " +
      "housing on its own clock and a pinned arm would take the fight's one " +
      "window away.",
    source: "touch.ts — vaneGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "vaneArm",
    sends: ["drag"],
    pose: "THE VANE · VEER",
  },
  {
    name: "THE VANE'S HOUSING",
    where:
      "on a ring hanging just under the bearing's hub, and only under SEIZE " +
      "with a pin standing and nothing hauled yet — below the hub rather " +
      "than on it, so the ring never covers the pins the pair are counting " +
      "the fight by (render/vane-grip.ts)",
    seat: "player 2 only — the navigator, and nothing at all from the pilot",
    gesture: "grab and drag",
    does:
      "Hauls the seized housing off the bearing — a pull of at least " +
      "vaneHaulMilli downward, once per pin — which is what opens the split " +
      "the pilot's arm chose. Under SEIZE the bearing has stopped giving " +
      "anything away on its own, so this is the only opening left in the " +
      "fight and the pair have a pin's worth of beats to spend it " +
      "(sim/vane-hand.ts). A tap does nothing: the distance is the gesture, " +
      "which is why it is drawn as a ring to carry and not a button.",
    source: "touch.ts — vaneGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "vaneHousing",
    sends: ["drag"],
    pose: "THE VANE · SEIZE",
  },
];
