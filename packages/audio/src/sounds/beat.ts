/**
 * The click track.
 *
 * `docs/spec/systems.md` 5.3: no soundtrack, only a sparse click below the
 * speech range. This is the one sound the game makes on a schedule rather than
 * because something happened, so it is the one that must never be in the way —
 * every grain here is either a six-millisecond transient or under 120 Hz.
 *
 * The beat is the shared clock two people who cannot see each other's screen
 * both hear. At 96 BPM a beat is 625 ms, and every fourth is accented.
 */

import { glint, soft, sub, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BEAT_SOUNDS: SoundDef[] = [
  {
    id: "beat.tick",
    family: "beat",
    blurb: "A dry click with a short low body under it. Almost not there.",
    status: "bound",
    use: "Every beat that is not the fourth.",
    level: 0.34,
    layers: [tick(0.5), sub(84, 0.05, 0.5)],
  },
  {
    id: "beat.accent",
    family: "beat",
    blurb: "The same click, wider, on a lower body that rings a moment longer.",
    status: "bound",
    use: "Every fourth beat — the one both players count from.",
    level: 0.44,
    layers: [tick(0.6, 0, 4200), sub(62, 0.12, 0.7), soft(0.35, glint(4800, 0.06))],
  },
  {
    id: "beat.half",
    family: "beat",
    blurb: "A thinner click, offset half a beat.",
    status: "spare",
    use: "A wave that needs eighths — the beat-breaker, or a boss on a half-beat clock.",
    level: 0.2,
    layers: [tick(0.35, 0, 6400)],
  },
  {
    id: "beat.countIn",
    family: "beat",
    blurb: "Four clicks rising a tone each, the last one landing on the body.",
    status: "spare",
    use: "Before a wave that starts on a figure, and before a briefing hands over.",
    level: 0.4,
    layers: [
      {
        source: "noise",
        freq: 5000,
        gain: 0.5,
        attack: 0.001,
        release: 0.008,
        filter: { type: "highpass", freq: 5000, q: 0.7 },
        repeat: { times: 4, every: 0.625, decay: 1, detune: 6 },
      },
      { source: "sine", freq: 80, gain: 0.6, at: 1.875, attack: 0.004, release: 0.18 },
    ],
  },
  {
    id: "beat.drift",
    family: "beat",
    blurb: "The click with its low body detuned flat, dragging behind itself.",
    status: "spare",
    use: "The beat-breaker: the global beat stays right, this one says something is off.",
    level: 0.32,
    layers: [
      tick(0.45, 0, 4600),
      { source: "sine", freq: 84, toFreq: 74, gain: 0.5, attack: 0.004, release: 0.1 },
    ],
  },
  {
    id: "beat.lock",
    family: "beat",
    blurb: "Two clicks a hair apart, closing into one.",
    status: "spare",
    use: "Both inputs landing on the same beat — the whisperer's whole mechanic.",
    level: 0.42,
    layers: [tick(0.5, 0, 5600), tick(0.5, 0.028, 5600), sub(96, 0.1, 0.55, 0.028)],
  },
  {
    id: "beat.silence",
    family: "beat",
    blurb: "A click with the top cut off — present, but suddenly far away.",
    status: "spare",
    use: "A bar the game deliberately does not fill: the moment before a boss moves.",
    level: 0.26,
    layers: [
      {
        source: "noise",
        freq: 900,
        gain: 0.4,
        attack: 0.001,
        release: 0.02,
        filter: { type: "lowpass", freq: 260, q: 0.8 },
      },
      sub(70, 0.08, 0.4),
    ],
  },
];
