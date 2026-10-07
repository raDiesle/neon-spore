import { KEY } from "@neon-spore/content";
import { rgba } from "./hex.js";
import type { Point } from "./lamprey-shape.js";
import { lampreyStations } from "./lamprey-skin.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE LAMPREY's gills and eyes**: a row of seven pores down each flank
 * behind the head, and an eye on each side of the neck with the key light's
 * glint in it. The pores open and shut once a beat in a ripple running back
 * from the head — the eel breathing — off the pose's `wave`, never the wall
 * clock.
 */

/** The gill pores: seven down each flank from this station, and how far across. */
const GILLS = 7;
const GILL_FROM = 6;
const GILL_ACROSS = 0.55;
/** The station the eyes sit at, and how far across. */
const EYE_AT = 4;
const EYE_ACROSS = 0.5;

/**
 * The gill pores and the eyes, on both flanks. A pore opens and shuts once a
 * beat, the ripple running back from the head.
 */
export function drawLampreyGills(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  spine: readonly Point[],
  wave: number,
): void {
  const st = lampreyStations(l, spine);
  const pores = new Path2D();
  const rims = new Path2D();
  const r = l.tile * 0.055;
  for (let g = 0; g < GILLS; g++) {
    const s = st[GILL_FROM + g];
    if (s === undefined) continue;
    const open = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(wave * 2.5 - g * 0.7));
    const a = Math.atan2(s.ny, s.nx);
    for (const side of [1, -1]) {
      const x = s.x + s.nx * s.w * GILL_ACROSS * side;
      const y = s.y + s.ny * s.w * GILL_ACROSS * side;
      rims.moveTo(x + r * 1.35, y);
      rims.ellipse(x, y, r * 1.35, r * 1.1, a, 0, Math.PI * 2);
      pores.moveTo(x + r, y);
      pores.ellipse(x, y, r, r * 0.8 * open, a, 0, Math.PI * 2);
    }
  }
  ctx.fillStyle = rgba(PALETTE.lampreyHideDark, 0.45);
  ctx.fill(rims);
  ctx.fillStyle = PALETTE.lampreyGill;
  ctx.fill(pores);

  const eye = st[EYE_AT];
  if (eye === undefined) return;
  const er = l.tile * 0.085;
  for (const side of [1, -1]) {
    const x = eye.x + eye.nx * eye.w * EYE_ACROSS * side;
    const y = eye.y + eye.ny * eye.w * EYE_ACROSS * side;
    ctx.fillStyle = PALETTE.lampreyEye;
    ctx.beginPath();
    ctx.arc(x, y, er, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.lampreyHideDark;
    ctx.beginPath();
    ctx.arc(x, y, er * 0.68, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,240,0.85)";
    ctx.beginPath();
    ctx.arc(x + KEY.x * er * 0.35, y + KEY.y * er * 0.35, er * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
}
