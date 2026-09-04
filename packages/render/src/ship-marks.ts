import { halo, strokeGlow } from "./glow.js";
import type { Circle } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ShipMark } from "./touch-hand.js";

/**
 * The marks round the cup: what letting go of this swelling would do, said in
 * the colour the band already says it in.
 *
 * Its own file beside `ship-hand.ts` for that file's own reason — it had
 * reached its length carrying the cup and player 2's two colours, and this is
 * a third picture asking the same question of a different gesture.
 *
 * **Every colour here is the button's own.** The maw is pod amber because the
 * SUCK lobe in the band is (`band-control.ts` reads `PALETTE.pod` for it), the
 * bolt is shield cyan because the SHIELD lobe is, and the arrows carry no
 * colour of their own at all — they are the swelling's, because *travels* is a
 * property of the thing rather than of a control that acts on it. The owner
 * asked for the field marks to be recognisable as the same controls, and the
 * only way that is true rather than approximately true is for the two pictures
 * to read one palette.
 *
 * Nothing here reads a world, a tick or a seat: it is handed a circle, a mark
 * and an alpha, and draws.
 */

/** How far out from the cup the slide arrows stand, in cup radii. */
const ARROW_OUT = 1.45;
/**
 * How far above the cup the maw and the bolt stand, in cup radii.
 *
 * Both clear the arc rather than sitting on it. A mark drawn across the cup
 * reads as part of the bracket — which is a thing about the *hand* — instead
 * of as a thing about the control, and the first draft of the bolt did
 * exactly that.
 */
const SUCK_UP = 1.3;
const BOLT_UP = 1.7;

export function drawShipMark(
  ctx: CanvasRenderingContext2D,
  mark: ShipMark,
  at: Circle,
  r: number,
  base: string,
  alpha: number,
  time: number,
): void {
  if (mark === "slide") {
    drawSlide(ctx, at, r, base, alpha);
    return;
  }
  if (mark === "suck") {
    drawSuck(ctx, at, r, alpha, time);
    return;
  }
  drawGuard(ctx, at, r, alpha);
}

/**
 * A chevron either side of the cup, pointing away from it: **this travels, and
 * it travels both ways**.
 *
 * Dimmer than anything else drawn on the ship, and deliberately so. It is the
 * one mark that is never news — the swelling can always be carried along the
 * hull — so it says so quietly and leaves the brightness to the marks that are
 * about what this particular hand is about to do.
 */
function drawSlide(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  r: number,
  base: string,
  alpha: number,
): void {
  const w = r * 0.28;
  for (const side of [-1, 1] as const) {
    const x = at.x + side * r * ARROW_OUT;
    const arrow = new Path2D();
    arrow.moveTo(x - side * w, at.y - w);
    arrow.lineTo(x + side * w, at.y);
    arrow.lineTo(x - side * w, at.y + w);
    ctx.globalAlpha = 0.55 * alpha;
    strokeGlow(ctx, arrow, base, 1.6, 0.45 * alpha);
    ctx.globalAlpha = 1;
  }
}

/**
 * The maw: three chevrons stacked over the muzzle, all pointing **down into
 * it**, the highest of them faintest.
 *
 * Down, because that is the direction the thing being swallowed actually
 * travels — a pod falls into the mouth, and an arrow pointing anywhere else
 * would be decoration. They breathe on their own short cycle, offset one from
 * the next, so the stack reads as a draught being pulled rather than as three
 * marks that happen to be in a line.
 */
function drawSuck(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  r: number,
  alpha: number,
  time: number,
): void {
  const top = at.y - r * SUCK_UP;
  const w = r * 0.42;
  halo(ctx, at.x, top - r * 0.2, r * 1.2, PALETTE.pod, 0.16 * alpha);
  for (let i = 0; i < 3; i++) {
    const pulse = (time * 1.6 - i * 0.22) % 1;
    const y = top - i * r * 0.34;
    const lit = (1 - i * 0.28) * (0.55 + 0.45 * Math.cos(pulse * Math.PI * 2));
    const chevron = new Path2D();
    chevron.moveTo(at.x - w, y - r * 0.16);
    chevron.lineTo(at.x, y + r * 0.16);
    chevron.lineTo(at.x + w, y - r * 0.16);
    ctx.globalAlpha = lit * alpha;
    strokeGlow(ctx, chevron, PALETTE.pod, 2, lit * alpha);
    ctx.globalAlpha = 1;
  }
}

/**
 * The bolt over the plate: **this press has already fired the guard**.
 *
 * A lightning stroke rather than a ring or a word, because the guard is the
 * one control on the ship whose whole content is *now* — the window opens on
 * the press and closes on the simulation's own clock (`sim/guard.ts`), so
 * there is nothing to aim and nothing to change your mind about. Shield cyan,
 * the colour of the plate it is standing over and of the lobe in the band that
 * does the same thing.
 */
function drawGuard(ctx: CanvasRenderingContext2D, at: Circle, r: number, alpha: number): void {
  const y = at.y - r * BOLT_UP;
  const h = r * 0.55;
  const w = r * 0.34;
  const bolt = new Path2D();
  bolt.moveTo(at.x + w * 0.6, y - h);
  bolt.lineTo(at.x - w, y + h * 0.1);
  bolt.lineTo(at.x + w * 0.15, y + h * 0.1);
  bolt.lineTo(at.x - w * 0.6, y + h);
  halo(ctx, at.x, y, r * 1.1, PALETTE.shield, 0.3 * alpha);
  ctx.globalAlpha = alpha;
  // The lobe's own cyan and not the paler rim the cup is drawn in: the cup is
  // nearly white, and a bolt that shared its colour would read as a piece of
  // the bracket rather than as the SHIELD button standing over the plate.
  strokeGlow(ctx, bolt, PALETTE.shield, 2.4, alpha);
  ctx.globalAlpha = 1;
}
