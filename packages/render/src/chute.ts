import { type Creature, chuteIsOpen, type SimConfig } from "@neon-spore/sim";
import { creatureRadius } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE CHUTE, drawn: the thrust that throws a body out of a cracked carom, and
 * the canopy it comes back down under.
 *
 * The body itself is not drawn here. `wornKind` answers "slick" or "bulb" for
 * a chute, so `creatures.ts` draws the ordinary living body in its ordinary
 * colour with its ordinary own-motion — the same drawing it was making a
 * moment earlier through the carom's window, which is the point. What this
 * file adds is the thing attached to it, and which thing that is depends on
 * the one piece of state the creature carries.
 *
 * **Stowed: a column of fire underneath.** The body is being *thrown*, and
 * upward motion is the one thing this game has never drawn — everything else
 * on the field falls, so an ascent with nothing pushing it would read as a
 * mistake in the physics rather than as an ejection. THE DART's jet is the
 * precedent (`dart-path.ts` draws one under a body under thrust) and this is
 * the same idea pointed the other way and made larger, because a dart is
 * holding station and this is leaving.
 *
 * **Open: a canopy above it.** A dome and four shroud lines, swaying slowly on
 * the wall clock. It is drawn as a *membrane* rather than as fabric — the
 * body's own colour at low alpha with a bright rim — because everything in
 * this game that is not rock is grown rather than made, and a nylon parachute
 * over a slime would be a picture from a different game. The sway is the whole
 * of what says "drifting": the body holds its lane exactly (`chute.ts` moves
 * only its row), so the lane the pair name stays true, and the canopy is what
 * carries the drift that would otherwise have to be real.
 *
 * Nothing here is remembered between frames. `chuteIsOpen` is read off the
 * world and the sway off the wall clock spread by the body's own id, so a
 * restart cannot leave a canopy behind and two chutes never sway together
 * (`restart.test.ts` is the gate).
 */

/** How far the canopy's crown stands above the body, in body radii. Exported
 * for the moment it is cut off one (`chute-cut.ts`): a canopy that let go from
 * anywhere but where it was hanging is a second canopy. */
export const CANOPY_LIFT = 1.9;
/** How wide the canopy is, in body radii. Wider than the body it carries by
 * half again: narrower and it reads as a hat, wider and it reaches into the
 * lane next door and argues with the column the pair have just agreed on. */
export const CANOPY_HALF = 1.5;
/** How far the whole assembly leans, in radians, at the ends of its sway. */
const SWAY = 0.16;
/** How long the plume under a climbing body reaches, in body radii. */
const PLUME = 2.4;

/**
 * The canopy or the plume, over a body that is already drawn. `time` is
 * seconds, for the sway and the flame; `near` is `nearness`, so the far rows
 * dim with everything else.
 */
export function drawChute(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beatPhase: number,
  near: number,
): void {
  const r = creatureRadius(l, c, beatPhase, cfg);
  const glow = hazed(cfg, c.color === "cyan" ? PALETTE.cyan : PALETTE.red, near);
  const rim = hazed(cfg, c.color === "cyan" ? PALETTE.cyanRim : PALETTE.redRim, near);
  const phase = sinHash(c.id) * 6.3;

  ctx.save();
  ctx.translate(x, y);
  if (chuteIsOpen(c)) drawCanopy(ctx, cfg, r, glow, rim, near, time, phase);
  else drawPlume(ctx, r, time, phase, hazed(cfg, PALETTE.ember, near));
  ctx.restore();
}

/**
 * The dome itself, as a path about the body it hangs from — the crown
 * `CANOPY_LIFT` above the origin and the hem `CANOPY_HALF` either side of it.
 *
 * A path rather than a run of `ctx` calls because it is drawn in two places
 * now: here, over a body still coming down, and in `chute-cut.ts`, climbing
 * away from one that has been shot out from under it. The pair must recognise
 * the second as the first with nothing underneath it, and one shape drawn
 * twice is the only way that stays true.
 *
 * `belly` is how far the crown is bellied up on this frame: 1 at rest, and the
 * canopy's own slow breath either side of it.
 */
