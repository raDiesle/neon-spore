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
 * **The whole figure is grey.** Red and cyan are ammunition — they are the two
 * words the pair say to each other about what to load — and the one thing this
 * body must never suggest is that it can be shot at all. So the clown is stone
 * and off-white, and everything that makes it a clown is *shape*: a cone hat
 * with a pompom, a ruff where it meets the rock, a round nose, a grin.
 *
 * **The crouch is a tell and not a word.** On the beat the rock steps, the
 * rider sinks and leans into the pull — on both screens, from the moment the
 * beat begins. That says *now*, which both players are entitled to, and says
 * nothing about *which way*, which is player 1's alone (`veer-marks.ts`). It
 * is THE DART's jet, argued at a body instead of a flame.
 */

/** How deep the rider sinks into the pull, in body radii, at full crouch. */
const CROUCH = 0.3;
/** How far the hat whips over with it, in radians. */
const HAT_LEAN = 0.5;

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
function ball(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
  line: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
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
  // The head's own size, and the unit the rest of the figure is written in —
  // so a rock authored two tiles wide carries a rider twice the size rather
  // than the same small one perched on a boulder.
  const hr = r * 0.44;
  // Where the shoulders are: on the rock's crown, sunk by the brace. The idle
  // sway is the stone's own wobble borrowed at a different speed, so the rider
  // is never perfectly still on a body that never is.
  const sway = Math.sin(time * 1.7 + (c.id % 7)) * hr * 0.07;
  const seatY = y - r * 0.72 + r * CROUCH * brace;
  const headY = seatY - hr * 0.95;
  const headX = x + sway;

  ctx.save();

  // The ruff, where the rider meets the stone: five discs along the rock's
  // shoulder. A collar rather than a straight line, because the one thing that
  // has to be plain at a tile thirty pixels wide is that the figure is *on*
  // the rock and not floating over it.
  for (let k = -2; k <= 2; k++) {
    const rx = x + k * hr * 0.52;
    const ry = seatY + Math.abs(k) * hr * 0.12;
    ball(ctx, rx, ry, hr * 0.36, PALETTE.rock, PALETTE.rockDark);
  }

  // The head.
  ball(ctx, headX, headY, hr, PALETTE.rock, PALETTE.rockDark);

  // The hat: a cone off the crown with a pompom on the tip, leaning into the
  // pull. It is the tallest thing on the figure and the one that carries the
  // silhouette — a clown read at arm's length is a triangle over a circle.
  const lean = HAT_LEAN * brace;
  ctx.save();
  ctx.translate(headX, headY - hr * 0.55);
  ctx.rotate(lean);
  const tip = -hr * 2.1;
  ctx.beginPath();
  ctx.moveTo(-hr * 0.9, 0);
  ctx.lineTo(hr * 0.9, 0);
  ctx.lineTo(0, tip);
  ctx.closePath();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  ball(ctx, 0, tip, hr * 0.3, PALETTE.text, PALETTE.rockDark);
  ctx.restore();

  // The face, in the background's own dark so it reads as holes rather than as
  // a second material: two eyes and a grin. Small enough that on a phone they
  // are the difference between a boulder and somebody looking at you, which is
  // all they are asked to be.
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.arc(headX - hr * 0.38, headY - hr * 0.22, hr * 0.14, 0, Math.PI * 2);
  ctx.arc(headX + hr * 0.38, headY - hr * 0.22, hr * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX, headY + hr * 0.12, hr * 0.55, 0.24 * Math.PI, 0.76 * Math.PI);
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = Math.max(1, hr * 0.16);
  ctx.lineCap = "round";
  ctx.stroke();

  // The nose last and brightest: the one near-white thing on a grey figure, so
  // the eye lands on the face before it lands on anything else.
  ball(ctx, headX, headY + hr * 0.16, hr * 0.28, PALETTE.text, PALETTE.rockDark);
  ctx.restore();

  // A breath of light around the rider while it braces, and none at all
  // otherwise — the same way the dart's pilot flame lights just before a run.
  if (brace > 0.01) halo(ctx, headX, headY, hr * 1.9, PALETTE.rock, brace * 0.28);
}
