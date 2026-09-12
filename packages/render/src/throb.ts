/**
 * THE THROB's far half: the side of the body the cannon is *not* looking at,
 * painted in the other ammunition colour — **where that half lies**. The
 * paint itself is `throb-pores.ts`, the look the owner adopted from VERSUS on
 * 12 September 2026; GLOBE, the paint that stood here before it, went with
 * the slot (`tools/versus/DECIDED.md`, and the history of this file).
 *
 * Drawn as a layer over an ordinary living body rather than as a body of its
 * own, the arrangement `shell-draw.ts` and `clasp.ts` already use — the
 * contour, the interior and the colour underneath are a slick's or a bulb's,
 * and this covers half of them. The body has already been turned by
 * `throbTurnMilli` when this is called, so the far half is simply *the half
 * above the seam* in the body's own space and the turn carries it round for
 * free. A second copy of the angle here is how a picture comes to promise a
 * shot the rule refuses.
 *
 * **It used to be green plating and it is not any more.** Green means one
 * thing in this game — a body up the field that a shot does nothing to — and
 * that is exactly what this half has stopped being. It is a live half with a
 * live colour, so it is drawn the way every other live body is drawn: the
 * dark fill, the glowing rim, the same interior marks, all in the colour that
 * kills it. Half a body in one ammunition colour and half in the other is a
 * legible sentence precisely because those two colours already mean *which
 * trigger* to the pair, which is the whole of what this creature asks.
 */

/**
 * Where the far colour's own boundary meridian is this instant, and which side
 * of it the far colour lies on.
 *
 * **The reading of the rule is the picture, and this function is the whole of
 * it.** The shipped picture turns the seam in the picture plane, which is a ball
 * spinning about the axis you are looking down: half the body is the other
 * colour at every instant and the cut is always a diameter. This reads the
 * same `throbTurnMilli` as a ball turning about its **vertical** axis, where
 * the two hemispheres face toward you and away from you rather than up and
 * down — so *the colour you can see is the colour that answers it*, and the
 * other one is round the back.
 *
 * That is not a liberty taken with the rule; it is what makes the picture agree
 * with it. `throbFacing` is true over `throbFaceMilli` centred on turn nought,
 * and at turn nought this puts the authored hemisphere squarely at the viewer
 * with none of the far colour on screen at all. The far colour's own boundaries
 * are therefore the meridians at longitudes π/2 and 3π/2, and **exactly one of
 * the two is on the near side at any turn** — their cosines are each other's
 * negatives — so that one is the whole of the seam a player can see.
 *
 * Its projection is `x = rx·sin(α)·cos(lat)`, `y = ry·sin(lat)`, so its
 * half-width is `rx·sin(α)`: a straight line down the middle when the boundary
 * faces you, bowed out to the limb a quarter turn later, and back. That is the
 * width cue `docs/dimensional.md` says repeats **twice** per revolution against
 * a lean's once, and a diameter rotating in the picture plane has neither.
 */
export function seamAt(turn: number, rx: number): { half: number; side: number } {
  const first = turn + Math.PI / 2;
  const nearIsFirst = Math.cos(first) > 0;
  const a = nearIsFirst ? first : first + Math.PI;
  // Increasing longitude runs toward +x wherever the surface faces us, so the
  // hemisphere above longitude π/2 lies to the right of that meridian and the
  // one below 3π/2 lies to its left.
  return { half: rx * Math.sin(a), side: nearIsFirst ? 1 : -1 };
}

/**
 * The visible part of the painted hemisphere: everything on `side` of the
 * boundary ellipse.
 *
 * **It runs well past the body on every side, and that is not slack.** The rim
 * this region clips is a `strokeGlow`, which is three passes of a colour spread
 * *outward* from the contour — a region cut to the body itself would take the
 * outer two thirds of it away and leave the painted half wearing no light at
 * all. The shipped half has the same shape for the same reason: its clip is a
 * rectangle four radii wide, not the contour.
 */
export function farRegion(half: number, side: number, rx: number, ry: number): Path2D {
  const out = 3;
  const g = new Path2D();
  // Down the meridian, out past the poles at both ends, then round the outside
  // on whichever side the painted hemisphere lies.
  g.moveTo(0, -ry * out);
  g.lineTo(0, -ry);
  // The ellipse arc from pole to pole, bulging whichever way the meridian has
  // swung. `ccw` is what puts the bulge on the left rather than the right.
  g.ellipse(0, 0, Math.abs(half), ry, 0, -Math.PI / 2, Math.PI / 2, half < 0);
  g.lineTo(0, ry * out);
  g.lineTo(side * rx * out, ry * out);
  g.lineTo(side * rx * out, -ry * out);
  g.closePath();
  return g;
}
