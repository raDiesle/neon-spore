import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE THROAT's two hands**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * One hand moves the mouth and the other opens it, and neither can do the
 * other's: the navigator carries the lip anywhere inside the box the
 * simulation leaves round the walls and the top, and the pilot pumps a handle
 * on the hull up and down. The four colours are on the panel, two a seat, and
 * have no row here (`field-controls-panel*.ts`).
 *
 * The two it had before the rework of 1 October 2026, the ring and the tube,
 * went with the cinch and the haul they answered.
 */
export const THROAT_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE THROAT'S MOUTH",
    where:
      "on the lip of the gullet, travelling with it — the mouth is the thing " +
      "being carried, so the handle is the mouth (render/throat-grip.ts)",
    seat:
      "player 2 only — the navigator. Haloed on that screen until a thumb is " +
      "on it; the pilot's press is handed through and heard by nothing " +
      "(render/throat-marks.ts, sim/throat-hand.ts)",
    gesture: "grab and drag",
    does:
      "Carries the mouth anywhere over the field, and the gullet bends to " +
      "follow it from its root on the hull. Kept inside throatAimBox — " +
      "throatSideMarginMilli from each wall and throatTopMarginMilli from the " +
      "top — so the lip and the circle round it are never cut by the frame. " +
      "A body falling into that circle is swallowed if the colour is the one " +
      "it wants, and shakes and keeps falling if not (sim/throat-suck.ts).",
    source: "touch.ts — throatGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "throatAim",
    sends: ["drag"],
    pose: "THE THROAT · SUCKS",
  },
  {
    name: "THE THROAT'S PUMP",
    where:
      "on the hull two columns beside the gullet's root, where the cannon " +
      "would stand, and it never moves (render/throat-grip.ts)",
    seat:
      "player 1 only — the pilot. Haloed on that screen while the circle is " +
      "small; the navigator's press is handed through and heard by nothing " +
      "(render/throat-marks.ts, sim/throat-hand.ts)",
    gesture: "grab and drag",
    does:
      "Every stroke of throatStrokeMilli the other way from the last adds " +
      "throatPumpGainMilli to the pump, which drains throatPumpDecayMilli a " +
      "tick. The faster the strokes, the wider the circle round the mouth " +
      "that draws bodies in, from throatMinRadiusMilli to " +
      "throatMaxRadiusMilli (throatRadiusMilli). Only the height travelled " +
      "counts; sideways does nothing.",
    source: "touch.ts — throatGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "throatPump",
    sends: ["drag"],
    pose: "THE THROAT · SUCKS",
  },
];
