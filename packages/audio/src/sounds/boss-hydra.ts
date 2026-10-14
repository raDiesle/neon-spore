/**
 * THE HYDRA's seventeen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a slime with many heads**, and everything here is a throat
 * and a body: the enter a deep hiss with a heave under it; heads coming a
 * many-voiced rasp; a neck cut a wet chop, and one glanced off a thin slide;
 * a lap of a coil a creak, and a coil off a long slither and a slap; an eye
 * opening a wet click, blinking shut a softer one, poked shut a pop; a maw
 * opening a roar's breath with fire in it, and quenched a hiss of steam. A
 * level cleared is a falling howl with a bright ring after it — the step won
 * — and the strike a snap of jaws. Low and soft under the band, or short and
 * high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_HYDRA_SOUNDS: SoundDef[] = [
  {
    id: "boss.hydraEnter",
    family: "boss",
    blurb: "A deep hiss, and a heave under it.",
    status: "bound",
    use: "THE HYDRA coming in over the field, every head still to come.",
    level: 0.44,
    layers: [sub(48, 0.6, 0.3), after(0.1, air(900, 500, 0.6, 0.1, 1.6))],
  },
  {
    id: "boss.hydraHeads",
    family: "boss",
    blurb: "A many-voiced rasp: heads coming for the ship.",
    status: "bound",
    use: "A level of THE HYDRA's heads comes; pitched lower the later the level.",
    level: 0.36,
    layers: [
      noise(500, { type: "bandpass", freq: 520, q: 3 }, 0.04, 0.3, 0.1),
      after(0.08, noise(700, { type: "bandpass", freq: 760, q: 3 }, 0.04, 0.26, 0.08)),
    ],
  },
  {
    id: "boss.hydraCut",
    family: "boss",
    blurb: "A wet chop: a neck cut through.",
    status: "bound",
    use: "A neck of THE HYDRA swiped across far enough, cut.",
    level: 0.42,
    layers: [tick(0.22, 0, 2400), thud(520, 200, 0.06, 0.18)],
  },
  {
    id: "boss.hydraGlance",
    family: "boss",
    blurb: "A thin slide: the swipe stopped short.",
    status: "bound",
    use: "A swipe across THE HYDRA's neck let go short; the head swings on.",
    level: 0.32,
    layers: [air(1200, 800, 0.16, 0.08, 2)],
  },
  {
    id: "boss.hydraLap",
    family: "boss",
    blurb: "A creak: a coil loosened another lap.",
    status: "bound",
    use: "A coil of THE HYDRA turned off another lap; climbs with each lap.",
    level: 0.3,
    layers: [noise(400, { type: "bandpass", freq: 400, q: 4 }, 0.01, 0.12, 0.12)],
  },
  {
    id: "boss.hydraUncoil",
    family: "boss",
    blurb: "A long slither and a slap: a coil off the hull.",
    status: "bound",
    use: "A coil of THE HYDRA unwound its last lap and falls away.",
    level: 0.4,
    layers: [air(900, 400, 0.4, 0.1, 1.4), after(0.3, thud(360, 150, 0.06, 0.16))],
  },
  {
    id: "boss.hydraOpen",
    family: "boss",
    blurb: "A wet click: an eye opening.",
    status: "bound",
    use: "An eye of THE HYDRA opens on its side.",
    level: 0.3,
    layers: [spore(1400, 0.12, 0.12, 20)],
  },
  {
    id: "boss.hydraBlink",
    family: "boss",
    blurb: "A softer click: the eye blinked shut again.",
    status: "bound",
    use: "An eye of THE HYDRA left open blinks shut, untapped.",
    level: 0.26,
    layers: [spore(900, 0.1, 0.08, 20)],
  },
  {
    id: "boss.hydraPoke",
    family: "boss",
    blurb: "A pop: an eye tapped shut for good.",
    status: "bound",
    use: "An open eye of THE HYDRA tapped shut.",
    level: 0.4,
    layers: [thud(700, 300, 0.04, 0.16), after(0.03, glint(2200, 0.18, 0.08))],
  },
  {
    id: "boss.hydraMiss",
    family: "boss",
    blurb: "A dull knock: the eye was shut.",
    status: "bound",
    use: "A tap on THE HYDRA's eye while it was shut: refused.",
    level: 0.3,
    layers: [thud(260, 180, 0.05, 0.12)],
  },
  {
    id: "boss.hydraMaw",
    family: "boss",
    blurb: "A roar's breath, fire in it: a maw opening.",
    status: "bound",
    use: "A maw of THE HYDRA opens over its column, fire burning in it.",
    level: 0.38,
    layers: [
      swell(330, 0.5, 0.06),
      noise(600, { type: "lowpass", freq: 900, q: 1 }, 0.1, 0.4, 0.1),
    ],
  },
  {
    id: "boss.hydraQuench",
    family: "boss",
    blurb: "A hiss of steam: the fire put out.",
    status: "bound",
    use: "A bolt in the fire's colour into THE HYDRA's open maw.",
    level: 0.42,
    layers: [sub(62, 0.3, 0.26), after(0.04, air(2600, 1000, 0.4, 0.12, 1.2))],
  },
  {
    id: "boss.hydraWrong",
    family: "boss",
    blurb: "A low hiss: that head is the other's.",
    status: "bound",
    use: "A thumb on the partner's head of THE HYDRA, taking hold of nothing.",
    level: 0.32,
    layers: [air(700, 500, 0.18, 0.1, 2)],
  },
  {
    id: "boss.hydraCleared",
    family: "boss",
    blurb: "A falling howl and a bright ring: a level of heads down.",
    status: "bound",
    use: "THE HYDRA's lit heads all stopped; it rears back.",
    level: 0.46,
    layers: [
      air(1300, 450, 0.5, 0.14, 1.2),
      sub(50, 0.45, 0.2),
      after(0.2, glint(3100, 0.5, 0.12)),
      after(0.3, glint(3800, 0.45, 0.1)),
    ],
  },
  {
    id: "boss.hydraStrike",
    family: "boss",
    blurb: "A snap of jaws: a head reached the ship.",
    status: "bound",
    use: "A level of THE HYDRA ran out; a head still coming strikes the hull.",
    level: 0.46,
    layers: [tick(0.3, 0, 2600), thud(420, 120, 0.08, 0.22)],
  },
  {
    id: "boss.hydraSpent",
    family: "boss",
    blurb: "The hydra beaten: a crack, a deep fall, a long sigh.",
    status: "bound",
    use: "THE HYDRA beaten: its last head stopped.",
    level: 0.46,
    layers: [
      tick(0.28, 0, 2600),
      after(0.06, sub(42, 0.6, 0.34)),
      after(0.2, air(1200, 400, 0.8, 0.08, 1.4)),
    ],
  },
  {
    id: "boss.hydraOut",
    family: "boss",
    blurb: "The hydra gone, and the field clearing.",
    status: "bound",
    use: "THE HYDRA gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE CHRYSALIS's own out (`sounds/boss-chrysalis.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
