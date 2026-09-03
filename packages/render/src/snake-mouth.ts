import { PALETTE } from "./palette.js";

/**
 * What is in the mouth: the space itself, the fangs hung in it, and the tongue.
 *
 * Split off `snake-head.ts` when that file passed the 250-line ceiling
 * CLAUDE.md sets. It is a good seam rather than a convenient one: everything
 * here is drawn in the head's own turned coordinates and says nothing about
 * how the head is shaped or where it is pointing, which is the whole of what
 * is left next door.
 */

/**
 * The mouth: the space between the jaws, and nothing in it.
 *
 * It was a red throat with a glottis, taken from the reference. At this size
 * that red was the loudest thing on the screen and it did not read as the
 * inside of anything — the owner's note was that the open mouth looked
 * strange, and the red was why. What is drawn now is a hole: darker than the
 * arena floor so the grid does not run through it, and no colour of its own.
 */
export function cavity(ctx: CanvasRenderingContext2D, r: number, swing: number): void {
  // **Shorter the wider it opens.** A jaw's tip is about `r * 1.5` from the
  // hinge, so swinging it away pulls the tip back to `cos(swing)` of that; a
  // throat at a fixed reach therefore grew out past the snout at a full gape
  // and read as a red flag flying off the front of the head. It follows the
  // tips instead, and stops short of them.
  const reach = r * 1.5 * Math.cos(swing) * 0.86;
  // Wide enough to fill the gape rather than the reach: the corners follow
  // where the jaw *tips* have swung to, so no strip of the floor is left
  // showing between the throat and the jaw that is meant to be holding it.
  const open = Math.sin(swing) * r * 1.5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, 0);
  ctx.lineTo(reach * 0.9, -open);
  ctx.lineTo(reach, 0);
  ctx.lineTo(reach * 0.9, open);
  ctx.closePath();
  ctx.fillStyle = "#0A0616";
  ctx.fill();
}

/**
 * One fang: **rooted on the gum and hanging into the mouth.**
 *
 * A jaw is closed along `y = 0`, which is its mouth edge — the neck is the
 * upright at `x = 0` and the skin is the curve out to the snout. The fang used
 * to be drawn at `side * r * 0.42`, which is *inside* the flesh, so it came out
 * as a white sliver lying on the outside of the jaw with nothing to bite. It
 * starts on that gum line now and reaches across the gape towards the other
 * jaw, and it is recurved — the tip sits nearer the throat than the root does,
 * which is the one thing about a snake's fang everybody knows by sight.
 */
export function fang(ctx: CanvasRenderingContext2D, r: number, swing: number, side: number): void {
  ctx.save();
  ctx.translate(-r * 0.45, 0);
  ctx.rotate(swing * side);
  ctx.beginPath();
  ctx.moveTo(r * 1.3, 0);
  // Down the front edge to the point, then back up the inner one, which is
  // the shorter of the two — that is what makes it a hook and not a spike.
  //
  // Short on purpose. The first pair reached `r * 0.54` across the gape and
  // their tips met in the middle, so the two of them read as one white band
  // hung across the mouth rather than as two teeth.
  ctx.quadraticCurveTo(r * 1.28, -side * r * 0.2, r * 1.18, -side * r * 0.36);
  ctx.quadraticCurveTo(r * 1.22, -side * r * 0.16, r * 1.19, 0);
  ctx.closePath();
  ctx.fillStyle = PALETTE.hullRim;
  ctx.fill();
  ctx.restore();
}

/**
 * The tongue: out, forked, waving, and gone again.
 *
 * **It darts.** It used to be a fixed Y in front of the snout, and a snake
 * that never moves its tongue is a snake that is not doing anything. The whole
 * cycle is `flick`, 0 to 1, handed in by the caller off `world.tick` — out
 * over the first part of it, held a moment, back in, and away for the rest.
 * The shaft waves as it goes, at twice the rate of the dart, so the two tips
 * sweep the way they do when a snake is tasting the air.
 *
 * `from` is where the root sits: in front of the snout when the mouth is shut,
 * back at the hinge when it is open, where the jaws crop it themselves.
 *
 * No stored phase and no clock of its own, so two devices on the same tick
 * draw the same tongue and a restart has nothing to carry over.
 */
export function tongue(
  ctx: CanvasRenderingContext2D,
  r: number,
  from: number,
  flick: number,
): void {
  // Out and back over the first three fifths; withdrawn for the rest, which is
  // the pause that makes the next one read as a dart rather than as a wobble.
  const dart = flick < 0.6 ? Math.sin((flick / 0.6) * Math.PI) ** 0.7 : 0;
  if (dart < 0.03) return;

  const reach = r * (0.55 + 1.05 * dart);
  const tip = from + reach;
  const sway = Math.sin(flick * Math.PI * 4) * r * 0.16 * dart;
  const fork = r * 0.26 * dart;

  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  // One shaft, bent by the sway at its middle rather than at its root: a
  // tongue is anchored in the mouth and loose at the end.
  ctx.moveTo(from, 0);
  ctx.quadraticCurveTo(from + reach * 0.55, sway, tip, sway * 0.6);
  // The fork, both tines opening from the tip and carrying the sway on.
  ctx.moveTo(tip, sway * 0.6);
  ctx.quadraticCurveTo(tip + fork * 0.6, sway * 0.6 - fork * 0.3, tip + fork, sway - fork * 0.8);
  ctx.moveTo(tip, sway * 0.6);
  ctx.quadraticCurveTo(tip + fork * 0.6, sway * 0.6 + fork * 0.3, tip + fork, sway + fork * 0.8);
  ctx.stroke();
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
}
