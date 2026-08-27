/**
 * The half with the `AudioContext` in it.
 *
 * It knows nothing about the game and nothing about what a sound means: it
 * takes a `Plan` from `plan.ts` and builds nodes. Everything that could be
 * judged wrong was decided before it got here, which is why this file has no
 * test of its own and the catalogue has several.
 */

import { type Plan, type PlayOptions, planSound } from "./plan.js";
import type { SoundDef } from "./types.js";

/** Mobile audio dies under node churn long before it runs out of CPU. */
const MAX_LIVE_VOICES = 64;

export interface EngineOptions {
  /** 0..1, the whole game. */
  volume?: number;
}

export class Engine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private live = 0;
  private muted = false;
  private volume: number;

  constructor(opts: EngineOptions = {}) {
    this.volume = opts.volume ?? 0.7;
  }

  /**
   * A browser will not start audio before a finger has landed. Call this from
   * the first touch — before that every `play` is silently dropped, which is
   * the correct behaviour and not a bug to work around.
   */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor({ latencyHint: "interactive" });
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : this.volume;
    // One limiter for the whole game. Twenty creatures dying on one beat is a
    // wave doing its job, and it must not also be the loudest thing all run.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.18;
    master.connect(limiter).connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.noise = makeNoise(ctx);
  }

  get running(): boolean {
    return this.ctx?.state === "running";
  }

  setVolume(v: number): void {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.master && !this.muted) this.master.gain.value = this.volume;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : this.volume;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Seconds, for a caller that wants to schedule ahead of the frame. */
  get now(): number {
    return this.ctx?.currentTime ?? 0;
  }

  play(def: SoundDef, opts: PlayOptions = {}, when = 0): void {
    if (!this.ctx || !this.master || this.muted) return;
    this.playPlan(planSound(def, opts), when);
  }

  playPlan(plan: Plan, when = 0): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;
    const t0 = Math.max(ctx.currentTime, when || ctx.currentTime) + 0.002;
    for (const v of plan.voices) {
      if (this.live >= MAX_LIVE_VOICES) return;
      const start = t0 + v.start;
      const end = start + v.attack + v.hold + v.release;

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, start);
      amp.gain.linearRampToValueAtTime(v.gain, start + v.attack);
      amp.gain.setValueAtTime(v.gain, start + v.attack + v.hold);
      amp.gain.exponentialRampToValueAtTime(0.0001, end);

      let tail: AudioNode = amp;
      if (v.pan !== 0 && ctx.createStereoPanner) {
        const pan = ctx.createStereoPanner();
        pan.pan.value = Math.min(1, Math.max(-1, v.pan));
        amp.connect(pan);
        tail = pan;
      }
      tail.connect(master);

      let head: AudioNode = amp;
      if (v.filter) {
        const f = ctx.createBiquadFilter();
        f.type = v.filter.type;
        f.Q.value = v.filter.q;
        f.frequency.setValueAtTime(v.filter.freq, start);
        if (v.filter.toFreq !== v.filter.freq) {
          f.frequency.exponentialRampToValueAtTime(v.filter.toFreq, end);
        }
        f.connect(amp);
        head = f;
      }
      if (v.ring) {
        // source * modulator: the ring's gain rides on an oscillator, so what
        // comes out is two sidebands and no fundamental. The swarm's metal.
        const ring = ctx.createGain();
        ring.gain.value = 1 - v.ring.depth;
        const mod = ctx.createOscillator();
        mod.type = "sine";
        mod.frequency.value = v.ring.freq;
        const depth = ctx.createGain();
        depth.gain.value = v.ring.depth;
        mod.connect(depth).connect(ring.gain);
        mod.start(start);
        mod.stop(end);
        ring.connect(head);
        head = ring;
      }

      const source = this.source(ctx, v, start, end);
      source.node.connect(head);
      if (v.wobble && "detune" in source.node) {
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = v.wobble.rate;
        const depth = ctx.createGain();
        depth.gain.value = v.wobble.cents;
        lfo.connect(depth).connect((source.node as OscillatorNode).detune);
        lfo.start(start);
        lfo.stop(end);
      }
      source.start(start);
      source.stop(end);
      this.live++;
      source.node.onended = () => {
        this.live--;
      };
    }
  }

  private source(
    ctx: AudioContext,
    v: Plan["voices"][number],
    start: number,
    end: number,
  ): { node: AudioScheduledSourceNode; start: (t: number) => void; stop: (t: number) => void } {
    if (v.source === "noise") {
      const node = ctx.createBufferSource();
      node.buffer = this.noise;
      node.loop = true;
      return { node, start: (t) => node.start(t), stop: (t) => node.stop(t) };
    }
    const node = ctx.createOscillator();
    node.type = v.source;
    node.frequency.setValueAtTime(v.freq, start);
    if (v.toFreq !== v.freq) {
      if (v.glide === "lin") node.frequency.linearRampToValueAtTime(v.toFreq, end);
      else node.frequency.exponentialRampToValueAtTime(v.toFreq, end);
    }
    return { node, start: (t) => node.start(t), stop: (t) => node.stop(t) };
  }

  dispose(): void {
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }
}

/** Two seconds of white noise, made once and looped by every noise layer. */
function makeNoise(ctx: AudioContext): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}
