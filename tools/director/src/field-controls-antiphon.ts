import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE ANTIPHON's two handles, one to a screen, in a file of their own.
 *
 * The same split `field-controls-surge.ts` made, for the same reason —
 * `field-controls-page.ts` is at its limit — and with the one thing no row
 * on that page has had before: a handle **on one screen only**. THE
 * SURGE's bulb is one target both seats take on both screens; the organ is
 * one target either seat may send, drawn on the screen shown the organ and
 * never on the screen shown the rail, so on the chooser's it is not there
 * to press — and the two screens swap every level (`render/antiphon-grip.ts`, `sim/antiphon-hand.ts`,
 * `docs/spec/bosses.md` §11.31).
 *
 * The rail below is the mirror of it: the chooser's screen only, and the
 * gesture that answers the fight (`render/antiphon-rail-grip.ts`).
 */
export const ANTIPHON_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE ANTIPHON'S ORGAN",
    where:
      "the organ standing in the middle five rows under the rail, on the " +
      "explainer's screen — player 1's on the first level, swapping every level",
    seat: "the explainer on their screen; either on the test screen — the same circle for each",
    gesture: "hold",
    does:
      "A thumb resting on the organ turns it slowly in place, a whole turn " +
      "in antiphonTurnBeats, and it stops the moment the thumb lifts; the " +
      "grip mark under it fills while a thumb is on. " +
      "The turn is the explainer's way of looking — a lobe the organ hides " +
      "upright it shows turned — and it scores nothing: it changes no " +
      "window, sinks no organ and names no shape (sim/antiphon-hand.ts). " +
      "The rail on the chooser's screen never turns. While no thumb rests on " +
      "it the grip mark wears the halo every asked mark wears " +
      "(render/antiphon-marks.ts); the turn is not judged.",
    source: "touch.ts — antiphonOrganUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "antiphonOrgan",
    sends: ["drag"],
    pose: "ANTIPHON · A THUMB ON THE ORGAN",
  },
  {
    name: "THE ANTIPHON'S RAIL",
    where:
      "any candidate on the rail a third of the way down the field, on the " +
      "chooser's screen — player 2's on the first level, swapping every level",
    seat: "the chooser on their screen; the chooser on the test screen — a ring on each candidate",
    gesture: "grab and drag",
    does:
      "Carrying a candidate down its vein to where the organ stands, " +
      "antiphonReachMilli of the way and never more than " +
      "antiphonVeinSlackMilli of a tile off it, answers the level: the organ " +
      "makes a pit, anything else strikes the hull and the wave is lost " +
      "(sim/antiphon-hand.ts). Let go short and it springs back to the rail. " +
      "Nothing may be carried before the organ has grown all the way out, " +
      "and one at a time. Once the organ stands, every candidate wears the " +
      "halo every asked mark wears, and the verdict is drawn round the " +
      "organ's place on both screens (render/antiphon-marks.ts).",
    source: "touch.ts — antiphonRailUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "antiphonRail",
    sends: ["drag"],
    pose: "ANTIPHON · A CANDIDATE ON ITS VEIN",
  },
];
