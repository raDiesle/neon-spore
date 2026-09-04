import { KEY, type LightHalf } from "@neon-spore/content";
import { bakedCache } from "./baked.js";

/**
 * THE KEY LIGHT, ON A CANVAS.
 *
 * `packages/content`'s `light.ts` says where the light is. This says what a
 * surface looks like under it — once, so the hull and a rock cannot end up
 * disagreeing about a light they both claim to be reading. Everything comes out
 * of one table, `RAMP`: the numeric form (`shadeAt`, `litColour`) and the drawn
 * form (`litBox`, `litRound`) read the same rows, so a test can assert
 * something about a colour and have it be true of the pixels.
 *
 * **Nothing here allocates per frame.** `glow.ts`'s `haloSprite` caches on
 * `${color}@${radius}` and `sheen.ts` rounds a radius to keep that cache small;
 * both patterns are followed rather than replaced. A round body takes two
 * cached sprites keyed by a quantised radius and spin, and the one span wide
 * enough to be worth a gradient — the hull — holds a single slot it alone uses.
 */

/**
 * The ramp along the key axis. `u` is 0 at the silhouette nearest the light and
 * 1 at the one furthest from it, so **0.5 is the terminator** — a point square
 * to the light projects onto the centre. `shade` is black over the surface,
 * `lift` is light added to it, and the two rows usually left out are the ones
 * doing the work: the **contact shadow at `u = 0`**, without which the bright
 * shoulder runs off the edge and the body reads as translucent rather than
 * solid, and the **bounce at `u = 1`**, light coming back off whatever the body
 * sits over — the stop that separates a ball from a disc with a smudge on it.
 */
const RAMP = [
  [0.0, 0.3, 0.05],
  [0.16, 0.0, 0.34],
  [0.5, 0.18, 0.0],
  [0.74, 0.55, 0.0],
  [1.0, 0.3, 0.1],
] as const satisfies readonly (readonly [u: number, shade: number, lift: number])[];

/** How dark and how bright the light is at a point along its axis: `shade` is
 * black over the surface, multiplying every channel by `1 - shade`; `lift` is
 * light added to it, raising every channel toward white. Both 0..1. */
export interface Shade {
  readonly shade: number;
  readonly lift: number;
}

/** The ramp read at `u`, linearly between rows. Outside 0..1 it clamps. */
export function shadeAt(u: number): Shade {
  const t = u <= 0 ? 0 : u >= 1 ? 1 : u;
  for (let i = 1; i < RAMP.length; i++) {
    const a = RAMP[i - 1] as readonly [number, number, number];
    const b = RAMP[i] as readonly [number, number, number];
    if (t > b[0] && i < RAMP.length - 1) continue;
    const k = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
    return { shade: a[1] + (b[1] - a[1]) * k, lift: a[2] + (b[2] - a[2]) * k };
  }
  return { shade: 0, lift: 0 };
}

/**
 * The half a surface is allowed to take. **The value half drops `lift` entirely
 * and that is the whole of the rule**, rather than a comment beside it:
 * darkening scales all three channels by one number, so hue comes out exactly
 * where it went in, while any brightening moves a colour toward white and so a
 * red body some measurable distance toward cyan. `docs/alive.md` refuses that
 * on a body in a wave, so a creature gets no `lift` — not a smaller one.
 */
export function half(which: LightHalf, s: Shade): Shade {
  return which === "value+hue" ? s : { shade: s.shade, lift: 0 };
}

/** A `#rrggbb` as it reads under the light at `u` — the numeric twin of what
 * the canvas does: black at `shade`, then light at `lift` under `lighter`. */
