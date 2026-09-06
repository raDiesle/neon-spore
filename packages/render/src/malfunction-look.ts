import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import { P1_SKIN } from "./seat-skin.js";

/**
 * **What a broken control looks like**, and what the button that holds it off
 * looks like beside it.
 *
 * The owner asked for two pictures at once — *electronic device issues* and
 * *wound bleeding out* — and they are two because the ship is two things. The
 * band is the chamber under the hull: living tissue with sockets grown into it
 * (`band-ground.ts`, `lobe-shell.ts`). So a control that has stopped answering
 * is a fault in the *thing in the socket* and a wound in the *flesh around
 * it*, and drawing only one of them would say the ship is a machine or that it
 * is an animal, when the whole design of this band is that it is both.
 *
 * **A dead button is still drawn.** `drawLock` already makes that argument for
 * the panel THE MIRROR takes away: a control that quietly does nothing is
 * indistinguishable from a control that is broken, and the pair has to be able
 * to see which of the two they are looking at. So the lobe keeps its face, its
 * colour and its place — nothing moves — and the damage is laid over the top.
 *
 * **It does not stop.** The seat whose control broke used to be handed a
 * relief lobe that bought two beats of quiet, and the tearing stopped for as
 * long as it held; the owner took that button out on 6 September 2026. A fault
 * now runs for the whole wave, so the damage on the face is a fact about the
 * wave rather than a window somebody is spending.
 */

/** How far a slice of a glitched lobe is thrown sideways, as a share of its radius. */
const TEAR_REACH = 0.34;

/**
 * How long one tear stands before the next one is somewhere else, in seconds.
 *
 * The tear is placed by `sinHash` off this step counter rather than by `rng`:
 * nothing here is world state and nothing here may be, so two devices are free
 * to tear on different frames. `Math.random` would still be wrong — the button
 * would jump every frame instead of holding and then jumping.
 */
const TEAR_HOLD = 0.11;

/**
 * The damage over one dead lobe: a band of it thrown sideways, and a bleed
 * running out of the socket underneath.
 *
 * Drawn *after* the button's own face, so the tear cuts across whatever the
 * control normally shows. The seat's dead flesh is what fills the gap the
 * slice leaves, which is what makes it read as the button coming apart rather
 * than as something drawn on top of it.
 */
export function drawFaultOver(ctx: CanvasRenderingContext2D, c: Circle, time: number): void {
  const { x, y, r } = c;
  const step = Math.floor(time / TEAR_HOLD);
  ctx.save();
  // The electronic half. One horizontal slice of the lobe, cut out and put
  // back a third of a radius to one side, with the arc's blue on its two cut
  // edges — the same colour a bolt through THE FENCE leaves, because it is the
  // same idea: a current going somewhere it should not.
  const at = (sinHash(step, 1.7) - 0.5) * 1.2 * r;
  const tall = r * (0.14 + sinHash(step, 4.1) * 0.18);
  const throwBy = (sinHash(step, 9.3) - 0.5) * 2 * TEAR_REACH * r;
  ctx.beginPath();
  ctx.rect(x - r * 1.3, y + at - tall / 2, r * 2.6, tall);
  ctx.clip();
  ctx.fillStyle = P1_SKIN.dead[0];
  ctx.fillRect(x - r * 1.3, y + at - tall / 2, r * 2.6, tall);
  ctx.globalAlpha = 0.85;
  ctx.translate(throwBy, 0);
  ctx.fillStyle = rgba(PALETTE.arc, 0.22);
  paintLobe(ctx, x, y, r, "fill");
  ctx.strokeStyle = rgba(PALETTE.arcRim, 0.75);
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "stroke");
  ctx.restore();
  drawBleed(ctx, x, y, r, time);
}

/**
 * The wound half: a drop swelling on the underside of the socket, running, and
 * being replaced by the next one.
 *
 * On its own clock rather than the tear's, and deliberately much slower. Two
 * things flickering together read as one thing flickering; a drip that takes
 * two seconds to fall under a tear that jumps ten times a second is a machine
 * fault *and* something alive being hurt by it, which is the picture.
 */
function drawBleed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const cycle = 2.1;
  const t = (time % cycle) / cycle;
  // Swells for the first third, falls for the rest. The fall is squared so it
  // accelerates, which is the only part of this that has to look like weight.
  const grow = Math.min(1, t / 0.34);
  const fall = t <= 0.34 ? 0 : ((t - 0.34) / 0.66) ** 2;
  const top = y + r * 0.86;
  const drop = top + fall * r * 2.4;
  const size = r * 0.17 * grow * (1 - fall * 0.5);
  if (size <= 0.2) return;
  ctx.save();
  // The thread it runs down, from the socket's lip to wherever the drop has
  // got to. Fading out along its length, so an old bleed does not read as a
  // wire hanging off the panel.
  ctx.strokeStyle = rgba(PALETTE.redDark, 0.9);
  ctx.lineWidth = Math.max(1, size * 0.7);
  ctx.beginPath();
  ctx.moveTo(x, top - r * 0.1);
  ctx.lineTo(x, drop);
  ctx.stroke();
  halo(ctx, x, drop, size * 3.2, PALETTE.red, 0.22);
  ctx.fillStyle = rgba(PALETTE.red, 0.82);
  ctx.beginPath();
  ctx.ellipse(x, drop, size, size * 1.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
