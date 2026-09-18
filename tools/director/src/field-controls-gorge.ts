import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GORGE's two thumbs, in a file of their own — `field-controls-page.ts`
 * is at its limit, the split every boss since THE INSTAR has made.
 *
 * One target, `gorgeLobe`, with `id` the intake, and the seat says the
 * gesture (`sim/gorge-hand.ts`): player 1's thumb on a full intake is a
 * pinch, player 2's on the mouth is a pry. Two rows rather than one because
 * they are two rings on two screens, each with a pose of its own
 * (`render/gorge-grip.ts`, `docs/spec/bosses.md` §11.23).
 */
export const GORGE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GORGE'S PINCH",
    where:
      "a ring in every full intake that is not the mouth, over the top of the " +
      "field on player 1's screen; nowhere on player 2's; on the test screen",
    seat: "player 1 only — the seat shown the count and holding the cannon on the column",
    gesture: "hold",
    does:
      "Holds the intake's vent off for as long as the thumb stays, so P2 can " +
      "load the pierce in her own time. On the lift the vent count restarts " +
      "from the lift: a pause and not a pardon (sim/gorge-hand.ts).",
    source: "touch.ts — gorgeGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gorgeLobe",
    sends: ["drag"],
    pose: "THE GORGE · SPITTING",
  },
  {
    name: "THE GORGE'S PRY",
    where:
      "a ring in the mouth, over the top of the field on player 2's screen " +
      "once the sack is gorged; nowhere on player 1's; on the test screen",
    seat: "player 2 only — the seat shown the mouth's colour and loading the beam",
    gesture: "hold",
    does:
      "Pries the mouth open for gorgePryBeats, a dial round the ring running " +
      "the window out; the beam in the mouth's colour ends the fight only " +
      "inside it. Held past the window the mouth clenches: the thumb is thrown " +
      "off and a bead spat. Taken late, with the beam already filling " +
      "(sim/gorge-pry.ts).",
    source: "touch.ts — gorgeGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gorgeLobe",
    sends: ["drag"],
    pose: "THE GORGE · GORGED",
  },
];
