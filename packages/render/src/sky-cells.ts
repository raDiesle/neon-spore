import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { actTint, baked, paintSpace } from "./sky-kit.js";

/**
 * CELLS — the field is inside something alive.
 *
 * Behind everything, a wall of huge cells packed edge to edge — each one
 * many times a body's size, dark inside, with a lit membrane round it and a
 * dim nucleus off its centre — in the act's colour. The wall breathes: it
 * swells and settles on a slow clock, a few per cent, so the whole back reads
 * as tissue rather than as a pattern. The slimes come out of it.
 *
 * Baked once per size and tint; a frame is one scaled blit.
 */

/** Cells across the sky's width. */
const ACROSS = 3.4;
const BREATH = 0.025;

interface Cell {
  x: number;
  y: number;
  r: number;
}

/** A jittered grid of seeds, each cell's radius the distance to its nearest
 * neighbour, so they touch and do not stack. */
function seeds(w: number, h: number): Cell[] {
  const step = w / ACROSS;
  const out: Cell[] = [];
  let k = 0;
  for (let gy = -0.5; gy * step < h + step; gy++) {
    for (let gx = -0.5; gx * step < w + step; gx++) {
      const odd = Math.round(gy + 0.5) % 2 === 1 ? 0.5 : 0;
      out.push({
        x: (gx + odd + (hash01(110_000 + k) - 0.5) * 0.55) * step,
        y: (gy + (hash01(111_000 + k) - 0.5) * 0.55) * step * 0.9,
        r: 0,
      });
      k++;
    }
  }
  for (const c of out) {
    let near = Number.POSITIVE_INFINITY;
    for (const o of out) if (o !== c) near = Math.min(near, Math.hypot(o.x - c.x, o.y - c.y));
    c.r = near * 0.56;
  }
  return out;
}

function tissue(tint: string, w: number, h: number): HTMLCanvasElement {
  return baked(`cells${tint}`, w, h, (g, pw, ph) => {
    const wall = mixHex(tint, "#E0C8F0", 0.35);
    const deep = mixHex(tint, "#000000", 0.55);
    g.fillStyle = deep;
    g.fillRect(0, 0, pw, ph);
    const cells = seeds(pw, ph);
    cells.forEach((c, i) => {
      // The cytoplasm: darker at the heart, lit toward the membrane.
      const body = g.createRadialGradient(c.x, c.y, c.r * 0.1, c.x, c.y, c.r);
      body.addColorStop(0, withAlpha(deep, 1));
      body.addColorStop(0.75, withAlpha(tint, 0.9));
      body.addColorStop(0.93, withAlpha(wall, 0.55));
      body.addColorStop(1, withAlpha(wall, 0));
      g.fillStyle = body;
      g.beginPath();
      // A wobbled outline, so no cell is a circle.
      for (let k = 0; k <= 40; k++) {
        const a = (k / 40) * Math.PI * 2;
        const wob =
          1 + Math.sin(a * 3 + i * 1.7) * 0.05 + Math.sin(a * 5 + hash01(112_000 + i) * 6) * 0.03;
        const x = c.x + Math.cos(a) * c.r * wob;
        const y = c.y + Math.sin(a) * c.r * wob;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.fill();
      g.strokeStyle = withAlpha(wall, 0.4);
      g.lineWidth = Math.max(1, c.r * 0.025);
      g.stroke();
      // The nucleus, off centre.
      const na = hash01(113_000 + i) * Math.PI * 2;
      const nx = c.x + Math.cos(na) * c.r * 0.3;
      const ny = c.y + Math.sin(na) * c.r * 0.3;
      const nr = c.r * (0.16 + hash01(114_000 + i) * 0.08);
      const nuc = g.createRadialGradient(nx, ny, 0, nx, ny, nr);
      nuc.addColorStop(0, withAlpha(wall, 0.4));
      nuc.addColorStop(0.7, withAlpha(wall, 0.18));
      nuc.addColorStop(1, withAlpha(wall, 0));
      g.fillStyle = nuc;
      g.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
    });
  });
}

export function skyCells(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  paintSpace(d);
  const sheet = tissue(actTint(d, 0.25), l.width, height);
  const s = 1 + BREATH * (0.5 + 0.5 * Math.sin(time * 0.9));
  const w = l.width * s;
  const h = height * s;
  ctx.globalAlpha = 0.6;
  ctx.drawImage(sheet, (l.width - w) / 2, (height - h) / 2, w, h);
  ctx.globalAlpha = 1;
}
