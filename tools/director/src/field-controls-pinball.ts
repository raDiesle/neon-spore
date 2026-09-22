import type { FieldControlDef } from "./field-control-def.js";

/**
 * **PINBALL's two hands on its own table**, in a file of its own, the split
 * every boss since THE INSTAR has made.
 *
 * Two rows on two targets, and the only pair in the game that **cannot be on
 * the screen at the same time**: the wind is offered through `power` and the
 * shove through `flight`, which are two shots of one ball. So both stand in
 * the one band of air this round keeps clear above the ship — his at the right
 * end of it, hers at the left — and a table never shows two rings at once.
 *
 * They are also entered by the pair's **own last answer**, which is the shape
 * THE GAUGE's two states took: a launch at the top of the bar is what leaves
 * the spring slack, and a pair that never fires that hard never sees the first
 * row at all.
 *
 * **The rules shipped first and the pictures came after.** Both gestures were
 * heard by `sim/pinball-hand.ts` from 18 September 2026 with nothing drawn to
 * take hold of, which is why there were no rows here and
 * `on-field-controls.test.ts` had `pinPlunger` and `pinTable` as `unbuilt`.
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
    seat: "player 1 only — the seat that owns where from, and the seat that wound it",
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
  {
    name: "PINBALL'S TABLE",
    where:
      "at the left-hand end of the same band, as far from the plunger as the " +
      "table goes — the two are never offered together, and the distance is " +
      "so that a pair never learns that the handle is over on the right. Only " +
      "through a flight, and only until the table is tilted " +
      "(render/pinball-grip.ts)",
    seat: "player 2 only — the seat that has nothing else while a ball falls",
    gesture: "grab and drag",
    does:
      "Shoves the whole table sideways: a carry of at least pinballNudgeMilli, " +
      "whose sign is the direction, and the ball in the air takes " +
      "pinballNudgeShoveMilli that way (sim/pinball-hand.ts, pinNudgeable). " +
      "The one thing either seat has that reaches a ball already thrown, and " +
      "it is a direction and never a place: enough to move it a peg over by " +
      "the time it has fallen a third of the table, and nowhere near enough " +
      "to aim it. pinballNudges of them a flight — one — and the shove after " +
      "that tilts the table and kills her hand for the rest of it. Its dial " +
      "is that count, so a full ring means the next one tilts, and a tilt " +
      "takes the ring off the table altogether.",
    source: "touch.ts — pinballGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "pinTable",
    sends: ["drag"],
    pose: "PINBALL · FLIGHT",
  },
];
