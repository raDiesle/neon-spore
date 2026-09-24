import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE LEAD's stalk**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * One row, and the first on this tab for a boss that **shipped as a fixture**.
 * `grippable.ts` refuses a hand on a boss body, and here that refusal is the
 * mechanic rather than an accident of it: a thumb on the body would steer
 * every shot into it, and steering a shot to where a body *will be* is the
 * whole question this fight asks. The still is the one hole in that, because
 * with one segment left `leadShootable` is false and there is nothing in the
 * air to steer (`sim/lead-hand.ts`, `render/lead-grip.ts`).
 *
 * So what the stalk hands over is **time and nothing else**, which is the
 * opposite of THE SCUTTLE's part one row down: the still does not run out
 * while her thumb is on it, and it passes the beat she lets go.
 */
export const LEAD_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE LEAD'S STALK",
    where:
      "a ring on the organ at the tip of the stalk, over the body's own " +
      "column on player 2's screen, and only through the still — from the " +
      "beat the body stops dead with one segment left to the beat the pass " +
      "begins; nowhere on player 1's, where the stalk stands in the middle " +
      "of the field as a readout of the lean",
    seat: "player 2 only — the seat the stalk is drawn at its column on, and the one whose beam the still is for",
    gesture: "hold",
    does:
      "Holds the still open. While her thumb is on the organ the still does " +
      "not run out, and it passes on the beat she lets go, so the window her " +
      "beam has to fill in is the one she is holding rather than the " +
      "leadStillBeats the fight deals (sim/lead-hand.ts). Her fill needs " +
      "lancePrimeBeats, once for each of leadStillFills, which is why the " +
      "hand exists: a pair who spent the still saying the column have missed " +
      "it. Held past leadHoldBeats the stalk tears out of her and it passes " +
      "anyway — the ring fills with a dial running that fuse down, and the " +
      "fight still ends on the pilot's cannon standing where the pass comes " +
      "through (render/lead-grip.ts). Let go of once, the still cannot be " +
      "taken again.",
    source: "touch.ts — leadStalkUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "leadStalk",
    sends: ["drag"],
    pose: "THE LEAD · HELD",
  },
];
