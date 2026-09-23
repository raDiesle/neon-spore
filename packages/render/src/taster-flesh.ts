import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE TASTER is made of**: blades of whetted steel standing in a gum
 * of wet flesh. Each blade is a sliver lit down its leading face and gone
 * dark down the trailing one, with the grind line where the bevel starts and a
 * glint near its point; each stands in a socket in the gum, a dark wet ring
 * the gum has closed round its root. It is no longer a grey fill with a
 * glowing line drawn round the crest and round every blade, which is the one
 * picture the brief rules out by name (`new-boss-more` §6.3).
 *
 * Split off `taster-blade.ts` and `taster-crest.ts`, which decide *what* a
 * blade or the crest says — its edge colour, how thick, how grown, which
 * gaps are open — so they stay about the fight and this one about the
 * material. The edge's colour is still `taster-blade.ts`' own lit line: it is
 * the one piece of information on a blade, and it is light, not a body.
 *
 * **Every width is off the tile**, never off a blade's height: a blade grows,
 * and a width that followed it would be a new width on every frame.
 */

/** Where the gum runs, for `paintGum`. */
export interface Gum {
  left: number;
  right: number;
  y: number;
  thick: number;
  tile: number;
}

/**
 * The crest: flesh, lit along the top it holds the blades in and gone to the
 * deep underneath, with a film caught at the left. `roots` is the x of every
 * blade still standing, each given its socket.
 */
export function paintGum(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  g: Gum,
  roots: readonly number[],
  breath: number,
): void {
  const { tile, y, thick } = g;
  ctx.save();
  ctx.globalAlpha = 0.3 + 0.05 * breath;
  ctx.fillStyle = PALETTE.dim;
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  const hang = ctx.createLinearGradient(0, y, 0, y + thick);
  hang.addColorStop(0, rgba(PALETTE.sheenRim, 0.14));
  hang.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  hang.addColorStop(0.5, rgba(PALETTE.sheenDeep, 0));
  hang.addColorStop(1, rgba(PALETTE.sheenDeep, 0.6));
  ctx.fillStyle = hang;
  ctx.fill(body);
  // The top it holds the blades in, thick and lit from inside.
  ctx.save();
  ctx.beginPath();
  ctx.rect(g.left - tile, y - tile, g.right - g.left + 2 * tile, tile + thick * 0.35);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.1;
  ctx.strokeStyle = PALETTE.rock;
  ctx.globalAlpha = 0.35;
  ctx.stroke(body);
  ctx.restore();
  for (const x of roots) socket(ctx, x, y, tile);
  ctx.restore();
  film(ctx, g.left + tile * 0.6, y + thick * 0.3, tile * 0.35, tile * 0.04, 0.22);
}

/** A blade's root: the dark the gum has closed round it, and its wet lip. */
function socket(ctx: CanvasRenderingContext2D, x: number, y: number, tile: number): void {
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.beginPath();
  ctx.ellipse(x, y + tile * 0.02, tile * 0.36, tile * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = PALETTE.sheenRim;
  ctx.lineWidth = Math.max(1, tile * 0.025);
  ctx.beginPath();
  ctx.ellipse(x, y + tile * 0.03, tile * 0.34, tile * 0.07, 0, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * A blade's steel, painted inside its own shape: lit down the leading face,
 * dark down the trailing one, the grind line where the bevel begins, and a
 * glint near the point. `grind` is the bevel line; `a` the blade's fade.
 */
export function paintSteel(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  grind: Path2D,
  x: number,
  y: number,
  h: number,
  lean: number,
  tile: number,
  a: number,
): void {
  const w = tile * 0.3;
  ctx.save();
  ctx.clip(body);
  const face = ctx.createLinearGradient(x - w, 0, x + w, 0);
  face.addColorStop(0, rgba(PALETTE.sheenRim, 0.3 * a));
  face.addColorStop(0.45, rgba(PALETTE.sheenRim, 0));
  face.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  face.addColorStop(1, rgba(PALETTE.sheenDeep, 0.6 * a));
  ctx.fillStyle = face;
  ctx.fill(body);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, tile * 0.022);
  ctx.strokeStyle = PALETTE.rock;
  ctx.globalAlpha = 0.5 * a;
  ctx.stroke(grind);
  ctx.restore();
  // The glint, on the bevel a quarter of the way down from the point.
  const gx = x + lean * 0.75 - w * 0.25;
  const gy = y - h * 0.72;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.8 * a);
  ctx.beginPath();
  ctx.ellipse(gx, gy, Math.max(0.8, tile * 0.025), tile * 0.07, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * A blade still growing: no steel yet and no edge, only its shape filled in
 * the grey with a light moving up through it — standing there, and nothing
 * yet a pair could name it by.
 */
export function paintUnset(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  y: number,
  h: number,
  a: number,
  shimmer: number,
): void {
  ctx.save();
  ctx.clip(body);
  const up = y - h * shimmer;
  const band = ctx.createLinearGradient(0, up + h * 0.3, 0, up - h * 0.3);
  band.addColorStop(0, rgba(PALETTE.dim, 0));
  band.addColorStop(0.5, rgba(PALETTE.dim, 0.5 * a));
  band.addColorStop(1, rgba(PALETTE.dim, 0));
  ctx.fillStyle = band;
  ctx.fill(body);
  ctx.restore();
}

/** The wet film: a soft bloom and a hard point at its left end. */
function film(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  a: number,
): void {
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, a);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, Math.min(1, a * 3));
  ctx.beginPath();
  ctx.arc(x - rx * 0.5, y, Math.max(0.8, ry * 0.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
