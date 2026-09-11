import { blobPath, openSmoothPath, type Point } from "@neon-spore/content";
import { hash01 } from "./backdrop.js";
import { halo, strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { tileCX } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";
import type { StripDraw } from "./strip-look.js";

/**
 * THE FLUID UNDER THE CONTROLS — the two things the owner picked out of PLASM
 * and EMBEDDED on 11 September 2026 to keep.
 *
 * `bubbles` is PLASM's chamber with the part he named — *the big bottom
 * bubbles, not the top ones* — and nothing else: large lenses of fluid low in
 * the panel, biggest at the floor, each with the one specular point a wet
 * sphere carries, and none above the rails. Painted once into the ground,
 * which is cached (`band-ground.ts`), so the count is free.
 *
 * `spine` is EMBEDDED's rail — a lit cord through the body with a node per
 * column and a swollen node on the column held — carried here so the cards
 * built after it can use it once that card is gone. The node is drawn as a
 * bead of the same fluid: wet, lit from up-left, no plate.
 */

export interface Bubbles {
  /** How many, before the panel's size caps it. */
  readonly count: number;
  /** The share of the panel's height above which there are none. */
  readonly from: number;
}

export function bubbles(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  skin: SeatSkin,
  o: Bubbles,
): void {
  const base = g.createLinearGradient(0, 0, 0, h);
  skin.ground.forEach((c, i) => {
    base.addColorStop(i / 3, c);
  });
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const count = Math.round(Math.min(o.count, (w * h) / 14000));
  for (let i = 0; i < count; i++) {
    const x = hash01(i * 7 + 11) * w;
    const deep = hash01(i * 13 + 29) ** 0.6;
    const y = h * (o.from + (1.02 - o.from) * deep);
    const r = (0.06 + hash01(i * 19 + 3) * 0.07 + deep * 0.08) * w;
    const lens = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    lens.addColorStop(0, rgba(skin.flesh[0], 0.03));
    lens.addColorStop(0.7, rgba(skin.flesh[1], 0.07));
    lens.addColorStop(0.92, rgba(skin.flesh[0], 0.26));
    lens.addColorStop(1, rgba(skin.flesh[0], 0.34));
    g.fillStyle = lens;
    const shape = new Path2D(blobPath(x, y, r, r * 0.94, 4, 0.08, 0.05, 0, i * 3 + 1, 24));
    g.fill(shape);
    g.strokeStyle = rgba(skin.rim, 0.14);
    g.lineWidth = Math.max(0.6, w / 600);
    g.stroke(shape);
    // The one point of light a wet sphere carries, up and to the left.
    const spot = g.createRadialGradient(
      x - r * 0.42,
      y - r * 0.45,
      0,
      x - r * 0.42,
      y - r * 0.45,
      r * 0.3,
    );
    spot.addColorStop(0, rgba(skin.rim, 0.45));
    spot.addColorStop(1, rgba(skin.rim, 0));
    g.fillStyle = spot;
    g.fill(shape);
  }
  const floor = skin.ground[3];
  const v = g.createLinearGradient(0, h * 0.6, 0, h);
  v.addColorStop(0, rgba(floor, 0));
  v.addColorStop(1, rgba(floor, 0.6));
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
}

/** The rail as a lit cord through the flesh, a node per column and a swollen
 * wet node on the column held. */
export function spine(d: StripDraw): void {
  const { ctx, l, y, h, col, hex, label, skin } = d;
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.85;
  ctx.fillText(label, l.width / 2, y - h / 2 - 5);
  ctx.globalAlpha = 1;
  const span = l.gridWidth + l.tile * 0.8;
  const left = l.gridLeft - l.tile * 0.4;
  const pts: Point[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    pts.push({
      x: left + span * u,
      y: y + Math.sin(u * 5.3 + 1.1) * h * 0.14 + Math.sin(u * 12.7) * h * 0.05,
    });
  }
  const yAt = (x: number): number => (pts[Math.round(((x - left) / span) * 24)] ?? { y }).y;
  const cord = new Path2D(openSmoothPath(pts));
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.ground[3], 0.55);
  ctx.lineWidth = h * 0.5;
  ctx.stroke(cord);
  strokeGlow(ctx, cord, hex, h * 0.14, 0.22);
  ctx.strokeStyle = rgba(hex, 0.4);
  ctx.lineWidth = Math.max(1, h * 0.06);
  ctx.stroke(cord);
  for (let c = 0; c < l.cols; c++) {
    if (c === col) continue;
    const x = tileCX(l, c);
    ctx.fillStyle = rgba(hex, 0.45);
    ctx.beginPath();
    ctx.arc(x, yAt(x), Math.max(1.5, h * 0.09), 0, Math.PI * 2);
    ctx.fill();
  }
  const kx = tileCX(l, col);
  const ky = yAt(kx);
  const node = new Path2D(blobPath(kx, ky, h * 0.5, h * 0.44, 3, 0.05, 0.02, 0, 3, 32));
  halo(ctx, kx, ky, h * 1.1, hex, 0.5);
  ctx.fillStyle = hex;
  ctx.fill(node);
  const gloss = ctx.createRadialGradient(kx - h * 0.15, ky - h * 0.2, 0, kx, ky, h * 0.5);
  gloss.addColorStop(0, "rgba(255,255,255,0.6)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.fill(node);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 0.9;
  ctx.stroke(node);
}
