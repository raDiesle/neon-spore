import { blobPath, openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { BandAttach } from "../../../../../packages/render/src/band-join.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { tileCX } from "../../../../../packages/render/src/layout.js";
import type { LobeDraw } from "../../../../../packages/render/src/lobe-look.js";
import type { PanelPlan } from "../../../../../packages/render/src/panel-plan.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import type { StripDraw } from "../../../../../packages/render/src/strip-look.js";
import { sameLight, sky } from "../../../join.js";

/**
 * EMBEDDED's panel: there is no panel.
 *
 * The lower screen is the ship's own body, and the controls are *in* it. A
 * button is a pore — a depression in the flesh with the flesh ringed around
 * it, no socket and no plate. The rail is a lit spine running through the
 * body, its stations the nodes on it, the column held a swollen node. The
 * buttons stand in the corners where the thumbs are, not in a row in the
 * middle. It is the first card in this slot that changes the basis rather
 * than the skin, and it exists because the owner said every ship so far
 * looked the same from its basis.
 */

/** The arrangement: the buttons out at the thumbs, the rail a little lower
 * than the shipped strip so the spine runs through the body's middle. */
export const CORNERS: PanelPlan["solo"] = [
  { centre: 0.5, maxPitch: 0.58, share: 1 },
  { centre: 0.5, maxPitch: 0.58, share: 1 },
];
export const CORNERS_TEST: PanelPlan["test"] = [
  { centre: 0.24, maxPitch: 0.26, share: 0.48 },
  { centre: 0.74, maxPitch: 0.26, share: 0.48 },
];
export const ROWS: Pick<PanelPlan, "lobeRow" | "cannonRow" | "shieldRow"> = {
  cannonRow: [0.3, 0.22],
  shieldRow: [0.3, 0.5],
  lobeRow: [0.74, 0.8],
};

/** How many rings of flesh circle a pore, and how far out they reach in radii. */
const RINGS = 3;
const REACH = 2.1;

/** A pore: the flesh ringed round a depression. Under the face. */
export function pore(d: LobeDraw): void {
  const { ctx, x, y, r, skin } = d;
  for (let k = RINGS; k >= 1; k--) {
    const rr = r * (1.1 + ((REACH - 1.1) * k) / RINGS);
    const ring = new Path2D(blobPath(x, y, rr, rr * 0.9, 5, 0.06, 0.03, 0, k * 7 + 3, 40));
    ctx.strokeStyle = rgba(skin.hull.body[3], 0.35);
    ctx.lineWidth = Math.max(2, r * 0.16);
    ctx.save();
    ctx.translate(0, r * 0.06);
    ctx.stroke(ring);
    ctx.restore();
    ctx.strokeStyle = rgba(skin.flesh[0], 0.1 + 0.06 * (RINGS - k));
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.stroke(ring);
  }
  const dip = ctx.createRadialGradient(x, y + r * 0.1, r * 0.3, x, y, r * 1.25);
  dip.addColorStop(0, rgba(skin.ground[3], 0.75));
  dip.addColorStop(1, rgba(skin.ground[3], 0));
  ctx.fillStyle = dip;
  ctx.fillRect(x - r * 1.3, y - r * 1.3, r * 2.6, r * 2.6);
}

/** Over the face: one wet arc, up and to the side, never a ring. */
export function wet(d: LobeDraw): void {
  const { ctx, x, y, r, skin } = d;
  const arc = new Path2D();
  arc.ellipse(x, y, r * 0.86, r * 0.86, 0, Math.PI * 1.1, Math.PI * 1.5);
  ctx.strokeStyle = rgba(skin.rim, 0.32);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.lineCap = "round";
  ctx.stroke(arc);
}

/** The spine: the rail as a lit cord through the flesh, a node per column and
 * a swollen node on the column held. */
export function spine(d: StripDraw): void {
  const { ctx, l, y, h, col, hex, label, skin } = d;
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.85;
  ctx.fillText(label, l.width / 2, y - h / 2 - 5);
  ctx.globalAlpha = 1;
  const pts: Point[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    pts.push({
      x: l.gridLeft - l.tile * 0.4 + (l.gridWidth + l.tile * 0.8) * u,
      y: y + Math.sin(u * 5.3 + 1.1) * h * 0.14 + Math.sin(u * 12.7) * h * 0.05,
    });
  }
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
    const at = pts[Math.round(((x - (pts[0] as Point).x) / (l.gridWidth + l.tile * 0.8)) * 24)] ?? {
      x,
      y,
    };
    ctx.fillStyle = rgba(hex, 0.45);
    ctx.beginPath();
    ctx.arc(x, at.y, Math.max(1.5, h * 0.09), 0, Math.PI * 2);
    ctx.fill();
  }
  const kx = tileCX(l, col);
  const ky = (
    pts[Math.round(((kx - (pts[0] as Point).x) / (l.gridWidth + l.tile * 0.8)) * 24)] ?? { y }
  ).y;
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

/** The body's own folds, continued from the hull down through the chamber,
 * and then the hull's light — so the lower screen is one flesh. */
export function flesh(d: BandAttach): void {
  const { ctx, l, time, skin } = d;
  const top = sky(l);
  const bottom = l.bandTop + l.bandHeight;
  let folds = "";
  let lit = "";
  const n = 7;
  for (let i = 0; i < n; i++) {
    const y0 = top + ((bottom - top) * (i + 0.6)) / (n + 0.4);
    const pts: Point[] = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10;
      pts.push({
        x: -l.tile + (l.width + l.tile * 2) * u,
        y:
          y0 +
          Math.sin(u * 4.1 + i * 1.3 + time * 0.12) * l.tile * 0.35 +
          Math.sin(u * 9.3 + i * 0.7) * l.tile * 0.12 +
          (hash01(i * 13 + 1) - 0.5) * l.tile * 0.3,
      });
    }
    folds += openSmoothPath(pts);
    lit += openSmoothPath(pts.map((p) => ({ x: p.x, y: p.y - l.tile * 0.16 })));
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.hull.body[3], 0.5);
  ctx.lineWidth = l.tile * 0.34;
  ctx.stroke(new Path2D(folds));
  ctx.strokeStyle = rgba(skin.flesh[0], 0.16);
  ctx.lineWidth = Math.max(1, l.tile * 0.04);
  ctx.stroke(new Path2D(lit));
  sameLight(d);
}

/** The chamber's ground: the body's own deep flesh, no cells and no veins —
 * the folds are drawn live over it. */
export function body(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const base = g.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, skin.ground[0]);
  base.addColorStop(0.5, skin.ground[1]);
  base.addColorStop(1, skin.ground[2]);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const sides = g.createLinearGradient(0, 0, w, 0);
  sides.addColorStop(0, rgba(skin.ground[3], 0.5));
  sides.addColorStop(0.2, rgba(skin.ground[3], 0));
  sides.addColorStop(0.8, rgba(skin.ground[3], 0));
  sides.addColorStop(1, rgba(skin.ground[3], 0.5));
  g.fillStyle = sides;
  g.fillRect(0, 0, w, h);
}
