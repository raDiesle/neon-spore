/**
 * THE LAMPREY's thirteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a sucker mouth bitten onto the hull**, and everything here is
 * wet and close: the enter is something long swimming in, a low swell under a
 * hiss; a bite is a suck and a thud against the hull. A crack is a short high
 * tick, pitched up per tooth, and a snap the dry clack the tapper has to hear.
 * A crawl is a soft drag a column along, and a gnaw the low grind the pinner
 * has to hear, deepening as the bite does; a full bite is the hull's dull
 * strike. Loose is a wet pop, the rear a swell with a ring, the hit a shot
 * into the gullet, the lunge a rush of air, the spent a limp fall and the out
 * the field clearing. Low and soft under the band, or short and high above
 * it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_LAMPREY_SOUNDS: SoundDef[] = [
  {
    id: "boss.lampreyEnter",
    family: "boss",
    blurb: "Something long swimming in: a low swell under a hiss.",
    status: "bound",
    use: "THE LAMPREY arriving under the hull.",
    level: 0.42,
    layers: [swell(58, 1.2, 0.12), after(0.2, air(400, 1400, 0.7, 0.06, 2.2))],
  },
  {
    id: "boss.lampreyBite",
    family: "boss",
    blurb: "A suck and a thud: the mouth on the hull.",
    status: "bound",
    use: "A bite begun: one of you pins the jaw, the other taps the lit tooth.",
    level: 0.46,
    layers: [
      noise(600, { type: "lowpass", freq: 600, q: 1 }, 0.02, 0.2, 0.1),
      after(0.12, thud(160, 90, 0.04, 0.16)),
    ],
  },
  {
    id: "boss.lampreyCrack",
    family: "boss",
    blurb: "A short high tick: a tooth knocked out.",
    status: "bound",
    use: "The lit tooth tapped out; the pitch rises with the tooth.",
    level: 0.34,
    layers: [tick(0.18, 0, 3300), after(0.04, glint(2600, 0.2, 0.12))],
  },
  {
    id: "boss.lampreySnap",
    family: "boss",
    blurb: "A dry clack: a tooth snapped back in.",
    status: "bound",
    use: "A wrong tap, or a tooth's window run out: the last tooth goes back.",
    level: 0.4,
    layers: [noise(1100, { type: "bandpass", freq: 1100, q: 2 }, 0.005, 0.08, 0.08)],
  },
  {
    id: "boss.lampreyCrawl",
    family: "boss",
    blurb: "A soft drag a column along the hull.",
    status: "bound",
    use: "The jaw crawling; the pinner's thumb has to follow it.",
    level: 0.26,
    layers: [noise(420, { type: "lowpass", freq: 420, q: 1 }, 0.02, 0.18, 0.12)],
  },
  {
    id: "boss.lampreyGnaw",
    family: "boss",
    blurb: "A low grind, deepening as the bite does.",
    status: "bound",
    use: "The jaw not held: the bite a step deeper.",
    level: 0.36,
    layers: [metal(120, 0.25, 0.14, 180), sub(46, 0.25, 0.2)],
  },
  {
    id: "boss.lampreyFull",
    family: "boss",
    blurb: "The hull's dull strike: the bite gone all the way in.",
    status: "bound",
    use: "A full bite: the hull hit.",
    level: 0.5,
    layers: [thud(260, 120, 0.04, 0.22), sub(40, 0.45, 0.32)],
  },
  {
    id: "boss.lampreyLoose",
    family: "boss",
    blurb: "A wet pop: the mouth off the hull.",
    status: "bound",
    use: "A bite given up: its teeth out, the mouth pulling away.",
    level: 0.38,
    layers: [thud(520, 300, 0.03, 0.1), after(0.06, air(900, 2400, 0.3, 0.05, 2))],
  },
  {
    id: "boss.lampreyRear",
    family: "boss",
    blurb: "A swell with a ring: the gullet lit.",
    status: "bound",
    use: "The eel reared over the hull: shoot the gullet in its colour.",
    level: 0.4,
    layers: [swell(72, 0.8, 0.1), after(0.3, glint(2400, 0.4, 0.14))],
  },
  {
    id: "boss.lampreyHit",
    family: "boss",
    blurb: "A shot into the gullet; the pitch climbs per hit.",
    status: "bound",
    use: "The gullet shot in its colour.",
    level: 0.46,
    layers: [thud(420, 260, 0.04, 0.12), metal(220, 0.35, 0.18, 280)],
  },
  {
    id: "boss.lampreyLunge",
    family: "boss",
    blurb: "A rush of air: the eel lunging back onto the hull.",
    status: "bound",
    use: "A gullet's window run out: it bites again with the teeth it has left.",
    level: 0.42,
    layers: [air(300, 2600, 0.4, 0.12, 1.6), after(0.3, thud(180, 100, 0.04, 0.14))],
  },
  {
    id: "boss.lampreySpent",
    family: "boss",
    blurb: "A limp fall away from the hull.",
    status: "bound",
    use: "THE LAMPREY beaten, falling away.",
    level: 0.44,
    layers: [sub(42, 0.6, 0.36), after(0.2, air(1600, 400, 0.8, 0.08, 1.4))],
  },
  {
    id: "boss.lampreyOut",
    family: "boss",
    blurb: "The eel gone, and the field clearing.",
    status: "bound",
    use: "THE LAMPREY gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE GOVERNOR's own out (`sounds/boss-governor.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
