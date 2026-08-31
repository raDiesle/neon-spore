import type { Point } from "@neon-spore/content";
import type { Layout } from "./layout.js";
import { tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The shield's ambient flashes: a soft bright patch popping briefly above the
 * rim, at a random spot and a random moment — the `flash` answer to
 * `shield:charge`, offered beside `shield-spark.ts`'s `arcs`. Same slot,
 * same job (say the shield is charged, not catching anything), a different
 * kind of mark: a patch of light rather than a jagged discharge.
 *
 * Its own file for the reason `shield-spark.ts` gives for its own: `shield.ts`
 * was already at the file-length limit. `SHIELD_FLASH_LOOK` is inert at these
 * values (`perSecond: 0`): the shipped shield never calls `drawShieldFlashes`
 * for anything visible, so wiring this in changes no frame. See
 * `docs/versus.md` and `tools/versus/candidates/shield-charge/flash/`.
 *
 * Nothing here is stored between calls, the same way `shield-spark.ts` isn't:
 * a flash's whole life is read off `time` alone, so a wave restart needs no
 * entry in `Effects.reset()` to stay correct.
 */
export interface ShieldFlashLook {
  /** Expected flashes per second, summed over every slot below. 0 draws none. */
  perSecond: number;
  /** How long one flash is visible, in seconds. */
  life: number;
  /** How tall a flash reaches above the rim, as a share of `tile`. */
  heightMul: number;
  /** Radius of the patch itself, as a share of `heightMul * tile`. */
  radiusMul: number;
  /** Brightness at the flash's peak. */
  intensity: number;
}

/** The shipped shield: no flashes. */
export const SHIELD_FLASH_LOOK: ShieldFlashLook = {
  perSecond: 0,
  life: 0.3,
  heightMul: 0.25,
  radiusMul: 0.6,
  intensity: 1,
};

/** Two independent timers, so at most two flashes are ever live at once and
 * they never share a clock — "two, irregularly", not a strobe. */
const SLOTS = 2;

/** Deterministic, not `Math.random`: two devices reading the same `time`
 * draw the same flash, the way `shield-spark.ts`'s arcs already do. */
function hash(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Up to two soft flashes above the shield's rim, each at its own random spot
 * and its own random timing within a range — sudden, brief, then gone. `cols`
 * is the shield's current segment columns, the same ones `drawShieldRim`
 * spans its own rim across; `surface` places a point on the hull's real,
 * breathing contour, the way it always does.
 */
export function drawShieldFlashes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  cols: readonly number[],
  surface: (x: number) => Point,
): void {
  const look = SHIELD_FLASH_LOOK;
  if (look.perSecond <= 0 || cols.length === 0) return;
  const colMin = Math.min(...cols);
  const colMax = Math.max(...cols);

  for (let k = 0; k < SLOTS; k++) {
    // Each slot's own period wobbles by up to ±45% around the shared rate, so
    // the two flashes drift in and out of sync instead of ticking in lockstep.
    const period = (SLOTS / look.perSecond) * (0.7 + hash(k * 71.3 + 5) * 0.9);
    const activeFrac = Math.min(0.5, Math.max(0.02, look.life / period));
    const phase = time / period + hash(k * 41.1 + 2);
    const cycle = Math.floor(phase);
    const pos = phase - cycle;
    if (pos >= activeFrac) continue;
    drawOneFlash(ctx, l, cycle, k, pos / activeFrac, colMin, colMax, surface, look);
  }
}

function drawOneFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cycle: number,
  slot: number,
  age: number,
  colMin: number,
  colMax: number,
  surface: (x: number) => Point,
  look: ShieldFlashLook,
): void {
  // Fast attack, slower decay — a pop rather than a fade-in.
  const attack = Math.min(1, age / 0.2);
  const decay = 1 - Math.max(0, (age - 0.2) / 0.8);
  const alpha = Math.max(0, Math.min(1, attack * decay));
  if (alpha <= 0) return;

  const seed = cycle * 131 + slot * 17;
  const colFrac = hash(seed + 1);
  const originX = tileCX(l, colMin + (colMax - colMin) * colFrac);
  const origin = surface(originX);
  const rise = look.heightMul * l.tile;
  const cx = origin.x;
  const cy = origin.y - rise;
  const radius = Math.max(0.5, look.heightMul * l.tile * look.radiusMul);

  const prevComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, PALETTE.shieldRim);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha * look.intensity));
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prevComposite;
}
