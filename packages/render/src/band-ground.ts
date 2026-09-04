import { blobPath } from "@neon-spore/content";
import { hash01 } from "./backdrop.js";
import type { Layout } from "./layout.js";

/**
 * WHAT THE CONTROL PANEL IS MADE OF.
 *
 * The band used to be `fillRect` in `#0E0A22` with a ruled line along the top.
 * It is the ship seen from inside now: the chamber under the hull, wet, veined
 * and lit from the seam above it. The owner asked for that in those words —
 * neon, fluid, living, slime, and part of the ship rather than a box bolted
 * under it.
 *
 * **It is painted once and blitted.** A sheet this layered — a ground, two
 * hundred cells, thirty veins, a mottle over all of it — is far past what a
 * frame may spend, and none of it moves: it depends on the size of the panel
 * and nothing else. So it is baked into an offscreen canvas the first time a
 * size is asked for and drawn with a single `drawImage` after that, which is
 * the same bargain `haloSprite` already makes in `glow.ts`. That is also why
 * this can afford to be as detailed as a painted texture would be, without an
 * asset to fetch, a decode to wait for, or a fixed resolution to be soft at:
 * it is baked at `l.dpr`, so it is sharp on a phone and on a desk.
 *
 * Everything in it comes from `hash01`, so one size always bakes the same
 * sheet — a background that reshuffled itself on a resize would be the one
 * thing in the picture that noticed the window.
 */

/** The palette of the chamber, top (nearest the hull) to bottom. */
const GROUND = ["#150D33", "#0E0921", "#080513", "#04020A"] as const;

const sheets = new Map<string, HTMLCanvasElement>();

/**
 * The sheet for a panel this size, baked once. Keyed on the pixel size it will
 * be blitted at, and cleared past a handful of entries — a window being
 * dragged wider walks through every width on the way.
 */
export function groundSheet(width: number, height: number, dpr: number): HTMLCanvasElement {
  const w = Math.max(1, Math.round(width * dpr));
  const h = Math.max(1, Math.round(height * dpr));
  const key = `${w}x${h}`;
  const held = sheets.get(key);
  if (held) return held;
  if (sheets.size > 4) sheets.clear();
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (g) paint(g, w, h);
  sheets.set(key, canvas);
  return canvas;
}

function paint(g: CanvasRenderingContext2D, w: number, h: number): void {
  ground(g, w, h);
  cells(g, w, h);
  veins(g, w, h);
  mottle(g, w, h);
  vignette(g, w, h);
}

/** The meat of it: dark violet at the top where the hull is, near black below. */
function ground(g: CanvasRenderingContext2D, w: number, h: number): void {
  const grad = g.createLinearGradient(0, 0, 0, h);
  for (let i = 0; i < GROUND.length; i++) grad.addColorStop(i / (GROUND.length - 1), GROUND[i]!);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
}

/**
 * The tissue itself: a couple of hundred soft closed contours, overlapping,
 * each a shade off its neighbour. Blobs rather than circles, for the reason
 * every body in this game is one — a circle reads as drawn and a lobed contour
 * reads as grown.
 *
 * **Bucketed by depth, not drawn one at a time.** Every cell in a band gets the
 * same colour, so a band is one `Path2D` of many subpaths and one `fill` —
 * two hundred of each would be two hundred allocations in the frame that first
 * asks for a size, and the picture is identical.
 */
function cells(g: CanvasRenderingContext2D, w: number, h: number): void {
  const count = Math.round(Math.min(200, (w * h) / 3000));
  const bands = 7;
  const d: string[] = Array.from({ length: bands }, () => "");
  for (let i = 0; i < count; i++) {
    const x = hash01(i * 7 + 11) * w;
    const y = hash01(i * 13 + 29) ** 0.7 * h;
    const r = (0.012 + hash01(i * 19 + 3) * 0.05) * Math.min(w, h);
    const band = Math.min(bands - 1, Math.floor((y / h) * bands));
    d[band] += blobPath(
      x,
      y,
      r,
      r * (0.62 + hash01(i * 37 + 9) * 0.5),
      5,
      0.16,
      0.1,
      0,
      i * 3 + 1,
      16,
    );
  }
  for (let band = 0; band < bands; band++) {
    if (!d[band]) continue;
    // Nearer the seam they catch the light; deeper down they are only mass.
    const lift = (1 - (band + 0.5) / bands) * 0.42 + 0.04;
    g.fillStyle = `rgba(${Math.round(96 + 70 * lift)},${Math.round(56 + 40 * lift)},${Math.round(180 + 60 * lift)},${(0.026 + lift * 0.036).toFixed(3)})`;
    g.fill(new Path2D(d[band] as string));
  }
}

