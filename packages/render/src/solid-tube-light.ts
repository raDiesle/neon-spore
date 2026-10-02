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
/**
 * Held gradients before the cache starts again; a settled scene holds a few
 * dozen. It was 512 until THE INSTAR's dragon body and serpent swim shipped
 * (2 October 2026): the deep, swimming body lights its sections at enough
 * angles through a turn to fill 512, and the frame after each restart made
 * 150 to 180 gradients at once, where it now makes about 60.
 */
const HELD = 2048;
/** How far under the brightest stop a stop still takes some of the specular. */
const NEAR = 0.06;
/** The light at which the specular starts, and the light it is whole at. */
const SPEC_FROM = 0.55;
const SPEC_TO = 0.65;
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
  const hexes = sectionStops(qa / LIGHT_STEPS, qf / LIGHT_STEPS, skin);
  KS.forEach((k, j) => {
    (g as CanvasGradient).addColorStop((k + 1) / 2, hexes[j] as string);
  });
  GRADIENTS.set(key, g);
  return g;
}

/**
 * The colour at each of `KS` across a section lit as `across`, `facing`.
 *
 * Opaque stops, each the base mixed toward its zone, so the overlap between
 * two quads cannot stack into a band the way translucent ones did.
 *
 * **The specular is a weight, never a pick.** It falls on the stops lit
 * within `NEAR` of the brightest, and fades in across `SPEC_FROM`..`SPEC_TO`:
 * two stops lit almost the same share it, so a section turning by a hair
 * moves it by a hair. Picked as the one brightest stop, it jumped whole to
 * the edge when the edge won by a thousandth, and one slice of a body lost
 * its stripe under the rim.
 */
export function sectionStops(across: number, facing: number, skin: Skin): string[] {
  const lit = sectionLight(across, facing, KS);
  const peak = Math.max(...lit);
  const sheen = mixHex(skin.lift, skin.sheen, 0.34);
  return KS.map((k, j) => {
    const l = lit[j] as number;
    const dark = mixHex(skin.base, SHADOW, ((0.45 - l) / 0.45) * 0.7);
    if (Math.abs(k) > 0.95 && l < 0.3) return mixHex(dark, BOUNCE, 0.22);
    const hex = l >= 0.45 ? mixHex(skin.base, skin.lift, ((l - 0.45) / 0.55) * 0.75) : dark;
    const spec = ramp(peak - l, NEAR, 0) * ramp(l, SPEC_FROM, SPEC_TO);
    return spec > 0 ? mixHex(hex, sheen, spec) : hex;
  });
}

/** 0 at `a`, 1 at `b`, straight between, held either side. */
function ramp(v: number, a: number, b: number): number {
  return Math.max(0, Math.min(1, (v - a) / (b - a)));
}
