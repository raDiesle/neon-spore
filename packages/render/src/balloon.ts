import { BALLOON, balloonKnot, balloonPath, openSmoothPath } from "@neon-spore/content";
import {
  balloonSplitsLeft,
  balloonSwellPhase,
  balloonTension,
  type Creature,
  type SimConfig,
} from "@neon-spore/sim";
import { balloonRim, balloonSkinFill, drawBalloonParts } from "./balloon-alive.js";
import type { Body } from "./creature-body.js";
import { contourClock } from "./creature-place.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE BALLOON, drawn — a skin with a knot under it, filling where it appears,
 * leaning the way it climbs, and giving on whichever side somebody is pulling.
 *
 * **It wears an oil slick, and that is a sentence rather than a colour.** In
 * this game a body with an ammunition colour on it is a body somebody loads a
 * trigger for, and nothing can be fired at this one at all (`sim/balloon.ts`:
 * a bolt is spent on the skin). It was grey on that argument for a while,
 * which was safe and said *nothing to report* about the one arrival two people
 * have to name out loud. What it wears now is a band of colour that travels
 * round it and never settles: there is no hue standing still on it to load,
 * and the body is finally as strange as what it does. `balloon-alive.ts` next
 * door is the film and the three parts — veins under the skin, a ring of beads
 * orbiting it, threads dragging below — and `palette.ts` argues the three
 * colours the loop runs through.
 *
 * **What answers a hand is the tension**, and only that. Each side brightens
 * towards white as the hand on it carries its handle out, and the skin on that
 * side actually stretches — the pair's only readout of a thumb they cannot see
 * is the shape of the body itself, so there is no easing anywhere between
 * `balloonTension` and this (`lidOpenMilli` makes the same argument about a
 * gap between two plates).
 *
 * **Both screens draw the whole of it.** Nothing about this creature is
 * withheld from either seat — what is split is the hand, not the picture — so
 * there is no gate here the way there is for a ghost or a wisp.
 *
 * `balloon-handles.ts` next door draws the two things a finger takes hold of,
 * flat and outside the perspective transform, for `lid-string.ts`' reason: a
 * control is hit-tested against the circle it is drawn at, and a circle scaled
 * by the row it is on is a control that changes size under the thumb.
 */

/**
 * How much of a tile a full-size balloon's height is — **twice what it was**,
 * asked for by name.
 *
 * It used to be a little under half, so that two in adjacent lanes were
 * plainly two bodies. At double that a full one is nearly two tiles tall and
 * two neighbours crowd each other, which was put to the owner as the cost and
 * taken: this is the one arrival that has to be picked out and named out loud
 * across a room, and it was the smallest thing on the field.
 */
const FULL_RY = 0.88;
/** And a small one, after a split — doubled with it, so a half is now exactly
 * the size a whole balloon used to be. The two generations stay two thirds
 * apart, which is what keeps a split readable. */
const SMALL_RY = 0.58;
/** How much wider a side gets at full tension, as a share of its own width.
 * Half again: the give has to be visible across a room, because the other seat
 * is reading it to decide whether their own hand is doing anything. */
const GIVE = 0.5;
/** And how much shorter the body gets while it is being pulled. Skin has a
 * fixed area — a balloon that stretched sideways and kept its height would
 * read as a body being scaled rather than as one being worked on. */
const SQUASH = 0.16;

/** The height of this body, in pixels: its generation, times how far through
 * its swell it is. A fresh one and each half of a split both come up out of
 * nothing, which is the same picture and so is the same arithmetic. */
export function balloonRy(l: Layout, cfg: SimConfig, c: Creature, beats: number): number {
  const full = l.tile * (balloonSplitsLeft(c) > 0 ? FULL_RY : SMALL_RY);
  // Never quite nothing: a body at zero is a body neither player can see
  // arriving, and the whole of the swell is the announcement this creature
  // gets (`sim/balloon.ts` — it has no radar blip).
  return full * (0.18 + 0.82 * balloonSwellPhase(cfg, beats, c));
}

/** The body. `ctx` is expected to be inside the perspective transform
 * `drawCreatures` puts every body in, so nothing here scales for distance —
 * only the colour is hazed, which is where distance is spent everywhere else. */
export function drawBalloon({ ctx, l, world, c, x, y, time, beats, near }: Body): void {
  const cfg = world.cfg;
  const ry = balloonRy(l, cfg, c, beats);
  const left = balloonTension(cfg, c, 1) / 1000;
  const right = balloonTension(cfg, c, 2) / 1000;
  const base = ry * 0.82;
  const rxLeft = base * (1 + GIVE * left);
  const rxRight = base * (1 + GIVE * right);
  const squashed = ry * (1 - SQUASH * Math.max(left, right));
  const t = contourClock(c.id, time);

  const skin = new Path2D(balloonPath(rxLeft, rxRight, squashed, BALLOON.wobble, t, c.id % 16));
  const knot = new Path2D(openSmoothPath(balloonKnot(squashed)));

  ctx.save();
  ctx.translate(x, y);
  // The rim rides the film and brightens towards white with whichever side is
  // further on, so a body one hand is holding already looks different from one
  // nobody is.
  const lit = Math.max(left, right);
  const rimHex = balloonRim(cfg, time, c.id, near, lit);
  ctx.fillStyle = balloonSkinFill(ctx, cfg, Math.max(rxLeft, rxRight), squashed, time, c.id, near);
  ctx.fill(skin);
  drawBalloonParts(ctx, cfg, rxLeft, rxRight, squashed, time, c.id, near, lit);
  strokeGlow(ctx, skin, rimHex, STROKE.outline, 0.5 + lit * 1.2);
  strokeGlow(ctx, knot, rimHex, STROKE.inner, 0.4);
  // A highlight up and to the left, which is the one mark that says *inflated*
  // rather than *drawn*. It travels with the left half so it stretches with it.
  const gloss = new Path2D();
  gloss.ellipse(
    -rxLeft * 0.42,
    -squashed * 0.42,
    rxLeft * 0.2,
    squashed * 0.26,
    -0.5,
    0,
    Math.PI * 2,
  );
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = PALETTE.sheenRim;
  ctx.fill(gloss);
  ctx.globalAlpha = 1;
  ctx.restore();

  // And the glow around it, brightening with the pull: at full tension on both
  // sides it is a frame away from giving, and the field should say so.
  if (lit > 0) halo(ctx, x, y, ry * 2.4, PALETTE.sheenRim, 0.1 + lit * 0.22);
}
