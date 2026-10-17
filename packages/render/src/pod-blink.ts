import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { blinkAt, type Seed, seedAt } from "./pod-seed.js";
import { drawSkin, ringOn, type SkinKind } from "./pod-seed-skins.js";
import { drawSpikes, type SpikeKind } from "./pod-seed-spikes.js";

/**
 * **The real pod, blinking like a pickup** — the tumbling seed
 * (`pod-seed.ts`), capped with round mushroom studs over a spotted skin, and
 * on the count the whole sphere flashes white-hot and swells for a moment,
 * its halo kicking out with it, the way a bonus in a game says "take me".
 * Once a beat with time to spare, twice a beat as the clock runs down, four
 * times in the last one (`blinkAt`): the blink is the clock, read without the
 * ring.
 *
 * BLINK in VERSUS until the owner took it on 16 October 2026. `drawBack` and
 * `drawFront` are exported for a look that draws between the far spikes and
 * the body, or over the near ones — the hollow pod's candidates do.
 */
export function drawBlinkPod(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  /** Beats left on its clock, `Infinity` for none. */
  beatsLeft: number,
): void {
  const s = seedAt(x, y, r, t, beatsLeft);
  const flash = blinkAt(t, beatsLeft);
  s.R *= 1 + 0.12 * flash;
  drawSeed(ctx, s, { flash, ...BLINK_STYLE });
}

/** The real pod's own spikes and skin. */
export const BLINK_STYLE = { spike: "cap", skin: "spots" } as const;

/** How the body is lit: `flash` 0..1 takes the whole sphere toward white. */
export interface SeedLight {
  flash?: number;
  /** SMART's own `stud` and `smooth` when not named (`pod-seed-spikes.ts`, `pod-seed-skins.ts`). */
  spike?: SpikeKind;
  skin?: SkinKind;
}

/** The halo and the studs round the back. Opens a `save` that `drawFront` closes. */
export function drawBack(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  const f = light.flash ?? 0;
  halo(
    ctx,
    s.x,
    s.y,
    s.r * (2.1 + 0.3 * s.pulse + 0.8 * f),
    PALETTE.pod,
    0.12 + 0.08 * s.pulse + 0.3 * f,
  );
  ctx.save();
  ctx.lineCap = "round";
  drawSpikes(ctx, s, true, f, light.spike ?? "stud");
}

/** The sphere, its seam and the near studs. */
export function drawFront(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  const f = light.flash ?? 0;
  const { x, y, R } = s;
  // The sphere, lit from up and to the left.
  const g = ctx.createRadialGradient(x - R * 0.4, y - R * 0.45, R * 0.08, x, y, R);
  g.addColorStop(0, f > 0.5 ? "#FFFFFF" : PALETTE.pod);
  g.addColorStop(0.45, f > 0.5 ? PALETTE.podRim : f > 0 ? PALETTE.pod : "#7A4C0C");
  g.addColorStop(1, f > 0 ? "#7A4C0C" : PALETTE.podDark);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = f > 0 ? PALETTE.podRim : PALETTE.pod;
  ctx.lineWidth = Math.max(1.5, s.r * 0.1);
  ctx.globalAlpha = 0.85;
  ctx.stroke();

  drawSkin(ctx, s, light.skin ?? "smooth");
  // The seam round the middle, on every one of them.
  ctx.strokeStyle = PALETTE.podRim;
  ringOn(ctx, s, (a) => ({ x: Math.cos(a), y: 0, z: Math.sin(a) }), R * 0.07);
  drawSpikes(ctx, s, false, f, light.spike ?? "stud");
  ctx.restore();
}

export function drawSeed(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  drawBack(ctx, s, light);
  drawFront(ctx, s, light);
}
