import type { FieldControlDef } from "./field-control-def.js";

/**
 * **PINBALL's hand on its own table**, in a file of its own, the split every
 * boss since THE INSTAR has made.
 *
 * One row on one target: the plunger, in the band of air this round keeps
 * clear above the ship. It is entered by the pair's **own last answer**, which
 * is the shape THE GAUGE's two states took: a launch at the top of the bar is
 * what leaves the spring slack, and a pair that never fires that hard never
 * sees the row at all.
 *
 * PINBALL'S TABLE stood beside it — a shove carried across the table, offered
 * only through a flight — until the owner asked on 10 October 2026 for the
 * nudge to be a press on both sides of both panels, there all the time. It is
 * four band buttons now (`pin1Left` … `pin2Right`, `content/controls-round.ts`)
 * and no longer on this page, which is the field's.
 */
export const PINBALL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "PINBALL'S PLUNGER",
    where:
      "at the right-hand end of the band the strength bar runs in, a tile and " +
      "a half above the ship — clear of the trough itself, so the ring never " +
      "covers the part of the bar that fills, and clear of the ball waiting " +
      "in the muzzle below it. Only while the spring is slack, which is only " +
      "on the shot after a launch above pinballHardMilli " +
      "(render/pinball-grip.ts)",
    seat:
      "player 1 only — the seat that owns where from, and the seat that wound " +
      "it. Haloed on his screen while asked, the clock on hers; the wind washes " +
      "it green, and her press on it is refused once and washes it red " +
      "(render/pinball-marks.ts)",
    gesture: "grab and drag",
    does:
      "Winds the spring back: a carry of at least pinballWindMilli, measured " +
      "up or down, and the strength bar runs again (sim/pinball-hand.ts, " +
      "pinWindable). Until it does the bar does not move at all, so player 2 " +
      "has nothing to launch on — which is the whole price of the hard shot " +
      "they took, charged on the shot after and never against the hull. The " +
      "press says nothing and neither does a carry too short: the wind is the " +
      "lift. The needle stays latched where he left it, because what a hard " +
      "shot costs is the moment and the strength and both of those are hers. " +
      "Its ring carries no dial — the simulation remembers nothing about a " +
      "thumb on the way down, and the bar beside it starting to run is the " +
      "answer.",
    source: "touch.ts — pinballGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "pinPlunger",
    sends: ["drag"],
    pose: "PINBALL · POWER",
  },
];
