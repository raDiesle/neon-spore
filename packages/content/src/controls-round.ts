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
    does: "Stops the sweeping needle where it stands. Does nothing until player 2 has opened the sweep.",
  },
  {
    id: "pinLaunch",
    player: 2,
    form: "slab",
    label: "FIRE",
    does: "Opens the aiming sweep, and then fires on the power bar. One button, and which of the two it is is whatever the screen is showing.",
  },
];
