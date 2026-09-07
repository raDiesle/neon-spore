import type { Bullet } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { signedHash } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A lance in flight: not a dot with a tail behind it, but a length of the
 * column that is briefly alive.
 *
 * **Why it is not a `ShotLook`.** Everything an ordinary shot is made of fits
 * in that record — a straight tail, a halo, a core, a ring — because an
 * ordinary shot is a bright point moving fast enough that its own shape does
 * not matter. This one crosses the field at half that speed with three beats
 * of holding behind it, and the owner asked for it to be *more spectaculous,
 * in the colour of the cannon shot*: a record of five numbers has no way to be
 * that, and a candidate slot for how a bolt reads must not be able to move the
 * thing that bolt has to be told apart from (`bullets.ts`).
 *
 * **Fluid rather than drawn.** The body is a ribbon whose two edges waver in
 * opposite phases, so the beam swells and pinches along its length like
 * something being squeezed through the column rather than a stroke of a pen.
 * Three nodules ride inside it, spaced along the tail and moving with it.
 *
 * **The wave is a function of where the shot is**, never of a clock. A bullet
 * knows its own row and how far it has come towards the next one, and both
 * devices agree about both to the thousandth — so the ripple travels down the
 * beam because the beam is travelling, and nothing here needs a `time` that
 * two phones would disagree about.
 */

/** How far back down the column the beam reaches, in tiles. */
const LENGTH = 3.4;
/** Half the beam's width at its fattest, as a share of a tile. */
const WIDTH = 0.19;
/** Vertices along one edge. Enough for a curve, few enough to cost nothing. */
const STEPS = 12;

/** How wide the ribbon is `f` of the way from the head to the tail, 0..1. */
function girth(f: number, phase: number, side: number): number {
  // Fat just behind the head and drawn out to nothing at the tail — the shape
  // a drop of something falling upwards takes.
  const body = Math.sin(Math.min(1, f * 1.35) * Math.PI) ** 0.7;
  // And a slow swell travelling down it, opposite on the two edges, which is
  // what makes it read as fluid rather than as a shape with a wobbly outline.
  const swell = 1 + 0.34 * Math.sin(f * 7.4 - phase * 6.283 + (side > 0 ? 0 : 1.9));
  return body * swell;
}

/**
 * One lance, from its head at `(x, y)` down the path it came along.
 *
 * `ax` and `ay` are one tile of that path as a unit vector — straight down the
 * column for every lance in the game, and across it for one that has turned
 * the corner of a lock (`sim/lock.ts`). The beam is laid along the leg it is
 * actually on, for the reason the ordinary tail is.
 */
export function drawLanceBeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  b: Bullet,
  x: number,
  y: number,
  ax: number,
  ay: number,
): void {
  const hex = b.color === "red" ? PALETTE.red : PALETTE.cyan;
  const core = mixHex(hex, "#FFFFFF", 0.72);
  const tile = l.tile;
  const phase = (b.row + 1 - b.subMilli / 1000) * 0.5;
  // Perpendicular to the path, which is the axis the ribbon is wide along.
  const nx = -ay;
  const ny = ax;

  const edge = (side: number, at: (px: number, py: number) => void): void => {
    for (let i = 0; i <= STEPS; i++) {
      const f = i / STEPS;
      const along = f * LENGTH * tile;
      const out = girth(f, phase, side) * WIDTH * tile * side;
      // A slow snake down the middle as well as the swell on the edges, so the
      // whole ribbon leans rather than only breathing.
      const lean = Math.sin(f * 4.1 - phase * 6.283) * tile * 0.06 * Math.min(1, f * 2);
      at(x - ax * along + nx * (out + lean), y - ay * along + ny * (out + lean));
    }
  };

  const ribbon = (): void => {
    ctx.beginPath();
    let first = true;
    edge(1, (px, py) => {
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else ctx.lineTo(px, py);
    });
    const back: [number, number][] = [];
    edge(-1, (px, py) => back.push([px, py]));
    for (let i = back.length - 1; i >= 0; i--) {
      const p = back[i];
      if (p) ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
  };

  const prev = ctx.globalCompositeOperation;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Three passes over the one ribbon: a soft outer glow, the body, and a
  // white filament down the middle of it.
  ctx.fillStyle = rgba(hex, 0.22);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.9, 1);
  ctx.translate(-x, -y);
  ribbon();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = rgba(hex, 0.6);
  ribbon();
  ctx.fill();

  ctx.strokeStyle = rgba(core, 0.85);
  ctx.lineWidth = Math.max(1.2, tile * 0.06);
  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const f = i / STEPS;
    const along = f * LENGTH * tile;
    const lean = Math.sin(f * 4.1 - phase * 6.283) * tile * 0.06 * Math.min(1, f * 2);
    const px = x - ax * along + nx * lean;
    const py = y - ay * along + ny * lean;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Nodules riding inside it — the one part that is a body rather than a
  // stroke, and what makes the thing read as alive rather than as a laser.
  for (let i = 0; i < 3; i++) {
    const f = ((phase * 0.9 + i * 0.34) % 1) * 0.9 + 0.05;
    const along = f * LENGTH * tile;
    const r = tile * WIDTH * girth(f, phase, 1) * (0.5 + 0.2 * signedHash(b.id + i));
    const px = x - ax * along;
    const py = y - ay * along;
    halo(ctx, px, py, r * 3.4, hex, 0.4);
    ctx.fillStyle = rgba(core, 0.75);
    ctx.beginPath();
    ctx.ellipse(px, py, r, r * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // The head: the brightest thing on the field while it is up there.
  halo(ctx, x, y, tile * 0.72, hex, 0.9);
  halo(ctx, x, y, tile * 0.3, core, 0.95);
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(x, y, tile * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // A ring of the cannon's own colour round it, which is the one thing kept
  // from the old lance look: the shot carries the mark that made it.
  ctx.strokeStyle = rgba(hex, 0.9);
  ctx.lineWidth = Math.max(1.4, tile * 0.05);
  ctx.beginPath();
  ctx.arc(x, y, tile * (0.26 + 0.04 * Math.sin(phase * 6.283)), 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}

/** Where the tail of a lance lies — straight down its column, or along the
 * leg of a lock it has turned the corner onto (`sim/lock.ts`). */
export function beamAxis(b: Bullet): [number, number] {
  const across = Math.sign(b.aimMilli);
  return across === 0 ? [0, -1] : [across, 0];
}

/** The head of a lance, in screen coordinates. Written here rather than in
 * `drawBullets` so the beam and its axis are read off one place. */
export function beamHead(l: Layout, b: Bullet): [number, number] {
  const row = b.row - b.subMilli / 1000;
  const col = b.col + b.driftMilli / 1000;
  return [tileCX(l, col), tileCY(l, row)];
}
