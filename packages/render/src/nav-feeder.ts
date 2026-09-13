/**
 * What feeds a button from the bar's own membrane: a neck of slime running out
 * of the edge above and reaching down to the socket, thickening and thinning on
 * its own clock. The panel's answer to the same sentence, one layer up —
 * nothing down here sits on the ship, everything is fed by it
 * (`band-slime.ts`).
 */
export function drawNavFeeder(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  to: number,
  hex: string,
  phase: number,
): void {
  const reach = to - top;
  if (reach <= 2) return;
  const swell = 0.55 + 0.45 * Math.sin(phase);
  const w = 2.6 + 2.2 * swell;
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.moveTo(x - w, top);
  ctx.quadraticCurveTo(x - w * 0.35, top + reach * 0.6, x, to);
  ctx.quadraticCurveTo(x + w * 0.35, top + reach * 0.6, x + w, top);
  ctx.closePath();
  ctx.fill();
  // A bead that has let go and is on its way down the neck.
  const fall = (Math.sin(phase * 0.7) + 1) / 2;
  ctx.globalAlpha = 0.3 * (1 - fall);
  ctx.beginPath();
  ctx.arc(x, top + reach * (0.2 + 0.85 * fall), w * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
