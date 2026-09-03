/**
 * The grains — the instruments of Neon Spore.
 *
 * A sound in the catalogue is a stack of these, not a hand-built oscillator
 * graph. Two reasons. The catalogue holds well over a hundred sounds and they
 * have to belong to one game: if every sound invents its own bell, the game
 * has a hundred bells. And the speech band (`band.ts`) is easiest to respect
 * by construction — `sub` and `thud` live under it, `glint` and `air` live
 * over it, and the three that cross it are short by definition.
 *
 * Adding a grain is a change to the game's voice and should be rare. Adding a
 * sound is not: compose it here.
 */

import type { Layer } from "./types.js";

/** The ship's mass. A soft sine below the voice — felt more than heard. */
export function sub(freq: number, release: number, gain = 0.5, at = 0): Layer {
  return { source: "sine", freq, gain, at, attack: 0.006, release };
}

/** Weight landing: a pitch dropping through the floor. Every impact starts here. */
export function thud(from: number, to: number, release: number, gain = 0.6, at = 0): Layer {
  return { source: "sine", freq: from, toFreq: to, gain, at, attack: 0.002, release };
}

/**
 * The click track's grain, and every transient's front edge: six milliseconds
 * of noise above the voice. It is the one sound the game may make on every beat.
 */
export function tick(gain = 0.25, at = 0, colour = 5200): Layer {
  return {
    source: "noise",
    freq: colour,
    gain,
    at,
    attack: 0.0008,
    release: 0.006,
    filter: { type: "highpass", freq: colour, q: 0.7 },
  };
}

/**
 * Noise through one filter, which is what most of the game's texture is.
 *
 * `tick` and `air` are the two shapes of it that come up often enough to have
 * their own names and their own envelopes; everything else — a crack, a hiss,
 * a body coming apart, a wind that has to start slowly — chooses its own
 * attack and its own filter, and twenty-nine sounds were hand-building the
 * same six-line literal to say so.
 *
 * `colour` is where the layer means to sit. Noise has no pitch, so neither the
 * engine nor `band.ts` reads it — the filter is what decides both what comes
 * out and whether it crosses the voice. It is carried because `Layer` asks
 * every layer where it is, and because a bandpass at 2600 written over a
 * colour of 400 is a sound somebody should look at twice.
 */
export function noise(
  colour: number,
  filter: NonNullable<Layer["filter"]>,
  attack: number,
  release: number,
  gain: number,
  wobble?: Layer["wobble"],
): Layer {
  return {
    source: "noise",
    freq: colour,
    gain,
    attack,
    release,
    filter,
    ...(wobble && { wobble }),
  };
}

/** Neon: a bare high sine. Nothing in the game is this clean except a signal. */
export function glint(freq: number, release: number, gain = 0.16, at = 0): Layer {
  return { source: "sine", freq, gain, at, attack: 0.003, release };
}

/**
 * A bell with the harmonics knocked off centre. The swarm is not tuned to
 * anything, and the ring modulator is what says so in one node.
 */
export function chime(
  freq: number,
  release: number,
  gain = 0.18,
  ring = freq * 0.31,
  at = 0,
): Layer {
  return {
    source: "triangle",
    freq,
    gain,
    at,
    attack: 0.004,
    release,
    ring: { freq: ring, depth: 0.55 },
  };
}

/** Air moving: a band of noise sweeping. Arrivals, sweeps, anything passing. */
export function air(from: number, to: number, release: number, gain = 0.2, q = 1.4, at = 0): Layer {
  return {
    source: "noise",
    freq: from,
    gain,
    at,
    attack: Math.min(0.08, release * 0.4),
    release,
    filter: { type: "bandpass", freq: from, toFreq: to, q },
  };
}

/** Something alive: a triangle that cannot hold its pitch. */
export function spore(freq: number, release: number, gain = 0.22, cents = 30, at = 0): Layer {
  return {
    source: "triangle",
    freq,
    gain,
    at,
    attack: 0.02,
    hold: release * 0.25,
    release,
    wobble: { rate: 5.5, cents },
  };
}

/**
 * Hull and rock: a sawtooth with its top taken off, so the harmonics stay
 * under the voice where a saw's harmonics would otherwise sit.
 */
export function metal(freq: number, release: number, gain = 0.3, cutoff = 260, at = 0): Layer {
  return {
    source: "sawtooth",
    freq,
    gain,
    at,
    attack: 0.003,
    release,
    filter: { type: "lowpass", freq: cutoff * 2.2, toFreq: cutoff, q: 1.1 },
  };
}

/** The room breathing. Long, quiet, under everything — never a foreground sound. */
export function swell(freq: number, seconds: number, gain = 0.08, at = 0): Layer {
  return {
    source: "sine",
    freq,
    gain,
    at,
    attack: seconds * 0.4,
    hold: seconds * 0.1,
    release: seconds * 0.5,
    wobble: { rate: 0.3, cents: 14 },
  };
}

/** A grain said several times. Bursts, rattles, count-ins, chatter. */
export function burst(layer: Layer, times: number, every: number, decay = 0.8, detune = 0): Layer {
  return { ...layer, repeat: { times, every, decay, detune } };
}

/** Move a grain later in the sound. Stacking offsets is how a sound gets a shape. */
export function after(seconds: number, layer: Layer): Layer {
  return { ...layer, at: (layer.at ?? 0) + seconds };
}

/** Quieter, without touching anything else. */
export function soft(amount: number, layer: Layer): Layer {
  return { ...layer, gain: layer.gain * amount };
}
