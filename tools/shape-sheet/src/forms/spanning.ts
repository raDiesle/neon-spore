import { catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * The two forms that are not bodies: something that spans the field, and
 * something that is losing itself.
 *
 * Both are converted off `docs/tower-defence.md`, and both are here rather
 * than in `radial.ts` or `hanging.ts` because neither is sampled one radius per
 * angle and neither is alive. A barrier over the hull and a shell coming off a
 * body are *objects*, and the sheet has had nothing of the kind since `arm`.
 */

/**
 * A barrier drawn as a chain of straight facets rather than as a curve.
 *
 * Galaxy Defense's dome, which is the one thing on that page the ask named by
 * hand. What makes it worth converting is not that it is a shield — we have a
 * shield — but **how it says how much of itself is left**: it is faceted, so a
 * missing facet is a hole you can point at, where a glow can only get dimmer.
 * A pair who can say *the third one from the left is gone* have a sentence
 * that a brightness cannot give them.
 *
 * So `gone` is the parameter this exists for, and the card is judged on
 * whether a gap in an arc reads at all at the width the hull actually gets.
 * The arc is open — a barrier has no inside — which also means it must never
 * be filled: SVG would close it straight across the ends and draw a lens.
 *
 * Straight segments rather than a smoothed path on purpose. Smoothing a facet
 * chain turns it back into the curve this form exists not to be.
 */
export interface SpanOpts {
  /** Half-width. Seven columns of an eleven-column field, at 390 px, is 124. */
  rx: number;
  /** How far the middle of the arc stands above its ends. */
  rise: number;
  /** How many straight facets the arc is made of. */
  facets: number;
  /** Facets missing from the middle outward, as if spent. */
  gone?: number;
}

/**
 * A chain of straight segments, left open. `linePath` closes with a `Z`, which
 * on an arc draws the chord back across it and turns a barrier into a lens.
 */
function openLinePath(pts: Point[]): string {
  if (pts.length === 0) return "";
  const head = pts[0] as Point;
  let d = `M ${head.x.toFixed(2)} ${head.y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i] as Point;
    d += ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }
  return d;
}

export function spanned(name: string, note: string, o: SpanOpts): Subject {
  const gone = o.gone ?? 0;

  /**
   * The arc as separate runs, with the spent facets simply absent.
   *
   * The first cut dropped those points out of one path, which is the mistake
   * this comment exists to stop being made again: an open path with a point
   * missing does not have a gap in it, it has a longer straight segment, and
   * the frame showed a barrier that looked whole. A hole in something open has
   * to be a break between two subpaths — `contourAt` already draws a subject as
   * several loops when it offers them, for the cluster that comes apart, and
   * this is the same need arriving from the other direction.
   */
  const runs = (t: number): Point[][] => {
    // A shallow settle, so the barrier reads as held rather than painted on.
    // Nothing travels: it is over the hull and the hull does not move.
    const settle = 1 + Math.sin(t * 0.55) * 0.03;
    const out: Point[][] = [];
    let run: Point[] = [];
    for (let i = 0; i <= o.facets; i++) {
      // The spent facets are taken from the middle out, because that is where
      // a barrier is hit first and because a gap at one end reads as a barrier
      // that was drawn short.
      const fromMiddle = Math.abs(i - o.facets / 2);
      if (gone > 0 && fromMiddle < gone / 2) {
        if (run.length > 1) out.push(run);
        run = [];
        continue;
      }
      const a = Math.PI * (1 - i / o.facets);
      run.push({ x: Math.cos(a) * o.rx, y: -Math.sin(a) * o.rise * settle });
    }
    if (run.length > 1) out.push(run);
    return out;
  };

  return {
    name,
    note,
    open: true,
    pointsAt: (t) => runs(t).flat(),
    loopsAt: runs,
    path: openLinePath,
  };
}

/**
 * A body under a shell that comes off in pieces, and the body under it shrinks.
 *
 * The Bloons ceramic, whose shell cracks visibly as it takes damage so the
 * player reads how much is left off the body rather than off a bar. `RIND` on
 * the tower-defence page argues that we can do better than crack — shrink —
 * and this is that argument drawn: the contour steps down through `layers`
 * sizes over its cycle, and the rim goes from broken to smooth as it does,
 * because a body that has lost its armour should not still look armoured.
 *
 * The steps are **discrete and the transitions are not**. A size that eases
 * continuously is a body breathing, which every other card here already does
 * and which says nothing about damage; a size that jumps is an event, and the
 * pair needs to see an event to say "again". So the shrink snaps and only the
 * roughness fades.
 */
export interface ShedOpts {
  r: number;
  /** How many sizes it steps down through, largest first. */
  layers: number;
  /** How much of the radius is lost at each step, as a fraction. */
  step: number;
  /** Beats one layer lasts. */
  dwell: number;
  /** Notches round the rim while the shell is whole. */
  teeth: number;
}

const N = 128;

export function shed(name: string, note: string, o: ShedOpts): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const cycle = o.dwell * o.layers;
      const at = Math.floor((((t % cycle) + cycle) % cycle) / o.dwell);
      const size = 1 - o.step * at;
      // Whole at the first layer, bare at the last. Linear on purpose: the
      // roughness is a readout, and a readout that eases is one a player has
      // to interpret rather than count.
      const armour = o.layers > 1 ? 1 - at / (o.layers - 1) : 0;
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        // Sharpened, so a notch reads as broken edge rather than as lobing —
        // the same treatment `glyphed` gives a rim that carries a code.
        const notch = Math.tanh(Math.sin(o.teeth * a + 1.7) * 2.4);
        const breath = 1 + 0.02 * Math.sin(t * 0.7);
        const m = size * breath * (1 + 0.1 * armour * notch);
        pts.push({ x: Math.cos(a) * o.r * m, y: Math.sin(a) * o.r * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}
