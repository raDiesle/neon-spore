import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE SCUTTLE's hanging part**, in a file of its own, the split every boss
 * since THE INSTAR has made.
 *
 * One row, and the only one on this tab that buys a **place**. Every other
 * thumb in this game buys time — a beat of still, a window, a count held open
 * — because a fixed hull with a sliding cannon is short of time. This boss is
 * short of something else: it throws a part down a column every cadence and
 * the pair own two columns at once, the cannon's and the shield's. Carrying a
 * hanging part one column moves where the throw lands
 * (`sim/scuttle-hand.ts`, `render/scuttle-grip.ts`).
 *
 * **Every part that may still be carried is ringed, never one of them.** Two
 * come loose a cycle late in the fight and exactly one is live; a ring on the
 * one he should move would be the live socket worked out by subtraction.
 */
export const SCUTTLE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE SCUTTLE'S PART",
    where:
      "a ring on every part that has come loose and not landed, where it " +
      "hangs on its thread this frame — it slides down the thread over the " +
      "cadence and the ring slides with it — on player 1's screen only, and " +
      "only while a carry is left in the cycle",
    seat: "player 1 only — the seat shown every socket and every hanging part uncoloured, so a thumb on one names no live part",
    gesture: "grab and drag",
    does:
      "Carries a hanging part one column along the frame, and it is thrown " +
      "down the column he put it in rather than its socket's: a rock due " +
      "over the shield walks off it, a body due away from the cannon walks " +
      "onto it (sim/scuttle-hand.ts). The bar is scuttleSwingMilli and, " +
      "unlike THE TASTER's gap, the sign is the whole point — it is the " +
      "direction the part goes. One a cycle, and never on the wind-up: the " +
      "last part is burned where it stands. A carry that would take a part " +
      "off the end of the frame is not spent, so a thumb that shoved the " +
      "wrong way may still carry it the other. What it costs is the thumb: " +
      "it is off the cannon and the shield while it is on the frame, and " +
      "this boss throws every cadence.",
    source: "touch.ts — scuttlePartUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "scuttlePart",
    sends: ["drag"],
    pose: "THE SCUTTLE · HELD",
  },
];
