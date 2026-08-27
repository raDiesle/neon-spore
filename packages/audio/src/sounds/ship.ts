/**
 * The ship: the cannon sliding, the shield, the maw, and a hand on the field.
 *
 * Nothing the players control travels the field, so none of these are motion
 * sounds in the arcade sense — they are the sounds of a mechanism on a rail,
 * heard from inside the hull. Hard, close, dry, and short enough that holding
 * a control down is never a drone.
 */

import { air, glint, metal, soft, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const SHIP_SOUNDS: SoundDef[] = [
  {
    id: "ship.cannonStep",
    family: "ship",
    blurb: "A detent. One notch of a rail, felt more than heard.",
    status: "bound",
    use: "The cannon arriving in a new column.",
    level: 0.3,
    layers: [tick(0.4, 0, 6000), sub(120, 0.03, 0.5)],
  },
  {
    id: "ship.cannonEdge",
    family: "ship",
    blurb: "The detent with the rail's end under it — a stop, not a step.",
    status: "spare",
    use: "A cannon command that cannot move. Needs the command, not the column it landed in — the mixer only sees the result.",
    level: 0.26,
    layers: [tick(0.3, 0, 3600), metal(58, 0.08, 0.4, 110)],
  },
  {
    id: "ship.shieldStep",
    family: "ship",
    blurb: "The same rail, heavier and further away — three tiles of plate moving.",
    status: "bound",
    use: "The shield arriving in a new column.",
    level: 0.32,
    layers: [
      soft(0.6, tick(0.4, 0, 4400)),
      sub(96, 0.06, 0.6),
      soft(0.5, metal(72, 0.07, 0.4, 120)),
    ],
  },
  {
    id: "ship.fireRed",
    family: "ship",
    blurb: "A dry snap and a bolt leaving: noise falling away upward.",
    status: "bound",
    use: "A red shot fired.",
    level: 0.4,
    layers: [tick(0.5, 0, 3800), thud(220, 70, 0.09, 0.5), air(5200, 9000, 0.1, 0.22, 2.2)],
  },
  {
    id: "ship.fireCyan",
    family: "ship",
    blurb: "The same snap, glassier and a fifth higher — the colours are told apart by ear.",
    status: "bound",
    use: "A cyan shot fired.",
    level: 0.4,
    layers: [tick(0.5, 0, 5200), thud(300, 96, 0.08, 0.45), air(6400, 11000, 0.09, 0.22, 2.6)],
  },
  {
    id: "ship.fireBlocked",
    family: "ship",
    blurb: "The snap without the bolt. A mechanism moving against a lock.",
    status: "spare",
    use: "Fire pressed inside the reload gap. Needs the refused command, which the sim does not report.",
    level: 0.24,
    layers: [
      {
        source: "noise",
        freq: 700,
        gain: 0.5,
        attack: 0.001,
        release: 0.03,
        filter: { type: "lowpass", freq: 240, q: 1.4 },
      },
      sub(58, 0.05, 0.4),
    ],
  },
  {
    id: "ship.guard",
    family: "ship",
    blurb: "Plate coming up: a rising body and a sheet of air closing over it.",
    status: "bound",
    use: "The shield triggered — the start of the guard window.",
    level: 0.42,
    layers: [
      {
        source: "sine",
        freq: 70,
        toFreq: 150,
        gain: 0.6,
        attack: 0.006,
        hold: 0.05,
        release: 0.14,
      },
      air(3400, 6800, 0.16, 0.2, 1.8),
      soft(0.5, glint(5200, 0.09)),
    ],
  },
  {
    id: "ship.guardLapse",
    family: "ship",
    blurb: "The same body sinking back. Quiet enough to miss if you are talking.",
    status: "bound",
    use: "The guard window closing with nothing having arrived.",
    level: 0.2,
    layers: [{ source: "sine", freq: 140, toFreq: 62, gain: 0.5, attack: 0.02, release: 0.16 }],
  },
  {
    id: "ship.intake",
    family: "ship",
    blurb: "Something soft opening. Wet, low, and clearly not machinery.",
    status: "bound",
    use: "The maw opened for a pod.",
    level: 0.36,
    layers: [spore(150, 0.16, 0.4, 40), air(400, 1600, 0.14, 0.14, 3.2), sub(64, 0.12, 0.4)],
  },
  {
    id: "ship.intakeShut",
    family: "ship",
    blurb: "It closes on nothing. A small sucking stop.",
    status: "bound",
    use: "The intake window closing empty.",
    level: 0.22,
    layers: [
      {
        source: "noise",
        freq: 900,
        gain: 0.4,
        attack: 0.03,
        release: 0.05,
        filter: { type: "bandpass", freq: 1400, toFreq: 300, q: 2.4 },
      },
    ],
  },
  {
    id: "ship.forkOpen",
    family: "ship",
    blurb: "Everything letting go at once: one soft settling click and nothing after it.",
    status: "bound",
    use: "THE FORK opening — the rest ran out and the run has stopped, waiting on both thumbs.",
    // Deliberately not a chime and not an alarm: `fork.ts` has no timeout, so
    // nothing here may read as a countdown or a summons. Every other ship
    // sound is the mechanism doing something; this is the one moment it does
    // nothing, so the sound is a single dry settle rather than a tone that
    // holds — a room going quiet is heard once, at the edge of it, not sat in.
    level: 0.2,
    layers: [
      { source: "sine", freq: 90, toFreq: 48, gain: 0.4, attack: 0.01, hold: 0.05, release: 0.5 },
      soft(0.35, tick(0.25, 0, 3200)),
    ],
  },
];
