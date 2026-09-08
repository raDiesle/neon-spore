import { CRANK_TURN, crankBites, crankTurnedMilli, NO_CRANK, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * THE CLAW's crank, drawn: the winder that brings the arm home.
 *
 * **It is a control that is turned, and the picture has to say so before
 * anybody has turned it.** Every other button on the band is a thing to press,
 * so a crank drawn as another lit lobe would be pressed once and then stared
 * at. What says *turn me* is the handle standing off the middle: a knob on a
 * bar, sitting round the circle a finger has to go round, exactly where the
 * hand should be. It is the one part of the panel that is a mechanism rather
 * than tissue, which is the decision the arm itself already made
 * (`reach-arm.ts`) — the two are one machine and are drawn as one.
 *
 * **The knob stands where the drum has turned to, and that is read off the
 * rope.** `crankTurnedMilli` is how far the drum is wound out, which is
 * `world.reachMilli` in another unit — so the handle comes round under the
 * finger at exactly the rate the arm comes down, and it is back at the top the
 * moment the arm is home. Nothing here is remembered between frames, so a
 * restart cannot carry a half-turned crank into the next run.
 *
 * **It is lit only while it bites.** A crank with the arm at home turns
 * nothing (`crankBites`), and a lit control that answers nothing is the one
 * thing a panel must not do — so it sits in the seat's dead flesh until the
 * arm is out and on its way back, and then it is the brightest thing in
 * player 1's half.
 *
 * **And while it bites with nobody on it, it breathes.** The owner asked for
 * exactly that — *a bigger white circle inside where to rotate, and glowing in
 * pulsing when unused* — and both halves are the same problem: a pair meeting
 * this panel for the first time has to see that the button is a *path* rather
 * than a target, and then be told that the path is waiting. The circle is the
 * white one a finger traces; the pulse runs only while `world.crankAtMilli`
 * says no hand is reporting a bearing, so it stops the moment somebody starts
 * turning and comes back if they stop.
 */

/** Where the handle rides, as a share of the button's radius. Far enough out
 * that a finger has a circle to travel, inside enough that the whole path is
 * in the hit region a thumb is answered in (`hitCircle`). */
const HANDLE_AT = 0.62;
/** And how big the knob on the end of it is, as the same share. */
const KNOB_R = 0.19;
/** How much of the groove is lit behind the handle, in radians. */
const TRAIL = 0.9;
/** How long one breath of a crank nobody is turning takes, in seconds. Slow:
 * it is an invitation rather than an alarm, and the panel already has a beat
 * of its own running under it. */
const BREATH = 1.6;

export function drawCrankDial(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  world: World,
  skin: SeatSkin,
  /** Seconds since the page opened, for the breath. Nought is a still frame,
   * which is what every test and every still capture hands it. */
  time = 0,
): void {
  const { x, y, r } = circle;
  const live = crankBites(world);
  // Live and nobody reporting a bearing: the arm is hanging up there waiting
  // for a hand. That is what breathes (`sim/crank.ts`).
  const waiting = live && world.crankAtMilli === NO_CRANK;
  const breath = waiting ? 0.5 + 0.5 * Math.sin((time / BREATH) * Math.PI * 2) : 0;
  const hex = live ? PALETTE.hull : skin.dead[0];
  // Clockwise from the top, which is the way the hand winds — the drum's own
  // angle, in the one place it becomes radians.
  const turn = (crankTurnedMilli(world) / CRANK_TURN) * Math.PI * 2;

  if (live) halo(ctx, x, y, r * (1.9 + 0.5 * breath), PALETTE.hull, 0.4 + 0.35 * breath);
  ctx.fillStyle = skin.face;
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  paintLobe(ctx, x, y, r, "both");

  // **The circle a finger is being asked to travel**, white and wide enough to
  // be the first thing seen on the button: it is the instruction, and the
  // handle riding it is only where to start. It breathes while nothing is
  // turning it and stands steady the moment something is.
  ctx.strokeStyle = live ? PALETTE.hullRim : skin.dead[1];
  ctx.globalAlpha = live ? 0.55 + 0.4 * breath : 0.4;
  ctx.lineWidth = Math.max(2, r * 0.13);
  ctx.beginPath();
  ctx.arc(x, y, r * HANDLE_AT, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const hx = x + Math.sin(turn) * r * HANDLE_AT;
  const hy = y - Math.cos(turn) * r * HANDLE_AT;

  // The stretch of groove the handle has just come along, lit behind it. It is
  // the only thing on this button that says *which way*, and it says it the
  // way a thing in motion does rather than with an arrow — the ratchet means
  // the other way is not a mistake with a cost, it simply does nothing, which
  // is worse to find out by trying (`sim/crank.ts`).
  if (live) {
    ctx.strokeStyle = PALETTE.hull;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.beginPath();
    // Screen angles run from the x axis and the drum's run from the top, so
    // the quarter turn between them is put in here rather than carried around
    // by everything that asks where the handle is.
    ctx.arc(x, y, r * HANDLE_AT, turn - Math.PI / 2 - TRAIL, turn - Math.PI / 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // The bar from the middle out to the handle. It is what turns the drawing
  // from a ring into a crank: a ring is a dial to be read, and a bar with a
  // knob on the end of it is a thing to take hold of.
  ctx.strokeStyle = live ? PALETTE.hull : skin.dead[1];
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  ctx.lineCap = "butt";

  // The boss the bar turns on, and the knob at the far end of it — both the
  // panel's own grown contour rather than circles, which is the rule every
  // other button on this band is drawn by (`lobe-shell.ts`). The boss is dark
  // and rimmed: it is the one part of this that does not move, and a bright
  // middle would read as the thing to press.
  ctx.fillStyle = skin.dead[1];
  ctx.strokeStyle = hex;
  ctx.lineWidth = 1.5;
  paintLobe(ctx, x, y, r * 0.11, "both");
  if (live) halo(ctx, hx, hy, r * (1 + 0.3 * breath), PALETTE.hullRim, 0.5 + 0.3 * breath);
  ctx.fillStyle = live ? PALETTE.hullRim : skin.dead[1];
  ctx.strokeStyle = hex;
  ctx.lineWidth = 1.5;
  paintLobe(ctx, hx, hy, r * KNOB_R, "both");
}