export function canopyPath(r: number, belly: number): Path2D {
  const lift = -r * CANOPY_LIFT;
  const half = r * CANOPY_HALF;
  const p = new Path2D();
  // A single curve from one lip to the other, bellied upward. Not a
  // semicircle — a canopy under load is flatter at the crown than at the
  // edges, and the difference is what stops it reading as a ball sitting on
  // top of the body.
  p.moveTo(-half, lift);
  p.bezierCurveTo(
    -half * 0.9,
    lift - r * 1.5 * belly,
    half * 0.9,
    lift - r * 1.5 * belly,
    half,
    lift,
  );
  // Back along the underside, so the shape closes as a shell rather than as a
  // lens: the hem hangs a little below the lips it is stretched between.
  p.quadraticCurveTo(0, lift + r * 0.42, -half, lift);
  p.closePath();
  return p;
}

/**
 * The dome and its lines, leaning together about the body they hang from.
 * Rotated about the *body* and not about the canopy's own crown, because that
 * is where the weight is: a canopy pivoting on itself swings the body around
 * underneath it, which is a picture of something being shaken rather than
 * something hanging.
 */
function drawCanopy(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  r: number,
  glow: string,
  rim: string,
  near: number,
  time: number,
  phase: number,
): void {
  ctx.save();
  ctx.rotate(Math.sin(time * 0.7 + phase) * SWAY);
  const lift = -r * CANOPY_LIFT;
  const half = r * CANOPY_HALF;

  // The dome, with its own breath — the shape `chute-cut.ts` cuts loose.
  const belly = 1 + Math.sin(time * 1.6 + phase) * 0.06;
  const dome = canopyPath(r, belly);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.22;
  ctx.fill(dome);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(dome);

  // Four lines, evenly across the hem and gathered at the body. Four rather
  // than two, because two is a handle; and evenly rather than at the edges,
  // because the inner pair is what says the hem is being *held down* across
  // its whole width.
  ctx.beginPath();
  for (let k = 0; k < 4; k++) {
    const t = -1 + (k * 2) / 3;
    ctx.moveTo(half * t, lift + r * 0.42 * (1 - t * t));
    ctx.lineTo(0, -r * 0.45);
  }
  ctx.strokeStyle = hazed(cfg, PALETTE.dim, near);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
  ctx.restore();

  // A soft light off the underside of the canopy onto the body, so the two
  // read as one object rather than as a shape parked above another.
  halo(ctx, 0, -r * CANOPY_LIFT * 0.5, r * 1.4, glow, 0.1);
}

/**
 * The column of fire under a body still climbing: a tapering plume with a
 * bright core, guttering on the wall clock.
 *
 * Drawn downward from the body's underside, which is the only direction it can
 * be — the thrust is what is putting the thing up the screen, and a flame that
 * pointed anywhere else would be describing a body that is falling.
 */
function drawPlume(
  ctx: CanvasRenderingContext2D,
  r: number,
  time: number,
  phase: number,
  ember: string,
): void {
  const gutter = 1 + Math.sin(time * 22 + phase) * 0.12;
  const len = r * PLUME * gutter;
  const grad = ctx.createLinearGradient(0, r * 0.4, 0, r * 0.4 + len);
  grad.addColorStop(0, ember);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, r * 0.4);
  ctx.lineTo(r * 0.55, r * 0.4);
  ctx.lineTo(0, r * 0.4 + len);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  // The core, half the width and reaching two thirds as far — the part that is
  // white-hot rather than burning.
  ctx.beginPath();
  ctx.moveTo(-r * 0.22, r * 0.4);
  ctx.lineTo(r * 0.22, r * 0.4);
  ctx.lineTo(0, r * 0.4 + len * 0.66);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,240,214,0.75)";
  ctx.fill();
  ctx.restore();
  halo(ctx, 0, r * 0.6, r * 1.2, ember, 0.18);
}
