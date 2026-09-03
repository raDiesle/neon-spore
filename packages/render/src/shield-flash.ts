import type { Point } from "@neon-spore/content";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The shield's ambient flashes: a soft bright patch popping briefly above the
 * rim, at a random spot and a random moment, alongside `shield-spark.ts`'s
 * jagged `arcs` — both say the shield is charged, not catching anything, in a
 * different kind of mark: a patch of light rather than a jagged discharge.
 *
 * Its own file for the reason `shield-spark.ts` gives for its own: `shield.ts`
 * was already at the file-length limit. Shipped, not offered — it was the
 * `flash` candidate in `shield:charge` (`tools/versus/candidates/`) until the
 * owner asked for it by name, at which point the candidate's own patch became
 * `SHIELD_FLASH_LOOK`'s default and the directory that offered it was
 * removed; see CLAUDE.md's *A look is offered, never replaced*, third
 * exemption.
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

export const SHIELD_FLASH_LOOK: ShieldFlashLook = {
  perSecond: 1,
  life: 0.3,
  heightMul: 0.25,
  radiusMul: 0.6,
  intensity: 1,
};

/** Four independent timers, so at most four flashes are ever live at once and
 * they never share a clock — "a few, irregularly", not a strobe. */
const SLOTS = 4;

/**
 * Up to four soft flashes above the shield's rim, each at its own random spot
 * and its own random timing within a range — sudden, brief, then gone. `from`
 * and `to` are the same pixel bounds `drawShieldRim` strokes its own rim
 * across (segment columns plus the ward's own half-width), so a flash can land
 * anywhere along the lit rim rather than clustering near the segment chain's
 * own, much narrower, centre; `surface` places a point on the hull's real,
 * breathing contour, the way it always does.
 */
export function drawShieldFlashes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  from: number,
  to: number,
  surface: (x: number) => Point,
): void {
  const look = SHIELD_FLASH_LOOK;
  if (look.perSecond <= 0 || from >= to) return;

  for (let k = 0; k < SLOTS; k++) {
    // Each slot's own period wobbles by up to ±45% around the shared rate, so
    // the flashes drift in and out of sync instead of ticking in lockstep.
    const period = (SLOTS / look.perSecond) * (0.7 + sinHash(k * 71.3 + 5) * 0.9);
    const activeFrac = Math.min(0.5, Math.max(0.02, look.life / period));
    const phase = time / period + sinHash(k * 41.1 + 2);
    const cycle = Math.floor(phase);
    const pos = phase - cycle;
    if (pos >= activeFrac) continue;
    drawOneFlash(ctx, l, cycle, k, pos / activeFrac, from, to, surface, look);
  }
}

function drawOneFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cycle: number,
  slot: number,
  age: number,
  from: number,
  to: number,
  surface: (x: number) => Point,
  look: ShieldFlashLook,
): void {
  // Fast attack, slower decay — a pop rather than a fade-in.
  const attack = Math.min(1, age / 0.2);
  const decay = 1 - Math.max(0, (age - 0.2) / 0.8);
  const alpha = Math.max(0, Math.min(1, attack * decay));
  if (alpha <= 0) return;

  const seed = cycle * 131 + slot * 17;
  const posFrac = sinHash(seed + 1);
  const originX = from + (to - from) * posFrac;
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
