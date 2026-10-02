import type { GripVerdict } from "./grip-verdict.js";

/**
 * **Where each boss's marks were drawn this frame, on the screen**, for the
 * one reader that has to find a mark again away from the boss that drew it:
 * the ring round a held mark (`thumb-aura.ts`). The owner, 2 October 2026:
 * *it should slowly grow exactly green circle where center is the red
 * circle* — so the ring is centred on the mark, and only the mark's own
 * drawer knows where that is this frame.
 *
 * Every boss draws its marks through a handful of shared pieces — the halo
 * on this seat's (`drawMarkHalo`), the turning ring on the partner's
 * (`drawMarkTheirs`), a pull's knob (`drawPullKnob`), a grip's ring
 * (`drawGripRing`) — and judges them through one (`drawVerdictRing`). Each
 * of those notes its circle here, in whatever frame its drawer stood in, so
 * the spot is kept in the canvas's own pixels and the reader turns it back.
 * A canvas nobody is watching keeps nothing: `watchMarks` starts the list
 * and `marksDrawn` takes it.
 */
export interface MarkSpot {
  /** Centre and radius in the canvas's own pixels. */
  x: number;
  y: number;
  r: number;
  /** The verdict thrown off the mark, when the spot is one — the same object
   * for as long as it is on screen. */
  v?: GripVerdict;
}

/** A canvas transform, as `getTransform` hands it back. */
type Matrix = Pick<DOMMatrix, "a" | "b" | "c" | "d" | "e" | "f">;

const watched = new WeakMap<CanvasRenderingContext2D, MarkSpot[]>();

/** Begin keeping this frame's mark spots on `ctx`. */
export function watchMarks(ctx: CanvasRenderingContext2D): void {
  watched.set(ctx, []);
}

/** The spots kept since `watchMarks`, and the watch over. */
export function marksDrawn(ctx: CanvasRenderingContext2D): readonly MarkSpot[] {
  const spots = watched.get(ctx) ?? [];
  watched.delete(ctx);
  return spots;
}

/** A mark of radius `r` drawn at `x, y` in the current frame of `ctx`. */
export function noteMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  v?: GripVerdict,
): void {
  const spots = watched.get(ctx);
  if (spots === undefined) return;
  const m = ctx.getTransform();
  const scale = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
  const at = { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f, r: r * scale };
  spots.push(v === undefined ? at : { ...at, v });
}

/** The spots, out of the canvas's pixels and back into the stage's frame. */
export function marksOnStage(spots: readonly MarkSpot[], m: Matrix): MarkSpot[] {
  const det = m.a * m.d - m.b * m.c;
  if (det === 0) return [];
  const scale = Math.sqrt(Math.abs(det));
  return spots.map((s) => {
    const dx = s.x - m.e;
    const dy = s.y - m.f;
    const at = { x: (m.d * dx - m.c * dy) / det, y: (m.a * dy - m.b * dx) / det, r: s.r / scale };
    return s.v === undefined ? at : { ...at, v: s.v };
  });
}

/** The spot nearest `p` that `keep` keeps, within its own `reach`; of two as
 * near, the wider — a halo and the knob drawn on it are one mark. */
export function nearestMark(
  spots: readonly MarkSpot[],
  p: { x: number; y: number },
  reach: (s: MarkSpot) => number,
  keep: (s: MarkSpot) => boolean,
): MarkSpot | null {
  let best: MarkSpot | null = null;
  let bestD = Infinity;
  for (const s of spots) {
    if (!keep(s)) continue;
    const d = Math.hypot(s.x - p.x, s.y - p.y);
    if (d > reach(s)) continue;
    if (d < bestD - 1 || (Math.abs(d - bestD) <= 1 && best !== null && s.r > best.r)) {
      best = s;
      bestD = Math.min(d, bestD);
    }
  }
  return best;
}