/**
 * Veins, running down out of the seam and fading before the floor.
 *
 * They are what makes the panel read as *connected* to the ship rather than
 * as a surface with a texture on it: everything the pair presses down here is
 * fed from the hull above. Three weights, three paths, three strokes — the
 * same bargain the cells make.
 */
function veins(g: CanvasRenderingContext2D, w: number, h: number): void {
  const count = Math.round(Math.min(16, w / 58));
  const weights = 3;
  const paths = Array.from({ length: weights }, () => new Path2D());
  const bright = new Path2D();
  for (let i = 0; i < count; i++) {
    const x = ((i + 0.5) / count + (hash01(i * 41 + 17) - 0.5) * 0.7) * w;
    const drop = (0.22 + hash01(i * 53 + 23) * 0.42) * h;
    const sway = (hash01(i * 59 + 7) - 0.5) * w * 0.16;
    const weight = Math.min(weights - 1, Math.floor(hash01(i * 67 + 13) * weights));
    for (const path of hash01(i * 71 + 3) > 0.55
      ? [paths[weight] as Path2D, bright]
      : [paths[weight] as Path2D]) {
      path.moveTo(x, -h * 0.02);
      path.bezierCurveTo(x + sway, drop * 0.4, x - sway, drop * 0.7, x + sway * 0.4, drop);
    }
  }
  const grad = g.createLinearGradient(0, 0, 0, h * 0.9);
  grad.addColorStop(0, "rgba(168,102,248,0.16)");
  grad.addColorStop(0.45, "rgba(132,78,222,0.06)");
  grad.addColorStop(1, "rgba(112,66,192,0)");
  g.lineCap = "round";
  g.strokeStyle = grad;
  for (let i = 0; i < weights; i++) {
    g.lineWidth = (0.9 + i * 1.3) * Math.max(1, w / 400);
    g.stroke(paths[i] as Path2D);
  }
  // A thread of light down the middle of the thicker ones.
  g.strokeStyle = "rgba(226,190,255,0.06)";
  g.lineWidth = Math.max(0.6, w / 900);
  g.stroke(bright);
}

/**
 * The wet film on top of everything: broad, very faint patches that break the
 * gradient up so the ground never reads as a printed sheet. One gradient,
 * moved — every patch is the same soft disc at a different place and size.
 */
function mottle(g: CanvasRenderingContext2D, w: number, h: number): void {
  const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  grad.addColorStop(0, "rgba(116,68,206,0.03)");
  grad.addColorStop(1, "rgba(116,68,206,0)");
  g.globalCompositeOperation = "lighter";
  g.fillStyle = grad;
  for (let i = 0; i < 16; i++) {
    const r = (0.08 + hash01(i * 97 + 5) * 0.22) * w;
    g.save();
    g.translate(hash01(i * 83 + 19) * w, hash01(i * 89 + 31) * h);
    g.scale(r, r);
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  }
  g.globalCompositeOperation = "source-over";
}

/** The corners fall away, so the panel has a body rather than an edge. */
function vignette(g: CanvasRenderingContext2D, w: number, h: number): void {
  const grad = g.createLinearGradient(0, h * 0.45, 0, h);
  grad.addColorStop(0, "rgba(4,2,10,0)");
  grad.addColorStop(1, "rgba(3,1,8,0.72)");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  const sides = g.createLinearGradient(0, 0, w, 0);
  sides.addColorStop(0, "rgba(3,1,8,0.6)");
  sides.addColorStop(0.13, "rgba(3,1,8,0)");
  sides.addColorStop(0.87, "rgba(3,1,8,0)");
  sides.addColorStop(1, "rgba(3,1,8,0.6)");
  g.fillStyle = sides;
  g.fillRect(0, 0, w, h);
}

/**
 * The sheet, put down under the panel — one clip and one blit, whatever is in
 * the picture. `top` is the highest the seam reaches, so the sheet covers
 * every part of the panel the membrane above it can expose.
 */
export function drawBandGround(ctx: CanvasRenderingContext2D, l: Layout, top: number): void {
  const height = l.bandTop + l.bandHeight - top;
  ctx.drawImage(groundSheet(l.width, height, l.dpr), 0, top, l.width, height);
}
