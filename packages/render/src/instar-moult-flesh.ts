import { spriteRng } from "./sprite-bake.js";

/**
 * The strokes THE INSTAR's wound tile is painted from, at load
 * (`instar-moult-baked.ts`): muscle along the tile and veins over it, every
 * mark repeated at each wrap so the tile has no seam. Split off for length.
 */

const FIBRES = 22;
const VEINS = 5;

/** Every mark at each wrap it could reach across, so the tile has no edge. */
export function wrapped(w: number, h: number, draw: (dx: number, dy: number) => void): void {
  for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) draw(dx, dy);
}

/** Short strands of muscle along the tile, each a thin spindle, lit or dark by `grey`. */
export function fibres(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  grey: number,
) {
  const rnd = spriteRng(seed);
  g.strokeStyle = `rgb(${grey},${grey},${grey})`;
  for (let i = 0; i < FIBRES; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const len = w * (0.12 + rnd() * 0.2);
    const bow = (rnd() - 0.5) * h * 0.08;
    g.lineWidth = h * (0.01 + rnd() * 0.02);
    g.globalAlpha = 0.35 + rnd() * 0.4;
    wrapped(w, h, (dx, dy) => {
      g.beginPath();
      g.moveTo(x + dx, y + dy);
      g.quadraticCurveTo(x + dx + len / 2, y + dy + bow, x + dx + len, y + dy);
      g.stroke();
    });
  }
  g.globalAlpha = 1;
}

/** A vein: a wandering dark line and two short branches off it. */
export function veins(g: CanvasRenderingContext2D, w: number, h: number): void {
  const rnd = spriteRng(47);
  g.strokeStyle = "rgb(40,40,40)";
  for (let i = 0; i < VEINS; i++) {
    const pts = [{ x: rnd() * w, y: rnd() * h }];
    for (let j = 0; j < 4; j++) {
      const p = pts[pts.length - 1] ?? { x: 0, y: 0 };
      pts.push({ x: p.x + w * (0.04 + rnd() * 0.05), y: p.y + (rnd() - 0.5) * h * 0.16 });
    }
    g.lineWidth = h * 0.012;
    g.globalAlpha = 0.7;
    wrapped(w, h, (dx, dy) => {
      g.beginPath();
      for (const [k, p] of pts.entries()) {
        if (k === 0) g.moveTo(p.x + dx, p.y + dy);
        else g.lineTo(p.x + dx, p.y + dy);
      }
      for (const k of [1, 3]) {
        const p = pts[k] ?? { x: 0, y: 0 };
        g.moveTo(p.x + dx, p.y + dy);
        g.lineTo(p.x + dx + w * 0.03, p.y + dy + (k === 1 ? -1 : 1) * h * 0.07);
      }
      g.stroke();
    });
  }
  g.globalAlpha = 1;
}
