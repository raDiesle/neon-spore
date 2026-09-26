import type { StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { rimeFacetPath, rimeRadius } from "./rime-shape.js";

/**
 * **THE RIME's own blow at the hull** (`boss-strike-look.ts`). A fire step ran
 * out with the core unshot (`rime-step.ts`'s `miss`), so the lens lets go of
 * what it is made of: one of its frosted sheets, THE CAIRN's seven-sided rock
 * (`rimeFacetPath`), breaks off its underside and drops down the middle
 * column, turning. On the plating it bursts into chips, and the frost it
 * carried creeps out along the skin both ways in ferns of pale ice, then
 * thins away.
 */

/** The sheet's radius, as a share of the lens's half-width. */
const SHEET = 0.32;
/** Turns it makes on the way down. */
const TURNS = 0.6;
/** Chips it bursts into, and ferns the frost creeps out in. */
const CHIPS = 7;
const FERNS = 6;
/** How far the ferns reach along the skin, in tiles. */
const CREEP = 1.6;

export function rimeBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { l, from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const r = rimeRadius(l).rx * SHEET;
  const rock = (x: number, y: number, size: number, spin: number, seed: number, a: number) => {
    const p = rimeFacetPath(size, spin, seed);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = rgba(PALETTE.rimeFrost, 0.92 * a);
    ctx.fill(p);
    ctx.strokeStyle = rgba(PALETTE.rimeFrostDeep, a);
    ctx.lineWidth = tile * 0.05;
    ctx.stroke(p);
    ctx.restore();
  };
  ctx.save();
  if (f.after === 0) {
    // Dropped, not thrown: slow off the lens, quick at the skin.
    const t = f.reach * f.reach;
    rock(to.x, from.y + (to.y - r * 0.6 - from.y) * t, r, TURNS * Math.PI * 2 * t, 1.3, 1);
  } else {
    // The frost it carried, creeping out along the plating in ferns.
    const creep = 1 - (1 - Math.min(1, f.after * 2)) ** 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = rgba(PALETTE.rimeFrost, 0.85 * fade);
    for (let i = 0; i < FERNS; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const k = Math.floor(i / 2);
      const len = CREEP * tile * creep * (1 - 0.25 * k);
      // Down the hump's two slopes, each pair tipped a little further up than
      // the last so the outer ones follow the skin and the inner ones fan off it.
      const droop = 0.4 - 0.3 * k;
      const ex = to.x + side * Math.cos(droop) * len;
      const ey = to.y + Math.sin(droop) * len;
      ctx.lineWidth = tile * (0.07 - 0.015 * k);
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(ex, ey);
      // The fern's barbs, pointing back to where it came from.
      for (let b = 1; b <= 3; b++) {
        const bx = to.x + ((ex - to.x) * b) / 4;
        const by = to.y + ((ey - to.y) * b) / 4;
        const barb = tile * 0.16 * (1 - b / 5) * creep;
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - side * barb * 0.6, by - barb * 0.8);
      }
      ctx.stroke();
    }
    // The sheet burst into chips, scattered up and falling back.
    for (let i = 0; i < CHIPS; i++) {
      const a = -Math.PI / 2 + (i - (CHIPS - 1) / 2) * 0.42;
      const d = tile * (0.8 + 0.25 * (i % 3)) * f.after;
      const x = to.x + Math.cos(a) * d;
      const y = to.y - r * 0.4 + Math.sin(a) * d + 2.4 * tile * f.after * f.after;
      rock(x, y, r * (0.28 + 0.06 * (i % 3)), i * 1.9 + f.after * 4, i, fade);
    }
  }
  ctx.restore();
}
