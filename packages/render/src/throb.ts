import { LIGHT_HALF } from "@neon-spore/content";
import { drawDetails } from "./creature-detail.js";
import { strokeGlow } from "./glow.js";
import { litRound } from "./key-light.js";
import type { ThrobHalf } from "./throb-look.js";

/**
 * THE THROB's far half: the side of the body the cannon is *not* looking at,
 * painted in the other ammunition colour.
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

/**
 * A throb as a ball with one hemisphere painted, rather than a disc cut in two.
 *
 * It was the far colour laid over everything above a straight seam, carried
 * round by the transform's own rotation — exactly right about the rule, and the
 * shape a spinning *coin* makes. The owner took GLOBE out of VERSUS on
 * 9 September 2026 and this is it. It takes a record rather than eight
 * arguments because it is the field on `THROB_LOOK` a candidate look is patched
 * onto (`throb-look.ts`).
 *
 * **The turn is undone for the region and put straight back for the drawing**,
 * and the two-step is the whole care in this file. `turn` is what the *surface*
 * has done, so the meridian has to be worked out in a frame the turn has been
 * taken out of; but the contour, its lobes and its interior are the *body*, and
 * a body drawn in that same frame would be a silhouette spinning backwards
 * against the one underneath it. A clip is fixed in device space the moment it
 * is taken, so the region is clipped un-turned and the pen is turned back
 * before a single mark is made.
 */
export function drawThrobHalf(h: ThrobHalf): void {
  const { ctx, body, rx, ry, isBulb, tint, seamHue, lw, turn, rot } = h;
  const { half, side } = seamAt(turn, rx);
  const far = farRegion(half, side, rx, ry);
  // How far round the painted hemisphere has gone, as the cosine the tangent
  // plane hands out. Floored so a seam edge-on leaves a sliver of core rather
  // than a zero-width scale, which a canvas refuses.
  const squash = Math.max(0.18, Math.abs(half) / rx);

  ctx.save();
  ctx.rotate(-turn);
  ctx.clip(far);
  // Back into the body's own frame for the contour, which is a silhouette and
  // must not be turned by anything except its own transform.
  ctx.rotate(turn);
  ctx.fillStyle = tint.dark;
  ctx.fill(body);
  strokeGlow(ctx, body, tint.hex, lw, 1);
  // And the interior marks this half wears, over the fill the way the shipped
  // half draws them, narrowed with the surface they sit on. Back in the
  // un-turned frame, because a core is a mark *on* the ball.
  ctx.rotate(-turn);
  ctx.scale(squash, 1);
  // The blob this half wears, not `"throb"`: the far side of a throb is drawn
  // as the body it is made of, interior included.
  drawDetails(ctx, isBulb ? "bulb" : "slick", {
    hex: tint.hex,
    rim: tint.rim,
    dark: tint.dark,
    rx,
    ry,
    rot: 0,
    t: 0,
  });
  ctx.restore();

  // The cut itself — the boundary meridian, in the two colours mixed, which is
  // neither of them. An ellipse arc and not a line, and it is the whole claim:
  // it swells to the body's full width as the seam comes round to face the pair
  // and shuts to nothing as it turns edge-on, twice a revolution. Clipped to
  // the body so it stops at the contour rather than running out into the field.
  ctx.save();
  ctx.clip(body);
  ctx.rotate(-turn);
  const meridian = new Path2D();
  meridian.ellipse(0, 0, Math.max(0.5, Math.abs(half)), ry, 0, -Math.PI / 2, Math.PI / 2, half < 0);
  ctx.strokeStyle = seamHue;
  ctx.lineWidth = lw * 1.4;
  ctx.stroke(meridian);
  ctx.restore();

  // And the terminator over both halves, in the value half only — the rule
  // rather than a taste, because a creature's red-or-cyan is a fact one player
  // says out loud and a light that moved its hue would be moving the callout
  // (`LIGHT_HALF`). The whole rotation the context carries is handed over, so
  // the light stays where it is on the screen while the body turns under it.
  ctx.save();
  ctx.clip(body);
  litRound(ctx, 0, 0, Math.max(rx, ry), LIGHT_HALF.creature, rot);
  ctx.restore();
}
