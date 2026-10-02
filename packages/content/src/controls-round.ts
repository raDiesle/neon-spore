import type { ControlDef } from "./controls.js";
import { PULSE_CONTROLS } from "./controls-pulse.js";

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
 * **THE GAUGE's four are lobes, and they were the last slabs.** The owner,
 * 20 September 2026: *improve the buttons a lot so they fit the regular ship
 * hull and control set visuals* — the request the four rounds above had
 * already had granted. The two turns stand in the pilot's sockets and the call
 * in the navigator's, faced with the cannon they turn (`gauge-button.ts`). The
 * call became the ship's two fire buttons on 29 September 2026, when the
 * wound's colour became a rule (`sim/gauge-call.ts`): four, not three.
 *
 * `CONTROLS` spreads this in place, so nothing that reads the vocabulary had
 * to learn there are two files. THE FLEET's five, a boss's and not a round's,
 * are `controls-fleet.ts`'s, for THE THROAT's reason (`controls-throat.ts`),
 * and THE PULSE's eight, written once for each seat, are `controls-pulse.ts`'s.
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
    id: "gaugeRed",
    player: 2,
    form: "lobe",
    label: "RED",
    does: "Fires the cannon red along its line. A red shot in a red wound counts. A shot on the armour, or in the wrong colour, jams the valve.",
  },
  {
    id: "gaugeCyan",
    player: 2,
    form: "lobe",
    label: "CYAN",
    does: "Fires the cannon cyan along its line. A cyan shot in a cyan wound counts. A shot on the armour, or in the wrong colour, jams the valve.",
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
    label: "SHOOT",
    does: "A shot straight out of the head. It is the only thing that takes an enemy off the arena.",
  },
  {
    id: "snakeMaw",
    player: 1,
    form: "lobe",
    label: "EAT",
    does: "Opens the mouth for a moment. A point driven over with it shut starts the round again.",
  },
  ...PULSE_CONTROLS,
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
