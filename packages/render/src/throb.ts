import {
  type SimConfig,
  THROB_TURN_MILLI,
  throbFaceEdgeMilli,
  throbTurnMilli,
} from "@neon-spore/sim";

/**
 * THE THROB's two halves: the side of the body the cannon is *not* looking
 * at, which answers the other ammunition colour — **where that half lies**.
 * The paint is `throb-pores.ts`, the look the owner adopted from VERSUS on
 * 12 September 2026 and changed on 20 September; GLOBE, the paint that stood
 * here before it, went with the slot (`tools/versus/DECIDED.md`).
 *
 * Drawn as a layer over an ordinary living body rather than as a body of its
 * own, the arrangement `shell-draw.ts` and `clasp.ts` already use. The body
 * has already been turned by `throbTurnMilli` when this is called, so the far
 * half is simply *the half past the meridian* in the body's own space and the
 * turn carries it round for free. A second copy of the angle here is how a
 * picture comes to promise a shot the rule refuses.
 *
 * **Only the rim says which half is which.** The owner, 20 September 2026:
 * the middle is never a slick's or a bulb's colour and no line is drawn down
 * it. So the far colour takes a share of the glow round the outside instead,
 * and the share is the answer `throbFacing` gives, drawn as an amount.
 */

/**
 * Which side of the body the far colour comes round from: +1 the right, -1 the
 * left. The ball turns about its **vertical** axis, so the far hemisphere's
 * nearer boundary is the meridian at longitude π/2 or 3π/2 — whichever faces
 * you (`surface.ts`'s `facet`: a feature is near while `cos(lon + turn) > 0`)
 * — and increasing longitude runs toward +x, so the hemisphere above π/2 lies
 * to the right of that meridian and the one below 3π/2 to its left.
 */
export function farSide(turn: number): number {
  return Math.cos(turn + Math.PI / 2) > 0 ? 1 : -1;
}

/**
 * How much of the rim the far colour wears, 0 to 1.
 *
 * **Not the far hemisphere's share of the disc, because the rim cannot show
 * that.** A meridian always runs pole to pole, so a rim coloured by which side
 * of it each point lies on is split left from right at every turn — which is
 * what the frame of the first try showed. So the share is the rule instead:
 * nothing at turn nought, a half exactly where `throbFacing` stops holding, and
 * the whole rim half a turn round. Linear on each side of that edge, so the
 * colour sweeps at one rate while it is the answer and another while it is not.
 * `throb-rim.test.ts` holds it to `throbFacing` at every thousandth.
 */
export function farShare(cfg: SimConfig, beats: number): number {
  const t = throbTurnMilli(cfg, beats);
  const d = Math.min(t, THROB_TURN_MILLI - t);
  const edge = Math.max(1, Math.min(THROB_TURN_MILLI / 2 - 1, throbFaceEdgeMilli(cfg)));
  if (d <= edge) return (0.5 * d) / edge;
  return 0.5 + (0.5 * (d - edge)) / (THROB_TURN_MILLI / 2 - edge);
}

/**
 * The part of the rim one colour wears: a wedge from the centre, `share` of the
 * whole way round, centred on `side`. It runs to three radii because the rim is
 * a `strokeGlow`, spread *outward* from the contour, and a region cut to the
 * body would take most of the light away.
 */
export function rimWedge(side: number, share: number, r: number): Path2D {
  const g = new Path2D();
  const mid = side > 0 ? 0 : Math.PI;
  const span = Math.PI * Math.min(1, Math.max(0, share));
  g.moveTo(0, 0);
  g.arc(0, 0, r * 3, mid - span, mid + span);
  g.closePath();
  return g;
}
