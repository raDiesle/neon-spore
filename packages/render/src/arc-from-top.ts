/**
 * **A share of a circle, from twelve o'clock round clockwise**: the arc every
 * countdown ring, filling ring and dial is drawn as — a step's window closing
 * round its core, a ready circle filling, a pull's progress round its knob.
 *
 * Added to `path`, a `Path2D` or the context's own path, so a caller strokes
 * it however its own ring is stroked; the strokes are looks, and differ. Its
 * own file since 2 October 2026, when the arc was typed out in nineteen
 * places across eighteen files.
 */
export function arcFromTop(path: CanvasPath, x: number, y: number, r: number, share: number): void {
  path.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * share);
}
