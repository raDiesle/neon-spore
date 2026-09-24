/**
 * THE SPOOL's eleven, in a file of their own so the catalogue stays a list
 * of spreads.
 *
 * The boss is a **wooden thread-spool slung sideways across the top of the
 * field**, and everything here is line running off a drum and the wood that
 * holds it: the enter is the line coming taut, a rising creak that stops; the
 * grip is a thumb landing on the brake, a short dry scuff; the let is the
 * brake coming off and the drum finding its own speed, which is the only sound
 * in the fight that gets *faster* as it goes.
 *
 * **The zone and the leg are the two the pair listen for, and they are the
 * quietest things here** — a soft double knock as a movement opens, pitched up
 * per rib gone, and one dull knock a leg. They have to sit under a
 * conversation, because the conversation is the fight and a sound that talks
 * over it takes away the thing it is announcing (`docs/spec/audio.md` §1).
 *
 * The slip is the line jumping the groove, a dry rattle with nothing tonal in
 * it; the rock is the hazard thrown down a column, low and moving; the rib is
 * a rib **easing** and never cracking — a long wooden sigh, pitched up as the
 * ribs go, which is the one sound the design names by that word. The slack is
 * the line going loose all at once, the drift is the spool leaving under THE
 * SLOW, and the out is the field clearing after it. **Nothing here is sharp**:
 * this is the only boss in the game whose finish is calm, and the last three
 * are what that means with the picture taken away.
 */

import { after, air, glint, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SPOOL_SOUNDS: SoundDef[] = [
  {
    id: "boss.spoolEnter",
    family: "boss",
    blurb: "A rising creak that stops: the line coming taut.",
    status: "bound",
    use: "THE SPOOL arriving, four ribs whole and the line run to the hull.",
    level: 0.38,
    layers: [swell(52, 1.4, 0.1), after(0.34, soft(0.5, thud(200, 86, 0.16, 0.3)))],
  },
  {
    id: "boss.spoolZone",
    family: "boss",
    blurb: "A soft double knock: a movement opening on a narrower band.",
    status: "bound",
    use: "A movement of THE SPOOL beginning. Pitched up as the ribs go.",
    level: 0.3,
    layers: [tick(0.18, 0, 2400), after(0.08, soft(0.5, tick(0.14, 0, 2400)))],
  },
  {
    id: "boss.spoolLeg",
    family: "boss",
    blurb: "One dull knock: the band has moved and wants a new rate.",
    status: "bound",
    use: "A leg of a movement of THE SPOOL, which is one call to correct.",
    level: 0.26,
    layers: [tick(0.16, 0, 1900)],
  },
  {
    id: "boss.spoolGrip",
    family: "boss",
    blurb: "A short dry scuff: a thumb landing on the brake.",
    status: "bound",
    use: "The pilot taking hold of THE SPOOL's brake.",
    level: 0.24,
    layers: [noise(0.12, { type: "bandpass", freq: 1100, toFreq: 760, q: 1.2 }, 0.01, 0.09, 0.14)],
  },
  {
    id: "boss.spoolLet",
    family: "boss",
    blurb: "The drum finding its own speed: a run that gets faster.",
    status: "bound",
    use: "The brake let go, which pays line out fastest of all.",
    level: 0.32,
    layers: [air(620, 1800, 0.5, 0.12, 1.4), after(0.2, soft(0.45, sub(60, 0.34, 0.26)))],
  },
  {
    id: "boss.spoolSlip",
    family: "boss",
    blurb: "A dry rattle with nothing tonal in it: the line out of its groove.",
    status: "bound",
    use: "The paid-out line left the band, and the movement starts again.",
    level: 0.4,
    layers: [
      noise(0.26, { type: "bandpass", freq: 1500, toFreq: 700, q: 0.9 }, 0.005, 0.1, 0.3),
      after(0.06, soft(0.5, thud(180, 80, 0.14, 0.26))),
    ],
  },
  {
    id: "boss.spoolRock",
    family: "boss",
    blurb: "A low, moving weight: a rock coming down a column.",
    status: "bound",
    use: "The second slip on, thrown down the column the cannon stands in.",
    level: 0.42,
    layers: [sub(64, 0.46, 0.34), after(0.08, air(480, 260, 0.4, 0.12, 1.4))],
  },
  {
    id: "boss.spoolRib",
    family: "boss",
    blurb: "A long wooden sigh: a rib easing open, never cracking.",
    status: "bound",
    use: "A movement held inside the band end to end. Pitched up as the ribs go.",
    level: 0.44,
    // **Under the speech band rather than across it**, which is where a sigh
    // this long has to sit: 0.62s of 420-900 Hz spent 0.197s inside it, over
    // the 0.16s budget, and this is the one sound in the fight the pair is
    // most likely to be mid-sentence over. Sweeping *down* from 230 Hz keeps
    // it wooden — a sigh, not a hiss — and leaves room for the pitch the bind
    // puts on it as the ribs go (x1.21 at the last one).
    layers: [air(230, 160, 0.62, 0.16, 1.6), after(0.22, soft(0.55, sub(52, 0.5, 0.32)))],
  },
  {
    id: "boss.spoolSlack",
    family: "boss",
    blurb: "The line going loose all at once, and the pull coming off it.",
    status: "bound",
    use: "The last rib eased: nothing is holding the spool any more.",
    level: 0.46,
    layers: [air(4200, 6600, 0.66, 0.14, 1.5), after(0.18, soft(0.6, sub(46, 0.58, 0.34)))],
  },
  {
    id: "boss.spoolDrift",
    family: "boss",
    blurb: "A slow turn away: the spool leaving on nothing at all.",
    status: "bound",
    use: "THE SPOOL drifting free under THE SLOW — the game's one calm finish.",
    level: 0.4,
    layers: [swell(44, 1.6, 0.1), after(0.5, soft(0.5, glint(2600, 0.6, 0.12)))],
  },
  {
    id: "boss.spoolOut",
    family: "boss",
    blurb: "The field clearing behind it, and nothing struck.",
    status: "bound",
    use: "THE SPOOL gone — then the wave-end light.",
    level: 0.48,
    layers: [
      sub(50, 0.5, 0.33),
      after(0.12, air(4000, 6400, 0.56, 0.13, 1.5)),
      // Above the band, not through it: at 2900 Hz this half-second tail was
      // the whole of the 0.200s the finish spent in the speech band.
      after(0.44, glint(3600, 0.5, 0.13)),
    ],
  },
];
