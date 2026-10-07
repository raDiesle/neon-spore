import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE TRAPEZE's two hands, as rows of the ON THE FIELD tab: the freeze ring
 * and the draw's track, each pressed where it is drawn, and each the lit
 * step's seat's — the freezer's ring and the other seat's track
 * (`render/trapeze-grip.ts`, `docs/spec/bosses-choreographed.md` §39).
 */
const SOURCE =
  "handles.ts — trapezeFreezeUnder() and trapezeDrawUnder() under handleUnder(); the swipe's side carried on the lift by touch.ts' swiped set";

export const TRAPEZE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE TRAPEZE'S FREEZE RING",
    where: "the ring over the lit column, where the boom's tip would be, while a catch is lit",
    seat: "the step's freezer — player 1 on the first catch, player 2 on the second, either on a recatch",
    gesture: "press",
    does:
      "An **edge**, THE VALVE's pin: the press stills the flag for `trapezeFreezeBeats` " +
      "if it is over the lit column that instant, and a thumb resting on the ring " +
      "has to lift and come down again. A tap off the column is a flap, and the " +
      "flag swings on (sim/trapeze-hand.ts). While it asks, the ring wears the " +
      "halo on the freezer's screen and the partner's ring and clock on the " +
      "other's; a freeze on the mark greens it, and a flap reddens it " +
      "(render/trapeze-verdicts.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "trapezeFreeze",
    sends: ["drag"],
    pose: "TRAPEZE · THE FREEZE RING LIT",
  },
  {
    name: "THE TRAPEZE'S DRAW",
    where:
      "the track under the ring, from under the pivot toward the lit column, while a catch is lit",
    seat: "the seat that is not the freezer — either on a recatch, until one of them has frozen it",
    gesture: "grab and drag",
    does:
      "A **draw and swipe**, THE SLING's: a finger down on the track counts its " +
      "beats, and the lift carries the swipe's side. The catch lands only if the " +
      "draw was held `trapezeDrawBeats`, the flag is frozen the instant it lifts, " +
      "and the swipe goes toward the lit column's side; any other lift is a " +
      "flutter, the step still lit (sim/trapeze-hand.ts). While it asks, the " +
      "track wears the halo on the drawer's screen and the partner's ring and " +
      "clock on the other's; a catch greens it, and a flutter or a freeze run " +
      "out before the swipe reddens it (render/trapeze-verdicts.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "trapezeDraw",
    sends: ["drag"],
    pose: "TRAPEZE · THE DRAW HELD",
  },
];
