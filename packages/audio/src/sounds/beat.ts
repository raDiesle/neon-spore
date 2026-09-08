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

import { burst, glint, noise, soft, sub, tick } from "../grain.js";
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
      burst(
        noise(5000, { type: "highpass", freq: 5000, q: 0.7 }, 0.001, 0.008, 0.5),
        4,
        0.625,
        1,
        6,
      ),
      { source: "sine", freq: 80, gain: 0.6, at: 1.875, attack: 0.004, release: 0.18 },
    ],
  },
  {
    id: "beat.drift",
    family: "beat",
    blurb: "The click with its low body detuned flat, dragging behind itself.",
    status: "spare",
    // Written for the beat-breaker, spent on THE BEATBOX's discharge for a
    // while, and handed back. It is a *drift* — the global beat is still right
    // and this is not on it — and the owner asked for a discharge to be a
    // plain error rather than a shade of late, which is `beat.wrong` below.
    // The beat-breaker also keeps `beat.half` and `creature.beatBreaker`.
    use: "A wave whose clock is deliberately off the shared beat.",
    level: 0.32,
    layers: [
      tick(0.45, 0, 4600),
      { source: "sine", freq: 84, toFreq: 74, gain: 0.5, attack: 0.004, release: 0.1 },
    ],
  },
  {
    id: "beat.wrong",
    family: "beat",
    blurb: "A flat two-note buzz falling a semitone, under a bitten-off click.",
    status: "bound",
    // **A buzzer, not a shade of late.** The owner asked for it by name — *a
    // sound of error* — after a miscount had been sounding as `beat.drift`,
    // which is a click dragging behind itself. That is a good sound for a
    // clock that is off and a bad one for a mistake: it says *not quite*
    // where what happened is *no*. Two square bodies a semitone apart, falling
    // together, is the shape every machine in the world uses to refuse
    // something, and this is the one moment in the game that wants it.
    //
    // Under the beat's own click in level so it never masks the metronome the
    // pair is counting on — a wrong answer that drowns the question would take
    // the next run with it — and short, because the `breach` beside it is
    // already playing what the mistake cost.
    use: "THE BEATBOX discharging: a run committed on the wrong count.",
    // Both bodies are squares under a lowpass, and the filter is not a
    // flourish: a square is its fundamental plus everything above it, so an
    // open one at 196 Hz reaches a kilohertz into the voice and `judgeBand`
    // refuses it. Cut at 270 the harmonics that make it a buzz rather than a
    // hum are the two under the band, which is exactly the fat, flat, wrong
    // sound wanted and none of the part that would sit on a sentence.
    level: 0.4,
    layers: [
      tick(0.4, 0, 4600),
      {
        source: "square",
        freq: 196,
        toFreq: 185,
        gain: 0.34,
        attack: 0.004,
        release: 0.16,
        filter: { type: "lowpass", freq: 270, q: 0.7 },
      },
      {
        source: "square",
        freq: 131,
        toFreq: 123,
        gain: 0.4,
        attack: 0.004,
        release: 0.22,
        filter: { type: "lowpass", freq: 270, q: 0.7 },
      },
    ],
  },
  {
    id: "beat.lock",
    family: "beat",
    blurb: "Two clicks a hair apart, closing into one.",
    status: "bound",
    // Two clicks a hair apart closing into one, which is what a run that
    // answered is: several beats of counting resolving into a single fact.
    // Deliberately used here rather than an ordinary kill cue — nothing was
    // shot, and a pair who heard a body burst would learn that a box is
    // answered the way a slick is (`bind-beatbox.ts`).
    use: "THE BEATBOX going quiet: the run committed on the count it asked for.",
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
      noise(900, { type: "lowpass", freq: 260, q: 0.8 }, 0.001, 0.02, 0.4),
      sub(70, 0.08, 0.4),
    ],
  },
];
