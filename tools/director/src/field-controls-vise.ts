import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE VISE's two lobe pinches, as rows of the ON THE FIELD tab.
 *
 * THE OCULUS's arrangement: **both screens draw the whole case**, and whose
 * lobe is whose is geometry — the left the pilot's, the right the
 * navigator's. What is new is the gesture: the first pinch in the game, two
 * fingers of one seat on one body, paired by `apps/game/src/pinch.ts` and
 * measured by `render/pinch.ts` (`render/vise-grip.ts`, `docs/spec/bosses.md`
 * §11.45).
 */
const LOBE_DOES =
  "A **pinch**: two fingers of the same seat laid in that seat's zone — its " +
  "side of the spine, the field's width, the rows the case stands in and half " +
  "a tile either way — and closed. **A finger alone sends nothing.** Once the " +
  "second is down, the gap between the fingertips is sent on every move that " +
  "changes it; a lit step counts the beats it stays at or under the shut line " +
  "(`viseShutMilli`) and cracks a seam when they run out, and the gap widening " +
  "past the line starts the count again. **Either finger lifting lets the lobe " +
  "go**, back open. A third finger is nobody's. The case takes a pinch " +
  "whenever it stands, until it splits (sim/vise-hand.ts).";

export const VISE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE VISE'S LEFT LOBE",
    where:
      "in the left half of the field across the rows of the seed-case over the middle column, on both screens, from the drop into frame until it splits",
    seat: "player 1 — the left lobe is the pilot's, by geometry, on both phones; a navigator's fingers there fall through",
    gesture: "pinch",
    does: LOBE_DOES,
    source: "handles.ts — viseLobeUnder() under handleUnder(); the pair in apps/game/src/pinch.ts",
    holdKind: "drag",
    dragTarget: "viseLobeLeft",
    sends: ["drag"],
    pose: "VISE · THE LEFT LOBE PINCHED",
  },
  {
    name: "THE VISE'S RIGHT LOBE",
    where:
      "in the right half of the field across the rows of the seed-case over the middle column, on both screens, from the drop into frame until it splits",
    seat: "player 2 — the right lobe is the navigator's, by geometry, on both phones; a pilot's fingers there fall through",
    gesture: "pinch",
    does: LOBE_DOES,
    source: "handles.ts — viseLobeUnder() under handleUnder(); the pair in apps/game/src/pinch.ts",
    holdKind: "drag",
    dragTarget: "viseLobeRight",
    sends: ["drag"],
    pose: "VISE · THE RIGHT LOBE PINCHED",
  },
];
