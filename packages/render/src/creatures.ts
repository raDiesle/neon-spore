import { BULB, blobPath, crystalPath, METEOR, SLICK } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * Creature silhouettes come from `legacy/style-guide.html` by way of
 * `content/shapes.ts`: one blob contour per kind, tuned by lobes, depth and
 * wobble. The wobble is time-based, so a creature is never quite still.
 *
 * On top of the contour sits the own-motion the raster prototype gives each
 * kind. Spec 5.8 is strict about what it may touch: **nothing**. The bulb
 * sways and pumps, the slick tilts and ripples, but neither ever leaves its
 * column, so the lane stays exactly readable while the picture stays alive.
 */
export function drawCreatures(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  creatures: readonly Creature[],
  beatPhase: number,
  time: number,
  blocked: ReadonlyMap<number, number>,
): void {
  for (const c of creatures) {
    // One tile per beat, linear. No easing: the movement must read as an even
    // glide so that "it lands on the four" is a statement both players can act on.
    const row = c.fromRow + (c.row - c.fromRow) * beatPhase;
    const x = tileCX(l, c.col);
    const y = tileCY(l, row);
    if (c.kind === "meteor") drawMeteor(ctx, l, c, x, y, time);
    else drawLiving(ctx, l, c, x, y, time, blocked.get(c.id) ?? 0);
  }
}

function drawLiving(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
  blocked: number,
): void {
  const isBulb = c.kind === "bulb";
  const shape = isBulb ? BULB : SLICK;
  const rim = c.color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const hex = c.color === "red" ? PALETTE.red : PALETTE.cyan;
  const dark = c.color === "red" ? PALETTE.redDark : PALETTE.cyanDark;

  // Variation without randomness in the simulation: the id is deterministic on
  // both devices, so two screens shake the same creature the same way.
  const phase = (c.id % 7) * 0.9;
  const t = time + phase;
  const r = l.tile * 0.4;
  const scale = r / Math.max(shape.rx, shape.ry);

  let ox = 0;
  let oy = 0;
  let rot = 0;
  let sx = 1;
  let sy = 1;
  if (isBulb) {
    ox = Math.sin(t * 1.9) * l.tile * 0.17;
    const pump = Math.sin(t * 3.1);
    sx = 1 + pump * 0.1;
    sy = 1 - pump * 0.1;
    rot = Math.sin(t * 1.9) * 0.18;
  } else {
    ox = Math.sin(t * 1.35) * l.tile * 0.11;
    oy = Math.sin(t * 2.2) * l.tile * 0.05;
    rot = Math.sin(t * 1.35 + 0.5) * 0.22;
    sx = 1 + Math.sin(t * 2.2) * 0.09;
  }

  const d = blobPath(
    0,
    0,
    shape.rx,
    shape.ry,
    shape.lobes,
    shape.depth,
    shape.wobble,
    t,
    shape.seed,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x + ox, y + oy);
  ctx.rotate(rot);
  ctx.scale(scale * sx, scale * sy);

  if (blocked > 0) {
    // Wrong colour: no resonance, so the light organ stays shut. Grey outline
    // only — the shot is spent and the creature keeps coming.
    ctx.strokeStyle = PALETTE.sparkDim;
    ctx.lineWidth = 2 / scale;
    ctx.stroke(path);
  } else {
    ctx.fillStyle = dark;
    ctx.fill(path);
    strokeGlow(ctx, path, hex, Math.max(1, r * 0.1) / scale, 1);
    drawDetails(ctx, isBulb, shape.rx, shape.ry, rim, hex);
  }
  ctx.restore();

  if (blocked <= 0) halo(ctx, x + ox, y + oy, r * 1.9, hex, 0.16);
}

/** Core and trailing filaments. Inner drawing is thinner than the outline
 * (docs/spec/graphics.md). */
function drawDetails(
  ctx: CanvasRenderingContext2D,
  isBulb: boolean,
  rx: number,
  ry: number,
  rim: string,
  hex: string,
): void {
  ctx.fillStyle = rim;
  if (isBulb) {
    ctx.beginPath();
    ctx.arc(0, ry * 0.3, ry * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hex;
    ctx.lineWidth = Math.max(0.6, ry * 0.035);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.28, -ry * 0.4);
    ctx.quadraticCurveTo(-rx * 0.39, -ry * 0.68, -rx * 0.22, -ry * 0.9);
    ctx.moveTo(rx * 0.28, -ry * 0.4);
    ctx.quadraticCurveTo(rx * 0.39, -ry * 0.68, rx * 0.22, -ry * 0.9);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  ctx.beginPath();
  ctx.arc(-rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The rock. Angular facets rather than a contour, because it does not live —
 * that is the fiction the indestructibility rests on (docs/spec/graphics.md). Craters from
 * shots are placed from the creature id, so both screens agree without the
 * simulation having to store an angle per hole.
 */
function drawMeteor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const r = l.tile * 0.4;
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;
  const d = crystalPath(
    0,
    0,
    r,
    r,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.rotate(spin + time * 0.12);

  const rg = ctx.createLinearGradient(-r, -r, r, r);
  rg.addColorStop(0, "#9DA3B0");
  rg.addColorStop(0.55, "#6B707E");
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(path);

  for (let k = 0; k < c.holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (c.id % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + c.id) % 10) / 28;
    const hx = Math.cos(a) * r * dist;
    const hy = Math.sin(a) * r * dist;
    ctx.fillStyle = "#17181D";
    ctx.beginPath();
    ctx.arc(hx, hy, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(199,203,214,.5)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
  halo(ctx, x + wobble, y, r * 1.6, PALETTE.rock, 0.1);
}
