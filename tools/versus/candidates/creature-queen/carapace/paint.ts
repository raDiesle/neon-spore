import { KEY, LIGHT_HALF } from "../../../../../packages/content/src/light.js";
import {
  facet,
  LAT_LIMIT,
  type Pin,
  pin,
  surfaceDim,
} from "../../../../../packages/content/src/surface.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { ShellDraw } from "../../../../../packages/render/src/queen-look.js";

/**
 * CARAPACE — the shell is a domed back, lit as a ball under the key, with
 * rows of spiracles pinned to it that ride over the crest as she heaves.
 *
 * The dome is the shipped key light (`litRound`, the ramp the meteor and the
 * hull read) with a rounding laid over it — dark toward the rim on every
 * side, a wet specular on the shoulder nearest the light, and a cool line of
 * bounced light along the far rim. Then the surface is *placed*: every
 * spiracle is pinned at a longitude round her long axis and a latitude along
 * it, and her back rocks slowly about that axis, so the far pores rise over
 * the crest into view and the near ones sink under her lower edge —
 * foreshortened by the tangent plane's own map, lit by their own normal.
 * That is the reveal a pose cannot fake, and it is what says she has a back
 * and not a front.
 */

/** How far she rocks about her long axis, either way, and how slowly. A
 * boss that rolled through would read as a barrel; a rock either way is a
 * thing breathing under armour. */
const HEAVE = 0.6;
const HEAVE_SECONDS = 7;
/** The spiracles: rows along her width, pores round each row. */
const ROWS = 6;
const ROUND = 5;
/** How much of her half-width the rows span, and how much of her half-height
 * the barrel's radius is. Both under 1, so a pore at the limb stays inside
 * the contour's own corners. */
const ROW_REACH = 0.86;
const BARREL = 0.84;
/** She is a barrel along her width rather than a ball, so a row's place
 * along her is its own share of the half-width and its latitude only says
 * how far the barrel has tapered toward that wing. */
const TAPER = 0.6;
/** One pore's radius as a share of her half-height, at the facing meridian. */
const PORE = 0.15;
/** What a pore keeps of its light turned fully away — a hole reads as a
 * hole, so lower than a plane would take. */
const PORE_FLOOR = 0.3;
/** The light is painted as a square of this many half-widths, because her
 * corners stand a fifth past `rx` and a sprite cut at `rx` leaves the wing
 * tips unlit. */
const REACH = 1.25;
const SHADOW = "#0B1024";
const STONE = "#8A8F9C";
const SHEEN = "#F4F1EA";
/** The cool the far rim bounces back — not the key's warm, which is the
 * difference between a ball and a disc with a smudge on it. */
const BOUNCE = "#9FB4E8";

interface Spiracle {
  readonly pin: Pin;
  /** Its place along her width, as a share of the half-width. */
  readonly along: number;
}

/**
 * The pins, laid once. Rows alternate half a pore round the barrel so no two
 * neighbouring rows put a pore on the same meridian.
 */
const PINS: Spiracle[] = (() => {
  const out: Spiracle[] = [];
  for (let r = 0; r < ROWS; r++) {
    const along = ((r + 0.5) / ROWS - 0.5) * 2;
    const lat = along * TAPER * LAT_LIMIT;
    for (let k = 0; k < ROUND; k++) {
      const lon = ((k + (r % 2) * 0.5) / ROUND) * Math.PI * 2;
      out.push({ pin: pin(lon, lat, 1), along });
    }
  }
  return out;
})();

/** The rounding over the flat ramp: nothing at the middle, the cool shadow
 * gathering toward the rim on every side, in her own aspect. */
function rounding(ctx: CanvasRenderingContext2D, rx: number, ry: number): void {
  ctx.save();
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, rx * 0.2, 0, 0, rx);
  g.addColorStop(0, rgba(SHADOW, 0));
  g.addColorStop(0.62, rgba(SHADOW, 0.08));
  g.addColorStop(1, rgba(SHADOW, 0.6));
  ctx.fillStyle = g;
  ctx.fillRect(-rx * 1.2, -rx * 1.2, rx * 2.4, rx * 2.4);
  ctx.restore();
}

/** The wet shoulder: one soft ellipse where the dome faces the key. */
function specular(ctx: CanvasRenderingContext2D, rx: number, ry: number): void {
  const cx = KEY.x * rx * 0.42;
  const cy = KEY.y * ry * 0.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 0.34);
  g.addColorStop(0, rgba(SHEEN, 0.42));
  g.addColorStop(0.5, rgba(SHEEN, 0.12));
  g.addColorStop(1, rgba(SHEEN, 0));
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

/** Light coming back off whatever she sits over, along the rim turned away
 * from the key: a stroke inside the clip, so only its inner half shows. */
function bounce(ctx: CanvasRenderingContext2D, path: Path2D, rx: number, ry: number): void {
  const g = ctx.createLinearGradient(KEY.x * rx, KEY.y * ry, -KEY.x * rx, -KEY.y * ry);
  g.addColorStop(0, rgba(BOUNCE, 0));
  g.addColorStop(0.55, rgba(BOUNCE, 0));
  g.addColorStop(1, rgba(BOUNCE, 0.5));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = g;
  ctx.lineWidth = ry * 0.34;
  ctx.stroke(path);
  ctx.restore();
}

/**
 * One spiracle, drawn about its own origin in the tangent plane and
 * foreshortened by `scale(sy, sx)` — the axes swapped because her axis of
 * turn is horizontal, so `facet`'s longitude runs *down* the picture and its
 * latitude runs along her width. Its `lit` is still right: `KEY.x` and
 * `KEY.y` are the same number, so swapping the two axes of the light changes
 * nothing about how much of it a normal takes.
 */
function pore(ctx: CanvasRenderingContext2D, s: Spiracle, theta: number, rx: number, ry: number) {
  const p = s.pin;
  const f = facet(p, theta);
  if (!f.near) return;
  const pr = ry * PORE;
  const dim = surfaceDim(PORE_FLOOR, f.lit);
  ctx.save();
  ctx.translate(s.along * rx * ROW_REACH, f.x * ry * BARREL);
  ctx.scale(Math.max(0.05, f.sy), Math.max(0.05, f.sx));
  ctx.beginPath();
  ctx.arc(0, 0, pr, 0, Math.PI * 2);
  ctx.fillStyle = rgba(SHADOW, 0.35 + 0.45 * dim);
  ctx.fill();
  // The wall a light reaches inside a hole is the far one, so the bright
  // arc sits on the side away from the key.
  ctx.beginPath();
  ctx.arc(-KEY.x * pr * 0.35, -KEY.y * pr * 0.35, pr * 0.8, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(SHEEN, 0.55 * f.lit);
  ctx.lineWidth = pr * 0.3;
  ctx.stroke();
  ctx.restore();
}

/** The dome, the light, and the spiracles riding the heave. */
export function carapace(d: ShellDraw): void {
  const { ctx, path, rx, ry, time } = d;
  const theta = HEAVE * Math.sin((time * Math.PI * 2) / HEAVE_SECONDS);
  ctx.save();
  ctx.clip(path);
  ctx.fillStyle = STONE;
  ctx.fill(path);
  litRound(ctx, 0, 0, rx * REACH, LIGHT_HALF.rock);
  rounding(ctx, rx, ry);
  for (const p of PINS) pore(ctx, p, theta, rx, ry);
  specular(ctx, rx, ry);
  bounce(ctx, path, rx, ry);
  ctx.restore();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(1, Math.min(rx, ry) * 0.06);
  ctx.stroke(path);
}
