/**
 * THE SINEW's fourteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **rope under load**, and everything here is taut where THE
 * CURTAIN's was dry: a grip is a hand closing on a wet cord, the hold
 * counting is the cord creaking under a weight, a fibre parting is a single
 * strand letting go with a twang, and the snap is the whole rope whipping
 * back — and the catch is that crack stopped halfway, which is the one sound
 * on the page that is a thing *not* happening. The mass at the end of it is the only heavy thing — it sinks a row
 * with a thud, and the fall is the long sound on the page, ending clear at
 * the wall or on the hull. Low and soft under the band, or short and high
 * above it, as ever (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, noise, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SINEW_SOUNDS: SoundDef[] = [
  {
    id: "boss.sinewSettle",
    family: "boss",
    blurb: "The tendon taking the weight: a low swell and six strands creaking taut one by one.",
    status: "bound",
    use: "THE SINEW arriving, every fibre whole and the mass hanging in the middle.",
    level: 0.36,
    layers: [
      swell(70, 1.2, 0.1),
      after(0.3, burst(soft(0.5, spore(420, 0.16, 0.2, 40)), 6, 0.11, 0.9, 30)),
    ],
  },
  {
    id: "boss.sinewGrip",
    family: "boss",
    blurb: "A hand closing on the cord: a short damp tick and the strand tightening under it.",
    status: "bound",
    use: "THE SINEW's handle taken by one seat, on that seat's side.",
    level: 0.32,
    layers: [tick(0.22, 0, 4400), after(0.03, soft(0.5, spore(360, 0.14, 0.18, 20)))],
  },
  {
    id: "boss.sinewRelease",
    family: "boss",
    blurb: "A hand off the cord: the strand slapping back slack.",
    status: "bound",
    use: "THE SINEW's handle let go — lifted, or thrown off by a snap.",
    level: 0.3,
    layers: [spore(300, 0.12, 0.18, 30), after(0.02, tick(0.14, 0, 3800))],
  },
  {
    id: "boss.sinewEnter",
    family: "boss",
    blurb: "The sum coming into the band: the rope settling into a creak that keeps.",
    status: "bound",
    use: "THE SINEW's hold starting to count — the four beats begin.",
    level: 0.34,
    layers: [glint(3200, 0.2, 0.12), after(0.05, soft(0.6, sub(90, 0.5, 0.3)))],
  },
  {
    id: "boss.sinewLoose",
    family: "boss",
    blurb: "The sum slipping out of the band: the creak stopping short, a small dull knock.",
    status: "bound",
    use: "THE SINEW's hold lost before four beats — the count starts over.",
    level: 0.32,
    layers: [thud(200, 110, 0.14, 0.3), after(0.04, tick(0.12, 0, 3400))],
  },
  {
    id: "boss.sinewPart",
    family: "boss",
    blurb: "One strand letting go: a twang above the band and the mass dropping a row under it.",
    status: "bound",
    use: "THE SINEW losing a fibre to a hold kept. Pitched up as fewer are left.",
    level: 0.44,
    layers: [glint(4400, 0.3, 0.2), tick(0.2, 0, 5200), after(0.08, thud(150, 60, 0.28, 0.45))],
  },
  {
    id: "boss.sinewSnap",
    family: "boss",
    blurb: "The whole rope whipping back: a crack, a rush of air, and the hands thrown off.",
    status: "bound",
    use: "THE SINEW over-pulled — the fibre snaps the pair's hands away. Pitched down on the last.",
    level: 0.48,
    layers: [
      noise(0.14, { type: "highpass", freq: 3600, toFreq: 6000, q: 0.9 }, 0.002, 0.03, 0.5),
      after(0.04, air(7000, 3200, 0.5, 0.18, 1.4)),
      after(0.1, sub(55, 0.45, 0.35)),
    ],
  },
  {
    id: "boss.sinewRock",
    family: "boss",
    blurb: "A rock shaken out of the mass: a grit tick and a small stone leaving.",
    status: "bound",
    use: "THE SINEW throwing one rock out of the mass after a snap.",
    level: 0.34,
    layers: [tick(0.24, 0, 4000), after(0.03, thud(220, 90, 0.16, 0.3))],
  },
  {
    id: "boss.sinewCatch",
    family: "boss",
    blurb: "Two hands closing on a whipping rope: the air cut off short and the cord going still.",
    status: "bound",
    use: "THE SINEW caught — both hands carried outward end a snap-back early.",
    level: 0.4,
    layers: [
      // The snap's own rush, shorter and falling instead of rising: the whip
      // is the sound this one interrupts.
      noise(0.07, { type: "highpass", freq: 5200, toFreq: 2200, q: 0.9 }, 0.002, 0.02, 0.5),
      after(0.05, soft(0.6, thud(180, 120, 0.18, 0.34))),
      after(0.09, glint(1800, 0.12, 0.22)),
    ],
  },
  {
    id: "boss.sinewSlack",
    family: "boss",
    blurb: "The cord creeping slack under a held hand: a low slide down, a strand fraying.",
    status: "bound",
    use: "THE SINEW's decay, once per beat from the fourth fibre while a hand is on.",
    level: 0.28,
    layers: [
      soft(0.5, noise(0.2, { type: "bandpass", freq: 1200, toFreq: 700, q: 2 }, 0.02, 0.08, 0.3)),
      after(0.05, soft(0.5, sub(80, 0.25, 0.2))),
    ],
  },
  {
    id: "boss.sinewFall",
    family: "boss",
    blurb: "The last strand gone: a twang, then the weight of the mass leaving the rope.",
    status: "bound",
    use: "THE SINEW's mass starting to fall — the four beats to walk it clear.",
    level: 0.5,
    layers: [
      glint(4600, 0.3, 0.2),
      tick(0.22, 0, 5400),
      after(0.1, sub(50, 0.9, 0.4)),
      after(0.2, air(3000, 7000, 0.8, 0.14, 1.5)),
    ],
  },
  {
    id: "boss.sinewSwing",
    family: "boss",
    blurb: "The falling mass swung a column: a heavy sway and the air moving with it.",
    status: "bound",
    use: "THE SINEW's mass walked a column by both handles swayed the same way.",
    level: 0.4,
    layers: [
      swell(85, 0.5, 0.12),
      after(0.05, noise(0.24, { type: "lowpass", freq: 1400, toFreq: 800, q: 1 }, 0.03, 0.1, 0.3)),
    ],
  },
  {
    id: "boss.sinewOut",
    family: "boss",
    blurb: "The mass landing beside the hull: a deep thud into the ground, then the air clearing.",
    status: "bound",
    use: "THE SINEW's mass down at the wall, clear of the ship — then the wave-end light.",
    level: 0.5,
    layers: [
      thud(120, 40, 0.5, 0.55),
      after(0.1, glint(3600, 0.5, 0.14)),
      after(0.2, burst(glint(4800, 0.16, 0.1), 8, 0.05, 0.85, 40)),
      after(0.3, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
  {
    id: "boss.sinewCrush",
    family: "boss",
    blurb: "The mass landing on the hull: the same thud with metal under it and nothing clearing.",
    status: "bound",
    use: "THE SINEW's mass down on the ship — the breach that fails the wave.",
    level: 0.54,
    layers: [
      thud(110, 35, 0.6, 0.6),
      after(
        0.02,
        noise(0.3, { type: "highpass", freq: 3200, toFreq: 5000, q: 1 }, 0.004, 0.08, 0.4),
      ),
      after(0.15, sub(45, 0.7, 0.4)),
    ],
  },
];
