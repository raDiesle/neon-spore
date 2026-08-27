/**
 * The speech band, kept clear.
 *
 * Talking is the control scheme (docs/spec/overview.md 1.1), and the pair talks
 * over a channel with a delay on it. A sound that sits on top of a voice does
 * not merely annoy — it costs the other player a sentence they have to say
 * twice, which is the one currency this game spends. So the palette is carved
 * around the voice: bodies below 300 Hz, sparkle above 3 kHz, and only brief
 * transients crossing the middle.
 *
 * `docs/spec/systems.md` 5.3 asked for exactly this in one line — "a sparse
 * click track below the speech range, so it does not compete with the voice".
 * This file is that line made into something that can fail.
 */

import { endOf, type Plan, type PlannedVoice } from "./plan.js";
import type { SoundDef } from "./types.js";

/** Roughly the intelligibility range of a phone call. */
export const SPEECH_BAND = { low: 300, high: 3000 } as const;

/**
 * How much audible in-band time one sound may spend. A click, a tick and the
 * attack of a bell all fit; a held mid-range tone does not.
 */
export const VOICE_BUDGET_SECONDS = 0.16;

/**
 * A foreground amplitude. A voice at this level and above costs its full time;
 * one at half of it costs half, because covering a voice is a matter of how
 * loud the thing on top of it is, not merely of it being there. Under
 * `AUDIBLE` it is not on top of anything.
 */
const FOREGROUND = 0.25;
const AUDIBLE = 0.05;

/** The band a voice occupies at one moment of its life, `t` running 0..1. */
export function spectrumAt(v: PlannedVoice, t: number): { low: number; high: number } {
  let low = 20;
  let high = 20_000;
  const slide = (from: number, to: number): number => from * (to / from) ** t;
  if (v.source !== "noise") {
    const f = slide(v.freq, v.toFreq);
    low = f;
    high = f;
    // Ring modulation puts sidebands at f±m, so the sound is wider than its pitch.
    if (v.ring && v.ring.depth > 0) {
      low = Math.max(20, low - v.ring.freq);
      high = high + v.ring.freq;
    }
    // A sawtooth or a square is its fundamental plus everything above it, and
    // the first few harmonics are what a listener hears reaching into the band.
    if (v.source === "sawtooth" || v.source === "square") high *= 5;
  }
  const filter = v.filter;
  if (!filter) return { low, high };
  const cut = slide(filter.freq, filter.toFreq);
  if (filter.type === "lowpass") return { low, high: Math.min(high, cut) };
  if (filter.type === "highpass") return { low: Math.max(low, cut), high };
  // A bandpass is only as narrow as its Q; Q=1 is about an octave either side.
  const skirt = 1 + 1 / filter.q;
  return { low: Math.max(low, cut / skirt), high: Math.min(high, cut * skirt) };
}

/** Where a voice puts its energy across its whole life. */
export function spectrum(v: PlannedVoice): { low: number; high: number } {
  const a = spectrumAt(v, 0);
  const b = spectrumAt(v, 1);
  return { low: Math.min(a.low, b.low), high: Math.max(a.high, b.high) };
}

/**
 * How much of a voice's life overlaps the speech band, 0..1.
 *
 * The fraction matters, and getting it wrong in the safe direction was the
 * first version of this file: a sweep from 600 Hz to 7 kHz *crosses* the band
 * rather than sitting in it, and counting the whole sweep condemned every
 * arrival and every deflection in the catalogue. What covers a voice is time
 * spent, so time spent is what is measured — by sampling, because the shapes
 * that reach here include a swept filter over a swept oscillator with
 * sidebands on it, and the closed form for that is not worth owning.
 */
const SAMPLES = 64;

export function bandFraction(v: PlannedVoice): number {
  let inside = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const s = spectrumAt(v, (i + 0.5) / SAMPLES);
    if (s.high > SPEECH_BAND.low && s.low < SPEECH_BAND.high) inside++;
  }
  return inside / SAMPLES;
}

/**
 * What this sound costs the conversation: time in the band, weighted by how
 * loudly it is spent. Seconds, so the budget can be read as one.
 */
export function voiceBandSeconds(plan: Plan): number {
  return plan.voices
    .filter((v) => v.gain >= AUDIBLE)
    .reduce(
      (sum, v) => sum + (endOf(v) - v.start) * bandFraction(v) * Math.min(1, v.gain / FOREGROUND),
      0,
    );
}

export interface BandVerdict {
  seconds: number;
  /** True when the sound is within budget, or has a stated reason to exceed it. */
  ok: boolean;
  /** Set when it is over budget without a reason — the message a test prints. */
  complaint?: string;
}

export function judgeBand(def: SoundDef, plan: Plan): BandVerdict {
  const seconds = voiceBandSeconds(plan);
  if (seconds <= VOICE_BUDGET_SECONDS) return { seconds, ok: true };
  if (def.pierce) return { seconds, ok: true };
  return {
    seconds,
    ok: false,
    complaint:
      `${def.id} spends ${seconds.toFixed(3)}s in the speech band ` +
      `(budget ${VOICE_BUDGET_SECONDS}s). Move the body below ${SPEECH_BAND.low} Hz or ` +
      `above ${SPEECH_BAND.high} Hz, shorten it, drop its gain under ${AUDIBLE} — ` +
      "or set `pierce` to the reason this one is allowed to cover a voice.",
  };
}
