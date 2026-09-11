import { openSmoothPath, type Point } from "../../packages/content/src/index.js";
import { hash01 } from "../../packages/render/src/backdrop.js";
import type { BandAttach } from "../../packages/render/src/band-join.js";
import { rgba } from "../../packages/render/src/hex.js";
import type { HullSkin } from "../../packages/render/src/hull.js";
import type { SheenPass } from "../../packages/render/src/hull-sheen.js";
import type { Layout } from "../../packages/render/src/layout.js";
import { sweep } from "../../packages/render/src/sheen.js";
import { sameLight } from "./join.js";
import { tube } from "./tube.js";

/**
 * WET SKIN — the ship as a clear, light-reflecting surface, with **no grain**.
 *
 * The owner, on the `ship:body` cards of 11 September 2026: *I don't like the
 * sand-like lighting and gradient … completely remove it from the ship and
 * have full fluid and plasma-like, light-reflecting clear surfaces like the
 * skin of the aliens in the Alien films … keep the clear colours of the
 * current control panel, but have it for the top skin of the hull as well —
 * all the same style.* The sand is `dither` — the noise the shipped membrane
 * lays over its gradient so it never bands — and every pass here is written
 * without it: the surface is smooth, and what says *wet* is a crisp specular
 * line just under the rim, a few elongated reflections sliding along the
 * crown, and ridges each carrying a shadow and a highlight the way a wet fold
 * of skin does.
 *
 * The ridges are MEDUSA's canals, moved to where he asked for them: *not the
 * small centred thin lines above — start them from the very top of the hull.*
 * A rib starts above the crown (the hull's own clip trims it to the rim, so
 * its first visible pixel is the edge of the ship) and runs down through the
 * hull and on through the chamber; `ribLine` maps x from **absolute y**, so
 * the hull pass and the chamber pass draw the same curve and nothing has to
 * meet at the membrane.
 */

/** One ridge: where it leaves the crown, which way it leans, and its own wobble. */
export interface Rib {
  readonly x0: number;
  readonly lean: number;
  readonly seed: number;
}

/** A set of ribs spread across the width, each with its own lean and phase. */
export function ribs(n: number, seed: number): Rib[] {
  const out: Rib[] = [];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n + (hash01(seed + i * 7) - 0.5) * (0.5 / n);
    out.push({
      x0: u,
      lean: (u - 0.5) * 1.2 + (hash01(seed + i * 11 + 3) - 0.5) * 0.6,
      seed: seed + i * 2.7,
    });
  }
  return out;
}

/**
 * The course of a rib between two heights. x is a function of y measured from
 * the hull's apex in tiles, so any two passes drawing it agree to the pixel.
 */
export function ribLine(l: Layout, rib: Rib, top: number, bottom: number, time: number): Point[] {
  const x0 = l.gridLeft + l.gridWidth * rib.x0;
  const pts: Point[] = [];
  const steps = 14;
  for (let k = 0; k <= steps; k++) {
    const y = top + ((bottom - top) * k) / steps;
    const h = Math.max(0, (y - l.hullY) / l.tile);
    const settle = Math.min(1, h / 2);
    pts.push({
      x:
        x0 +
        rib.lean * h * l.tile * 0.1 +
        Math.sin(h * 0.9 + rib.seed + time * 0.15) * l.tile * 0.26 * settle +
        Math.sin(h * 2.1 + rib.seed * 2) * l.tile * 0.05,
      y,
    });
  }
  return pts;
}

/** A wet ridge: its shadow, then its highlight, offset against each other so
 * the ridge stands up off the surface rather than lying on it as a line. */
export function ridges(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  lines: readonly Point[][],
  dark: string,
  light: string,
  weight = 1,
): void {
  let d = "";
  for (const pts of lines) d += openSmoothPath(pts);
  const path = new Path2D(d);
  ctx.lineCap = "round";
  ctx.save();
  ctx.translate(l.tile * 0.04, l.tile * 0.05);
  ctx.strokeStyle = rgba(dark, 0.42 * weight);
  ctx.lineWidth = l.tile * 0.11 * weight;
  ctx.stroke(path);
  ctx.restore();
  ctx.save();
  ctx.translate(-l.tile * 0.03, -l.tile * 0.04);
  ctx.strokeStyle = rgba(light, 0.62 * weight);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.028 * weight);
  ctx.stroke(path);
  ctx.restore();
}

/** The reflections: elongated highlights sliding slowly along the crown,
 * each turned to the slope of the skin where it lies. */
