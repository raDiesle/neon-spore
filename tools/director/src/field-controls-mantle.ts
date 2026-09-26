import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE MANTLE's two knobs and its core, as rows of the ON THE FIELD tab.
 *
 * Three rows, and the only boss here whose **both screens draw both
 * handles**: the fight is the sum of the two pulls, so neither half of it is
 * hidden. Whose knob is whose is geometry — the left the pilot's, the right
 * the navigator's — and a thumb on the other seat's knob falls through
 * (`render/mantle-grip.ts`, `docs/spec/bosses.md` §11.40).
 */
const KNOB_DOES =
  "Carries the knob **down** its groove, and it stands at the depth the " +
  "thumb has it. The two depths are **summed**, and the pair shears when " +
  "the sum passes this movement's threshold — but only while **both** " +
  "handles are past mantleFloorMilli at once: one thumb at the bottom and " +
  "the other at nought shears nothing. **Letting go costs the whole pull**, " +
  "at once: the depth is the thumb's, never banked. A press before the " +
  "handles light is held here and counts from the tick they do " +
  "(sim/mantle-hand.ts). No desk key: the groove is a carry, not a turn.";

export const MANTLE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE MANTLE'S LEFT KNOB",
    where:
      "on the knob hung off the left valve of the shell above the middle of the field, on both screens, from the drop into frame until the shell splits",
    seat: "player 1 — the left handle is the pilot's, by geometry, on both phones; a navigator's thumb on it falls through",
    gesture: "grab and drag",
    does: KNOB_DOES,
    source: "handles.ts — mantleHandleUnder() under handleUnder(); mantle-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "mantleLeft",
    sends: ["drag"],
    pose: "MANTLE · THE LEFT KNOB UNDER A THUMB",
  },
  {
    name: "THE MANTLE'S RIGHT KNOB",
    where:
      "on the knob hung off the right valve of the shell above the middle of the field, on both screens, from the drop into frame until the shell splits",
    seat: "player 2 — the right handle is the navigator's, by geometry, on both phones; a pilot's thumb on it falls through",
    gesture: "grab and drag",
    does: KNOB_DOES,
    source: "handles.ts — mantleHandleUnder() under handleUnder(); mantle-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "mantleRight",
    sends: ["drag"],
    pose: "MANTLE · THE RIGHT KNOB UNDER A THUMB",
  },
  {
    name: "THE MANTLE'S CORE",
    where:
      "on the ring round the bared core, once the last pair is shed and the shell has split, on both screens, until the core goes dark",
    seat: "either — the ring is tapped from both seats, and the half of it that beats says whose tap is next",
    gesture: "press",
    does:
      "A **tap**, and the finish **alternates**: the pilot first, then the " +
      "navigator, then the pilot, mantleHeartbeatTaps in all. A tap from " +
      "the seat the core is not waiting on is refused by the simulation, " +
      "silently, and taken here rather than falling through to the cannon " +
      "behind the ring. Every landed tap dims the core a step; the last " +
      "puts it out and ends the fight.",
    source: "handles.ts — mantleCoreUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "mantleCore",
    sends: ["drag"],
    pose: "MANTLE · THE CORE UNDER A THUMB",
  },
];
