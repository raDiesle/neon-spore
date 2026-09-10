import { KEY, openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { barrelAcross } from "../../../../../packages/render/src/hull-barrel.js";
import type { HullLit } from "../../../../../packages/render/src/hull-light.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { dither } from "../../../../../packages/render/src/sheen.js";

/**
 * CHITIN's skin and chamber: the ship is a **carapace**, wet, black, and
 * glittering under a hard sun.
 *
 * The owner's own reference: *glittering sun reflecting like in "aliens"
 * movie*. Everything else in this slot is soft and lit from within; this is
 * hard and lit from outside. The hull is plated — dark seams cross it where
 * one plate meets the next — and every plate carries one sharp specular where
 * the sun hits its crown, plus a scatter of pinpoint glints that flicker as the
 * membrane breathes. The chamber is the inside of the shell: ribs, and the
 * same glints on the same wet black.
 *
 * A concept card, shot once: rough by design, and polished only if chosen.
 */

const PLATES = 11;
const GLINTS = 40;

/** The seams between plates, running from the crest down and fading. */
function seams(s: SheenPass): void {
  const { ctx, l, skinY, skin } = s;
  let d = "";
  for (let i = 0; i <= PLATES; i++) {
    const x = l.gridLeft + (l.gridWidth * i) / PLATES + (hash01(i * 13 + 1) - 0.5) * l.tile * 0.3;
    const top = skinY(x);
    const lean = (hash01(i * 17 + 5) - 0.5) * l.tile * 0.6;
    const pts: Point[] = [];
    for (let k = 0; k <= 5; k++) {
      const p = k / 5;
      pts.push({ x: x + lean * p * p, y: top + l.tile * 1.5 * p });
    }
    d += openSmoothPath(pts);
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.body[3], 0.85);
  ctx.lineWidth = Math.max(1.2, l.tile * 0.06);
  ctx.stroke(new Path2D(d));
  ctx.strokeStyle = rgba(skin.edge, 0.12);
  ctx.lineWidth = Math.max(0.5, l.tile * 0.016);
  ctx.save();
  ctx.translate(l.tile * 0.03, 0);
  ctx.stroke(new Path2D(d));
  ctx.restore();
}

/** The sun on every plate's crown: one short, hard, white specular per plate,
 * on the side the key light comes from. */
function suns(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  let d = "";
  for (let i = 0; i < PLATES; i++) {
    const x = l.gridLeft + (l.gridWidth * (i + 0.5)) / PLATES;
    const y = skinY(x) + l.tile * 0.16;
    const len = l.tile * (0.16 + hash01(i * 7 + 3) * 0.14);
    const flick = 0.85 + 0.15 * Math.sin(time * 3.1 + i * 2.7);
    d += `M ${(x + KEY.x * len * flick).toFixed(2)} ${(y + KEY.y * len * 0.4).toFixed(2)} L ${(
      x - KEY.x * len * 0.4
    ).toFixed(2)} ${(y - KEY.y * len * 0.15).toFixed(2)} `;
  }
  const path = new Path2D(d);
  ctx.lineCap = "round";
  strokeGlow(ctx, path, skin.edge, l.tile * 0.16, 0.5);
  ctx.strokeStyle = rgba(skin.edge, 0.9);
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.stroke(path);
}

/** The glitter: pinpoints all over the wet shell, each one flickering on its
 * own clock, most of them off at any moment — a sea of them would be sequins,
 * a few is sunlight on something wet. */
function glints(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  ctx.fillStyle = rgba(skin.edge, 0.9);
  for (let i = 0; i < GLINTS; i++) {
    const x = l.gridLeft + l.gridWidth * hash01(i * 19 + 7);
    const y = skinY(x) + l.tile * (0.1 + hash01(i * 23 + 11) * 1.3);
    const on = Math.sin(time * (1.5 + hash01(i * 29 + 1) * 3) + i * 1.9);
    if (on < 0.75) continue;
    const r = l.tile * 0.03 * (on - 0.75) * 4;
    ctx.beginPath();
    ctx.moveTo(x - r * 3, y);
    ctx.lineTo(x, y - r);
    ctx.lineTo(x + r * 3, y);
    ctx.lineTo(x, y + r);
    ctx.closePath();
    ctx.fill();
  }
}

export function carapace(s: SheenPass): void {
  seams(s);
  suns(s);
  glints(s);
  dither(s.ctx, s.filled);
}

/** The light: the ship's own across its width, harder — no glow from inside a
 * shell, and the terminator sharper by a second pass of the same ramp. */
export function hardLight(ctx: CanvasRenderingContext2D, s: HullLit): void {
  barrelAcross(ctx, s.region, s.x, s.w, s.half);
  barrelAcross(ctx, s.region, s.x, s.w, "value");
}

/** The chamber: the inside of the shell — ribs, and glints on wet black. */
export function shell(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const base = g.createLinearGradient(0, 0, 0, h);
  skin.ground.forEach((c, i) => {
    base.addColorStop(i / 3, c);
  });
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const ribs = Math.round(Math.min(9, w / 60));
  g.lineCap = "round";
  for (let i = 0; i < ribs; i++) {
    const x = w * ((i + 0.5) / ribs);
    const pts: Point[] = [];
    for (let k = 0; k <= 8; k++) {
      const p = k / 8;
      pts.push({ x: x + Math.sin(p * 2.4 + i) * w * 0.02 * (x < w / 2 ? -1 : 1) * p, y: h * p });
    }
    const rib = new Path2D(openSmoothPath(pts));
    g.strokeStyle = rgba(skin.ground[3], 0.9);
    g.lineWidth = Math.max(6, w * 0.03);
    g.stroke(rib);
    g.strokeStyle = rgba(skin.flesh[0], 0.16);
    g.lineWidth = Math.max(1, w * 0.004);
    g.save();
    g.translate(-w * 0.008, 0);
    g.stroke(rib);
    g.restore();
  }
  g.fillStyle = rgba(skin.rim, 0.7);
  for (let i = 0; i < 40; i++) {
    const x = hash01(i * 31 + 5) * w;
    const y = hash01(i * 37 + 9) * h;
    const r = (0.002 + hash01(i * 41 + 3) * 0.004) * w;
    g.beginPath();
    g.moveTo(x - r * 3, y);
    g.lineTo(x, y - r);
    g.lineTo(x + r * 3, y);
    g.lineTo(x, y + r);
    g.closePath();
    g.fill();
  }
  const floor = skin.ground[3];
  const v = g.createLinearGradient(0, h * 0.5, 0, h);
  v.addColorStop(0, rgba(floor, 0));
  v.addColorStop(1, rgba(floor, 0.8));
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
}
