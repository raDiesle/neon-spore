/**
 * Information one player has and the other does not — which is the game.
 *
 * Marks, announcements, the radar strip, and the several idea-store mechanics
 * that are all the same shape underneath: something is known over here and has
 * to be got over there through a voice channel with a delay on it. The three
 * `mark` sounds are bound: marking is built, as THE LANCE (`sim/lance.ts`),
 * and they were written for exactly this. Announcing is still unbuilt
 * (`docs/spec/couplings.md`).
 */

import { after, burst, chime, glint, soft, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const SIGNAL_SOUNDS: SoundDef[] = [
  {
    id: "signal.markSet",
    family: "signal",
    blurb: "A mark landing on a tile: one pip, and a ring around it.",
    status: "bound",
    use: "THE LANCE's lobe coming full — the mark is set, and player 2 may fire it.",
    level: 0.3,
    layers: [
      glint(6200, 0.05, 0.5),
      after(0.03, {
        source: "sine",
        freq: 4400,
        gain: 0.24,
        attack: 0.02,
        hold: 0.08,
        release: 0.3,
      }),
    ],
  },
  {
    id: "signal.markHit",
    family: "signal",
    blurb: "A shot landing where the mark was. Two sounds agreeing.",
    status: "bound",
    use: "A lance leaving a full lobe — the joint moment marking exists to make.",
    level: 0.36,
    layers: [
      glint(6200, 0.04, 0.5),
      after(0.01, chime(4400, 0.3, 0.2, 900)),
      after(0.01, sub(96, 0.24, 0.4)),
    ],
  },
  {
    id: "signal.markMissed",
    family: "signal",
    blurb: "The mark going out without being used.",
    status: "bound",
    use: "A shot fired through a lobe that was still filling — the fill goes with it.",
    level: 0.24,
    layers: [{ source: "sine", freq: 4400, toFreq: 3300, gain: 0.3, attack: 0.03, release: 0.26 }],
  },
  {
    id: "signal.lureWarn",
    family: "signal",
    blurb: "Two quick pips, high and close together. Small, and impossible to mistake for a body.",
    status: "bound",
    use: "A lure arriving, on the navigator's device only — one more indicator beside the ring and the strip, never a replacement for either.",
    // Quiet on purpose (`docs/spec/audio.md`): the owner asked for it turned
    // down, sitting on top of the visual indicators rather than beside them.
    level: 0.16,
    layers: [
      // Both pips well above 3 kHz. A short high transient reads as an alarm
      // without ever entering the band the two voices need, and the voices are
      // the control scheme — this is the one sound in the game that fires
      // exactly when one player has something to say to the other.
      glint(5400, 0.04, 0.34),
      after(0.09, glint(6300, 0.04, 0.3)),
    ],
  },
  {
    id: "signal.announce",
    family: "signal",
    blurb: "An announcement leaving one device: a short rising call.",
    status: "spare",
    use: "Announcing (couplings.md 3), on the sending side.",
    level: 0.3,
    layers: [
      { source: "sine", freq: 3600, toFreq: 5400, gain: 0.3, attack: 0.02, release: 0.16 },
      soft(0.4, glint(8000, 0.1)),
    ],
  },
  {
    id: "signal.received",
    family: "signal",
    blurb: "The same call arriving, from the other end.",
    status: "spare",
    use: "Announcing, on the receiving side — deliberately not the same sound.",
    level: 0.3,
    layers: [
      { source: "sine", freq: 5400, toFreq: 3600, gain: 0.3, attack: 0.02, release: 0.16 },
      soft(0.4, sub(110, 0.16, 0.4)),
    ],
  },
  {
    id: "signal.radarPing",
    family: "signal",
    blurb: "One line growing on the strip: a pip whose tail is how long you have.",
    status: "spare",
    use: "A radar line appearing — length is remaining time (systems.md 5.2).",
    level: 0.22,
    layers: [glint(5600, 0.16, 0.4)],
  },
  {
    id: "signal.radarUnknown",
    family: "signal",
    blurb: "A pip that does not resolve. The question mark, as a sound.",
    status: "bound",
    use: "THE VEIL turning over (`veilMorph`) — the call has expired and the sound will not say what replaced it.",
    level: 0.24,
    layers: [
      {
        source: "triangle",
        freq: 5200,
        gain: 0.26,
        attack: 0.02,
        release: 0.2,
        ring: { freq: 1700, depth: 0.7 },
        wobble: { rate: 9, cents: 60 },
      },
    ],
  },
  {
    id: "signal.radarClose",
    family: "signal",
    blurb: "The strip's last warning: the pip, twice, faster.",
    status: "spare",
    use: "A radar line about to run out.",
    level: 0.28,
    layers: [burst(glint(6600, 0.07, 0.45), 2, 0.09, 0.9, 6)],
  },
  {
    id: "signal.inverted",
    family: "signal",
    blurb: "An instruction that means its opposite: a rising tone that ends lower than it began.",
    status: "spare",
    use: "Inverted instructions (ideas.md) — the Spaceteam principle.",
    level: 0.3,
    layers: [
      {
        source: "triangle",
        freq: 4000,
        toFreq: 6600,
        gain: 0.26,
        attack: 0.02,
        hold: 0.06,
        release: 0.06,
        ring: { freq: 1200, depth: 0.4 },
      },
      after(0.14, {
        source: "triangle",
        freq: 3400,
        toFreq: 2600,
        gain: 0.26,
        attack: 0.01,
        release: 0.2,
        ring: { freq: 900, depth: 0.5 },
      }),
    ],
  },
  {
    id: "signal.codebook",
    family: "signal",
    blurb: "A table being read: four pips, evenly spaced, no melody in them.",
    status: "spare",
    use: "The codebook table (ideas.md), and The Codex.",
    level: 0.24,
    layers: [burst(glint(5200, 0.04, 0.4), 4, 0.14, 1)],
  },
  {
    id: "signal.interference",
    family: "signal",
    blurb: "Two colours swapped and nobody told: the fire sounds, in the wrong order.",
    status: "spare",
    use: "Interference (ideas.md) — one player's colours are swapped.",
    level: 0.28,
    layers: [
      tick(0.4, 0, 5200),
      thud(300, 96, 0.08, 0.4),
      after(0.16, tick(0.4, 0, 3800)),
      after(0.16, thud(220, 70, 0.09, 0.4)),
    ],
  },
  {
    id: "signal.bearing",
    family: "signal",
    blurb: "A coordinate spoken as two pips: one for the column, one for the row.",
    status: "spare",
    use: "Bearing waves (ideas.md) — a coordinate grid as a change of controls.",
    level: 0.26,
    layers: [glint(4400, 0.06, 0.45), after(0.16, glint(7040, 0.08, 0.4))],
  },
  {
    id: "signal.jammed",
    family: "signal",
    blurb: "A channel that is no longer carrying anything.",
    status: "spare",
    use: "A strip blanked — the Jammer, from the side that lost the strip.",
    level: 0.26,
    layers: [
      {
        source: "noise",
        freq: 3000,
        gain: 0.35,
        attack: 0.02,
        release: 0.5,
        filter: { type: "bandpass", freq: 5600, toFreq: 4400, q: 2.6 },
        wobble: { rate: 31, cents: 400 },
      },
    ],
  },
];
