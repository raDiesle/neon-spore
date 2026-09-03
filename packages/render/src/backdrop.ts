import { gradientSlot, slotGradient } from "./gradient-slot.js";
import type { Layout } from "./layout.js";
import { drawLightShafts } from "./light-shafts.js";
import { PALETTE } from "./palette.js";

/**
 * The field's back: two depths of drifting motes, a slow wash, and the
 * horizon they sit in front of. The owner asked for a field that has a
 * back instead of reading as a test rig — this is render only, it decides
 * nothing, and none of it is stored anywhere: every value below is a pure
 * function of `time` (wall-clock, own-motion — see `renderer.ts`'s `ViewState`)
 * or of `wave` (world state, already identical on both screens), so there is
 * nothing here for `Effects.reset()` to ever have to forget.
 *
 * Deliberately dim throughout. The creatures are the brightest thing on the
 * field; a backdrop bright enough to compete with them breaks the one thing
 * that has to read at 26 px on a phone — see `bun run shapes`.
 */

/**
 * Where the horizon sits, as a fraction down the grid — near the top, where
 * everything the field shows first arrives from. `drawGrid`'s beat pulse
 * starts at the very top of the grid and travels down across this band on its
 * way to the hull, which is what makes the horizon read as *behind* the field
 * rather than printed on it.
 */
const HORIZON_FRAC = 0.16;

/** A pure bit-mixing hash — not `Math.random`. The same index always gives
 * the same value, on both screens, on every frame: mote positions are looked
 * up here, never rolled. */
export function hash01(seed: number): number {
  let h = (seed * 0x9e3779b1) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function withAlpha(hex: string, alpha: number): string {
  const byte = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return `${hex}${byte.toString(16).padStart(2, "0")}`;
}

/**
 * A handful of dark, desaturated tints — one per act. There is no `Act` type
 * yet (the wave is the finest-grained thing the world tracks), so `wave` is
 * the closest stand-in: cheap and correct today, worth swapping for a real
 * act index if acts ever get named as their own thing.
 */
const WASH_TINTS = ["#241B4F", "#152A45", "#3A1B45", "#123B2E", "#402313"] as const;

function tintFor(wave: number): string {
  const i = ((wave % WASH_TINTS.length) + WASH_TINTS.length) % WASH_TINTS.length;
  return WASH_TINTS[i]!;
}

interface MoteStyle {
  count: number;
  /** Keeps this depth's hashes out of the other depth's — otherwise both
   * layers would draw the same dust in the same places. */
  seedBase: number;
  /** Sideways drift, screen widths per second. */
  speed: number;
  size: readonly [number, number];
  alpha: readonly [number, number];
}

/** Farther, smaller, slower, dimmer. */
const FAR: MoteStyle = {
  count: 30,
  seedBase: 0,
  speed: 0.007,
  size: [0.8, 1.5],
  alpha: [0.04, 0.1],
};

/** Nearer, a touch bigger and brighter, drifting faster — parallax between
 * the two is the whole of what reads as depth. */
const NEAR: MoteStyle = {
  count: 14,
  seedBase: 10_000,
  speed: 0.021,
  size: [1.5, 2.6],
  alpha: [0.07, 0.16],
};

/**
 * One mote's four fixed numbers. Every one of them is `hash01` of `seedBase + i`
 * and nothing else — not of `time`, not of the layout — so the whole table is
 * built once at module load rather than 176 hashes a frame. Only `x` moves,
 * and it moves by a drift computed from `time` at the draw site, in the order
 * the table is in, which is the order the motes were always drawn in.
 */
interface Mote {
  bx: number;
  by: number;
  size: number;
  alpha: number;
}

function motesOf(style: MoteStyle): Mote[] {
  const out: Mote[] = [];
  for (let i = 0; i < style.count; i++) {
    const s = style.seedBase + i;
    out.push({
      bx: hash01(s * 4 + 1),
      by: hash01(s * 4 + 2),
      size: style.size[0] + hash01(s * 4 + 3) * (style.size[1] - style.size[0]),
      alpha: style.alpha[0] + hash01(s * 4 + 4) * (style.alpha[1] - style.alpha[0]),
    });
  }
  return out;
}

const FAR_MOTES = motesOf(FAR);
const NEAR_MOTES = motesOf(NEAR);

function drawMotes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  style: MoteStyle,
  motes: readonly Mote[],
): void {
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  ctx.fillStyle = PALETTE.sparkDim;
  for (const m of motes) {
    // Wraps forever without ever going negative into `%`.
    const frac = m.bx + time * style.speed;
    const x = (frac - Math.floor(frac)) * l.width;
    const y = m.by * height;
    ctx.globalAlpha = m.alpha;
    ctx.fillRect(x - m.size / 2, y - m.size / 2, m.size, m.size);
  }
  ctx.globalAlpha = 1;
}

/** A soft horizontal band, fixed at `HORIZON_FRAC`, tinted per act. Static in
 * position — only the beat pulse in `drawGrid` moves — so it reads as a
 * distant skyline rather than another thing competing for attention. */
/** Depends only on `l` (gridTop, gridHeight, width) and `wave` — never on
 * time, so the same gradient serves every frame between two waves. */
const horizonSlot = gradientSlot<CanvasGradient>();

function drawHorizon(ctx: CanvasRenderingContext2D, l: Layout, wave: number): void {
  if (l.gridHeight <= 0 || l.width <= 0) return;
  const y = l.gridTop + l.gridHeight * HORIZON_FRAC;
  const band = Math.max(1, l.gridHeight * 0.1);
  const tint = tintFor(wave);
  const g = slotGradient(ctx, horizonSlot, `${y},${band},${tint}`, () => {
    const grad = ctx.createLinearGradient(0, y - band, 0, y + band);
    grad.addColorStop(0, withAlpha(tint, 0));
    grad.addColorStop(0.5, withAlpha(tint, 0.55));
    grad.addColorStop(1, withAlpha(tint, 0));
    return grad;
  });
  ctx.fillStyle = g;
  ctx.fillRect(0, y - band, l.width, band * 2);
}

/** A very slow, very faint wash over the whole sky, breathing rather than
 * static — the one part of the backdrop that moves without anything crossing
 * it, so the field never looks quite like a still. */
function drawWash(ctx: CanvasRenderingContext2D, l: Layout, wave: number, time: number): void {
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  const tint = tintFor(wave);
  // A different, wave-offset phase per act, so two acts sharing a tint (the
  // palette is shorter than the wave list) still don't breathe in lockstep.
  const breathe = 0.5 + 0.5 * Math.sin(time * 0.11 + wave * 1.7);
  const alpha = 0.03 + 0.035 * breathe;
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, withAlpha(tint, 0));
  g.addColorStop(0.55, withAlpha(tint, alpha));
  g.addColorStop(1, withAlpha(tint, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, l.width, height);
}

export function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  wave: number,
  time: number,
): void {
  drawWash(ctx, l, wave, time);
  // Light reaching the water, over the wash and under the horizon band and
  // the motes — a suggestion under the field's other back layers, never on
  // top of them. Its own file: `light-shafts.ts` has the why and the geometry.
  drawLightShafts(ctx, l, time);
  drawHorizon(ctx, l, wave);
  drawMotes(ctx, l, time, FAR, FAR_MOTES);
  drawMotes(ctx, l, time, NEAR, NEAR_MOTES);
}
