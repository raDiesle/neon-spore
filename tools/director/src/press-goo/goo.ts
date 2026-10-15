import { paintPressDrop } from "../../../../packages/render/src/press-drop.js";
import { fizzAway } from "../hold-goo/goo.js";
import type { PressLook } from "./view.js";

/**
 * **The GOO press**: THE HOLD LAB's drop — the same RIPPLES · STILL drop, at
 * the same size in the same place, boiled away with the same FIZZ once
 * counted (`hold-goo/goo.ts`) — popping up where a hold sinks, calling in a
 * tap rhythm, with STEPS' terraces in it. The drop itself is the game's now
 * (`packages/render/src/press-drop.ts`), since THE BLISTER's TAP took it on
 * 15 October 2026; the lab tells it what its rule says and adds the FIZZ.
 */
export function gooPress(): PressLook {
  return {
    key: "steps",
    name: "steps",
    sentence:
      "SOAK's water cut into presses: one terrace a press, each a jump; the terraces still to come are faint contours on the drop, none for one press and ten close bands for ten",
    paint(v) {
      if (v.ending !== null) fizzAway(v, v.ending);
      if (v.mark) paintPressDrop({ ...v, times: v.ask.times });
    },
  };
}
