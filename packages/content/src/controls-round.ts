import type { ControlDef } from "./controls.js";

/**
 * The buttons that belong to a round rather than to the ship.
 *
 * Split out of `controls.ts` on line count, along the seam `keys-slide.ts`
 * already cut for the same growth: next door is the **ship**, which is the
 * same on every wave, and this is whichever boss has taken the panel away.
 * Every one of them is a lobe on the band now — each round's buttons arrived
 * as slabs that replaced it, and each was moved into its sockets when the
 * owner asked for it — and there are nine more rounds designed, each wanting a
 * handful, so the growth belongs in a file of its own rather
 * than under the cannon's row.
 *
 * **THE PULSE's eight are lobes, and that is the owner's decision rather than
 * an exception that crept in.** He asked for that round to look like the game
 * it is part of — the ship on the screen and the four buttons in the panel the
 * pair have been holding since wave one — so its controls stand in the band's
 * own sockets like every other button in the game. A round is still free to
 * take the field away; what it is not free to do is invent a second kind of
 * button while it is there.
 *
 * **PINBALL's two are lobes for the same reason, and it went further.** The
 * owner asked for that round to wear the game's own furniture as well, and the
 * thing it fires from turned out to be the ship's cannon rather than a bucket
 * invented for it — so the two slabs that used to slide a bucket are gone and
 * the round is played on the band's own cannon strip, at the strip's own speed.
 * What is left here is the pair of presses that are genuinely the round's: the
 * needle stopped, and the shot fired.
 *
 * **THE SCOUT's four are lobes, and they arrived as slabs.** The design put
 * the round on THE CLAW's panel — the two turns where the crank stands, the
 * burn where REACH does, the mouth on the other seat (`docs/spec/interludes.md`)
 * — and THE CLAW's panel is the band. Its look lane moved the four into the
 * sockets the design named, with the ship on the screen under them, which is
 * the same request the owner made of the two rounds above.
 *
 * **THE GAUGE's three are lobes, and they were the last slabs.** The owner,
 * 20 September 2026: *improve the buttons a lot so they fit the regular ship
 * hull and control set visuals* — the request the four rounds above had
 * already had granted. The two turns stand in the pilot's sockets and the call
 * in the navigator's, faced with the cannon they turn (`gauge-button.ts`).
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
    form: "lobe",
    label: "LEFT",
    does: "Held. Turns THE GAUGE's cannon left for as long as a thumb is on it.",
  },
  {
    id: "gaugeRight",
    player: 1,
    form: "lobe",
    label: "RIGHT",
    does: "Held. Turns THE GAUGE's cannon right for as long as a thumb is on it.",
  },
  {
    id: "gaugeCall",
    player: 2,
    form: "lobe",
    label: "CALL",
    does: "Fires the cannon along its line. A shot in the wound counts. A shot on the armour jams the valve.",
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
    form: "lobe",
    label: "◀",
    does: "Turns the snake a quarter turn anticlockwise. Player 2 does all the driving.",
  },
  {
    id: "snakeRight",
    player: 2,
    form: "lobe",
    label: "▶",
    does: "A quarter turn clockwise, under the same hand. There is no up and down: a heading is not a place.",
  },
  {
    id: "snakeFire",
    player: 1,
    form: "lobe",
    label: "FIRE",
    does: "A shot straight out of the head. It is the only thing that takes an enemy off the arena.",
  },
  {
    id: "snakeMaw",
    player: 1,
    form: "lobe",
    label: "MAW",
    does: "Opens the mouth for a moment. A point driven over with it shut starts the round again.",
  },
  {
    id: "pulse1Slick",
    player: 1,
    form: "lobe",
    label: "SLICK",
    does: "Player 1's slick lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Bulb",
    player: 1,
    form: "lobe",
    label: "BULB",
    does: "Player 1's bulb lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Meteor",
    player: 1,
    form: "lobe",
    label: "ROCK",
    does: "Player 1's meteor lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Pod",
    player: 1,
    form: "lobe",
    label: "POD",
    does: "Player 1's pod lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Slick",
    player: 2,
    form: "lobe",
    label: "SLICK",
    does: "Player 2's slick lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Bulb",
    player: 2,
    form: "lobe",
    label: "BULB",
    does: "Player 2's bulb lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Meteor",
    player: 2,
    form: "lobe",
    label: "ROCK",
    does: "Player 2's meteor lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Pod",
    player: 2,
    form: "lobe",
    label: "POD",
    does: "Player 2's pod lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pinLatch",
    player: 1,
    form: "lobe",
    label: "SET",
    does: "Stops the sweeping needle where it stands, and the strength bar starts on the same press.",
  },
  {
    id: "pinLaunch",
    player: 2,
    form: "lobe",
    label: "FIRE",
    does: "Fires, at whatever strength the bar is at that moment. It answers only once the needle has been stopped, which is the half of a shot that is not player 2's.",
  },
  {
    id: "scoutTurnLeft",
    player: 1,
    form: "lobe",
    label: "◀",
    does: "Swings the little ship's nose anticlockwise for as long as it is held. A heading, not a place: it stays where the finger left it, which is THE CLAW's crank doing the same job on a different rope (`sim/scout-fly.ts`).",
  },
  {
    id: "scoutTurnRight",
    player: 1,
    form: "lobe",
    label: "▶",
    does: "The same, clockwise, under the same hand. Player 1 does all the flying.",
  },
  {
    id: "scoutBurn",
    player: 1,
    form: "lobe",
    label: "BURN",
    does: "Held, and the only thing that adds speed. The ship keeps whatever it was already doing — a burn is leaned on rather than steered with, so a heading said out loud has to be held long enough to be flown.",
  },
  {
    id: "scoutMaw",
    player: 2,
    form: "lobe",
    label: "MAW",
    does: "Opens the mother ship's mouth for a moment. Motes the little ship is carrying only come off it here, and only while this is open — THE CLAW's own rule about a catch being two hands, on the seat that can see where everything is.",
  },
];
