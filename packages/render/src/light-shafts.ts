import { KEY } from "@neon-spore/content";
import { hash01 } from "./backdrop.js";
import { bakedCache } from "./baked.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * SUN FALLING INTO DEEP WATER.
 *
 * The owner, having watched the key light land on the hull and the rocks:
 * "small sun stripes across background screen according to light source,
 * which looks like sun falling into the ocean deep." This is that — a few
 * slow bands of slightly brighter water in the back of the field, parallel,
 * leaning at the angle everything else is now lit from, and drifting the way
 * light does when the surface above keeps moving.
 *
 * **The same light, not a second one.** `KEY` points from a body toward the
 * light — upper left — so the light itself travels the other way: negate and
 * nothing else. No angle is named here; if `KEY` ever moves, these lean with
 * it for free.
 *
 * **Deliberately dim.** `backdrop.ts`'s header says why: the creatures are the
 * brightest thing on the field, and this has to lose that contest on purpose.
 * A shaft is a suggestion of brightness, not a wash — see `SHAFT_STYLES`.
 *
 * **Stateless.** Every shaft's position is `time` run through `hash01`, the
 * same pure-function shape as `backdrop.ts`'s motes. Nothing here survives a
 * restart because nothing here is stored anywhere.
 *
 * **No gradient in the loop.** One soft bar is rendered to an offscreen
 * canvas once per size, the `glow.ts` sprite-cache pattern, and every frame
 * only rotates, translates and blits it.
 */

interface ShaftStyle {
  /** Keeps this shaft's hash out of the others' — see `backdrop.ts`'s motes. */
  seed: number;
  /** Drift along the light's own direction, screen-diagonals per second. */
  speed: number;
  /** Band thickness, as a fraction of the sky's diagonal. */
  thicknessFrac: number;
  /** Peak alpha at the sprite's centre line, before the frame's own dimming. */
  alpha: number;
}

/** A few, not many — "small sun stripes", never a field of them. Thinner and
 * dimmer bands are listed after wider, brighter ones so the loop below draws
 * back-to-front the same way `backdrop.ts` draws far motes before near. */
const SHAFT_STYLES: readonly ShaftStyle[] = [
  { seed: 0, speed: 0.014, thicknessFrac: 0.05, alpha: 0.05 },
  { seed: 1, speed: 0.02, thicknessFrac: 0.032, alpha: 0.04 },
  { seed: 2, speed: 0.011, thicknessFrac: 0.065, alpha: 0.035 },
];

/** The light's own travel direction: away from where `KEY` says it comes
 * from, negate and nothing else. Not a re-derived angle —
 * `packages/sim/test/purity.test.ts` exists to catch exactly that kind of
 * second copy, even though this file sits outside what it scans. */
const RAY = { x: -KEY.x, y: -KEY.y } as const;
const RAY_ANGLE = Math.atan2(RAY.y, RAY.x);

const spriteCache = bakedCache<number, HTMLCanvasElement>();

/**
 * One soft bar, long enough to cross the sky at any rotation, cached by its
 * quantised thickness so a run only ever builds a handful of these — the
 * `haloSprite` pattern, never a `createLinearGradient` inside the per-frame
 * loop.
 */
function shaftSprite(length: number, thickness: number): HTMLCanvasElement {
  const key = Math.round(thickness);
  const cached = spriteCache.get(key);
  if (cached) return cached;

  const w = Math.max(1, Math.ceil(length));
  const h = Math.max(2, Math.ceil(thickness));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `${PALETTE.hullRim}00`);
    grad.addColorStop(0.5, PALETTE.hullRim);
    grad.addColorStop(1, `${PALETTE.hullRim}00`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }
  spriteCache.set(key, c);
  return c;
}

/**
 * The back of the field, raked to `KEY` and drifting. Sits in `drawBackdrop`,
 * over the wash and under the motes, so the dust the near layer draws still
 * reads as in front of the light rather than baked into it.
 */
export function drawLightShafts(ctx: CanvasRenderingContext2D, l: Layout, time: number): void {
  const skyHeight = l.bandTop;
  if (skyHeight <= 0 || l.width <= 0) return;

  const diag = Math.hypot(l.width, skyHeight);
  const length = diag * 1.6;
  const cx = l.width / 2;
  const cy = skyHeight / 2;

  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(RAY_ANGLE);

  // How far apart two stripes can drift, perpendicular to the light — wide
  // enough that a wrap happens off-screen and is never seen.
  const span = diag * 1.4;

  for (const style of SHAFT_STYLES) {
    const thickness = Math.max(2, diag * style.thicknessFrac);
    const sprite = shaftSprite(length, thickness);
    const base = hash01(style.seed * 4 + 1);
    const frac = base + time * style.speed;
    const wrapped = frac - Math.floor(frac);
    // Each stripe's own line across the sky, sliding sideways to it over
    // time — the stripe itself stays long enough along `RAY` to need no
    // motion in that direction at all.
    const perp = (wrapped - 0.5) * span;
    ctx.globalAlpha = style.alpha;
    ctx.drawImage(sprite, -length / 2, perp - thickness / 2, length, thickness);
  }

  ctx.restore();
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}
