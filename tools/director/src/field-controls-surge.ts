import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE SURGE's one handle, in a file of its own.
 *
 * The same split `field-controls-sinew.ts` made, for the first of its two
 * reasons — `field-controls-page.ts` is at its limit — and with the one
 * thing no row on that page has had before: a **seat of "either"**. Every
 * handle on the field so far belonged to one seat or came as a pair, one
 * each. The bulb is one target both seats send, and which thumb is whose
 * is the command's `player` and nothing on the glass
 * (`sim/surge-hand.ts`, `docs/spec/bosses.md` §11.28).
 */
export const SURGE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE SURGE'S BULB",
    where:
      "the ribbed bulb hung over the middle of the field, on both screens, " +
      "while it is neither re-sealing after a burst nor everting",
    seat: "either — the one handle both seats take, and the same circle for each",
    gesture: "hold",
    does:
      "A thumb anywhere on the bulb is that seat's thumb on it, and the " +
      "grip mark on that seat's flank fills on both screens. Each thumb " +
      "charges the pressure surgeChargeMilli a beat; no thumb leaks it " +
      "surgeDecayMilli. The only gesture that scores is the **lift**: both " +
      "thumbs off within a beat of each other with the pressure inside the " +
      "next notch's band opens that notch (sim/surge-seam.ts) — the bulb " +
      "sinks a row, the seam parts at the notch, the pressure is spent. Over " +
      "the band it bursts: both thumbs thrown off, surgeBurstGums gums down " +
      "the bulb's columns, no hold for surgeBurstBeats. Under it, or one " +
      "thumb alone, the charge is lost. Player 1's screen shows the notches " +
      "and the band and never the pressure; player 2's shows the pressure " +
      "and never the notches; the pressure coming into the band opens THE " +
      "SLOW for both. The last notch everts the bulb and ends it.",
    source: "touch.ts — surgeBulbUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "surgeBulb",
    sends: ["drag"],
    pose: "SURGE · BOTH THUMBS ON THE BULB",
  },
];
