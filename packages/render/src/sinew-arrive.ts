import type { SimConfig, SinewState } from "@neon-spore/sim";

/**
 * **THE SINEW dropping in, and its rubber after**, as offsets in tiles off
 * where the tendon hangs — the owner's ask of 2 October 2026: *it should
 * introduce itself first by bouncing in from the top, and bounce up and down
 * at its bottom like a rubber band.*
 *
 * Read off the beat, the phase and the beat the tendon was installed on
 * (`settleBeat`), and nothing else, because `sinew-shape.ts` adds these into
 * the mass's centre and that centre is where the handles are answered as well
 * as drawn: a body bouncing on the wall clock would be a handle bouncing away
 * from its own hit test. The simulation pins every pull to nought while the
 * tendon drops in (`sinewEntering`), so the ring arriving is never a ring a
 * thumb has to chase for a number.
 *
 * Two motions. **The crown** — the body the tendon hangs from — slides in
 * from above the glass over the first part of the entrance and overshoots a
 * little, the way a weight set down does. **The mass** falls from further up
 * on a stretched tendon and rings on it: a damped spring, far below its rest
 * on the first swing and a little less on each. Once it has settled it keeps
 * a small bounce on every beat, the tendon still elastic.
 */

/** How far above its rest the crown starts, in tiles, and the share of the entrance it takes. */
const CROWN_FROM = 6;
const CROWN_SHARE = 0.45;
/** The mass: how far above its rest it starts, in tiles, how fast the ringing dies, and how fast it rings, per beat. */
const MASS_FROM = 8;
const MASS_DAMP = 1.4;
const MASS_RING = 3.2;
/** The bounce kept after: its height in tiles, how fast it dies inside a beat, and its swings per beat. */
const BOB = 0.14;
const BOB_DAMP = 3;
const BOB_RING = 1.2;

/** Beats since the tendon was installed, with the phase: the entrance's clock. */
function since(s: SinewState, beat: number, beatPhase: number): number {
  return beat - s.settleBeat + Math.max(0, Math.min(1, beatPhase));
}

/** Whether the tendon is still dropping in, on the picture's clock. */
export function sinewArriving(
  s: SinewState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): boolean {
  const u = since(s, beat, beatPhase);
  return u >= 0 && u < cfg.sinewEnterBeats;
}

/** Ease out with a little overshoot: a weight set down. */
function settle(k: number): number {
  const c = 1.4;
  const t = k - 1;
  return 1 + (c + 1) * t * t * t + c * t * t;
}

/** How far above its rest the crown is now, in tiles: negative is up. */
export function sinewCrownDrop(
  s: SinewState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (!sinewArriving(s, cfg, beat, beatPhase)) return 0;
  const k = Math.min(1, since(s, beat, beatPhase) / (cfg.sinewEnterBeats * CROWN_SHARE));
  return -CROWN_FROM * (1 - settle(k));
}

/**
 * How far off its rest the mass is while it arrives, in tiles: the ringing on
 * a stretched tendon. Nought once it hangs, and the strain band rides this
 * and not the bounce after (`sinew-band.ts`), so the gauge rings in with the
 * tendon and then holds still to be read.
 */
export function sinewMassRing(
  s: SinewState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.fallBeat >= 0 || s.outBeat >= 0) return 0;
  if (!sinewArriving(s, cfg, beat, beatPhase)) return 0;
  const u = since(s, beat, beatPhase);
  return -MASS_FROM * Math.exp(-MASS_DAMP * u) * Math.cos(MASS_RING * u);
}

/**
 * The small bounce the mass keeps on every beat once it hangs, in tiles:
 * down and back up inside the beat, the tendon still elastic. Nothing while
 * it arrives, falls or lies.
 */
export function sinewMassBob(
  s: SinewState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.fallBeat >= 0 || s.outBeat >= 0) return 0;
  if (sinewArriving(s, cfg, beat, beatPhase)) return 0;
  const p = Math.max(0, Math.min(1, beatPhase));
  return BOB * Math.exp(-BOB_DAMP * p) * Math.sin(Math.PI * 2 * BOB_RING * p);
}
