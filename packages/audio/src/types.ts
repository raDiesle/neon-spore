/**
 * What a sound is made of.
 *
 * Nothing in this package is a recording. Every sound is a handful of numbers
 * that a synthesiser builds at the moment it plays, which is the whole reason
 * the catalogue can be this large: a sample pack is usually the biggest thing
 * a mobile web game ships, and all ~130 sounds here together cost less to
 * download than one second of mono WAV. See docs/spec/audio.md.
 *
 * A `Layer` is one voice. A `SoundDef` is a few of them stacked and offset —
 * which is what makes a click a click and a bell a bell.
 */

/** Oscillator shapes, plus noise. Nothing else is a source. */
export type Source = "sine" | "triangle" | "sawtooth" | "square" | "noise";

export interface Layer {
  source: Source;
  /**
   * Hz. For an oscillator it is the pitch; for noise it is ignored unless a
   * `filter` says otherwise, and the filter is what gives noise a colour.
   */
  freq: number;
  /** Where the pitch ends up. Defaults to `freq` — a flat layer. */
  toFreq?: number;
  /** Exponential reads as musical, linear as mechanical. Defaults to exp. */
  glide?: "exp" | "lin";
  /** Peak amplitude 0..1, before the sound's own `level`. */
  gain: number;
  /** Seconds after the sound starts. Stacking offsets is how a sound gets a shape. */
  at?: number;
  attack: number;
  hold?: number;
  release: number;
  filter?: {
    type: "lowpass" | "highpass" | "bandpass";
    freq: number;
    /** Sweeping the filter is cheaper than sweeping the pitch and reads as motion. */
    toFreq?: number;
    q?: number;
  };
  /**
   * Ring modulation — the layer multiplied by another oscillator. Two sidebands
   * where there was one tone, and neither of them harmonic: this is the whole
   * of the swarm's metal, and it costs one extra node.
   */
  ring?: { freq: number; depth: number };
  /** Vibrato. The organic half of the palette: nothing alive holds a pitch. */
  wobble?: { rate: number; cents: number };
  /** One layer becoming a burst. `decay` multiplies the gain each time round. */
  repeat?: { times: number; every: number; decay: number; detune?: number };
  /** -1 left .. 1 right. A play may override it with the column it happened in. */
  pan?: number;
}

/** What part of the game a sound belongs to. Fixed set — see docs/spec/audio.md. */
export type Family =
  | "beat"
  | "ship"
  | "impact"
  | "creature"
  | "pod"
  | "hull"
  | "boss"
  | "mirror"
  | "ui"
  | "ambient"
  | "assist"
  | "swarm"
  | "signal"
  | "motion"
  | "ruin"
  /** Not a sound the game makes. The music candidates' cells — see music/. */
  | "music";

/**
 * `bound` means something in the running game plays it today. `spare` means it
 * is built and tested and nothing calls it yet — the catalogue exists so that a
 * spare can be listened to and claimed rather than commissioned.
 */
export type Status = "bound" | "spare";

export interface SoundDef {
  id: string;
  family: Family;
  /** One sentence: what it sounds like. */
  blurb: string;
  status: Status;
  /** Bound: what triggers it. Spare: what it is being kept for. */
  use: string;
  /** Mix level 0..1. Every layer's gain is multiplied by this. */
  level: number;
  layers: Layer[];
  /**
   * Permission to sit in the speech band, and the reason. Talking is the
   * control scheme, so a sound that covers a voice costs the pair a sentence —
   * `band.ts` fails the build for one that does it without saying why here.
   */
  pierce?: string;
}
