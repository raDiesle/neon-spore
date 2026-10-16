import {
  BLISTER_BLOWS_FIELDS,
  BLISTER_LENGTH_FIELDS,
  BLISTER_UP_BEATS_FIELDS,
  type BlisterGesture,
  blisterLengthOf,
} from "@neon-spore/sim";
import { BLISTER_GESTURES } from "./entry-fields-blister.js";
import type { SliderSpec } from "./tuning.js";

/**
 * **THE BLISTER's sliders**, three a gesture: beats up, blows, and one blow's
 * length where it has one — the defaults every blister of that gesture meets
 * unless its own cell sets one (`cell-config-blister.ts`). The owner, 16
 * October 2026: *let me able to configure the timings/length/number of action
 * required for each control.*
 *
 * Built from the simulation's own tables (`sim/blister-numbers.ts`), so a
 * slider moves the field the game reads. Like every slider here they move the
 * run and never the wave; what ships is `sim/config-blister.ts`.
 */
export const BLISTER_SLIDERS: SliderSpec[] = BLISTER_GESTURES.flatMap((g) => slidersOf(g));

function slidersOf(gesture: BlisterGesture): SliderSpec[] {
  const name = gesture.toUpperCase();
  const out: SliderSpec[] = [
    {
      key: BLISTER_UP_BEATS_FIELDS[gesture],
      label: `${name} up`,
      min: 1,
      max: 16,
      step: 1,
      unit: " beats",
    },
    {
      key: BLISTER_BLOWS_FIELDS[gesture],
      label: `${name} blows`,
      min: 1,
      max: 8,
      step: 1,
      unit: "",
    },
  ];
  const unit = blisterLengthOf(gesture);
  const key = (BLISTER_LENGTH_FIELDS as Partial<Record<BlisterGesture, SliderSpec["key"]>>)[
    gesture
  ];
  if (unit !== undefined && key !== undefined) {
    out.push({
      key,
      label: `${name} length`,
      min: 250,
      max: unit === "tile" ? 5000 : 4000,
      step: 250,
      unit: ` ‰ ${unit}`,
    });
  }
  return out;
}
