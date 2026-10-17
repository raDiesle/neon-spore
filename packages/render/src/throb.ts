import { type SimConfig, THROB_TURN_MILLI, throbFaceEdgeMilli } from "@neon-spore/sim";

/**
 * THE THROB's two halves: one colour on each side of the body, fixed to it and
 * carried round by the turn. The paint is `throb-halves.ts`, the look the owner
 * asked for by name on 17 October 2026 — *make it rotating so players can
 * clearly see the colour rotating and when to shoot; colours on each half side
 * should stay*. PORES, the paint before it, kept the middle grey and shared the
 * two colours out round the rim, and no one could see the turn in that.
 *
 * Drawn as a layer over an ordinary living body rather than as a body of its
 * own, the arrangement `shell-draw.ts` and `clasp.ts` already use. The body
 * has already been turned by `throbTurnMilli` when this is called, so each
 * half is a wedge in the body's own space and the turn carries it round for
 * free. A second copy of the angle here is how a picture comes to promise a
 * shot the rule refuses.
 */

/**
 * How far either side of straight down the authored half reaches, in radians
 * of the body's own space. Read off `throbFaceEdgeMilli`, so the half the
 * cannon can see is exactly the half `throbFacing` says answers: the bottom of
 * the body lies in the authored wedge while the turn is within the edge, and
 * in the other one for the rest. A quarter turn at the shipped face, which is
 * a body cut in two down the middle.
 */
export function ownArc(cfg: SimConfig): number {
  const edge = Math.max(0, Math.min(THROB_TURN_MILLI / 2, throbFaceEdgeMilli(cfg)));
  return (edge / THROB_TURN_MILLI) * Math.PI * 2;
}

/**
 * One half as a wedge from the centre: the authored colour's centred on
 * straight down (+y at turn nought), the other colour's the rest of the way
 * round. It runs to three radii because the rim is a `strokeGlow`, spread
 * *outward* from the contour, and a region cut to the body would take most of
 * the light away.
 */
export function halfWedge(own: boolean, arc: number, r: number): Path2D {
  const g = new Path2D();
  const down = Math.PI / 2;
  g.moveTo(0, 0);
  if (own) g.arc(0, 0, r * 3, down - arc, down + arc);
  else g.arc(0, 0, r * 3, down + arc, down - arc + Math.PI * 2);
  g.closePath();
  return g;
}
