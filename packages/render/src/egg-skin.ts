import type { EggBeats } from "./egg-curve.js";
import { halo } from "./glow.js";
import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * What the cloaca is *made of* — split out of `cannon-maw.ts` so that file
 * stays the three beats meeting a canvas rather than also carrying a skin.
 *
 * The shape was already alive (`egg-contour.ts` breathes it); the surface was
 * not. A flat `rgba(28,10,52,0.85)` disc under a white line is a hole with a
 * ring round it, which is what the owner meant by asking for something more
 * "slimy living alien neon". Four passes fix that, and each one is doing a
 * different half of that phrase:
 *
 * 1. **Depth.** A radial fill lit from the same quarter the ship is
 *    (`key-light.ts`'s direction, by eye rather than by import — this is
 *    inside a body, not on its silhouette), so the thing reads as a volume of
 *    dark jelly instead of a cut-out.
 * 2. **Neon.** The rim is a tube, not a line: hull violet blooming inside the
 *    contour, a near-white core on it. That is the only way a stroke reads as
 *    *lit* rather than as drawn.
 * 3. **Wet.** Two specular highlights that drift on their own slow clock. A
 *    surface with a moving reflection is wet; one without is matte, and matte
 *    is the whole difference between a membrane and a decal.
 * 4. **Alive.** Everything above pulses on `time`, never on the phase, so the
 *    body is doing something on the frames when nothing is being fired.
 *
 * **The flare is the one thing here that says a colour**, and it is allowed to
 * because it happens *after* the shot exists. Everything the wind-up draws is
 * still in the hull's own light — see `cannon-maw.ts`'s header for why that
 * matters — but by the time this burns, the bolt is already on the field in
 * that same colour and there is nothing left to leak.
 */

/** The release burn: how hot, and in which ammunition colour. */
export interface EggFlare {
  /** 0..1, 1 the moment the shot leaves. */
  amount: number;
  /** `#rrggbb`, the colour that left. */
  color: string;
}

export const NO_FLARE: EggFlare = { amount: 0, color: PALETTE.hull };

/** The darkest part of the jelly, away from the light. */
const DEEP = "#12063A";
/** Between the two, so the falloff is jelly rather than a vignette. */
const MID = "#331070";
/** The lit shoulder of it. */
const LIT = "#6A28B4";

/** The one gradient this file builds, in unit space. See `drawEggSkin`. */
const fillSlot = gradientSlot<CanvasGradient>();
/**
 * How many steps the burn is rounded to before it keys that gradient — and
 * before it is mixed into its colours, so the key and the picture agree.
 *
 * Rounded because the burn eases continuously and the slot is cached on exact
 * equality: an unrounded key would rebuild the gradient on every frame of the
 * second the flare lasts, which is the one thing `gradient-slot.ts` is for.
 * Six steps is under the eye's ability to see a band in a shape this size, and
 * it means a whole burn costs six gradients rather than sixty.
 */
const FLARE_STEPS = 6;

/**
 * The body's own idle rhythm, slower than a beat on purpose: it is a thing
 * breathing, and anything at the tempo of the music reads as part of the
 * music.
 */
function breath(t: number): number {
  return 0.5 + 0.5 * Math.sin(t * 1.7);
}

/**
 * The whole surface, into an already-built contour. `r` is the contour's rough
 * half width this frame — the gradients and the highlights are placed against
 * it so they swell with the body rather than sitting still inside a shape that
 * is straining around them.
 */
export function drawEggSkin(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  cx: number,
  cy: number,
  r: number,
  t: number,
  b: EggBeats,
  flare: EggFlare,
): void {
  const f = Math.max(0, Math.min(1, flare.amount));
  const glowHue = f > 0 ? mixHex(PALETTE.hull, flare.color, f) : PALETTE.hull;
  const rimHue = f > 0 ? mixHex(PALETTE.hullRim, flare.color, 0.75 * f) : PALETTE.hullRim;
  const pulse = breath(t);

  ctx.save();
  // Everything from here in is *inside* the membrane.
  ctx.clip(path);

  // 1. Depth. Lit from the upper left, which is where every other pass on the
  // hull already puts the key.
  //
  // The gradient is built once in **unit space** and the context is scaled onto
  // the body, rather than built from this frame's `cx`/`cy`/`r`: those three
  // move every frame, and a gradient rebuilt sixty times a second is exactly
  // what `gradient-slot.ts` exists to stop. The only thing that can change it
  // is the flare's colour, and that is quantised to a handful of steps for the
  // same reason — see `FLARE_STEPS`.
  const fq = Math.round(f * FLARE_STEPS) / FLARE_STEPS;
  const g = slotGradient(ctx, fillSlot, `${flare.color}@${fq}`, () => {
    const grad = ctx.createRadialGradient(-0.34, -0.4, 0.06, 0, 0, 1.2);
    grad.addColorStop(0, mixHex(LIT, flare.color, 0.7 * fq));
    grad.addColorStop(0.55, mixHex(MID, flare.color, 0.45 * fq));
    grad.addColorStop(1, mixHex(DEEP, flare.color, 0.2 * fq));
    return grad;
  });
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.translate(cx, cy);
  ctx.scale(r, r);
  ctx.fillStyle = g;
  // Wider than the contour can reach in any direction: past the last stop a
  // radial gradient is its last colour, so the overspill is the deep it would
  // have been anyway, and the clip above cuts it to the body.
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();

  // 2. Neon, the inner half of it: the light a glass tube throws back into
  // itself. Widest and faintest first, same shape as `strokeGlow`'s outward
  // pass, so the two read as one tube from either side of the line.
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = glowHue;
  for (let i = 3; i >= 1; i--) {
    ctx.lineWidth = r * 0.2 * i;
    ctx.globalAlpha = (0.34 + 0.4 * f + 0.08 * pulse) / i;
    ctx.stroke(path);
  }

  // 3. Wet. A long smear where the light lies along the shoulder, and a small
  // hard catchlight beside it — one reflection is a stain, two are a surface.
  const drift = Math.sin(t * 0.9) * r * 0.06;
  ctx.globalAlpha = 0.34 + 0.1 * pulse + 0.3 * f;
  ctx.fillStyle = rimHue;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3 + drift, cy - r * 0.42, r * 0.34, r * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.6 + 0.4 * f;
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.26, cy - r * 0.12 + drift, r * 0.09, r * 0.07, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 4. Alive: a slow swirl low in the body, brighter while it is under load —
  // whatever the thing is made of, it moves before it is pressed out.
  ctx.globalAlpha = 0.26 + 0.3 * Math.max(0, b.bulge) + 0.35 * f;
  ctx.fillStyle = glowHue;
  ctx.beginPath();
  ctx.ellipse(
    cx + Math.sin(t * 1.3) * r * 0.22,
    cy + r * 0.42,
    r * 0.42,
    r * 0.2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

/**
 * The light the body throws *out* while it is burning off a shot. Drawn before
 * the contour, like the strain halo it sits beside, so it reads as coming from
 * inside the ship rather than as a decal over it.
 */
export function drawEggFlareHalo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  flare: EggFlare,
): void {
  const f = Math.max(0, Math.min(1, flare.amount));
  if (f <= 0.01) return;
  halo(ctx, cx, cy, r * (1.6 + 0.9 * f), flare.color, 0.55 * f);
}
