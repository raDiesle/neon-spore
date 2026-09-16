/**
 * THE BATON's seven, in a file of their own for the reason `boss.ts` is at its
 * limit: one boss is seven sounds, and the next one will be a file too.
 *
 * The fight is a metronome — one seat a beat, and the bead passed down the arm
 * on the alternation — so what these have to do is **be heard as a count**. A
 * launch and a landing are the two halves of one handover, and they are one
 * shape each way: a short click going up as the bead leaves, the same click
 * coming down as it lands. The pair keeps time off them without looking. Under
 * all of it the register `boss.arrive` opened, below 90 Hz, where nothing else
 * in the catalogue lives (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, metal, noise, soft, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_BATON_SOUNDS: SoundDef[] = [
  {
    id: "boss.batonLaunch",
    family: "boss",
    blurb: "A bead leaving its socket: one click, rising, and the socket ringing behind it.",
    status: "bound",
    use: "THE BATON's bead launched by the trigger — the pilot's turn, spent.",
    level: 0.38,
    layers: [
      tick(0.5, 0, 3200),
      {
        source: "sine",
        freq: 520,
        toFreq: 760,
        gain: 0.3,
        attack: 0.005,
        hold: 0.02,
        release: 0.1,
      },
      after(0.03, glint(4200, 0.18, 0.1)),
    ],
  },
  {
    id: "boss.batonStruck",
    family: "boss",
    blurb: "A bead hit in the air: a small hard knock, and the light in it turning over.",
    status: "bound",
    use: "THE BATON's bead struck in flight by the right colour — the navigator's turn, spent.",
    level: 0.42,
    layers: [
      thud(320, 140, 0.18, 0.5),
      metal(180, 0.22, 0.28, 200),
      after(0.04, glint(3600, 0.22, 0.14)),
    ],
  },
  {
    id: "boss.batonLanded",
    family: "boss",
    blurb:
      "The bead landing a socket lower: the launch's click, falling instead, and a socket going out.",
    status: "bound",
    use: "THE BATON's bead landing in the next socket down after a hit; the one it left is dark for good.",
    level: 0.4,
    layers: [
      tick(0.5, 0, 2600),
      {
        source: "sine",
        freq: 760,
        toFreq: 520,
        gain: 0.3,
        attack: 0.005,
        hold: 0.02,
        release: 0.1,
      },
      // The socket behind it going out: a short low body, the arm withering.
      after(0.06, sub(72, 0.28, 0.4)),
    ],
  },
  {
    id: "boss.batonRelit",
    family: "boss",
    blurb:
      "A bead nobody hit landing back where it was: the click, flat, and the socket lighting again.",
    status: "bound",
    use: "THE BATON's bead landing untouched — the flight wasted and the socket relit.",
    level: 0.36,
    layers: [
      tick(0.4, 0, 2200),
      { source: "sine", freq: 640, gain: 0.26, attack: 0.005, hold: 0.03, release: 0.12 },
      // Relit, not withered: a thin line up rather than a body down.
      after(0.05, air(600, 2400, 0.22, 0.12, 2)),
    ],
  },
  {
    id: "boss.batonSettled",
    family: "boss",
    blurb:
      "A bead left sitting too long going back to the top: a slide upward, and the count starting over.",
    status: "bound",
    use: "THE BATON's bead settling — a turn missed, and the bead returned to the topmost socket.",
    level: 0.4,
    layers: [
      // The slide stays under the speech band and the hiss above it: a settle
      // is the moment the pair most needs to say what just happened.
      { source: "sine", freq: 90, toFreq: 280, gain: 0.34, attack: 0.02, hold: 0.1, release: 0.3 },
      soft(
        0.5,
        noise(0.4, { type: "bandpass", freq: 3400, toFreq: 6800, q: 1.2 }, 0.02, 0.35, 0.3),
      ),
      after(0.34, tick(0.45, 0, 3600)),
    ],
  },
  {
    id: "boss.batonShed",
    family: "boss",
    blurb:
      "A dead segment parting from the arm: one joint letting go, and the rock it was starting to fall.",
    status: "bound",
    use: "THE BATON shedding a dark socket, which falls down the arm's own column as a rock.",
    level: 0.44,
    layers: [
      metal(140, 0.3, 0.3, 160),
      thud(240, 70, 0.4, 0.55),
      after(0.08, soft(0.6, spore(58, 0.5, 0.3, 40))),
    ],
  },
  {
    id: "boss.batonDown",
    family: "boss",
    blurb: "The bead taken by the maw, and the arm coming off at every joint at once.",
    status: "bound",
    use: "THE BATON beaten — the last drop taken into the lobe, and the arm folding away.",
    level: 0.55,
    // Not `pierce`: the five permissions are spent, and this one keeps out of
    // the band on its own — the body is a sub thud and the rattle rings above.
    layers: [
      thud(280, 32, 1.0, 0.8),
      after(0.16, burst(glint(3800, 0.3, 0.2), 6, 0.11, 0.78, -4)),
      after(0.9, soft(0.6, spore(52, 1.1, 0.35, 60))),
      after(1.0, soft(0.5, sub(46, 1.1, 0.4))),
    ],
  },
];
