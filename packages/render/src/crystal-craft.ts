import { livingPath, SHELL } from "@neon-spore/content";
import { halo } from "./glow.js";
import { signedHash, sinHash } from "./hash.js";

/**
 * THE CRYSTAL's craft: the hull, the two engine pods and the canopy over the
 * middle. The shape it is the shell of, drawn by `crystal.ts`.
 *
 * **The hull is `SHELL`** (`silhouettes-spare.ts`): five broad hard-edged
 * lobes and almost no wobble, the one contour in the game nothing draws any
 * more — kept, its note says, for a future creature that really is plated.
 * Stretched to three tiles wide and a third of one tall it is a saucer with
 * a lobed rim, and that is the whole of the craft's silhouette: `crystal:hull`
 * here and nowhere else drawn. The owner, 12 September 2026: *can you improve
 * visuals that it looks more cool, like a space ship?*
 *
 * **The pods are the two ends.** The slick and the bulb that used to sit in
 * the shell — the bodies it breaks into — are gone from the picture at the
 * owner's word (*replace the bulb and slick sitting in the ship left and
 * right with anything you like, but it's red and cyan — something cool*), and
 * in their place hang two engine pods, red to the left and cyan to the right,
 * each burning out of its outer end. The colours still say which cannon takes
 * which half once it is open; the split's burst (`effects-spark.ts`) covers
 * the pods becoming the plain bodies the simulation makes of them.
 */

/** The hull's half-height, as a share of a tile. */
export const HULL_RY = 0.3;
/** Where each pod's centre sits, tiles from the middle, and below the hull's
 * centre line — nacelles slung under the wing. */
const POD_DX = 1.22;
const POD_DY = 0.24;
/** A pod, as shares of a tile. */
const POD_W = 0.72;
const POD_H = 0.34;
/** The canopy's radius over the middle, as a share of a tile. */
export const CANOPY_R = 0.3;

export interface CraftInk {
  metal: string;
  dark: string;
  rim: string;
}

/** The saucer: `SHELL` over `halfW` by `HULL_RY` tiles, plated twice. */
export function drawCraftHull(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  halfW: number,
  tile: number,
  t: number,
  ink: CraftInk,
  held: number,
): void {
  const sx = halfW / SHELL.rx;
  const sy = (tile * HULL_RY) / SHELL.ry;
  const hull = new Path2D(livingPath(SHELL, t));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  // Lit from above: a pale edge along the top and dark plating under it.
  const g = ctx.createLinearGradient(0, -SHELL.ry, 0, SHELL.ry);
  g.addColorStop(0, ink.metal);
  g.addColorStop(0.22, ink.dark);
  g.addColorStop(1, ink.dark);
  ctx.fillStyle = g;
  ctx.fill(hull);
  ctx.strokeStyle = ink.rim;
  ctx.lineWidth = (1.5 + 0.6 * held) / Math.max(sx, sy);
  ctx.stroke(hull);
  // The second border, cut from the same contour a little inside it — the
  // armour rule every plated body in the game follows.
  ctx.scale(0.9, 0.78);
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 0.9 / Math.max(sx, sy);
  ctx.stroke(hull);
  ctx.restore();
  // A deck line along the whole width, and the plating seams off it.
  ctx.save();
  ctx.strokeStyle = ink.rim;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - halfW * 0.86, y + tile * 0.02);
  ctx.lineTo(x + halfW * 0.86, y + tile * 0.02);
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const px = x + i * halfW * 0.34;
    ctx.moveTo(px, y - tile * 0.1);
    ctx.lineTo(px, y + tile * 0.16);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * One engine pod: a capsule in its colour, a nozzle ring at its outer end
 * and an exhaust that flickers out of it. `side` is −1 for the left pod and
 * 1 for the right; the burn points away from the middle.
 */
export function drawEnginePod(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  side: -1 | 1,
  hex: string,
  rim: string,
  dark: string,
  time: number,
  seed: number,
): void {
  const cx = x + side * POD_DX * tile;
  const cy = y + POD_DY * tile;
  const w = POD_W * tile;
  const h = POD_H * tile;
  const r = h / 2;
  const frame = Math.floor(time * 30);
  // The exhaust first, under the pod: a tongue of the pod's colour out of the
  // outer end, its length re-rolled every frame.
  const nx = cx + side * w * 0.5;
  const reach = tile * (0.28 + 0.22 * sinHash(seed, frame));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createLinearGradient(nx, cy, nx + side * reach, cy);
  g.addColorStop(0, rim);
  g.addColorStop(0.35, hex);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(nx, cy - r * 0.7);
  ctx.quadraticCurveTo(
    nx + side * reach * 0.6,
    cy + signedHash(seed, frame, 1) * r * 0.4,
    nx + side * reach,
    cy,
  );
  ctx.quadraticCurveTo(nx + side * reach * 0.6, cy + r * 0.3, nx, cy + r * 0.7);
  ctx.closePath();
  ctx.fill();
  halo(ctx, nx, cy, tile * 0.42, hex, 0.35 + 0.2 * sinHash(seed, frame, 2));
  ctx.restore();
  // The capsule, dark with a lit belly stripe and its rim.
  ctx.save();
  const body = new Path2D();
  body.roundRect(cx - w / 2, cy - r, w, h, r);
  ctx.fillStyle = dark;
  ctx.fill(body);
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.32, cy - r * 0.28, w * 0.5, r * 0.56, r * 0.28);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2;
  ctx.stroke(body);
  // The nozzle ring on the outer end.
  ctx.beginPath();
  ctx.ellipse(nx, cy, r * 0.32, r * 0.86, 0, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * The canopy over the middle: a dome in the join's colour, which is the one
 * tile a shot can open, brighter while the whole condition holds.
 */
export function drawCanopy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  hex: string,
  rim: string,
  held: number,
): void {
  const r = tile * CANOPY_R * (1 + 0.2 * held);
  const top = y - tile * HULL_RY * 0.55;
  halo(ctx, x, top, r * (2.2 + 1.4 * held), hex, 0.35 + 0.45 * held);
  ctx.save();
  // The glass: a dome standing on the deck.
  ctx.beginPath();
  ctx.moveTo(x - r, top);
  ctx.arc(x, top, r, Math.PI, 0);
  ctx.closePath();
  const g = ctx.createLinearGradient(x, top - r, x, top);
  g.addColorStop(0, rim);
  g.addColorStop(0.5, hex);
  g.addColorStop(1, hex);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2 + 0.8 * held;
  ctx.stroke();
  // The highlight on the glass.
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, top - r * 0.55, r * 0.28, r * 0.16, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
