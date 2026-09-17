import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE ANTIPHON's one handle, in a file of its own.
 *
 * The same split `field-controls-surge.ts` made, for the same reason —
 * `field-controls-page.ts` is at its limit — and with the one thing no row
 * on that page has had before: a handle **on one screen only**. THE
 * SURGE's bulb is one target both seats take on both screens; the organ is
 * one target either seat may send, drawn on the screen shown the organ and
 * never on the screen shown the rail, so on the navigator's it is not
 * there to press (`render/antiphon-grip.ts`, `sim/antiphon-hand.ts`,
 * `docs/spec/bosses.md` §11.31).
 */
export const ANTIPHON_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE ANTIPHON'S ORGAN",
    where:
      "the organ hanging under the body's middle — twins a gap apart — on " +
      "the screen shown the organ, which is player 1's; nowhere on player 2's",
    seat: "player 1 on his screen; either on the test screen — the same circle for each",
    gesture: "hold",
    does:
      "A thumb resting on the organ turns it slowly in place, a whole turn " +
      "in antiphonTurnBeats, the twins together, and it stops the moment " +
      "the thumb lifts; the grip mark under it fills while a thumb is on. " +
      "The turn is the pilot's way of looking — a lobe the organ hides " +
      "upright it shows turned — and it scores nothing: it changes no " +
      "window, sinks no organ and names no shape (sim/antiphon-hand.ts). " +
      "The rail on player 2's screen never turns.",
    source: "touch.ts — antiphonOrganUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "antiphonOrgan",
    sends: ["drag"],
    pose: "ANTIPHON · A THUMB ON THE ORGAN",
  },
];
