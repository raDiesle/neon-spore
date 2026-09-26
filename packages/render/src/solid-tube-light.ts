import { ringSection, type SeenRing, sectionLight } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import { mixHex } from "./hex.js";

/**
 * THE LIGHT ACROSS A TUBE'S SECTION, as a gradient built once and reused
 * (`solid-tube-draw.ts` lays it across each slice by a transform).
 *
 * A section is lit as a cylinder, so its light is two numbers — how much of
 * the key falls along its width and how much on its face (`ringSection`) —
 * and those two, stepped, are the key. A tube's neighbouring slices share a
 * gradient, and a tube that is still holds the same few from frame to frame.
 *
 * **The stops are opaque and the fade is not in the key.** A body fading in
 * or out — THE INSTAR's fall, its passes — would otherwise step its fade
 * into a new key nearly every frame and rebuild the light of every slice it
 * has; the caller lays the fade on as `globalAlpha` instead, which composites
 * the same.
 *
 * Rebuilt when the context changes, as `gradient-slot.ts` is, so a gradient
 * is never used on a canvas other than the one that made it.
 */

export const SHADOW = "#0B1024";
const BOUNCE = "#9FB4E8";

/** How a tube is dressed: its own colour, its lit colour and its sheen. */
export interface Skin {
  readonly base: string;
  readonly lift: string;
  readonly sheen: string;
}

/** Where across the width the light is sampled, `right` edge -1 to `left` edge 1. */
const KS = [-1, -0.88, -0.62, -0.3, 0, 0.3, 0.62, 0.88, 1] as const;

/**
 * How finely a section's light is stepped to key a cached gradient: fine
 * enough that no stop moves by a visible amount, coarse enough that a tube's
 * neighbouring slices share one.
 */
const LIGHT_STEPS = 48;
/** Held gradients before the cache starts again; a settled scene holds a few dozen. */
const HELD = 512;
const GRADIENTS = bakedCache<string, CanvasGradient>();

let owner: CanvasRenderingContext2D | undefined;

/** The gradient across a section lit as `ring` is, from 0 (its right) to 1 (its left), opaque. */
export function sectionGradient(
  ctx: CanvasRenderingContext2D,
  ring: SeenRing,
  skin: Skin,
): CanvasGradient {
  const { across, facing } = ringSection(ring);
  const qa = Math.round(across * LIGHT_STEPS);
  const qf = Math.round(facing * LIGHT_STEPS);
  const key = `${skin.base}${skin.lift}${skin.sheen}|${qa}|${qf}`;
  if (owner !== ctx) {
    owner = ctx;
    GRADIENTS.clear();
  }
  let g = GRADIENTS.get(key);
  if (g) return g;
  if (GRADIENTS.size >= HELD) GRADIENTS.clear();
  g = ctx.createLinearGradient(0, 0, 1, 0);
  const lit = sectionLight(qa / LIGHT_STEPS, qf / LIGHT_STEPS, KS);
  const peak = Math.max(...lit);
  // Opaque stops, each the base mixed toward its zone, so the overlap between
  // two quads cannot stack into a band the way translucent ones did.
  KS.forEach((k, j) => {
    const l = lit[j] as number;
    const t = (k + 1) / 2;
    const edge = Math.abs(k) > 0.95;
    const dark = mixHex(skin.base, SHADOW, ((0.45 - l) / 0.45) * 0.7);
    let hex: string;
    if (edge && l < 0.3) hex = mixHex(dark, BOUNCE, 0.22);
    else if (l >= peak - 1e-6 && l > 0.6) hex = mixHex(skin.lift, skin.sheen, 0.34);
    else if (l >= 0.45) hex = mixHex(skin.base, skin.lift, ((l - 0.45) / 0.55) * 0.75);
    else hex = dark;
    (g as CanvasGradient).addColorStop(t, hex);
  });
  GRADIENTS.set(key, g);
  return g;
}
