/**
 * THE BASTION's fourteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a moon of armour plate around a reactor core**, and
 * everything here is machine metal: the enter a heavy hull settling with a
 * servo whine; a shell lighting a clamp releasing; a plate torn off a
 * shearing clank, and one let go a dull spring back. A gun blown is a short
 * hard crack, a node charging a rising whine and its burst a bright pop; the
 * lightning that came down unanswered a dry crackle, and a bolt down the port
 * a deep boom inside the hull. A shell shed is a big metal fall with a bright
 * ring after it — the step won — and a shell regrown a grinding close. Low
 * and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_BASTION_SOUNDS: SoundDef[] = [
  {
    id: "boss.bastionEnter",
    family: "boss",
    blurb: "A heavy hull settling, and a servo whine.",
    status: "bound",
    use: "THE BASTION coming in over the field, every shell on.",
    level: 0.44,
    layers: [
      sub(55, 0.6, 0.3),
      after(0.1, metal(120, 0.5, 0.18, 240)),
      after(0.2, swell(420, 0.5, 0.06)),
    ],
  },
  {
    id: "boss.bastionLayer",
    family: "boss",
    blurb: "A clamp letting go: this shell can come off now.",
    status: "bound",
    use: "A shell of THE BASTION lit; pitched lower the deeper it lies.",
    level: 0.36,
    layers: [metal(160, 0.3, 0.14, 260), after(0.12, glint(1900, 0.2, 0.08))],
  },
  {
    id: "boss.bastionTear",
    family: "boss",
    blurb: "A shearing clank: a plate torn off and flying.",
    status: "bound",
    use: "A plate of THE BASTION pulled far enough out, torn off.",
    level: 0.42,
    layers: [
      thud(520, 220, 0.05, 0.16),
      metal(200, 0.25, 0.16, 300),
      after(0.05, air(2400, 900, 0.3, 0.08, 1.4)),
    ],
  },
  {
    id: "boss.bastionSnap",
    family: "boss",
    blurb: "A dull spring back: the plate let go too soon.",
    status: "bound",
    use: "A plate of THE BASTION let go short; it snaps back and starts over.",
    level: 0.34,
    layers: [thud(260, 380, 0.05, 0.12), after(0.06, tick(0.14, 0, 1800))],
  },
  {
    id: "boss.bastionWrong",
    family: "boss",
    blurb: "A dull knock: not your side.",
    status: "bound",
    use: "A thumb on the partner's plates or rim of THE BASTION.",
    level: 0.28,
    layers: [thud(320, 260, 0.03, 0.1)],
  },
  {
    id: "boss.bastionGun",
    family: "boss",
    blurb: "A hard crack: a gun turret blown apart.",
    status: "bound",
    use: "A gun of THE BASTION's ring hit at the front in its colour.",
    level: 0.42,
    layers: [
      tick(0.28, 0, 2800),
      thud(600, 200, 0.04, 0.16),
      after(0.04, metal(240, 0.2, 0.12, 320)),
    ],
  },
  {
    id: "boss.bastionCharge",
    family: "boss",
    blurb: "A rising whine: a node charging.",
    status: "bound",
    use: "A node of THE BASTION's lattice charging over its column.",
    level: 0.32,
    layers: [swell(700, 0.6, 0.07), after(0.4, glint(2600, 0.15, 0.06))],
  },
  {
    id: "boss.bastionBurst",
    family: "boss",
    blurb: "A bright pop: the lightning thrown back, the node gone.",
    status: "bound",
    use: "The shield met a node's lightning; the node of THE BASTION bursts.",
    level: 0.42,
    layers: [
      tick(0.26, 0, 3000),
      after(0.03, glint(2400, 0.3, 0.14)),
      after(0.03, metal(220, 0.2, 0.1, 300)),
    ],
  },
  {
    id: "boss.bastionArc",
    family: "boss",
    blurb: "A dry crackle: the lightning came down, and nothing stopped it.",
    status: "bound",
    use: "A node of THE BASTION loosed with no shield under it; it charges again.",
    level: 0.34,
    layers: [noise(400, { type: "bandpass", freq: 2200, q: 2 }, 0.005, 0.2, 0.14)],
  },
  {
    id: "boss.bastionPort",
    family: "boss",
    blurb: "A deep boom inside the hull: the bolt went down the port.",
    status: "bound",
    use: "A bolt down THE BASTION's open port into the inner hull.",
    level: 0.44,
    layers: [sub(60, 0.5, 0.3), after(0.06, metal(140, 0.35, 0.14, 240))],
  },
  {
    id: "boss.bastionShed",
    family: "boss",
    blurb: "A big metal fall and a bright ring: a shell off, a step won.",
    status: "bound",
    use: "THE BASTION's lit shell comes away whole and the moon shrinks.",
    level: 0.46,
    layers: [
      metal(110, 0.5, 0.22, 240),
      sub(50, 0.45, 0.22),
      after(0.18, glint(3300, 0.5, 0.12)),
      after(0.28, glint(4000, 0.45, 0.1)),
    ],
  },
  {
    id: "boss.bastionRegrow",
    family: "boss",
    blurb: "A grinding close: the shell grows back.",
    status: "bound",
    use: "A shell of THE BASTION ran out of time and grows back whole.",
    level: 0.38,
    layers: [
      noise(500, { type: "lowpass", freq: 600, q: 1 }, 0.05, 0.4, 0.14),
      after(0.3, thud(240, 160, 0.04, 0.14)),
    ],
  },
  {
    id: "boss.bastionSpent",
    family: "boss",
    blurb: "The core blowing: a crack, a deep fall, a long hiss.",
    status: "bound",
    use: "THE BASTION beaten: the last shell off, the core blows.",
    level: 0.46,
    layers: [
      tick(0.3, 0, 2800),
      after(0.06, sub(42, 0.6, 0.36)),
      after(0.2, air(1600, 400, 0.8, 0.08, 1.4)),
    ],
  },
  {
    id: "boss.bastionOut",
    family: "boss",
    blurb: "The moon gone, and the field clearing.",
    status: "bound",
    use: "THE BASTION gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE MIMIC's own out (`sounds/boss-mimic.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
