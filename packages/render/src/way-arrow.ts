/**
 * **The way a pull goes, as an arrow** — THE INSTAR's `PULL UP` and `PULL
 * DOWN` glyph (`instar-glyphs.ts`), turned to point any way at all.
 *
 * The owner, 29 September 2026, for every boss: *for all "pull up" "pull
 * down" "pull \*" … we use always the visualization we have of the direction,
 * not just rounded red circle … which looks like a slider.* A circle says
 * *put a thumb here* and nothing about where to take it, so every mark that
 * asks for a pull carries this arrow inside it: THE INSTAR's rings, and the
 * knob every pull handle shares (`pull-knob.ts`). A drawing of its own for
 * the same idea is re-deriving this.
 *
 * `dx, dy` is the way, a unit vector; `r` is the ring's radius. The shaft
 * slides a little along itself so a still frame and a moving one both say
 * which end is the head. Drawn in the caller's stroke colour and width.
 * `heads: 2` is a pull that may go either way — THE MAZE's wheel, before the
 * hand has picked one — and is still, so neither end reads as the one.
 */
export function drawWayArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dx: number,
  dy: number,
  time: number,
  heads: 1 | 2 = 1,
): void {
  const slide = heads === 2 ? 0 : r * 0.12 * Math.sin(time * 5);
  const tipX = x + dx * (r * 0.5 + slide);
  const tipY = y + dy * (r * 0.5 + slide);
  // The head's two barbs: back along the shaft, and out either side of it.
  const backX = tipX - dx * r * 0.3;
  const backY = tipY - dy * r * 0.3;
  const sideX = -dy * r * 0.3;
  const sideY = dx * r * 0.3;
  ctx.beginPath();
  ctx.moveTo(x - dx * (r * 0.5 - slide), y - dy * (r * 0.5 - slide));
  ctx.lineTo(tipX, tipY);
  ctx.moveTo(backX + sideX, backY + sideY);
  ctx.lineTo(tipX, tipY);
  ctx.lineTo(backX - sideX, backY - sideY);
  if (heads === 2) {
    const tailX = x - dx * r * 0.5;
    const tailY = y - dy * r * 0.5;
    ctx.moveTo(tailX + dx * r * 0.3 + sideX, tailY + dy * r * 0.3 + sideY);
    ctx.lineTo(tailX, tailY);
    ctx.lineTo(tailX + dx * r * 0.3 - sideX, tailY + dy * r * 0.3 - sideY);
  }
  ctx.stroke();
}
