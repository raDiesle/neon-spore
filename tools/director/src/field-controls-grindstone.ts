import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GRINDSTONE's flats and jaws, as rows of the ON THE FIELD tab.
 *
 * Two primitives already spent, on one wheel: **a flat is THE RIME's wipe**
 * and **a jaw is THE TRIVET's chord**. Both screens draw the whole wheel and
 * whose is whose is geometry — the left flat and the left jaw the pilot's, the
 * right the navigator's — and a press is whichever of the seat's two it is
 * nearer (`render/grindstone-grip.ts`, `docs/spec/bosses-choreographed.md`
 * §33).
 */
const FLAT_DOES =
  "A **rub**: a thumb within most of a tile of the seat's flat face, held " +
  "and turned back and forth. Each drag says how many times it has turned " +
  "back since it went down, and **every fresh reversal shaves grit** off the " +
  "flat while its pass is lit; a beat nobody rubbed grows grit back, and a " +
  "flat ground to nothing is the pass. A lift sets the count back to nought " +
  "(sim/grindstone-hand.ts, packages/render/src/rub.ts). While its pass is " +
  "lit the flat wears the halo on its seat's screen and the partner's ring " +
  "and clock on the other's; a pass ground clean greens, and a grind through " +
  "the fade or a flat gritted over again reddens (render/grindstone-verdicts.ts).";

const JAW_DOES =
  "A **chord** of two: the caliper's pads on the seat's jaw sit a quarter of " +
  "a tile apart, so which pad a finger is, is the order it landed in, and " +
  "each says its pad down as it lands and up as it lifts. A lit clamp counts " +
  "the beats **both jaws are held shut together**; a pad lifting in a held " +
  "clamp starts the count again (sim/grindstone-hand.ts, " +
  "packages/render/src/chord-pads.ts). While a clamp is lit and the jaw is " +
  "not yet held, it wears the halo on its seat's screen and the partner's " +
  "ring and clock on the other's; a clamp held home greens both jaws, and a " +
  "pad lifted, a pad through the fade or the caliper sprung reddens " +
  "(render/grindstone-verdicts.ts).";

const WHERE_UNTIL = "on both screens, from the drop into frame until the wheel spins free";
const SOURCE =
  "handles.ts — grindstoneGripUnder() under handleUnder(); the flat or jaw is whichever of the seat's two the thumb is nearer";

export const GRINDSTONE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GRINDSTONE'S LEFT FLAT",
    where: `on the wheel's left cut face, ${WHERE_UNTIL}`,
    seat: "player 1 — the left flat is the pilot's, by geometry, on both phones",
    gesture: "grab and drag",
    does: FLAT_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "grindFlatLeft",
    sends: ["drag"],
    pose: "GRINDSTONE · THE LEFT FLAT RUBBED",
  },
  {
    name: "THE GRINDSTONE'S RIGHT FLAT",
    where: `on the wheel's right cut face, ${WHERE_UNTIL}`,
    seat: "player 2 — the right flat is the navigator's, by geometry, on both phones",
    gesture: "grab and drag",
    does: FLAT_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "grindFlatRight",
    sends: ["drag"],
    pose: "GRINDSTONE · THE RIGHT FLAT RUBBED",
  },
  {
    name: "THE GRINDSTONE'S LEFT JAW",
    where: `on the two pads of the caliper's left jaw, ${WHERE_UNTIL}`,
    seat: "player 1 — the left jaw is the pilot's, by geometry, on both phones",
    gesture: "chord",
    does: JAW_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "grindJawLeft",
    sends: ["drag"],
    pose: "GRINDSTONE · THE CALIPER CLAMPED",
  },
  {
    name: "THE GRINDSTONE'S RIGHT JAW",
    where: `on the two pads of the caliper's right jaw, ${WHERE_UNTIL}`,
    seat: "player 2 — the right jaw is the navigator's, by geometry, on both phones",
    gesture: "chord",
    does: JAW_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "grindJawRight",
    sends: ["drag"],
    pose: "GRINDSTONE · THE CALIPER CLAMPED, THE OTHER SEAT",
  },
];
