import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **The ghost hand's drawing**, cut out of `guide-finger.ts`, which decides
 * where the fingertip is: this is only what a hand looks like with its tip
 * there, pressed to the glass or lifted off it.
 */

/** Where the fingertip is on the screen, and whether it is on the glass. */
export interface FingerTip {
  x: number;
  y: number;
  down: boolean;
}

/**
 * The hand: a pointing finger whose tip is the touch, the palm below it and to
 * the right, three fingers curled and a thumb out — lobes of one body, the
 * panel's way, filled over their own rim so the outline is one contour.
 * Lifted, it stands a little off the glass and throws a shadow there.
 */
export function drawFingerHand(ctx: CanvasRenderingContext2D, tip: FingerTip, s: number): void {
  const lift = tip.down ? 0 : s * 0.1;
  const x = tip.x + lift * 0.4;
  const y = tip.y - lift;
  if (!tip.down) {
    ctx.fillStyle = rgba(PALETTE.podDark, 0.35);
    ctx.beginPath();
    ctx.ellipse(tip.x + s * 0.05, tip.y + s * 0.04, s * 0.1, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The finger leans a little right of straight up, the way a right hand
  // points at a phone held in front of it.
  const lean = 0.32;
  const ax = Math.sin(lean);
  const ay = Math.cos(lean);
  const at = (along: number, across: number) => ({
    x: x + ax * along * s + ay * across * s,
    y: y + ay * along * s - ax * across * s,
  });
  const fingerW = s * 0.13;
  const base = at(0.62, 0);
  const palm = at(0.98, 0.14);
  const knuckles = [at(0.66, 0.24), at(0.74, 0.4), at(0.86, 0.5)];
  const thumb = at(0.86, -0.24);
  const parts = (path: Path2D) => {
    path.moveTo(x + fingerW, y);
    path.arc(x, y, fingerW, 0, Math.PI * 2);
    path.moveTo(base.x + fingerW, base.y);
    path.arc(base.x, base.y, fingerW, 0, Math.PI * 2);
    path.moveTo(palm.x + s * 0.36, palm.y);
    path.ellipse(palm.x, palm.y, s * 0.36, s * 0.4, -lean, 0, Math.PI * 2);
    for (const k of knuckles) {
      path.moveTo(k.x + s * 0.13, k.y);
      path.arc(k.x, k.y, s * 0.13, 0, Math.PI * 2);
    }
    path.moveTo(thumb.x + s * 0.12, thumb.y);
    path.ellipse(thumb.x, thumb.y, s * 0.12, s * 0.2, -lean - 0.7, 0, Math.PI * 2);
  };
  const body = new Path2D();
  parts(body);
  const shaft = new Path2D();
  shaft.moveTo(x, y);
  shaft.lineTo(base.x, base.y);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // The rim first and wide, then the fill over it: inside, every lobe's rim is
  // covered by its neighbour's fill, so only the outer contour is left.
  // Dark, so the hand stands off the lit controls it is over, with a pale
  // halo outside that so it stands off the dark field too.
  const rim = Math.max(2, s * 0.05);
  ctx.strokeStyle = rgba(PALETTE.text, 0.35);
  ctx.lineWidth = rim * 3;
  ctx.stroke(body);
  ctx.lineWidth = fingerW * 2 + rim * 3;
  ctx.stroke(shaft);
  ctx.strokeStyle = PALETTE.podDark;
  ctx.lineWidth = rim * 2;
  ctx.stroke(body);
  ctx.lineWidth = fingerW * 2 + rim * 2;
  ctx.stroke(shaft);
  ctx.fillStyle = rgba(PALETTE.text, 0.94);
  ctx.strokeStyle = rgba(PALETTE.text, 0.94);
  ctx.fill(body);
  ctx.lineWidth = fingerW * 2;
  ctx.stroke(shaft);
  // A film of gloss down the finger, so it reads as round.
  const g1 = at(0.08, -0.05);
  const g2 = at(0.5, -0.05);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.25);
  ctx.lineWidth = fingerW * 0.5;
  ctx.beginPath();
  ctx.moveTo(g1.x, g1.y);
  ctx.lineTo(g2.x, g2.y);
  ctx.stroke();
  // The nail, at the tip.
  const n = at(0.07, 0);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.35);
  ctx.beginPath();
  ctx.ellipse(n.x, n.y, fingerW * 0.55, fingerW * 0.7, -lean, 0, Math.PI * 2);
  ctx.fill();
}
