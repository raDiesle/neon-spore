import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE FLUE's tap, as a row of the ON THE FIELD tab: the flue's row pressed
 * over the column the ember has stopped on, the column carried as the
 * press's `id` (`render/flue-grip.ts`, `docs/spec/bosses.md` §11.57).
 */
const SOURCE =
  "handles.ts — flueTapUnder() under handleUnder(); the column turned back by fieldCol";

export const FLUE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE FLUE'S EMBER",
    where: "anywhere along the flue's row, over the column the thumb means, while a vent is lit",
    seat: "the lit vent's tapper — the seat that is not keeping still; either seat's press is sent",
    gesture: "press",
    does:
      "An **edge**, THE VALVE's pin, carrying the column under the thumb: while " +
      "the rester has kept still long enough to stop the ember, a tap on its " +
      "column is one of `FLUE_TAPS`; a tap on any other column, or before " +
      "the ember stops, is a skid. The rester's own press costs the taps, and a " +
      "thumb resting on the glass has to lift and come down again (sim/flue-hand.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "flueTap",
    sends: ["drag"],
    pose: "FLUE · THE EMBER STEADY",
  },
];