function reflections(s: SheenPass, shine: number): void {
  const { ctx, l, time, skinY } = s;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 3; i++) {
    const u = (0.2 + i * 0.37 + time * 0.02 * (1 + i * 0.3)) % 1;
    const x = l.gridLeft + u * l.gridWidth;
    const y = skinY(x) + l.tile * 0.42;
    const slope = (skinY(x + 4) - skinY(x - 4)) / 8;
    const rx = l.tile * (0.7 + 0.4 * (i % 2));
    const ry = l.tile * 0.15;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan(slope));
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(255,250,255,${(0.55 * shine).toFixed(3)})`);
    g.addColorStop(0.5, `rgba(255,250,255,${(0.18 * shine).toFixed(3)})`);
    g.addColorStop(1, "rgba(255,250,255,0)");
    ctx.scale(rx, ry);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalCompositeOperation = "source-over";
}

export interface WetSkin {
  readonly ribs: readonly Rib[];
  /** How hard the light hits: the crisp line under the rim and the reflections. */
  readonly shine: number;
  /** How pale the fluid is where it is thin, just under the skin. */
  readonly clear: number;
}

/** The hull's material: smooth depth, ribs from the crown, a wet rim and the
 * reflections — and no grain anywhere. */
export function wetHull(s: SheenPass, o: WetSkin): void {
  const { ctx, l, time, body, skinY, skin } = s;
  ctx.globalCompositeOperation = "source-over";
  ctx.lineCap = "round";
  // The clear depth: the fluid is palest where it is thinnest, at the skin,
  // as wide soft strokes of the contour in the seat's own pale.
  ctx.strokeStyle = skin.body[0];
  for (const [w, a] of [
    [1.6, 0.14],
    [0.8, 0.16],
    [0.3, 0.24],
  ] as const) {
    ctx.globalAlpha = a * o.clear;
    ctx.lineWidth = l.tile * w;
    ctx.stroke(body);
  }
  ctx.globalAlpha = 1;
  // Each rib leaves the skin itself — a hair under the rim, so its rounded
  // end is the edge of the ship and not a dark bead sitting on it.
  const lines = o.ribs.map((r) =>
    ribLine(l, r, skinY(l.gridLeft + l.gridWidth * r.x0) + l.tile * 0.06, l.bandTop + l.tile, time),
  );
  ridges(ctx, l, lines, skin.body[3], skin.edge, 0.7);
  // The wet rim: one crisp bright line just under the edge, and a softer one
  // a little further in — the highlight a curved wet surface throws back.
  ctx.save();
  ctx.translate(0, l.tile * 0.09);
  ctx.strokeStyle = rgba(skin.edge, 0.6 * o.shine);
  ctx.lineWidth = Math.max(1, l.tile * 0.026);
  ctx.stroke(body);
  ctx.translate(0, l.tile * 0.1);
  ctx.strokeStyle = rgba(skin.rim, 0.16 * o.shine);
  ctx.lineWidth = l.tile * 0.12;
  ctx.stroke(body);
  ctx.restore();
  reflections(s, o.shine);
  sweep(ctx, body, l, time);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

/** The hanging half of a rib: MEDUSA's oral arm, a translucent ribbon that
 * widens under the membrane and tapers out at the bottom of the panel. */
export function ribbons(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  lines: readonly Point[][],
  skin: HullSkin,
  flesh: string,
): void {
  const top = l.bandTop;
  const bottom = l.bandTop + l.bandHeight;
  for (const pts of lines) {
    const first = pts[0] as Point;
    const last = pts[pts.length - 1] as Point;
    const half = (p: number): number => {
      const y = first.y + (last.y - first.y) * p;
      const u = Math.min(1, Math.max(0, (y - top) / (bottom - top)));
      return l.tile * (0.05 + 0.3 * Math.sin(Math.PI * u) ** 0.7);
    };
    const shape = new Path2D(tube(pts, half));
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, rgba(flesh, 0.22));
    g.addColorStop(0.6, rgba(flesh, 0.12));
    g.addColorStop(1, rgba(flesh, 0));
    ctx.fillStyle = g;
    ctx.fill(shape);
    ctx.strokeStyle = rgba(skin.edge, 0.1);
    ctx.lineWidth = Math.max(0.6, l.tile * 0.015);
    ctx.stroke(shape);
  }
}

export interface WetChamber {
  readonly ribs: readonly Rib[];
  /** Whether the ribs hang on as ribbons below the membrane. */
  readonly hang: boolean;
  readonly weight: number;
}

/** The chamber's share of the same skin: the ribs carried on down, as ribbons
 * or as ridges, and then the hull's light without the hull's grain. */
export function wetChamber(d: BandAttach, o: WetChamber): void {
  const { ctx, l, time, skin } = d;
  const top = l.bandTop - l.tile;
  const bottom = l.bandTop + l.bandHeight;
  const lines = o.ribs.map((r) => ribLine(l, r, top, bottom, time));
  if (o.hang) ribbons(ctx, l, lines, skin.hull, skin.flesh[0]);
  ridges(ctx, l, lines, skin.ground[3], skin.rim, o.weight);
  sameLight(d, false);
}
