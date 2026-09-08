import { beats, type Facet, facet, type OwnMotion, pin } from "@neon-spore/content";

/**
 * THE NUMBERS FOR MOTION, THE WAY `report.ts` IS THE NUMBERS FOR SHAPE.
 *
 * A session writing an animation cannot watch it. `shapes:report` already
 * spares it a picture for everything static — extents, lobes, where a contour
 * sits in its box — and there was no equivalent for anything that moves, so
 * every question about *timing* went to a render or to a guess.
 *
 * `docs/style-guide.md` names three cues that decide whether a thing reads as
 * depth or as a coin, and all three are arithmetic:
 *
 * - **Two periods.** A body turning about an axis it does not stand on repeats
 *   its width twice per revolution and its sideways swing once. A squash has
 *   one period and no travel, so it cannot produce this however hard it tries.
 * - **An asymmetric cycle.** Foreshortening is a cosine of angle *plus lens*,
 *   so going away and coming toward are not mirror images. A lean is symmetric
 *   by construction and says nothing.
 * - **Spread.** How differently the fastest and slowest marks on one body are
 *   drawn to move. `docs/dimensional.md` measured **22.9 : 1** for a real
 *   projection and **1.10 : 1** for an affine pose, and that gap is the whole
 *   reason `packages/content/src/surface.ts` exists.
 *
 * Nothing here renders and nothing here is a picture. It is the cheap half of
 * `.claude/skills/svg-look`'s loop, extended to things that move.
 */

/** Where a mark sits on a body at rest, in body units about its own centre. */
export interface Mark {
  readonly x: number;
  readonly y: number;
}

/** How a mark is drawn at time `t`. `null` is a mark round the back. */
export type Drawn = (m: Mark, t: number) => Mark | null;

/** The eight marks the style guide's own depth panel uses, on a unit circle. */
export const RING: Mark[] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return { x: Math.cos(a), y: Math.sin(a) };
});

/** A motion's affine, applied to a mark the way a renderer applies it: scale
 * about the body's centre, then rotate, then translate. */
export function posedBy(motion: OwnMotion): Drawn {
  return (m, t) => {
    const p = motion.poseAt(beats(t));
    const c = Math.cos(p.rot);
    const s = Math.sin(p.rot);
    const x = m.x * p.sx;
    const y = m.y * p.sy;
    return { x: x * c - y * s + p.dx, y: x * s + y * c + p.dy };
  };
}

/**
 * The same marks placed on a surface instead: each ring position read as a
 * longitude, with a latitude spread across them, carried round by `turns`. The
 * reference every posed row is measured against, and the only row in the table
 * that is not a motion.
 */
export function placedAt(turns: (t: number) => number): Drawn {
  return (m, t) => {
    const lon = Math.atan2(m.y, m.x);
    const f: Facet = facet(pin(lon, 0.35 * Math.sin(3 * lon), 1), turns(t));
    return f.near ? { x: f.x, y: f.y } : null;
  };
}

/**
 * How much of a body is taken out of view and brought back over one cycle,
 * 0 to 1 — and the one cue in this file that an affine transform cannot fake
 * at any setting of any number.
 *
 * Everything else here is a difference of degree. A rotating ring of marks
 * crowds toward its own edges exactly as a turning surface does, because
 * projecting a circle onto one axis *is* the cosine; a body under a lens and a
 * body being squashed differ only in how their curves are shaped. Occlusion is
 * different in kind: a card is one contour and a pose scales the picture about
 * one centre, so no affine has ever hidden a part of the thing it transformed.
 *
 * A reveal is therefore the whole of `docs/style-guide.md`'s ask — *a flying
 * body should turn just enough that what was behind it comes into view* — as
 * one number that is 0 for every pose and non-zero only for a placement.
 */
export function reveal(draw: Drawn, period: number, steps = 72): number {
  let hidden = 0;
  for (const m of RING) {
    for (let i = 0; i < steps; i++) {
      if (!draw(m, (i / steps) * period)) {
        hidden++;
        break;
      }
    }
  }
  return hidden / RING.length;
}

/**
 * How many times a series completes a cycle over the window sampled — counted
 * as upward crossings of its own middle, with a tenth of its swing of
 * hysteresis either side.
 *
 * Crossings rather than peaks, and that is not a detail: a peak is a local
 * comparison, and a sine sampled finely enough has neighbours a thousandth
 * apart at its own top, so peak-finding reported *no* period for a pure sine
 * at 240 samples. A crossing is a global comparison and does not care how
 * finely the curve is walked. The hysteresis is what keeps a hold at the
 * middle of a cycle from reading as a run of periods.
 */
export function turnsOf(series: readonly number[]): number {
  const n = series.length;
  const hi = Math.max(...series);
  const lo = Math.min(...series);
  const span = hi - lo;
  // A channel that never moves has no period rather than an infinite one.
  if (span < 1e-6) return 0;
  const mid = (hi + lo) / 2;
  const band = span * 0.1;
  let high = (series[n - 1] as number) > mid;
  let turns = 0;
  for (let i = 0; i < n; i++) {
    const v = series[i] as number;
    if (!high && v > mid + band) {
      high = true;
      turns++;
    } else if (high && v < mid - band) {
      high = false;
    }
  }
  return turns;
}

/**
 * How far a cycle is from being a mirror of itself, 0 to 1. A series is
 * compared against its own time-reverse about its maximum: a lean, a sine or
 * anything built out of one symmetric curve comes back at ~0, and anything
 * foreshortened by a lens does not.
 */
export function asymmetry(series: readonly number[]): number {
  const n = series.length;
  const span = Math.max(...series) - Math.min(...series);
  if (span < 1e-6) return 0;
  let at = 0;
  for (let i = 1; i < n; i++) if ((series[i] as number) > (series[at] as number)) at = i;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const ahead = series[(at + i) % n] as number;
    const behind = series[(at - i + n * 2) % n] as number;
    sum += Math.abs(ahead - behind);
  }
  return sum / (n * span);
}

/** One motion, sampled. */
export interface Cues {
  readonly name: string;
  /** Drawn aspect `sx/sy`, lowest and highest across the cycle, and the factor
   * between them — the axis `tools/shape-sheet`'s nameability gate measures. */
  readonly aspectLo: number;
  readonly aspectHi: number;
  /** Periods per cycle on width and on sideways travel. Two against one is a
   * body turning about an axis it does not stand on; anything else is not. */
  readonly widthTurns: number;
  readonly swayTurns: number;
  /** How far the width cycle is from mirroring itself. */
  readonly asymmetry: number;
  /** How much of the body goes behind over a cycle. 0 for every pose there
   * can ever be, and the only cue here that is a difference in kind. */
  readonly reveal: number;
}

export function cuesOf(motion: OwnMotion, period: number, steps = 144): Cues {
  const width: number[] = [];
  const sway: number[] = [];
  const aspect: number[] = [];
  for (let i = 0; i < steps; i++) {
    const p = motion.poseAt(beats((i / steps) * period));
    width.push(p.sx);
    sway.push(p.dx);
    aspect.push(p.sx / p.sy);
  }
  return {
    name: motion.name,
    aspectLo: Math.min(...aspect),
    aspectHi: Math.max(...aspect),
    widthTurns: turnsOf(width),
    swayTurns: turnsOf(sway),
    asymmetry: asymmetry(width),
    reveal: reveal(posedBy(motion), period, steps),
  };
}
