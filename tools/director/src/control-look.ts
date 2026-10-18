import type { BlisterGesture } from "@neon-spore/sim";
import { livingStroke } from "./brush-cards.js";
import {
  CONTROL_BRUSHES,
  CONTROL_KIND,
  type ControlBrush,
  controlGestureOf,
} from "./control-brushes.js";
import { gestureLabel } from "./entry-fields-blister.js";

/**
 * **The CONTROLS brushes as the palette shows them**: the gesture's word, the
 * blister's stroke, and a line saying what the hand does — the one thing that
 * tells the five apart (`control-brushes.ts`).
 */
const NOTE: Record<BlisterGesture, string> = {
  tap: "tap it while it is up; the other says where",
  hold: "hold it down while it is up; the other says where",
  swipe: "pull it down its channel while it is up",
  turn: "turn the knob round it while it is up",
  rub: "rub it back and forth while it is up",
  combo: "press it, then pull the knob that comes in its place",
  lever: "carry its knob down into the band and hold it there",
};

export const CONTROL_LOOK: {
  brush: ControlBrush;
  label: string;
  subjects: string[];
  stroke: string;
  note: string;
}[] = CONTROL_BRUSHES.map((brush) => {
  const gesture = controlGestureOf(brush) as BlisterGesture;
  return {
    brush,
    label: gestureLabel(gesture),
    subjects: [],
    stroke: livingStroke(CONTROL_KIND),
    note: NOTE[gesture],
  };
});
