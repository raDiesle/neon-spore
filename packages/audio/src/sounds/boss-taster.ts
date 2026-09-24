/**
 * THE TASTER's sixteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **eleven blades**, and everything here is a blade being worked:
 * growing is a whetstone, setting is a single struck edge, thickening is that
 * edge going dull and heavy, paring is metal coming off it, and a shear is the
 * blade itself going. Nothing is wet — one boss over is the sack, and the two
 * must never be mistaken for each other on a phone speaker.
 *
 * Thin and bright above the band or short and low under it, and the two the
 * pair hears dozens of times — `tasterThick` and `tasterPare` — are the
 * shortest (docs/spec/audio.md §1).
 *
 * **The three hands are the only things here that are not metal being worked**,
 * and that is deliberate: a thumb is not an edge, and the pair should be able
 * to hear the difference between what they did to the fan and what the fan did
 * to itself. A pin is a finger stopping a ringing blade dead, a wipe is a hand
 * dragged over something soft, and the pry is the one heavy sound of the three
 * because it is two locked edges coming off each other (`sim/taster-hand.ts`).
 */

import { after, air, burst, chime, glint, metal, noise, soft, spore, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_TASTER_SOUNDS: SoundDef[] = [
  {
    id: "boss.tasterRise",
    family: "boss",
    blurb: "The crest coming in: a long metal edge settling across the top of the frame.",
    status: "bound",
    use: "THE TASTER arriving, no blades out of the crest yet.",
    level: 0.36,
    // The sweep stays above the band and the weight of it below, so a slow
    // arrival never sits on top of a voice.
    layers: [
      air(9000, 4600, 1.1, 0.2, 1.4),
      after(0.25, sub(65, 1.1, 0.34)),
      after(0.7, soft(0.5, metal(4800, 0.5, 0.22, 240))),
    ],
  },
  {
    id: "boss.tasterGrow",
    family: "boss",
    blurb: "A blade coming out of the crest: one short pass of a whetstone, no colour yet.",
    status: "bound",
    use: "THE TASTER growing a blade — the beat before its edge sets.",
    level: 0.3,
    layers: [noise(0.14, { type: "bandpass", freq: 4600, toFreq: 7200, q: 1.6 }, 0.01, 0.03, 0.4)],
  },
  {
    id: "boss.tasterSet",
    family: "boss",
    blurb: "An edge taking its colour: one struck blade, ringing thin.",
    status: "bound",
    use: "THE TASTER setting a blade's edge to the colour the pair has been spending — the tell, and the beat THE SLOW holds.",
    level: 0.42,
    layers: [metal(5200, 0.7, 0.3, 220), after(0.06, glint(7200, 0.3, 0.14))],
  },
  {
    id: "boss.tasterThick",
    family: "boss",
    blurb: "The edge going heavy: a dull, lower strike with no ring left in it.",
    status: "bound",
    use: "THE TASTER fed its own colour — the blade thickens. Pitched down a step per layer.",
    level: 0.34,
    layers: [thud(190, 80, 0.16, 0.36), after(0.02, soft(0.4, metal(4400, 0.14, 0.16, 200)))],
  },
  {
    id: "boss.tasterPare",
    family: "boss",
    blurb: "Metal coming off an edge: one short bright scrape.",
    status: "bound",
    use: "THE TASTER struck with the colour its blade is not — one layer off. Pitched up as the blade thins.",
    level: 0.34,
    layers: [noise(0.1, { type: "bandpass", freq: 7600, toFreq: 5200, q: 2 }, 0.004, 0.02, 0.44)],
  },
  {
    id: "boss.tasterShear",
    family: "boss",
    blurb: "A blade going: metal parting, then the piece falling away.",
    status: "bound",
    use: "THE TASTER's blade struck off for good, its column left soft.",
    level: 0.46,
    layers: [
      noise(0.22, { type: "bandpass", freq: 8000, toFreq: 4200, q: 1.4 }, 0.004, 0.02, 0.48),
      after(0.05, sub(58, 0.4, 0.34)),
      after(0.16, soft(0.5, glint(6200, 0.2, 0.14))),
    ],
  },
  {
    id: "boss.tasterCrest",
    family: "boss",
    blurb: "A shot into bare crest: a soft, gutless knock.",
    status: "bound",
    use: "THE TASTER hit where a blade used to be — it counts nothing, and sounds like nothing.",
    level: 0.26,
    layers: [soft(0.7, thud(150, 90, 0.12, 0.28))],
  },
  {
    id: "boss.tasterLift",
    family: "boss",
    blurb: "The crest cut through: a long tearing lift, and the fan losing its spine.",
    status: "bound",
    use: "THE TASTER's crest opened for good — it can never re-edge itself again.",
    level: 0.5,
    layers: [
      noise(0.36, { type: "bandpass", freq: 4200, toFreq: 9000, q: 1.2 }, 0.006, 0.04, 0.5),
      after(0.08, sub(52, 0.6, 0.4)),
      after(0.2, burst(soft(0.5, glint(5600, 0.16, 0.12)), 5, 0.06, 0.8, 40)),
    ],
  },
  {
    id: "boss.tasterTaste",
    family: "boss",
    blurb: "Every standing edge turning over at once: a shiver of thin metal along the whole fan.",
    status: "bound",
    use: "THE TASTER re-edging — the majority flipped, and every blade is the other colour now.",
    level: 0.44,
    layers: [
      burst(metal(5600, 0.22, 0.2, 200), 7, 0.05, 0.85, 50),
      after(0.4, spore(4800, 0.6, 0.1, 8)),
    ],
  },
  {
    id: "boss.tasterClose",
    family: "boss",
    blurb: "The last blades folding over each other: two heavy edges locking.",
    status: "bound",
    use: "THE TASTER's survivors interlocking over its body — no single bolt reaches them now.",
    level: 0.46,
    layers: [
      metal(3400, 0.4, 0.26, 180),
      after(0.09, metal(2900, 0.5, 0.24, 170)),
      after(0.16, sub(60, 0.7, 0.36)),
    ],
  },
  {
    id: "boss.tasterRefused",
    family: "boss",
    blurb: "A bolt turned away: a flat clank off locked metal.",
    status: "bound",
    use: "THE TASTER's interlock refusing a single shot — it counts nothing either way.",
    level: 0.3,
    layers: [soft(0.6, metal(3000, 0.12, 0.22, 160)), after(0.02, thud(210, 120, 0.1, 0.22))],
  },
  {
    id: "boss.tasterPin",
    family: "boss",
    blurb:
      "A ringing edge stopped dead by a finger: the tone cut short, with the touch left on it.",
    status: "bound",
    use: "THE TASTER's blade held out of its decision by player 1's thumb.",
    level: 0.3,
    layers: [metal(5000, 0.1, 0.1, 210), after(0.05, soft(0.6, thud(220, 150, 0.08, 0.2)))],
    // Shorter than `tasterSet`, which is the same blade allowed to ring: a pin
    // is that sound with the end taken off it.
  },
  {
    id: "boss.tasterWipe",
    family: "boss",
    blurb:
      "A hand dragged across something soft: a low sweep with a wet hiss over it, and no edge in it.",
    status: "bound",
    use: "THE TASTER's soft crest cut by player 2's thumb rather than by a bolt — the cut that spends no colour.",
    level: 0.32,
    // The hiss is high-passed well clear of a voice and the weight of it is
    // under one, which is `tasterCrest`'s shape stretched into a drag: the
    // crest's two sounds are the same gap answered by a bolt and by a hand.
    layers: [
      noise(0.28, { type: "highpass", freq: 5200, toFreq: 4200, q: 0.9 }, 0.04, 0.08, 0.34),
      after(0.06, soft(0.6, thud(170, 110, 0.18, 0.3))),
    ],
  },
  {
    id: "boss.tasterPry",
    family: "boss",
    blurb:
      "Two locked edges hauled off each other: a heavy grinding part, then the gap standing open.",
    status: "bound",
    use: "THE TASTER's interlock carried apart by player 1 — the beam has tasterPryBeats to land.",
    level: 0.5,
    // The grind is the longest thing in this file and so is the one that most
    // had to stay off a voice: high-passed above the band, with the body of it
    // under one, and the edges ringing at the top on the way out.
    layers: [
      noise(0.32, { type: "highpass", freq: 4400, toFreq: 5600, q: 1 }, 0.02, 0.06, 0.46),
      after(0.08, sub(56, 0.5, 0.38)),
      after(0.24, metal(4600, 0.3, 0.2, 150)),
    ],
  },
  {
    id: "boss.tasterPryFill",
    family: "boss",
    blurb:
      "A beam ringing into the open interlock: one struck edge and a low weight, and no give yet.",
    status: "bound",
    use: "THE TASTER — a right beam into the pried interlock short of the last; one more opens the fan.",
    level: 0.4,
    // `tasterOut`'s first grain on its own and short: the fan answered, and
    // not yet thrown open.
    layers: [metal(4800, 0.2, 0.18, 200), after(0.03, sub(62, 0.3, 0.32))],
  },
  {
    id: "boss.tasterOut",
    family: "boss",
    blurb:
      "The fan unlocking outward: eleven edges thrown open at once, and the body going with them.",
    status: "bound",
    use: "THE TASTER ended by the beam in the colour it never tasted.",
    level: 0.52,
    layers: [
      noise(0.5, { type: "bandpass", freq: 4600, toFreq: 9000, q: 1.2 }, 0.004, 0.05, 0.5),
      after(0.05, sub(55, 0.5, 0.42)),
      after(0.12, burst(chime(4800, 0.3, 0.14), 6, 0.05, 0.85, 60)),
      after(0.26, air(4600, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
