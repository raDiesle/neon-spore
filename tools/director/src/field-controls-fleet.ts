import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE FLEET's three thumbs on the chart**, in a file of their own, the
 * split every boss since THE INSTAR has made.
 *
 * They sit together because they are one arrangement and it is the boss's
 * whole second half: the hunt is a panel fight, and the two states after a
 * hull is holed are played on the water itself. All three land on the *same*
 * square — the wound — and which of the two seats it answers, and what it
 * does, is the state the round is in (`sim/fleet-hand.ts`,
 * `render/fleet-grip.ts`, `docs/spec/bosses.md` 11.6).
 *
 * **The seats change hands between them**, which nothing else on this page
 * does: under `flood` the plume is hers and the rake is his, under `wreck`
 * the wreck is hers and the hold is his. Two of the rows name
 * `THE FLEET · FLOOD` and the third `THE FLEET · WRECK`, so the pictures on
 * the sheet are the two states rather than one of them twice.
 */
export const FLEET_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE FLEET'S PLUME",
    where:
      "a ring on the holed square, on player 2's screen, and only for the " +
      "fleetFloodBeats the flood lasts — the water standing out of the hole " +
      "is drawn on both screens, the ring on hers",
    seat: "player 2 only — the navigator, who cannot see a hull and can see this one",
    gesture: "hold",
    does:
      "Keeps the hole open. A shell that finds a hull holes it, and the hull " +
      "closes again the moment her thumb leaves — every square the pilot had " +
      "raked is taken back and the hull is afloat and whole (sim/fleet-flood.ts, " +
      "plugFleet). Where on the plume she lands says nothing; that it is down " +
      "is the whole message.",
    source: "touch.ts — fleetGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "fleetBreach",
    sends: ["drag"],
    pose: "THE FLEET · FLOOD",
  },
  {
    name: "THE FLEET'S RAKE",
    where:
      "anywhere along the holed hull, on player 1's screen — the seat that " +
      "sees hulls at all — from the beat it is holed until the wreck is under",
    seat: "player 1 only — the pilot, who is looking at the ship",
    gesture: "grab and drag",
    does:
      "Strikes the hull square by square. Every square his thumb rests on for " +
      "fleetRakeBeats is marked, and a hull raked end to end inside the window " +
      "goes to wreck; one that is not is plugged. The carry is measured from " +
      "the hole rather than from where he grabbed, so the square the round " +
      "reads is the square under his thumb, and the hull's own heading says " +
      "which of the two axes is the rake (sim/fleet-hand.ts).",
    source: "touch.ts — fleetGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "fleetRake",
    sends: ["drag"],
    pose: "THE FLEET · FLOOD",
  },
  {
    name: "THE FLEET'S WRECK",
    where: "the raked hull's wound, on player 2's screen, for the fleetWreckBeats it floats",
    seat: "player 2 only — the navigator again, and the hand-over is the point",
    gesture: "grab and drag",
    does:
      "Drags the wreck under. A pull upward is no pull; fleetWreckPullMilli " +
      "down sinks it — but only while the pilot's thumb is still on the hull, " +
      "so the last gesture of a ship needs both of them at once and neither " +
      "can see the other's half (sim/fleet-hand.ts, sinkFleetWreck).",
    source: "touch.ts — fleetGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "fleetWreck",
    sends: ["drag"],
    pose: "THE FLEET · WRECK",
  },
];