export function litColour(hex: string, u: number, which: LightHalf = "value+hue"): string {
  const { shade, lift } = half(which, shadeAt(u));
  let out = "#";
  for (const at of [1, 3, 5]) {
    const v = Number.parseInt(hex.slice(at, at + 2), 16) * (1 - shade) + 255 * lift;
    out += Math.round(v < 0 ? 0 : v > 255 ? 255 : v)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

/** The warm of the light and the cool of the shadow, as rgb triples — the
 * `torch-alarm.ts` pattern, so an alpha can be graded onto either. */
const LIT_RGB = "255,246,228";
const DARK_RGB = "3,2,10";

/** The key direction with a rotation the caller has already applied taken back
 * out, so a rock turning under the light keeps its lit side where the light is
 * rather than carrying it round. */
function keyDir(spin: number): { dx: number; dy: number } {
  const c = Math.cos(-spin);
  const s = Math.sin(-spin);
  return { dx: KEY.x * c - KEY.y * s, dy: KEY.x * s + KEY.y * c };
}

function ramp(g: CanvasGradient, which: LightHalf, pick: "shade" | "lift"): void {
  for (const [u] of RAMP) {
    const s = half(which, shadeAt(u));
    const rgb = pick === "shade" ? DARK_RGB : LIT_RGB;
    g.addColorStop(u, `rgba(${rgb},${s[pick].toFixed(3)})`);
  }
}

/**
 * Two gradients along the key axis across a span of half-width `r` about
 * `(cx, cy)`: black, then light. Two rather than one because a canvas gradient
 * carries a single colour ramp and this needs a `source-over` pass and a
 * `lighter` one. One slot, not a map: the hull is the only caller and its axis
 * is a function of the layout and a quantised contour top, so the slot is a hit
 * on essentially every frame — where a map keyed on coordinates that did move
 * would be a leak rather than a cache.
 */
interface Slot {
  key: string;
  ctx: CanvasRenderingContext2D;
  shade: CanvasGradient;
  lift: CanvasGradient;
}
let slot: Slot | null = null;

/** The light over a wide region, filled twice: black, then light. */
function litSpan(
  ctx: CanvasRenderingContext2D,
  region: Path2D,
  cx: number,
  cy: number,
  r: number,
  which: LightHalf,
): void {
  const key = `${which}|${cx}|${cy}|${r}`;
  if (!slot || slot.key !== key || slot.ctx !== ctx) {
    const { dx, dy } = keyDir(0);
    const a = [cx + dx * r, cy + dy * r, cx - dx * r, cy - dy * r] as const;
    const shade = ctx.createLinearGradient(...a);
    const lift = ctx.createLinearGradient(...a);
    ramp(shade, which, "shade");
    ramp(lift, which, "lift");
    slot = { key, ctx, shade, lift };
  }
  const prev = ctx.globalCompositeOperation;
  ctx.save();
  ctx.fillStyle = slot.shade;
  ctx.fill(region);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = slot.lift;
  ctx.fill(region);
  ctx.restore();
  ctx.globalCompositeOperation = prev;
}

/** How many directions a sprite is baked in. A rock turns at 0.12 rad/s, so a
 * 15° step is a quarter-second of drift — under what an eye finds on a value
 * ramp, and it bounds the cache at 24 entries per radius. */
const SPIN_STEPS = 24;

const sprites = bakedCache<string, HTMLCanvasElement>();

/** One face of the light, pre-rendered square and cached. The radius and the
 * spin arrive already quantised from `litRound`, its only caller. */
function litSprite(which: LightHalf, pick: "shade" | "lift", r: number, step: number) {
  const key = `${which}/${pick}@${r}@${step}`;
  const cached = sprites.get(key);
  if (cached) return cached;
  const size = r * 2;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const { dx, dy } = keyDir((step / SPIN_STEPS) * Math.PI * 2);
    const grad = g.createLinearGradient(r + dx * r, r + dy * r, r - dx * r, r - dy * r);
    ramp(grad, which, pick);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  sprites.set(key, c);
  return c;
}

/**
 * The light over a round body of radius `r` at `(x, y)` in the current
 * transform, `spin` being the rotation that transform already carries. The
 * caller clips to the body first — this paints a square, and the clip is what
 * makes it a body. Radius in steps of four and spin in 24ths, for the reason
 * `sheen.ts`'s `bloom` rounds its halo radius: a value that moves every frame
 * caches a canvas every frame.
 */
export function litRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  which: LightHalf,
  spin = 0,
): void {
  const q = Math.max(4, Math.round(r / 4) * 4);
  const turns = spin / (Math.PI * 2);
  const step = ((Math.round(turns * SPIN_STEPS) % SPIN_STEPS) + SPIN_STEPS) % SPIN_STEPS;
  const prev = ctx.globalCompositeOperation;
  ctx.drawImage(litSprite(which, "shade", q, step), x - q, y - q);
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(litSprite(which, "lift", q, step), x - q, y - q);
  ctx.globalCompositeOperation = prev;
}

/**
 * How much of the ramp a box leaves unused at each end. The two stops it cuts
 * off are the two that are *about a silhouette* — the contact shadow, and the
 * bounce off the far rim. A box has no silhouette at its corners, so landing
 * them there would put a dark band down the lit side of the ship, which is the
 * read this lane exists to fix rather than cause.
 */
const SPAN_INSET = 0.22;

/**
 * The light over a rectangular region — the hull, a span across the whole field
 * rather than a body with a radius. The corner nearest the light lands at
 * `SPAN_INSET` and the far one at `1 - SPAN_INSET`. Quantised to eight pixels
 * here rather than at the call site, so a hull that breathes by a pixel keeps
 * hitting the one gradient slot, and so no caller has to know which way the
 * light runs in order to size a span for it.
 */
export function litBox(
  ctx: CanvasRenderingContext2D,
  region: Path2D,
  x: number,
  y: number,
  w: number,
  h: number,
  which: LightHalf,
): void {
  const q = 8;
  const bx = Math.round(x / q) * q;
  const by = Math.round(y / q) * q;
  const bw = Math.max(q, Math.round(w / q) * q);
  const bh = Math.max(q, Math.round(h / q) * q);
  const reach = (Math.abs(KEY.x) * bw + Math.abs(KEY.y) * bh) / 2;
  litSpan(ctx, region, bx + bw / 2, by + bh / 2, reach / (1 - 2 * SPAN_INSET), which);
}
