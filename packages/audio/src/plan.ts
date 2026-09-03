/**
 * A sound, flattened into voices with absolute times.
 *
 * This is the half of the engine that has no `AudioContext` in it, and that is
 * on purpose: the whole catalogue can be checked by `bun test` on a machine
 * with no sound card. `engine.ts` does nothing but turn a `PlannedVoice` into
 * nodes — every decision that could be wrong is made here.
 */

import type { Layer, SoundDef, Source } from "./types.js";

export interface PlannedVoice {
  source: Source;
  /** Seconds after the sound started. */
  start: number;
  freq: number;
  toFreq: number;
  glide: "exp" | "lin";
  /** Peak amplitude, the sound's `level` already multiplied in. */
  gain: number;
  attack: number;
  hold: number;
  release: number;
  filter?: { type: "lowpass" | "highpass" | "bandpass"; freq: number; toFreq: number; q: number };
  ring?: { freq: number; depth: number };
  wobble?: { rate: number; cents: number };
  pan: number;
}

export interface Plan {
  id: string;
  voices: PlannedVoice[];
  /** Seconds from the first voice's start to the last one's tail. */
  duration: number;
}

export interface PlayOptions {
  /** Multiplies every frequency. 2 is an octave up. */
  pitch?: number;
  /** Multiplies every gain. */
  gain?: number;
  /** Overrides each layer's own pan — the column something happened in. */
  pan?: number;
}

/**
 * Mobile audio dies under node churn long before it runs out of CPU, so the
 * engine holds a ceiling on how many sources may be alive at once. The number
 * lives here rather than next to the nodes because the decision it feeds is
 * `admits`, and that decision is the kind this file exists to keep testable.
 */
export const MAX_LIVE_VOICES = 64;

/**
 * Whether a plan may start at all, given what is already sounding.
 *
 * A whole plan or none of it. The cap used to be read inside the engine's
 * per-voice loop, which let a multi-layer sound arriving at the ceiling play
 * its first layers and drop the rest — a click with no body, which is worse
 * than the silence it was rationing towards.
 */
export function admits(liveCount: number, plan: Plan): boolean {
  return liveCount + plan.voices.length <= MAX_LIVE_VOICES;
}

/** An oscillator cannot glide exponentially to or from zero, and 20 Hz is inaudible anyway. */
const MIN_HZ = 20;
const MAX_HZ = 20_000;

const clampHz = (hz: number): number => Math.min(MAX_HZ, Math.max(MIN_HZ, hz));

function voiceFrom(layer: Layer, def: SoundDef, opts: PlayOptions, index: number): PlannedVoice[] {
  const pitch = opts.pitch ?? 1;
  const level = def.level * (opts.gain ?? 1);
  const times = layer.repeat?.times ?? 1;
  const out: PlannedVoice[] = [];

  for (let i = 0; i < times; i++) {
    const decay = layer.repeat ? layer.repeat.decay ** i : 1;
    const detune = layer.repeat?.detune ? (1 + layer.repeat.detune / 100) ** i : 1;
    const gain = layer.gain * level * decay;
    if (gain <= 0.0005) break; // below hearing; the rest of the burst is arithmetic
    const freq = clampHz(layer.freq * pitch * detune);
    out.push({
      source: layer.source,
      start: (layer.at ?? 0) + (layer.repeat ? layer.repeat.every * i : 0),
      freq,
      toFreq: clampHz((layer.toFreq ?? layer.freq) * pitch * detune),
      glide: layer.glide ?? "exp",
      gain,
      attack: Math.max(0.0005, layer.attack),
      hold: layer.hold ?? 0,
      release: Math.max(0.001, layer.release),
      filter: layer.filter && {
        type: layer.filter.type,
        freq: clampHz(layer.filter.freq * pitch),
        toFreq: clampHz((layer.filter.toFreq ?? layer.filter.freq) * pitch),
        q: layer.filter.q ?? 1,
      },
      ring: layer.ring && { freq: layer.ring.freq * pitch, depth: layer.ring.depth },
      wobble: layer.wobble,
      // A sound's own pan is a character note (the hull's left rib); the play's
      // pan is where it happened, and where it happened wins.
      pan: opts.pan ?? layer.pan ?? 0,
    });
    void index;
  }
  return out;
}

export function endOf(v: PlannedVoice): number {
  return v.start + v.attack + v.hold + v.release;
}

export function planSound(def: SoundDef, opts: PlayOptions = {}): Plan {
  const voices = def.layers.flatMap((layer, i) => voiceFrom(layer, def, opts, i));
  const duration = voices.reduce((max, v) => Math.max(max, endOf(v)), 0);
  return { id: def.id, voices, duration };
}
