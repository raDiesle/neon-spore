import { GAUGE_FULL } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { rimPoint } from "./gauge-alien.js";
import { type Loaded, loadedLook } from "./gauge-load.js";
import { halo, strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * THE GAUGE's wound: where the band is, drawn as a place the alien's armour
 * is torn open and the flesh under it shows, in the colour of the shot the
 * cannon is loaded with. It is on the navigator's screen alone, as the band
 * always was (`showsGaugeMarks`).
 *
 * **The wound's ends are the span.** The call is one comparison — the needle
 * within `gaugeSpanNow` of the mark — and about the pivot that is an angle
 * either side of the mark's. The wound runs along the rim between exactly
 * those two angles, and its ends are cut square across the armour, along the
 * rays themselves, with a bright torn edge: so a shot lands in the flesh on
 * exactly the calls that land, and nowhere on the rim is it half one and half
 * the other.
 *
 * **The bind is the wound pulling shut.** Wound tight, the band is narrower
 * than its full width, and what is between the two widths is drawn as a seam
 * sewn shut — the same wound, closing from both ends — so her thumb holding it
 * open is a thumb on something visibly closing (`sim/gauge-band.ts`).
 */

/** How far the torn armour reaches either side of the rim, as a share of the radius. */
const OUTER = 0.085;
const INNER = 0.075;
/** How wide the gash is at its middle, either side of the rim. */
const GAPE = 0.055;

/** A strip along the rim from `lo` to `hi`, `outer` beyond it and `inner` inside. */
function strip(
  dial: Dial,
  lo: number,
  hi: number,
  outer: (u: number) => number,
  inner: (u: number) => number,
): Path2D {
  const steps = Math.max(4, Math.ceil((hi - lo) / 8));
  const path = new Path2D();
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const p = rimPoint(dial, lo + (hi - lo) * u, outer(u));
    if (i === 0) path.moveTo(p.x, p.y);
    else path.lineTo(p.x, p.y);
  }
  for (let i = steps; i >= 0; i--) {
    const u = i / steps;
    const p = rimPoint(dial, lo + (hi - lo) * u, -inner(u));
    path.lineTo(p.x, p.y);
  }
  path.closePath();
  return path;
}

/**
 * The wound, from `mark - span` to `mark + span`. `full` is the span it has
 * when it is not wound tight; `grow` is how far it has torn open, 0..1, and is
 * only below 1 inside the rest after a hit, while a fresh one opens.
 */
export function drawGaugeWound(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  markMilli: number,
  spanMilli: number,
  fullMilli: number,
  load: Loaded,
  glow: number,
  grow = 1,
): void {
  if (grow <= 0) return;
  const look = loadedLook(load);
  const span = spanMilli * grow;
  const lo = Math.max(-GAUGE_FULL, markMilli - span);
  const hi = markMilli + span;
  const out = dial.r * OUTER;
  const inn = dial.r * INNER;
  const gape = dial.r * GAPE * (0.85 + 0.15 * glow);

  const mid = rimPoint(dial, markMilli);
  halo(ctx, mid.x, mid.y, dial.r * 0.3 + gape * 2, look.hex, 0.22 + 0.18 * glow);

  // The seam either side, where the band is wound tighter than it was cut.
  if (fullMilli > spanMilli) {
    for (const side of [-1, 1] as const) {
      const a = markMilli + side * span;
      const b = markMilli + side * fullMilli * grow;
      drawSeam(ctx, dial, Math.min(a, b), Math.max(a, b));
    }
  }

  // The armour torn back: flesh across the rim's whole depth, square at both
  // ends, so nothing of a plate stands inside the span.
  const torn = strip(
    dial,
    lo,
    hi,
    () => out,
    () => inn,
  );
  ctx.fillStyle = look.dark;
  ctx.fill(torn);
  // The gash itself, full almost to both ends so its width is not guessed at
  // from a taper.
  const lip = (u: number): number => gape * Math.sqrt(Math.max(0, 1 - Math.abs(2 * u - 1) ** 6));
  const gash = strip(dial, lo, hi, lip, lip);
  ctx.save();
  ctx.fillStyle = rgba(look.hex, 0.55 + 0.35 * glow);
  ctx.fill(gash);
  ctx.restore();
  strokeGlow(ctx, gash, look.rim, 1.6, 0.8 + 0.5 * glow);

  // The two torn edges, along the rays that are the span's two ends.
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = look.rim;
  ctx.lineWidth = 2.4;
  for (const m of [lo, hi]) {
    const a = rimPoint(dial, m, out);
    const b = rimPoint(dial, m, -inn);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

/** A closed length of wound, sewn across: dark, dim, and plainly not open. */
function drawSeam(ctx: CanvasRenderingContext2D, dial: Dial, lo: number, hi: number): void {
  if (hi - lo < 1) return;
  const out = dial.r * OUTER;
  const inn = dial.r * INNER;
  ctx.fillStyle = PALETTE.throbMiddle;
  ctx.fill(
    strip(
      dial,
      lo,
      hi,
      () => out * 0.7,
      () => inn * 0.7,
    ),
  );
  ctx.save();
  ctx.strokeStyle = PALETTE.sparkDim;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  const stitches = Math.max(1, Math.round((hi - lo) / 9));
  for (let i = 0; i < stitches; i++) {
    const m = lo + ((i + 0.5) / stitches) * (hi - lo);
    const a = rimPoint(dial, m - 3, out * 0.6);
    const b = rimPoint(dial, m + 3, -inn * 0.6);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Where a hit landed, closing up after it: a short seam of the shot's colour
 * that fades as the fresh wound opens somewhere else. `fade` runs 1 to 0.
 */
export function drawGaugeScar(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  milli: number,
  load: Loaded,
  fade: number,
): void {
  if (fade <= 0) return;
  const look = loadedLook(load);
  const half = 22 * fade + 8;
  const path = strip(
    dial,
    milli - half,
    milli + half,
    (u) => dial.r * GAPE * fade * Math.sin(Math.PI * u),
    (u) => dial.r * GAPE * fade * Math.sin(Math.PI * u),
  );
  ctx.fillStyle = look.dark;
  ctx.fill(path);
  strokeGlow(ctx, path, look.hex, 1.4, fade);
}
