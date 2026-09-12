import { halo } from "./glow.js";
import { signedHash, sinHash } from "./hash.js";

/**
 * THE CRYSTAL's electric field: arcs crawling round the whole craft, and the
 * gap that opens in them over the middle while the ship's shield stands
 * armed underneath.
 *
 * The field is the *before*. The owner, 12 September 2026: *add some visual
 * before which indicates some electrical shield around all; then when
 * shielded correctly below it, the electric shield is interrupted, and the
 * shot can hit the middle.* So the arcs run all the way round an ellipse
 * that encloses hull, pods and canopy, and a held body loses the arc across
 * its underside — the one place a bolt comes from — with the two broken ends
 * sparking at the edges of the hole. A shot up the middle goes through the
 * hole; everywhere else the field is still whole, which is what the shell
 * catching it looks like.
 *
 * Every arc is re-read from `sinHash` at `FRAME_HZ`, so the field flickers
 * the way the ship's own sparks do (`shield-spark.ts`) and two devices draw
 * the same picture from the same clock. Nothing here outlives a frame.
 */

/** Arcs round the ellipse. */
const SEGS = 16;
/** How many times a second every arc is re-rolled. */
const FRAME_HZ = 24;
/** The whole field turns slowly, radians a second, so a body standing still
 * between beats still reads as live. */
const DRIFT = 0.7;
/** Radial jitter of an arc's points, as a share of the ellipse's height. */
const JITTER = 0.09;
/** Points along one arc. */
const POINTS = 5;

function angleFrom(a: number, b: number): number {
  const d = (a - b) % (Math.PI * 2);
  return d > Math.PI ? d - Math.PI * 2 : d < -Math.PI ? d + Math.PI * 2 : d;
}

/**
 * The field round a body centred on `x`,`y`, `rx` by `ry`. `gapHalf` is the
 * half-width of the hole, in radians either side of straight down, and it is
 * only opened while `held`; `hex` is already hazed for depth.
 */
export function drawCrystalField(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  time: number,
  held: boolean,
  gapHalf: number,
  hex: string,
): void {
  const frame = Math.floor(time * FRAME_HZ);
  const rot = time * DRIFT;
  const down = Math.PI / 2;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // The skin itself, faint: the ellipse the arcs crawl on, so the field reads
  // as one closed thing even between arcs.
  ctx.strokeStyle = hex;
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (held) {
    ctx.ellipse(x, y, rx, ry, 0, down + gapHalf, down - gapHalf + Math.PI * 2);
  } else {
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  }
  ctx.stroke();

  const slot = (Math.PI * 2) / SEGS;
  for (let k = 0; k < SEGS; k++) {
    const a0 = rot + k * slot + signedHash(k, frame) * slot * 0.25;
    const len = slot * (0.35 + 0.5 * sinHash(k, frame, 1));
    const mid = a0 + len / 2;
    if (held && Math.abs(angleFrom(mid, down)) < gapHalf + slot * 0.3) continue;
    const bright = 0.35 + 0.6 * sinHash(k, frame, 2);
    ctx.globalAlpha = bright;
    ctx.lineWidth = 1 + 1.2 * sinHash(k, frame, 3);
    ctx.beginPath();
    for (let i = 0; i < POINTS; i++) {
      const a = a0 + (len * i) / (POINTS - 1);
      const m = 1 + signedHash(k, frame, 10 + i) * JITTER * (i === 0 || i === POINTS - 1 ? 0.3 : 1);
      const px = x + Math.cos(a) * rx * m;
      const py = y + Math.sin(a) * ry * m;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // The broken ends: where the field stops either side of the hole, the arc
  // that would have crossed it flares out and fizzes instead.
  if (held) {
    for (const side of [-1, 1]) {
      const a = down + side * gapHalf;
      const ex = x + Math.cos(a) * rx;
      const ey = y + Math.sin(a) * ry;
      halo(ctx, ex, ey, ry * 0.5, hex, 0.55 + 0.35 * sinHash(side, frame));
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.4;
      for (let j = 0; j < 3; j++) {
        const spread = (signedHash(side, frame, j) * 0.9 + side * 0.6) * 0.8;
        const reach = ry * (0.25 + 0.35 * sinHash(side, frame, 20 + j));
        const bx = ex + Math.cos(a + spread) * reach;
        const by = ey + Math.sin(a + spread) * reach;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo((ex + bx) / 2 + signedHash(side, frame, 30 + j) * reach * 0.4, (ey + by) / 2);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}
