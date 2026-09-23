/**
 * THE RATCHET's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **toothed rack with a catch and a pawl**, and everything here
 * is hardware, THE HASP's iron again: the enter is the rack settling into its
 * frame, the lit a small bright knock, the set the catch dropping into a
 * tooth and the let it springing back out.
 *
 * **The click and the burn are the fight.** A clean tooth is a short bright
 * ratchet, pitched up per clean so how far the rack has climbed can be heard;
 * a burned one is a flat dull thud with nothing bright in it. §22 asked for
 * the burn to be silent, and it is not, because a press on glass that answers
 * nothing reads as a tap the phone missed (`docs/spec/bosses.md` §11.38).
 *
 * The open is the top catch giving, a long groan under everything; the jam is
 * the rack grinding into the hull. The bolt, its shot and its strike are
 * THE HASP's. Low and soft under the band, or short and high above it, as
 * ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_RATCHET_SOUNDS: SoundDef[] = [
  {
    id: "boss.ratchetEnter",
    family: "boss",
    blurb: "An iron rack settling into its frame.",
    status: "bound",
    use: "THE RATCHET arriving, seven teeth and the catch unset.",
    level: 0.4,
    layers: [thud(190, 72, 0.22, 0.4), after(0.14, soft(0.5, metal(210, 0.5, 0.2, 180)))],
  },
  {
    id: "boss.ratchetLit",
    family: "boss",
    blurb: "One small bright knock: the pawl taking the light.",
    status: "bound",
    use: "A tooth is waiting — the window for one press is open.",
    level: 0.36,
    layers: [tick(0.24, 0, 3000), after(0.05, soft(0.55, metal(260, 0.3, 0.2, 220)))],
  },
  {
    id: "boss.ratchetSet",
    family: "boss",
    blurb: "A solid dropped clack: the catch going into a tooth.",
    status: "bound",
    use: "Player 2 has set the catch — a press now is clean.",
    level: 0.3,
    layers: [thud(300, 150, 0.09, 0.3), after(0.02, soft(0.5, tick(0.16, 0, 2200)))],
  },
  {
    id: "boss.ratchetLet",
    family: "boss",
    blurb: "The catch springing back out, short and high.",
    status: "bound",
    use: "Player 2 let the catch go before a press came.",
    level: 0.28,
    layers: [metal(420, 0.22, 0.24, 320), after(0.04, soft(0.4, tick(0.14, 0, 3400)))],
  },
  {
    id: "boss.ratchetClick",
    family: "boss",
    blurb: "A short clean ratchet: one tooth up, for good.",
    status: "bound",
    use: "A press with the catch set — a clean tooth.",
    level: 0.34,
    layers: [tick(0.22, 0, 2600), after(0.05, soft(0.5, metal(340, 0.24, 0.2, 260)))],
  },
  {
    id: "boss.ratchetBurn",
    family: "boss",
    blurb: "A flat dull thud with nothing bright in it: a tooth spent for nothing.",
    status: "bound",
    use: "A press with no catch, or a window let run out — a tooth burned.",
    level: 0.32,
    layers: [thud(220, 100, 0.1, 0.3), after(0.03, sub(50, 0.3, 0.3))],
  },
  {
    id: "boss.ratchetBolt",
    family: "boss",
    blurb: "A rattle that will not stop: a bolt working its way loose.",
    status: "bound",
    use: "Two clean teeth — a bolt is loose and takes either colour.",
    level: 0.34,
    layers: [
      swell(58, 0.9, 0.08),
      after(
        0.06,
        noise(0.5, { type: "bandpass", freq: 2400, toFreq: 3000, q: 1.5 }, 0.02, 0.2, 0.2),
      ),
    ],
  },
  {
    id: "boss.ratchetBoltOut",
    family: "boss",
    blurb: "The shot taking it: bright, and the rattle gone.",
    status: "bound",
    use: "The loose bolt shot away, in either colour.",
    level: 0.4,
    layers: [glint(3100, 0.24, 0.18), after(0.04, air(2800, 1000, 0.2, 0.12, 1.5))],
  },
  {
    id: "boss.ratchetBoltHit",
    family: "boss",
    blurb: "The bolt arriving on the hull: dull, and heavy.",
    status: "bound",
    use: "Nobody shot the bolt — one strike on the hull, which is the wave.",
    level: 0.46,
    layers: [thud(250, 110, 0.12, 0.34), after(0.04, sub(48, 0.4, 0.36))],
  },
  {
    id: "boss.ratchetOpen",
    family: "boss",
    blurb: "A long groan under everything: the top catch giving.",
    status: "bound",
    use: "Five clean teeth — the rack opens and the fight is over.",
    level: 0.5,
    // Under the speech band for THE HASP's clear's reason: the longest sound
    // in the fight, and the pair are talking across it.
    layers: [
      metal(140, 0.8, 0.3, 130),
      after(0.18, air(210, 120, 0.7, 0.16, 2)),
      after(0.3, sub(44, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.ratchetJam",
    family: "boss",
    blurb: "The rack grinding to a dead stop, down into the hull.",
    status: "bound",
    use: "Five clean is out of reach — the rack jams, which is the wave.",
    level: 0.46,
    layers: [
      noise(0.26, { type: "bandpass", freq: 700, toFreq: 420, q: 1.6 }, 0.01, 0.16, 0.26),
      after(0.04, thud(170, 90, 0.1, 0.3)),
      after(0.12, soft(0.5, sub(46, 0.4, 0.34))),
    ],
  },
  {
    id: "boss.ratchetOut",
    family: "boss",
    blurb: "The rack gone, and the field clearing behind it.",
    status: "bound",
    use: "THE RATCHET gone — then the wave-end light.",
    level: 0.5,
    layers: [
      sub(54, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
