import type { ControlDef } from "./controls.js";

/**
 * The buttons that belong to a round rather than to the ship.
 *
 * Split out of `controls.ts` on line count, along the seam `keys-round.ts`
 * already cut for the same growth: next door is the **ship**, which is the
 * same on every wave, and this is whichever boss has taken the panel away.
 * Every one of these is a `slab` — a round replaces the band rather than
 * adding to it (`docs/spec/interludes.md`) — and there are nine more rounds
 * designed, each wanting a handful, so the growth belongs in a file of its own
 * rather than under the cannon's row.
 *
 * `CONTROLS` spreads this in place, so nothing that reads the vocabulary had
 * to learn there are two files.
 *
 * **THE PULSE's eight are the one place a control is written twice**, once for
 * each seat, and it is not a mistake in the model. A `ControlDef` belongs to a
 * seat — that is what makes a panel two halves — and this is the first round
 * where both halves are the same four buttons. The alternative was a control
 * that belongs to *both*, which would be a third value on a field that is
 * `1 | 2` in forty places, to save writing four labels out twice.
 */
export const ROUND_CONTROLS: readonly ControlDef[] = [
  {
    id: "gaugeLeft",
    player: 1,
    form: "slab",
    label: "LEFT",
    does: "Held. Turns THE GAUGE's needle down the dial for as long as a thumb is on it.",
  },
  {
    id: "gaugeRight",
    player: 1,
    form: "slab",
    label: "RIGHT",
    does: "Held. Turns THE GAUGE's needle up the dial for as long as a thumb is on it.",
  },
  {
    id: "gaugeCall",
    player: 2,
    form: "slab",
    label: "CALL",
    does: "Says the needle is between the marks. The only thing in the round that can be wrong.",
  },
  {
    id: "salvo",
    player: 1,
    form: "lobe",
    label: "SALVO",
    does: "Fires into whichever square of THE FLEET's chart the sights are standing in.",
  },
  {
    id: "aimLeft",
    player: 2,
    form: "lobe",
    label: "◀",
    does: "Carries the sights one square left. A step, never a place — a place would need no telling.",
  },
  {
    id: "aimUp",
    player: 2,
    form: "lobe",
    label: "▲",
    does: "One square up the chart.",
  },
  {
    id: "aimDown",
    player: 2,
    form: "lobe",
    label: "▼",
    does: "One square down the chart.",
  },
  {
    id: "aimRight",
    player: 2,
    form: "lobe",
    label: "▶",
    does: "One square right.",
  },
  {
    id: "snakeLeft",
    player: 2,
    form: "slab",
    label: "◀",
    does: "Turns the snake a quarter turn anticlockwise. Player 2 does all the driving.",
  },
  {
    id: "snakeRight",
    player: 2,
    form: "slab",
    label: "▶",
    does: "A quarter turn clockwise, under the same hand. There is no up and down: a heading is not a place.",
  },
  {
    id: "snakeFire",
    player: 1,
    form: "slab",
    label: "FIRE",
    does: "A shot straight out of the head. It is the only thing that takes an enemy off the arena.",
  },
  {
    id: "snakeMaw",
    player: 1,
    form: "slab",
    label: "MAW",
    does: "Opens the mouth for a moment. A point driven over with it shut starts the round again.",
  },
  {
    id: "pulse1Left",
    player: 1,
    form: "slab",
    label: "◀",
    does: "Player 1's left lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Down",
    player: 1,
    form: "slab",
    label: "▼",
    does: "Player 1's down lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Up",
    player: 1,
    form: "slab",
    label: "▲",
    does: "Player 1's up lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Right",
    player: 1,
    form: "slab",
    label: "▶",
    does: "Player 1's right lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Left",
    player: 2,
    form: "slab",
    label: "◀",
    does: "Player 2's left lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Down",
    player: 2,
    form: "slab",
    label: "▼",
    does: "Player 2's down lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Up",
    player: 2,
    form: "slab",
    label: "▲",
    does: "Player 2's up lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Right",
    player: 2,
    form: "slab",
    label: "▶",
    does: "Player 2's right lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pinLeft",
    player: 1,
    form: "slab",
    label: "◀",
    does: "Slides the bucket left. Held, not pressed — a thing that has to be under a falling ball cannot be stepped.",
  },
  {
    id: "pinRight",
    player: 1,
    form: "slab",
    label: "▶",
    does: "Slides the bucket right, the same way.",
  },
  {
    id: "pinLatch",
    player: 1,
    form: "slab",
    label: "SET",
    does: "Stops the sweeping needle where it stands, and the strength bar starts on the same press.",
  },
  {
    id: "pinLaunch",
    player: 2,
    form: "slab",
    label: "FIRE",
    does: "Fires, at whatever strength the bar is at that moment. It answers only once the needle has been stopped, which is the half of a shot that is not player 2's.",
  },
];
