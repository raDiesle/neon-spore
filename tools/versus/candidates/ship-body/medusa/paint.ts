import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { bloom, dither, innerLight } from "../../../../../packages/render/src/sheen.js";

/**
 * MEDUSA's skin and chamber: the jellyfish the ship already is, **all the way**.
 *
 * The shipped hull is a bell with a film on it. This keeps the film's light and
 * puts the bell's anatomy under it: radial canals fanning out from the middle
 * of the bell, a gastric pouch that pulses on a long breath, and the
 * bioluminescence the ship already has. The chamber is the bell's underside —
 * oral arms, long frilled ribbons hanging the whole height of the panel, which
 * is what a jellyfish keeps under its bell.
 *
 * The least different of the four, on purpose: the card that says the ship was
 * right and only ever needed its insides.
 *
 * A concept card, shot once: rough by design, and polished only if chosen.
 */

const CANALS = 9;

/** Radial canals: thin bright channels fanning from the bell's centre out to
 * the rim, each a shallow curve. */
function canals(s: SheenPass): void {
  const { ctx, l, skinY, skin } = s;
  const cx = l.gridLeft + l.gridWidth * 0.5;
  const cy = skinY(cx) + l.tile * 1.4;
  let d = "";
  for (let i = 0; i < CANALS; i++) {
    const u = (i + 0.5) / CANALS;
    const ex = l.gridLeft + l.gridWidth * u;
    const ey = skinY(ex) + l.tile * 0.12;
    const pts: Point[] = [];
    for (let k = 0; k <= 6; k++) {
      const p = k / 6;
      pts.push({
        x: cx + (ex - cx) * p + Math.sin(p * Math.PI) * (u - 0.5) * l.tile * 0.6,
        y: cy + (ey - cy) * p ** 0.8,
      });
    }
    d += openSmoothPath(pts);
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.edge, 0.12);
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.stroke(new Path2D(d));
  ctx.strokeStyle = rgba(skin.edge, 0.22);
  ctx.lineWidth = Math.max(0.5, l.tile * 0.016);
  ctx.stroke(new Path2D(d));
}

/** The gastric pouch: one soft body in the middle of the bell, breathing over
 * four seconds. */
function pouch(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  const cx = l.gridLeft + l.gridWidth * 0.5;
  const breathe = 0.5 + 0.5 * Math.sin(time * 1.5);
  const y = skinY(cx) + l.tile * (0.95 + 0.1 * breathe);
  const r = l.tile * (0.55 + 0.12 * breathe);
  halo(ctx, cx, y, r * 2.2, skin.body[0], 0.1 + 0.08 * breathe);
  ctx.strokeStyle = rgba(skin.edge, 0.18);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.02);
  ctx.beginPath();
  ctx.ellipse(cx, y, r * 1.5, r * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();
}

export function bell(s: SheenPass): void {
  const { ctx, l, time, body, filled, skinY } = s;
  bloom(ctx, l, time, skinY);
  canals(s);
  pouch(s);
  innerLight(ctx, body);
  dither(ctx, filled);
}

/** The chamber: oral arms — long frilled ribbons hanging the whole height. */
export function arms(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const base = g.createLinearGradient(0, 0, 0, h);
  skin.ground.forEach((c, i) => {
    base.addColorStop(i / 3, c);
  });
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const count = Math.round(Math.min(11, w / 70));
  for (let i = 0; i < count; i++) {
    const x0 = w * ((i + 0.5) / count + ((hash01(i * 17 + 3) - 0.5) * 0.4) / count);
    const width = w * (0.02 + hash01(i * 23 + 7) * 0.025);
    const left: Point[] = [];
    const right: Point[] = [];
    for (let k = 0; k <= 14; k++) {
      const p = k / 14;
      const y = -h * 0.02 + h * 1.04 * p;
      const wave = Math.sin(p * 9 + i * 1.7) * width * 0.9 + Math.sin(p * 23 + i) * width * 0.35;
      const drift = Math.sin(p * 2.6 + i * 0.8) * w * 0.03;
      const wd = width * (1 - p * 0.5);
      left.push({ x: x0 + drift + wave - wd, y });
      right.push({ x: x0 + drift + wave + wd, y });
    }
    right.reverse();
    const ribbon = new Path2D(`${openSmoothPath([...left, ...right])} Z`);
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, rgba(skin.flesh[0], 0.4));
    grad.addColorStop(1, rgba(skin.flesh[2], 0.1));
    g.fillStyle = grad;
    g.fill(ribbon);
    g.strokeStyle = rgba(skin.rim, 0.12);
    g.lineWidth = Math.max(0.6, w / 600);
    g.stroke(ribbon);
  }
  const floor = skin.ground[3];
  const v = g.createLinearGradient(0, h * 0.55, 0, h);
  v.addColorStop(0, rgba(floor, 0));
  v.addColorStop(1, rgba(floor, 0.75));
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
}
