import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE VISE's two lobes, carried shut, as rows of the ON THE FIELD tab.
 *
 * THE OCULUS's arrangement: **both screens draw the whole case**, and whose
 * lobe is whose is geometry — the left the pilot's, the right the
 * navigator's. The gesture was the game's one pinch, two fingers of one seat,
 * until the owner ruled one finger a player on 8 October 2026; one thumb
 * carries the lobe shut now (`render/vise-grip.ts`, `render/vise-carry.ts`,
 * `docs/spec/bosses.md` §11.45).
 */
const LOBE_DOES =
  "A **carry**: one thumb laid in that seat's zone — its side of the spine, " +
  "the field's width, the rows the case stands in and half a tile either way " +
  "— and carried, any way at all. **The press sends nothing.** Every move " +
  "sends the gap left, the open gap (`viseOpenMilli`) less however far the " +
  "thumb has come; a lit step counts the beats it stays at or under the shut " +
  "line (`viseShutMilli`) and cracks a seam when they run out, and the thumb " +
  "coming back past the line starts the count again. **The lift lets the " +
  "lobe go**, back open. The case takes a hand whenever it stands, until it " +
  "splits (sim/vise-hand.ts). While a step " +
  "naming a lobe is lit and its gap is not yet shut, the lobe wears the halo " +
  "on its seat's screen and the partner's ring and clock on the other's; a " +
  "seam cracked greens its lobe, a brace greens both, and a slip or a step " +
  "run out reddens the lobe it asked (render/vise-verdicts.ts).";

export const VISE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE VISE'S LEFT LOBE",
    where:
      "in the left half of the field across the rows of the seed-case over the middle column, on both screens, from the drop into frame until it splits",
    seat: "player 1 — the left lobe is the pilot's, by geometry, on both phones; a navigator's thumb there falls through",
    gesture: "grab and drag",
    does: LOBE_DOES,
    source:
      "handles.ts — viseLobeUnder() under handleUnder(); the carry in packages/render/src/vise-carry.ts",
    holdKind: "drag",
    dragTarget: "viseLobeLeft",
    sends: ["drag"],
    pose: "VISE · THE LEFT LOBE PINCHED",
  },
  {
    name: "THE VISE'S RIGHT LOBE",
    where:
      "in the right half of the field across the rows of the seed-case over the middle column, on both screens, from the drop into frame until it splits",
    seat: "player 2 — the right lobe is the navigator's, by geometry, on both phones; a pilot's thumb there falls through",
    gesture: "grab and drag",
    does: LOBE_DOES,
    source:
      "handles.ts — viseLobeUnder() under handleUnder(); the carry in packages/render/src/vise-carry.ts",
    holdKind: "drag",
    dragTarget: "viseLobeRight",
    sends: ["drag"],
    pose: "VISE · THE RIGHT LOBE PINCHED",
  },
];
