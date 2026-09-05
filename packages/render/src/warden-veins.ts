import type { WardenOpening } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import { inOpening } from "./warden-skin.js";

/**
 * What lies **under** THE WARDEN's surface: the veins running in from its rim,
 * and the wet film over them.
 *
 * The third of the skin's three files, and the line between them is the body's
 * own edge and its own material. `warden-cilia.ts` is what stands outside the
 * edge, `warden-skin.ts` is what is set into the material, and this is what is
 * *under* it — which is why everything here is drawn inside a clip and nothing
 * there is. Splitting it that way is not tidiness: a mark under the skin has to
 * be cut to the body or it floats off the edge, and a mark outside it must not
 * be, or the fringe is shaved flat.
 */

/** Veins under the skin. Five, on fixed spokes, so the body is the same body
 * on both phones and after a restart. */
const VEINS = 5;

/**
 * Everything that lives **under** the surface, drawn inside one clip: the veins
 * running in from the rim, and the wet film lying over them.
 *
 * One `save`/`clip`/`restore` for the pair rather than one each, because the
 * clip is the expensive half — and `evenodd` for the fallback's sake: where the
 * shape is still two loops, the hole is not part of the surface and must catch
 * neither a vein nor the light.
 *
 * **The veins are the half of CILIATE that is inside the outline**, and they
 * are what the sheet's note is about: a haze at the edge, and something legible
 * under the skin. Each runs in from the rim toward the middle and forks near
 * its tip, the way VEIN does on the shapes page — and each breathes on its own
 * period, so the set never pulses together and never lands on the beat the pair
 * is counting.
 */
export function drawWardenUnderskin(
  ctx: CanvasRenderingContext2D,
  shape: Path2D,
  cx: number,
  cy: number,
  r: number,
  time: number,
  openness: number,
  cut: WardenOpening | null,
): void {
  ctx.save();
  ctx.clip(shape, "evenodd");

  const veins = new Path2D();
  for (let k = 0; k < VEINS; k++) {
    // Fixed spokes, offset off the vertical so no vein stands on the axis the
    // shot comes up.
    const a = (k / VEINS) * Math.PI * 2 + 0.55;
    if (inOpening(a, cut)) continue;
    const ox = Math.cos(a);
    const oy = Math.sin(a);
    // The pulse is in the *length*: one path is one alpha, and a set of veins
    // that all brightened together would read as a lamp under the skin rather
    // than as something moving through them.
    const beat = 0.82 + 0.18 * Math.sin(time * 1.3 + k * 2.1);
    const reach = r * 0.4 * beat;
    const rootX = cx + ox * r * 0.99;
    const rootY = cy + oy * r * 0.99;
    const tipX = rootX - ox * reach;
    const tipY = rootY - oy * reach;
    // Bent rather than radial: a straight line into the middle of a ring reads
    // as a spoke, and this has to read as something grown.
    veins.moveTo(rootX, rootY);
    veins.quadraticCurveTo(
      rootX - ox * reach * 0.5 - oy * reach * 0.28,
      rootY - oy * reach * 0.5 + ox * reach * 0.28,
      tipX,
      tipY,
    );
    for (const fork of [-0.85, 0.7]) {
      const fx = Math.cos(a + Math.PI + fork);
      const fy = Math.sin(a + Math.PI + fork);
      veins.moveTo(tipX, tipY);
      veins.lineTo(tipX + fx * reach * 0.42, tipY + fy * reach * 0.42);
    }
  }
  strokeGlow(ctx, veins, PALETTE.eyeFluid, STROKE.inner * 0.7, 0.22 + openness * 0.25);

  // The wet film: two soft patches of light drifting over the material. It is
  // what stops the ring reading as rock with a line round it, and it is the
  // same trick every body in this game wears (`intro-parts.ts`'s wet spot,
  // `lobe-shell.ts`'s gloss).
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(201,255,201,0.10)";
  ctx.beginPath();
  ctx.ellipse(
    cx - r * 0.42 + Math.sin(time * 0.31) * r * 0.05,
    cy - r * 0.5 + Math.cos(time * 0.23) * r * 0.04,
    r * 0.42,
    r * 0.26,
    -0.6,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.beginPath();
  ctx.ellipse(
    cx + r * 0.5 + Math.sin(time * 0.19) * r * 0.04,
    cy + r * 0.34,
    r * 0.24,
    r * 0.14,
    0.7,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}
