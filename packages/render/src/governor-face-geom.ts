import { TRACK_IN, TRACK_OUT } from "./governor-shape.js";

/**
 * **Where THE GOVERNOR's baked face puts things**, in reaches of the radius
 * from straight above, and the small marks more than one of its layers
 * paints: the iris's seams, a glyph, a rivet (`governor-face-baked.ts`).
 */

export const BLADES = 7;
/** The iris's seams run from the bezel out to the track, curling this far round, in laps. */
export const CURL = 0.11;
export const BEZEL = 0.22;
export const GLYPH_IN = 0.34;
export const GLYPH_OUT = 0.42;
export const RIM_IN = TRACK_OUT + 0.02;
export const RIM_PLATES = 28;

export const TAU = Math.PI * 2;

export function at(k: number, lap: number): [number, number] {
  const a = lap * TAU;
  return [k * Math.sin(a), -k * Math.cos(a)];
}

/** Paints in reaches: the origin at the dial's middle, 1 its rim. */
export function unit(g: CanvasRenderingContext2D, w: number, h: number): number {
  const r = Math.min(w, h) / 2 - 1;
  g.translate(w / 2, h / 2);
  g.scale(r, r);
  return 1 / r;
}

export function ring(g: CanvasRenderingContext2D, k: number): void {
  g.beginPath();
  g.arc(0, 0, k, 0, TAU);
}

export const SEAM_STEPS = 14;

/** A point `f` of the way out along blade `i`'s leading seam, `lag` laps behind it. */
export function seamAt(i: number, f: number, lag: number, short = 0): [number, number] {
  return at(BEZEL + (TRACK_IN - BEZEL - short) * f, i / BLADES + lag + CURL * f * f);
}

/** Starts a path along blade `i`'s seam, from the bezel out to the track. */
export function seam(g: CanvasRenderingContext2D, i: number, lag: number): void {
  g.beginPath();
  g.moveTo(...seamAt(i, 0, lag));
  for (let j = 1; j <= SEAM_STEPS; j++) g.lineTo(...seamAt(i, j / SEAM_STEPS, lag));
}

export function glyph(g: CanvasRenderingContext2D, rnd: () => number, lap: number): void {
  const mid = (GLYPH_IN + GLYPH_OUT) / 2;
  const span = (GLYPH_OUT - GLYPH_IN) / 2;
  const [cx, cy] = at(mid, lap);
  g.save();
  g.translate(cx, cy);
  g.rotate(lap * TAU);
  g.beginPath();
  const kind = Math.floor(rnd() * 4);
  if (kind === 0) {
    g.moveTo(0, -span);
    g.lineTo(0, span);
    g.moveTo(-span * 0.5, -span * 0.2);
    g.lineTo(span * 0.5, -span * 0.2);
  } else if (kind === 1) {
    g.arc(0, 0, span * 0.6, Math.PI * 0.2, Math.PI * 1.6);
  } else if (kind === 2) {
    g.moveTo(-span * 0.5, span);
    g.lineTo(0, -span);
    g.lineTo(span * 0.5, span);
  } else {
    g.moveTo(-span * 0.4, -span);
    g.lineTo(span * 0.4, -span * 0.1);
    g.lineTo(-span * 0.4, span * 0.4);
    g.moveTo(span * 0.3, span * 0.9);
    g.arc(0, span * 0.9, span * 0.3, 0, TAU);
  }
  g.stroke();
  g.restore();
}

/** A rivet: a dark socket, a lit cap off-centre toward the key. */
export function rivet(g: CanvasRenderingContext2D, [x, y]: [number, number], r: number): void {
  g.beginPath();
  g.arc(x + r * 0.3, y + r * 0.3, r * 1.3, 0, TAU);
  g.fillStyle = "rgba(0,0,0,0.75)";
  g.fill();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fill();
}

/** A lap's thousandths as the canvas's own angle, clockwise from three o'clock. */
export function angleOf(lap: number): number {
  return lap * TAU - Math.PI / 2;
}
