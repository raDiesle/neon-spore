import { type ClownDisc, clownFigure, VEER_CLOWN } from "@neon-spore/content";
import { type Creature, type SimConfig, spanOf, veerRowsToChange } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rockRadius } from "./torch.js";

/**
 * THE VEER's rider: a clown sitting on the rock, and the reason the rock does
 * not fall straight.
 *
 * **Why there is a figure on it at all.** Every other rock in the game is a
 * dead stone, and the whole fiction of a stone is that nothing about it is a
 * decision — it cannot be shot because there is nothing in it to kill, and it
 * cannot be talked out of the column it is in. This one changes lane three
 * times, which is a decision, and a stone that steers itself is a stone the
 * pair has no picture for. So the decision is given a body: something is up
 * there holding on and pulling it over, and the arrow player 1 reads is what
 * that thing is about to do.
 *
 * **It does not turn with the stone.** `drawMeteor` spins the rock and its
 * pits inside a rotated frame and leaves anything *around* it alone, on the
 * argument that anything glued to a spinning stone reads as painted on. A
 * rider is the sharpest case of that rule in the game: a face that rolled with
 * the rock would be a face carved into it, and what has to read here is a
 * passenger.
 *
 * **Every figure on it is `content/veer-clown-shape.ts`, and none is here.**
 * The director's palette draws the same rider as a contour so the VEER brush
 * shows a clown rather than the plain stone every other rock brush shows, and
 * two tables of proportions would be two clowns nobody would ever see diverge.
 * This file is the colours, the light and the order things are drawn in; where
 * every disc sits is one call.
 *
 * **The figure is stone except for the nose.** Red and cyan are ammunition —
 * they are the two words the pair say to each other about what to load — so
 * this body must never suggest it can be shot at all, and the whole clown was
 * built grey on that argument. The owner overruled it for one mark: a clown
 * whose nose is stone is not a clown anybody sees. So the nose is a fuchsia
 * that is deliberately not a red (`PALETTE.clownNose` carries the reasoning),
 * it is the only coloured thing on the figure, and everything else that makes
 * this a clown is *shape* — a cone hat with a pompom, a ruff where it meets
 * the rock, a grin.
 *
 * **The crouch is a tell and not a word.** On the beat the rock steps, the
 * rider sinks and leans into the pull — on both screens, from the moment the
 * beat begins. That says *now*, which both players are entitled to, and says
 * nothing about *which way*, which is player 1's alone (`veer-marks.ts`). It
 * is THE DART's jet, argued at a body instead of a flame.
 */

/**
 * How hard the rider is bracing, 0 to 1: nothing at all until the beat that
 * ends in a change of lane, then all of it across that beat. `veerRowsToChange`
 * is the rule and it is called rather than re-derived — the row this body is
 * standing on is the only thing that decides when it moves, and a second copy
 * of that arithmetic would be a crouch on a beat the rock does not step.
 */
export function veerBrace(cfg: SimConfig, c: Creature, beatPhase: number): number {
  return veerRowsToChange(cfg, c.row) === 1 ? smoothstep(beatPhase) : 0;
}

/** One filled, outlined disc — the head, the nose and the pompom are all one. */
function ball(ctx: CanvasRenderingContext2D, d: ClownDisc, fill: string, line: string): void {
  ctx.beginPath();
  ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
}

export function drawVeerClown(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beatPhase: number,
): void {
  const r = rockRadius(l, spanOf(c));
  const brace = veerBrace(cfg, c, beatPhase);
  // The idle sway is the stone's own wobble borrowed at a different speed, so
  // the rider is never perfectly still on a body that never is. The phase is
  // the wall clock and belongs here; how far a sway of one carries the head is
  // a proportion of the figure and belongs with the rest of them.
  const sway = Math.sin(time * 1.7 + (c.id % 7)) * VEER_CLOWN.swayMul;
  const f = clownFigure(VEER_CLOWN, x, y, r, brace, sway);

  ctx.save();

  // The ruff, where the rider meets the stone: five discs along the rock's
  // shoulder. A collar rather than a straight line, because the one thing that
  // has to be plain at a tile thirty pixels wide is that the figure is *on*
  // the rock and not floating over it.
  for (const bead of f.ruff) ball(ctx, bead, PALETTE.rock, PALETTE.rockDark);

  // The head.
  ball(ctx, f.head, PALETTE.rock, PALETTE.rockDark);

  // The hat: a cone off the crown with a pompom on the tip, leaning into the
  // pull. It is the tallest thing on the figure and the one that carries the
  // silhouette — a clown read at arm's length is a triangle over a circle.
  ctx.beginPath();
  ctx.moveTo(f.hat[0]!.x, f.hat[0]!.y);
  for (const p of f.hat.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.closePath();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  ball(ctx, f.pompom, PALETTE.text, PALETTE.rockDark);

  // The face, in the background's own dark so it reads as holes rather than as
  // a second material: two eyes and a grin. Small enough that on a phone they
  // are the difference between a boulder and somebody looking at you, which is
  // all they are asked to be.
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  for (const eye of f.eyes) ctx.arc(eye.x, eye.y, eye.r, 0, Math.PI * 2);
  ctx.fill();
  // The grin is struck wide and low, clear of the nose that goes over it —
  // drawn tight to the nose it read as a shadow under one rather than as a
  // mouth, which loses the only mark on this face that is doing any work
  // besides "somebody is up there".
  ctx.beginPath();
  ctx.arc(f.grin.x, f.grin.y, f.grin.r, f.grin.from, f.grin.to);
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = f.grin.width;
  ctx.lineCap = "round";
  ctx.stroke();

  // The nose last, and the one coloured thing on the whole rock: the eye lands
  // on the face before it lands on anything else, which is the entire reason
  // the hue was spent. A breath of its own light under it, so it reads as lit
  // rather than as a sticker — small enough that it never grows into the ring
  // of colour a shot could be aimed at.
  halo(ctx, f.nose.x, f.nose.y, f.noseGlow, PALETTE.clownNose, 0.35);
  ball(ctx, f.nose, PALETTE.clownNose, PALETTE.clownNoseRim);
  ctx.restore();

  // A breath of light around the rider while it braces, and none at all
  // otherwise — the same way the dart's pilot flame lights just before a run.
  if (brace > 0.01) halo(ctx, f.brace.x, f.brace.y, f.brace.r, PALETTE.rock, brace * 0.28);
}
