import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { EvertDraw } from "../../../../../packages/render/src/surge-body.js";

/** The ribs that come through the seam, one after another over the eversion. */
const RIBS = 5;
/** How much wider than the bulb the turned skin stands once it is all out. */
const SHELL_W = 0.22;

/**
 * The bulb turned inside out through its seam, as the design's step 14 has
 * it: the inside — pale — rolls out of the seam and back over the body like
 * a sock turned out, behind what is left of the outside, which shrinks into
 * it; a rolled lip stands at the seam the whole time; and the ribs come
 * through it one at a time, each a dark band on the pale skin once it is out.
 * At the end only the turned skin is left. The inner body the design grows
 * inside it stays out (bosses.md §11.28: it is a second boss).
 */
export function paintTurnedEversion(d: EvertDraw): void {
  const { ctx, c, rx, ry, evert, tile } = d;
  const e = Math.min(1, Math.max(0, evert));
  const shellRy = ry * (0.3 + 0.75 * e);
  const shellW = 1 + SHELL_W * e;
  // The turned skin, behind: pale, wider than the bulb, and lifted off the
  // seam as it comes, because it rolls back over the top.
  ctx.save();
  ctx.translate(c.x, c.y - shellRy * 0.25 * e);
  ctx.scale(shellW, 1);
  ctx.translate(-c.x, -c.y);
  d.body(Math.max(tile * 0.08, shellRy), true);
  ctx.restore();
  // The ribs through it, one by one, the newest brightest.
  const out = e * RIBS;
  for (let i = 0; i < Math.min(RIBS, Math.ceil(out)); i++) {
    const u = (i + 0.5) / RIBS;
    const x = c.x + (u - 0.5) * 2 * rx * shellW * 0.8;
    const h = shellRy * Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2)) * 0.95;
    const fresh = Math.min(1, out - i);
    const rib = new Path2D();
    rib.ellipse(x, c.y - shellRy * 0.25 * e, rx * 0.06, h, 0, 0, Math.PI * 2);
    ctx.save();
    ctx.strokeStyle = rgba(PALETTE.hull, 0.35 + 0.5 * fresh);
    ctx.lineWidth = STROKE.outline * 1.2;
    ctx.stroke(rib);
    ctx.restore();
  }
  // What is left of the outside, shrinking into the turned skin.
  if (e < 1) d.body(Math.max(tile * 0.08, ry * (1 - e)), false);
  // The lip the skin rolls over, at the seam.
  const lip = new Path2D();
  lip.ellipse(c.x, c.y, rx * (0.85 + 0.2 * e), ry * 0.16, 0, 0, Math.PI * 2);
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.lineWidth = tile * 0.12;
  ctx.stroke(lip);
  ctx.strokeStyle = rgba(PALETTE.hull, 0.7);
  ctx.lineWidth = tile * 0.04;
  ctx.stroke(lip);
  ctx.restore();
}
