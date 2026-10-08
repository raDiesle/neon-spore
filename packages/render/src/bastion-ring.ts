import { type BastionState, type BastionStep, bastionGunAngle, type Color } from "@neon-spore/sim";
import { type At, bastionGunAt, RING_DROP, RING_TILT } from "./bastion-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE BASTION's gun ring** (§11.62): a dark bronze band round the moon's
 * middle, lit along its length by amber running lights, with a turret on it
 * for every gun — a dome, a lens in the colour that kills it, and a barrel
 * pointing out. It is drawn in two halves, the far one before the moon and
 * the near one after, so the guns go round the back and come round again as
 * the pilot turns the rim.
 *
 * **The gun at the front is the one a shot meets**, so it is the one lit
 * hardest: its lens burns and breathes on the beat. A gun blown is a
 * scorched stump on the band, its lens out.
 */

/** A gun as the ring draws it. */
interface Gun extends At {
  depth: number;
  colour: Color;
  gone: boolean;
  front: boolean;
  /** Its angle round the ring from the front, in radians. */
  a: number;
}

/** Running lights along the band, and the band's height in tiles. */
const LIGHTS = 16;
const BAND = 0.38;

/** The ring's guns where they stand this frame; `lit` says whether it is the shell lit. */
export function bastionGuns(
  l: Layout,
  c: At,
  s: BastionState,
  step: BastionStep,
  lit: boolean,
  front: number,
): Gun[] {
  const colours = step.colors ?? [];
  return colours.map((colour, i) => {
    const angleMilli = bastionGunAngle(s, i, colours.length);
    const at = bastionGunAt(l, c, angleMilli);
    const gone = lit && (s.goneMask & (1 << i)) !== 0;
    const a = (angleMilli / 1000) * (Math.PI / 180);
    return { ...at, colour, gone, front: lit && i === front, a };
  });
}

/** The far half of the band and the guns behind the moon. */
export function drawRingBack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  guns: readonly Gun[],
  yaw: number,
  pulse: number,
): void {
  drawBand(ctx, l, c, yaw, Math.PI, Math.PI * 2, 0.55);
  for (const g of guns) if (g.depth < 0) drawGun(ctx, l, g, pulse, 0.5);
}

/** The near half of the band and the guns in front of the moon. */
export function drawRingFront(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  guns: readonly Gun[],
  yaw: number,
  pulse: number,
): void {
  drawBand(ctx, l, c, yaw, 0, Math.PI, 1);
  const near = guns.filter((g) => g.depth >= 0).sort((a, b) => a.depth - b.depth);
  for (const g of near) drawGun(ctx, l, g, pulse, 1);
}

function drawBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  yaw: number,
  from: number,
  to: number,
  fade: number,
): void {
  const r = bandRadius(l);
  const y = c.y + RING_DROP * l.tile;
  const h = BAND * l.tile;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.lineWidth = h;
  ctx.strokeStyle = PALETTE.bastionBand;
  ctx.beginPath();
  ctx.ellipse(c.x, y, r, r * RING_TILT, 0, from, to);
  ctx.stroke();
  // Its lit upper edge and its shadowed lower one.
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.bastionEdge, 0.7);
  ctx.beginPath();
  ctx.ellipse(c.x, y - h / 2, r, r * RING_TILT, 0, from, to);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.bastionArmourDark;
  ctx.beginPath();
  ctx.ellipse(c.x, y + h / 2, r, r * RING_TILT, 0, from, to);
  ctx.stroke();
  // The running lights turn with the guns.
  ctx.fillStyle = PALETTE.bastionLight;
  for (let k = 0; k < LIGHTS; k++) {
    const a = yaw + (k * Math.PI * 2) / LIGHTS;
    const inside = from === 0 ? Math.cos(a) >= 0 : Math.cos(a) < 0;
    if (!inside) continue;
    const x = c.x + Math.sin(a) * r;
    const ly = y + Math.cos(a) * r * RING_TILT;
    const size = l.tile * 0.05 * (1 + 0.5 * Math.abs(Math.cos(a)));
    ctx.fillRect(x - size, ly - size / 2, size * 2, size);
  }
  ctx.restore();
}

function bandRadius(l: Layout): number {
  return bastionGunAt(l, { x: 0, y: 0 }, 90_000).x;
}

function drawGun(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  g: Gun,
  pulse: number,
  fade: number,
): void {
  const size = l.tile * (1.0 + 0.3 * g.depth);
  const hex = g.colour === "red" ? PALETTE.red : PALETTE.cyan;
  ctx.save();
  ctx.globalAlpha = fade;
  // The barrel, pointing out from the moon along the ring.
  const dx = Math.sin(g.a);
  const dy = Math.cos(g.a) * RING_TILT + 0.55;
  const len = Math.hypot(dx, dy);
  if (!g.gone) {
    ctx.lineCap = "round";
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = PALETTE.bastionArmourDark;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + (dx / len) * size * 0.62, g.y + (dy / len) * size * 0.62);
    ctx.stroke();
    ctx.lineWidth = size * 0.07;
    ctx.strokeStyle = PALETTE.bastionArmour;
    ctx.stroke();
    ctx.lineCap = "butt";
  }
  const dome = new Path2D();
  dome.ellipse(g.x, g.y, size * 0.3, size * 0.22, 0, Math.PI, Math.PI * 2);
  dome.lineTo(g.x + size * 0.34, g.y + size * 0.06);
  dome.lineTo(g.x - size * 0.34, g.y + size * 0.06);
  dome.closePath();
  ctx.fillStyle = g.gone ? "#000" : PALETTE.bastionArmour;
  ctx.fill(dome);
  strokeGlowFaded(
    ctx,
    dome,
    g.gone ? PALETTE.bastionLight : PALETTE.bastionEdge,
    STROKE.inner,
    0.6,
  );
  if (!g.gone) {
    const lens = new Path2D();
    lens.arc(g.x, g.y - size * 0.08, size * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.fill(lens);
    if (g.front) {
      halo(ctx, g.x, g.y, size * (0.9 + 0.4 * pulse), hex, 0.9 * fade);
      strokeGlowFaded(ctx, dome, hex, STROKE.outline, 1.4 + pulse);
    }
  }
  ctx.restore();
}
