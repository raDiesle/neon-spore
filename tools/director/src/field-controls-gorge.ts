import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GORGE's one thumb, in a file of its own — `field-controls-page.ts`
 * is at its limit, the split every boss since THE INSTAR has made.
 *
 * One target, `gorgeLobe`, with `id` the bubble, and one seat: player 1 taps
 * the bottom bubble of a ring open (`sim/gorge-hand.ts`). A row level has no
 * thumb on it at all — the cannon and the shot are the whole of it
 * (`render/gorge-grip.ts`, `docs/spec/bosses.md` §11.23).
 */
export const GORGE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GORGE'S TAP",
    where:
      "a ring on the bottom bubble of a ring level while it is shut, on " +
      "player 1's screen; nowhere on player 2's; on the test screen",
    seat:
      "player 1 only — the seat shown the order, who knows which bubble is " +
      "worth opening. The ring is haloed while that bubble is due " +
      "(render/gorge-marks.ts, sim/gorge-hand.ts gorgeAsks)",
    gesture: "press",
    does:
      "Each press is one tap; gorgeOpenTaps of them open the bubble to " +
      "shots, a dial round the ring counting them down. The taps are lost " +
      "when the ring turns the bubble away (sim/gorge-step.ts).",
    source: "touch.ts — gorgeGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gorgeLobe",
    sends: ["drag"],
    pose: "THE GORGE · RING",
  },
];
