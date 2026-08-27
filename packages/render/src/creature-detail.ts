/** Core and trailing filaments. Inner drawing is thinner than the outline
 * (docs/spec/graphics.md). */
export function drawDetails(
  ctx: CanvasRenderingContext2D,
  isBulb: boolean,
  rx: number,
  ry: number,
  rim: string,
  hex: string,
): void {
  ctx.fillStyle = rim;
  if (isBulb) {
    ctx.beginPath();
    ctx.arc(0, ry * 0.3, ry * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hex;
    ctx.lineWidth = Math.max(0.6, ry * 0.035);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.28, -ry * 0.4);
    ctx.quadraticCurveTo(-rx * 0.39, -ry * 0.68, -rx * 0.22, -ry * 0.9);
    ctx.moveTo(rx * 0.28, -ry * 0.4);
    ctx.quadraticCurveTo(rx * 0.39, -ry * 0.68, rx * 0.22, -ry * 0.9);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  ctx.beginPath();
  ctx.arc(-rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
}
