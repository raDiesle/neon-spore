/**
 * A piece of music, written the way a sound is: numbers, not a recording.
 *
 * `docs/spec/systems.md` 5.3 rules out a soundtrack, and the reason is the
 * voice channel rather than taste — so nothing here is bound to anything. A
 * theme is a **candidate**: something to press play on in the director's MUSIC
 * tab and then keep or throw away, which is cheaper than arguing about music
 * that nobody has heard.
 *
 * What keeps a candidate honest is the same rule the catalogue lives under.
 * Music is the one thing that could quietly undo `band.ts` — a sound is over
 * in half a second and a piece runs for half a minute, so a body sitting in
 * 300–3000 Hz covers every sentence the pair says rather than one. So a theme
 * is built out of the same grains, carved around the voice, and
 * `themeBandSeconds` measures what it costs *per minute* instead of per play.
 *
 * A theme is a list of notes on a beat grid, and a note is one catalogue-shaped
 * cell at a pitch. Nothing loops inside the engine; `player.ts` schedules the
 * next second or so of it and no more, which is also what keeps a thirty-second
 * piece under the engine's 64-voice ceiling.
 */

import { voiceBandSeconds } from "../band.js";
import { type Plan, planSound } from "../plan.js";
import type { SoundDef } from "../types.js";

/** One cell, at one moment, at one pitch. */
export interface Note {
  /** Beats from the start of the piece. Not seconds — the tempo is the theme's. */
  at: number;
  cell: SoundDef;
  /** Multiplies every frequency in the cell, filters and ring included. */
  pitch?: number;
  gain?: number;
  pan?: number;
}

export interface Theme {
  id: string;
  /** What it is called when you are choosing between six of them. */
  title: string;
  /** One sentence: what it sounds like. */
  blurb: string;
  /** Where in the game it would sit, and what it is there to do. */
  use: string;
  bpm: number;
  /** The length of the piece in beats — and the point it loops back to. */
  beats: number;
  notes: Note[];
}

export interface TimedPlan {
  /** Seconds from the start of the piece. */
  start: number;
  plan: Plan;
}

export interface ThemePlan {
  id: string;
  /** Seconds to the last tail — a little past the loop point, usually. */
  duration: number;
  /** Seconds one time round. What the player adds when it comes back to the top. */
  loopSeconds: number;
  voices: number;
  plans: TimedPlan[];
}

const secondsPerBeat = (bpm: number): number => 60 / bpm;

export interface ThemeOptions {
  /** Multiplies every note's gain — the piece's own level, under the engine's. */
  gain?: number;
}

/** A theme flattened to absolute seconds. No `AudioContext` has been touched. */
export function planTheme(theme: Theme, opts: ThemeOptions = {}): ThemePlan {
  const spb = secondsPerBeat(theme.bpm);
  const level = opts.gain ?? 1;
  const plans = theme.notes
    .map((n) => ({
      start: n.at * spb,
      plan: planSound(n.cell, { pitch: n.pitch, gain: (n.gain ?? 1) * level, pan: n.pan }),
    }))
    .sort((a, b) => a.start - b.start);
  return {
    id: theme.id,
    duration: plans.reduce((max, p) => Math.max(max, p.start + p.plan.duration), 0),
    loopSeconds: theme.beats * spb,
    voices: plans.reduce((n, p) => n + p.plan.voices.length, 0),
    plans,
  };
}

/**
 * What a minute of this costs the conversation.
 *
 * Per minute rather than per play, because that is the comparison being made:
 * a sound is judged against the one sentence it might cover, a piece against
 * every sentence said while it runs. `band.ts` has the budget for one sound at
 * 0.16 s; a theme spending four seconds a minute is covering a voice about
 * seven per cent of the time it is playing.
 */
export function themeBandSeconds(plan: ThemePlan): number {
  const total = plan.plans.reduce((sum, p) => sum + voiceBandSeconds(p.plan), 0);
  const minutes = Math.max(plan.duration, plan.loopSeconds) / 60;
  return minutes > 0 ? total / minutes : total;
}

export interface Shape {
  pitch?: number;
  gain?: number;
  pan?: number;
}

/** A semitone count as a frequency multiplier. Twelve of them is an octave. */
export const step = (semitones: number): number => 2 ** (semitones / 12);

const note = (cell: SoundDef, at: number, degree: number, shape: Shape): Note => ({
  at,
  cell,
  pitch: step(degree) * (shape.pitch ?? 1),
  gain: shape.gain,
  pan: shape.pan,
});

/** The same cell on a beat grid — a pulse, a click track, a heartbeat. */
export function pulse(
  cell: SoundDef,
  from: number,
  every: number,
  times: number,
  shape: Shape = {},
): Note[] {
  return Array.from({ length: times }, (_, i) => note(cell, from + i * every, 0, shape));
}

/**
 * A phrase: semitones over a beat grid, `null` for a rest. The rests are the
 * point — a line with no holes in it is a drone, and a drone under a
 * conversation is the thing this whole package is arranged to avoid.
 */
export function line(
  cell: SoundDef,
  from: number,
  every: number,
  degrees: readonly (number | null)[],
  shape: Shape = {},
): Note[] {
  const out: Note[] = [];
  degrees.forEach((d, i) => {
    if (d !== null) out.push(note(cell, from + i * every, d, shape));
  });
  return out;
}

/** A phrase said again, `every` beats apart. */
export function again(notes: readonly Note[], times: number, every: number): Note[] {
  const out: Note[] = [];
  for (let i = 0; i < times; i++) for (const n of notes) out.push({ ...n, at: n.at + i * every });
  return out;
}
